import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import { buildLocalizedMetadata } from '@/utils/seo';

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/forgot-password',
    titleEn: 'Reset password',
    titleTr: 'Parola sıfırla',
    descriptionEn: 'Request a password reset for your SourceDev account.',
    descriptionTr: 'SourceDev hesabınız için parola sıfırlama bağlantısı isteyin.',
    noindex: true,
  });
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}

