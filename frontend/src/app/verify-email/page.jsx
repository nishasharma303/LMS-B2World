"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import { verifyEmail } from "../services/authService";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setError("Invalid or missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const data = await verifyEmail(token);
        setMessage(data.message || "Email verified successfully.");
      } catch (err) {
        setError(err.message || "Email verification failed.");
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, [token]);

  return (
    <AuthLayout
      title="Verify Email"
      subtitle="We’re checking your verification link."
    >
      <div>
        {loading && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            Verifying your email...
          </div>
        )}

        {!loading && message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            <p className="font-semibold">Email verified successfully.</p>
            <p className="mt-1">{message}</p>

            <Link
              href="/login"
              className="inline-block mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
            >
              Go to Login
            </Link>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            <p className="font-semibold">Verification failed.</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}