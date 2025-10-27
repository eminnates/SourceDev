import LoginForm from "@/components/Auth/LoginForm";

export const metadata = {
  title: "Login - SourceDev",
  description: "Login to your SourceDev account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <LoginForm />
    </div>
  );
}

