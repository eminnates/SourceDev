"use client";

export default function SocialLoginButton({ provider, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-6 py-3 bg-white border border-brand-muted/20 rounded-lg hover:bg-brand-background  transition-all duration-200 group cursor-pointer"
    >
      <Icon className="text-2xl text-brand-dark transition-colors duration-200" />
      <span className="text-brand-dark font-medium text-base transition-colors duration-200">
        Continue with {provider}
      </span>
    </button>
  );
}

