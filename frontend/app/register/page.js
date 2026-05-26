import RegisterForm from "@/components/Auth/RegisterForm";
import { buildLocalizedMetadata } from '@/utils/seo';

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/register',
    titleEn: 'Create account',
    titleTr: 'Kayıt ol',
    descriptionEn: 'Create a SourceDev account to share posts and join the developer community.',
    descriptionTr: 'Gönderi paylaşmak ve geliştirici topluluğuna katılmak için bir SourceDev hesabı oluşturun.',
    noindex: true,
  });
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <RegisterForm />
    </div>
  );
}

