import RegisterForm from "@/components/Auth/RegisterForm";

export const metadata = {
  title: "Register - SourceDev",
  description: "Create your SourceDev account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <RegisterForm />
    </div>
  );
}

