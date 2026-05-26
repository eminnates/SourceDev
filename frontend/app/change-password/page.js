import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { buildLocalizedMetadata } from '@/utils/seo';

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/change-password',
    titleEn: 'Change password',
    titleTr: 'Parola değiştir',
    descriptionEn: 'Securely update your SourceDev account password.',
    descriptionTr: 'SourceDev hesabınızın parolasını güvenli şekilde güncelleyin.',
    noindex: true,
  });
}

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <ChangePasswordForm />
    </div>
  );
}

