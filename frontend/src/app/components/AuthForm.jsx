"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, signupUser } from "../services/authService";
import useAuthStore from "../store/authStore";
import { createPlanOrder, verifyPlanAndSignup } from "../services/paymentService";
import { openRazorpayCheckout } from "../utils/razorpay";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [signupSuccessData, setSignupSuccessData] = useState(null);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    role: "STUDENT",
    name: "",
    email: "",
    password: "",
    instituteName: "",
    subdomain: "",
    plan: "STARTER",
  });

  const isSignup = mode === "signup";
  const isInstituteAdmin = signupForm.role === "INSTITUTE_ADMIN";

  const redirectByRole = (role) => {
    if (role === "SUPER_ADMIN") {
      router.push("/super-admin");
    } else if (role === "INSTITUTE_ADMIN") {
      router.push("/institute-admin");
    } else if (role === "TEACHER") {
      router.push("/teacher");
    } else {
      router.push("/student");
    }
  };

  const handleLoginChange = (e) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await loginUser(loginForm);

      setAuth({
        token: data.token,
        user: data.data.user,
        institute: data.data.institute,
      });

      setSuccess("Login successful.");
      redirectByRole(data.data.user.role);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  setSignupSuccessData(null);




  try {
    if (isInstituteAdmin) {
      const { plan, name, email, password, instituteName, subdomain } = signupForm;

      // 1. Ask backend to create a Razorpay order (or return free:true for STARTER)
      const orderRes = await createPlanOrder({ planType: plan, name, email, password, instituteName, subdomain });

      if (orderRes.free) {
        // STARTER is free — do normal signup
        const { signupUser } = await import("../services/authService");
        const data = await signupUser({ role: "INSTITUTE_ADMIN", name, email, password, instituteName, subdomain, plan });
        setSuccess(data.message || "Account created successfully. Please verify your email.");
        setSignupSuccessData({ email: data?.data?.user?.email || email, verificationUrl: data?.devInfo?.verificationUrl || "" });
      } else {
        // Paid plan — open Razorpay checkout
        await openRazorpayCheckout({
          orderId: orderRes.orderId,
          amount: orderRes.amount,
          keyId: orderRes.keyId,
          name,
          email,
          description: `${plan} Plan — B2World LMS`,
          onSuccess: async (rzpResponse) => {
            try {
              // Verify payment and complete signup
              const data = await verifyPlanAndSignup({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                name, email, password, instituteName, subdomain, planType: plan,
              });
              setSuccess(data.message || "Account created successfully. Please verify your email.");
              setSignupSuccessData({ email: data?.data?.user?.email || email, verificationUrl: data?.devInfo?.emailVerifyToken  | "" });
            } catch (err) {
              setError(err.message || "Signup after payment failed");
            } finally {
              setLoading(false);
            }
          },
          onCancel: () => {
            setError("Payment was cancelled. Please try again.");
            setLoading(false);
          },
        });
        // Don't set loading false here — it's handled in onSuccess/onCancel
        return;
      }
    } else {
      // STUDENT or TEACHER — no payment, normal signup
      const { signupUser } = await import("../services/authService");
      const payload = {
        role: signupForm.role,
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        subdomain: signupForm.subdomain,
      };
      const data = await signupUser(payload);
      setSuccess(data.message || "Account created successfully. Please verify your email.");
      setSignupSuccessData({ email: data?.data?.user?.email || signupForm.email, verificationUrl: data?.devInfo?.verificationUrl || "" });
    }

    setSignupForm({ role: "STUDENT", name: "", email: "", password: "", instituteName: "", subdomain: "", plan: "STARTER" });
  } catch (err) {
    setError(err.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};

  const inputClass =
    "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-400 transition-all";

  const labelClass =
    "block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide";

  const InfoAlert = ({ children }) => (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <span className="text-base leading-none mt-0.5">✅</span>
      <div>{children}</div>
    </div>
  );

  const ErrorAlert = ({ children }) => (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <span className="text-base leading-none mt-0.5">⚠️</span>
      <div>{children}</div>
    </div>
  );

  if (!isSignup) {
    return (
      <div>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        {success && <InfoAlert>{success}</InfoAlert>}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelClass + " mb-0"}>Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-neutral-900 py-3.5 text-white text-sm font-semibold hover:bg-neutral-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Logging in...
              </>
            ) : (
              <>Login →</>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 font-medium">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <p className="mt-5 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-neutral-900 hover:text-orange-500 transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorAlert>{error}</ErrorAlert>}

      {success && (
        <InfoAlert>
          <p className="font-semibold">Account created successfully.</p>
          <p className="mt-1">
            A verification email has been sent to{" "}
            <span className="font-semibold">{signupSuccessData?.email}</span>.
          </p>
          <p className="mt-1">Please verify your email before logging in.</p>

          {signupSuccessData?.verificationUrl && (
            <div className="mt-3">
              <a
                href={signupSuccessData.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Verify Email
              </a>
            </div>
          )}

          <div className="mt-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
            >
              Go to login
            </Link>
          </div>
        </InfoAlert>
      )}

      <form onSubmit={handleSignupSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Select Role</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-2xl">
            {[
              { val: "STUDENT", label: "Student", icon: "🧑‍🎓" },
              { val: "TEACHER", label: "Teacher", icon: "👩‍🏫" },
              { val: "INSTITUTE_ADMIN", label: "Institute", icon: "🏫" },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => setSignupForm((p) => ({ ...p, role: r.val }))}
                className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  signupForm.role === r.val
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <span className="text-base">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <select
            name="role"
            value={signupForm.role}
            onChange={handleSignupChange}
            className="sr-only"
            aria-hidden="true"
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="INSTITUTE_ADMIN">Institute Admin</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            name="name"
            value={signupForm.name}
            onChange={handleSignupChange}
            placeholder="Enter your full name"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            name="email"
            value={signupForm.email}
            onChange={handleSignupChange}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            name="password"
            value={signupForm.password}
            onChange={handleSignupChange}
            placeholder="Create a password"
            className={inputClass}
            required
            minLength={6}
          />
        </div>

        {isInstituteAdmin ? (
          <>
            <div>
              <label className={labelClass}>Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={signupForm.instituteName}
                onChange={handleSignupChange}
                placeholder="Enter institute name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Institute Subdomain</label>
              <div className="flex items-center rounded-2xl border border-neutral-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900/20 focus-within:border-neutral-400 transition-all">
                <input
                  type="text"
                  name="subdomain"
                  value={signupForm.subdomain}
                  onChange={handleSignupChange}
                  placeholder="yourname"
                  className="flex-1 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                  required
                />
                <span className="pr-4 text-xs text-neutral-400 font-medium shrink-0">
                  .b2world.in
                </span>
              </div>
            </div>

            <div>
              <label className={labelClass}>Select Plan</label>
              <select
                name="plan"
                value={signupForm.plan}
                onChange={handleSignupChange}
                className={inputClass}
              >
                <option value="STARTER">🌱 Starter — 100 students</option>
                <option value="PROFESSIONAL">⚡ Professional — 1,000 students</option>
                <option value="ENTERPRISE">🏢 Enterprise — Unlimited</option>
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className={labelClass}>Institute Subdomain</label>
            <div className="flex items-center rounded-2xl border border-neutral-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900/20 focus-within:border-neutral-400 transition-all">
              <input
                type="text"
                name="subdomain"
                value={signupForm.subdomain}
                onChange={handleSignupChange}
                placeholder="your-institute"
                className="flex-1 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                required
              />
              <span className="pr-4 text-xs text-neutral-400 font-medium shrink-0">
                .b2world.in
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-neutral-900 py-3.5 text-white text-sm font-semibold hover:bg-neutral-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating account...
            </>
          ) : (
            <>Create Account →</>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400 font-medium">or</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <p className="mt-5 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-neutral-900 hover:text-orange-500 transition-colors"
        >
          Login
        </Link>
      </p>
    </div>
  );
}