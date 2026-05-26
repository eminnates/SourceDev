"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "./InputField";
import { changePassword } from "@/utils/api/authApi";
import { getUser, removeToken, removeUser } from "@/utils/auth";
import { getUserById } from "@/utils/api/userApi";
import { useLanguage } from '@/context/LanguageContext';
import { buildLocalizedHref } from '@/utils/seo';

const getFallbackAvatar = (seed = 'User') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=1ABC9C&color=fff&bold=true`;

export default function ChangePasswordForm() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Check password requirements
  const passwordRequirements = {
    minLength: newPassword.length >= 6,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    notEmpty: newPassword.length > 0
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const fetchUserProfile = async () => {
    try {
      const currentUser = getUser();
      if (!currentUser || !currentUser.id) {
        router.push(buildLocalizedHref('/login', lang));
        return;
      }

      const response = await getUserById(currentUser.id);
      if (response.success && response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hata ve başarı mesajlarını temizle
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!currentPassword) {
      setError(t('auth.currentPasswordRequired'));
      return;
    }

    if (!newPassword) {
      setError(t('auth.newPasswordRequired'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.newPasswordMinLength'));
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError(t('auth.newPasswordUppercase'));
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError(t('auth.newPasswordLowercase'));
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError(t('auth.newPasswordNumber'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.newPasswordsDoNotMatch'));
      return;
    }

    if (currentPassword === newPassword) {
      setError(t('auth.newPasswordSameAsCurrent'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });
      
      if (result.success) {
        setSuccessMessage(t('auth.changePasswordSuccess'));
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Clear localStorage and redirect to login
        removeToken();
        removeUser();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(buildLocalizedHref('/login', lang));
        }, 2000);
      } else {
        setError(result.message || "Failed to change password. Please try again.");
      }
    } catch (err) {
      console.error('Change password error:', err);
      const errorMsg = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  const profileImageUrl = userData?.profileImageUrl || getFallbackAvatar(userData?.displayName || userData?.username || 'User');
  const displayName = userData?.displayName || userData?.username || 'User';

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-brand-dark text-3xl font-bold mb-3">
          {t('auth.changePassword')}
        </h1>
        <p className="text-brand-muted text-base">
          {t('auth.updatePasswordSubtitle')}
        </p>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-brand-primary/40 overflow-hidden shadow-lg">
          <img
            src={profileImageUrl}
            alt={`${displayName}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          label={t('auth.currentPassword')}
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setError(null);
          }}
          required
        />

        <div>
          <InputField
            label={t('auth.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            onFocus={() => setNewPasswordFocused(true)}
            placeholder={t('auth.newPasswordPlaceholder')}
            required
          />

          {/* Password Requirements */}
          {(newPasswordFocused || newPassword.length > 0) && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">{t('auth.passwordRequirements')}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {passwordRequirements.minLength ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                    {t('auth.reqMinLength')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasUpperCase ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-600'}`}>
                    {t('auth.reqUppercase')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasLowerCase ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-600'}`}>
                    {t('auth.reqLowercase')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasNumber ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                    {t('auth.reqNumber')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <InputField
            label={t('auth.confirmNewPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            onFocus={() => setConfirmPasswordFocused(true)}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            required
          />
          
          {/* Password Match Indicator */}
          {confirmPasswordFocused && confirmPassword.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {passwordsMatch ? (
                  <>
                    <span className="text-green-500 text-sm">✓</span>
                    <span className="text-xs text-green-600">{t('auth.passwordsMatch')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-500 text-sm">✗</span>
                    <span className="text-xs text-red-600">{t('auth.passwordsNotMatch')}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-1.5 rounded-lg transition-colors duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? t('auth.changingPassword') : t('auth.changePassword')}
        </button>
      </form>

      {/* Back to Settings Link */}
      <div className="text-center mt-6">
        <a
          href={buildLocalizedHref('/settings', lang)}
          className="text-brand-primary hover:text-brand-primary-dark font-medium text-base transition-colors"
        >
          {t('auth.backToSettings')}
        </a>
      </div>
    </div>
  );
}

