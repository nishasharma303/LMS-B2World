import AuthLayout from "../components/AuthLayout";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue to your dashboard."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}