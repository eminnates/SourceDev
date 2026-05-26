import LoginForm from "@/components/Auth/LoginForm";
import { buildLocalizedMetadata } from '@/utils/seo';

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/login',
    titleEn: 'Log in',
    titleTr: 'Giriş yap',
    descriptionEn: 'Log in to your SourceDev account to manage posts, drafts, and your reading list.',
    descriptionTr: 'Gönderilerinizi, taslaklarınızı ve okuma listenizi yönetmek için SourceDev hesabınıza giriş yapın.',
    noindex: true,
  });
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <LoginForm />
    </div>
  );
}

