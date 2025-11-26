import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";

export const metadata = {
  title: "Change Password - SourceDev",
  description: "Change your SourceDev account password",
};

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <ChangePasswordForm />
    </div>
  );
}

