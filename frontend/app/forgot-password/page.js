import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password - SourceDev",
  description: "Reset your SourceDev account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}

