import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Signup as institute admin, teacher or student."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}