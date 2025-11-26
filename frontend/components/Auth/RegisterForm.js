"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import SocialLoginButton from "./SocialLoginButton";
import InputField from "./InputField";
import TextArea from "./TextArea";
import { register } from "@/utils/api/authApi";
import { isAuthenticated } from "@/utils/auth";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    bio: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Check password requirements
  const passwordRequirements = {
    minLength: formData.password.length >= 6,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    notEmpty: formData.password.length > 0
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
    // Clear server error
    if (serverError) {
      setServerError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = "Username must be between 3 and 30 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length < 2 || formData.displayName.length > 50) {
      newErrors.displayName = "Display name must be between 2 and 50 characters";
    }

    // Bio validation (optional but max 200)
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = "Bio cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setServerError(null);
    setSuccessMessage(null);
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const registerData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
      bio: formData.bio || undefined
    };

    setIsLoading(true);

    try {
      const result = await register(registerData);
      
      if (result.success) {
        setSuccessMessage(result.message);
        
        // Redirect to home and reload to update navbar
        setTimeout(() => {
          router.push('/');
          window.location.reload();
        }, 300);
      } else {
        // Backend'den gelen hata mesajını göster
        setServerError(result.message);
        
        // Eğer backend'den field-specific hatalar geldiyse
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "GitHub") {
      const redirect = encodeURIComponent('/');
      window.location.href = `/api/oauth/github?redirect=${redirect}`;
      return;
    }

    console.log(`Register with ${provider}`);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/">
        <div className="inline-block bg-black text-white px-6 py-3 rounded-lg mb-6">
          <span className="text-3xl font-bold">SourceDev</span>
        </div>
        </Link>
        <h1 className="text-brand-dark text-3xl font-bold mb-3">
          Create your account
        </h1>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <SocialLoginButton
          provider="GitHub"
          icon={FaGithub}
          onClick={() => handleSocialLogin("GitHub")}
        />
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-brand-muted font-medium">
            OR
          </span>
        </div>
      </div>

      {/* Error Message */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => handleChange("username", e.target.value)}
          placeholder="Choose a unique username"
          required
        />
        {errors.username && (
          <p className="text-red-500 text-sm -mt-3">{errors.username}</p>
        )}

        <InputField
          label="Display Name"
          type="text"
          value={formData.displayName}
          onChange={(e) => handleChange("displayName", e.target.value)}
          placeholder="Your name as it will appear"
          required
        />
        {errors.displayName && (
          <p className="text-red-500 text-sm -mt-3">{errors.displayName}</p>
        )}

        <InputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="your.email@example.com"
          required
        />
        {errors.email && (
          <p className="text-red-500 text-sm -mt-3">{errors.email}</p>
        )}

        <div>
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            placeholder="At least 6 characters"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
          
          {/* Password Requirements */}
          {(passwordFocused || formData.password.length > 0) && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {passwordRequirements.minLength ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasUpperCase ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-600'}`}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasLowerCase ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-600'}`}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordRequirements.hasNumber ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-sm">○</span>
                  )}
                  <span className={`text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                    One number (0-9)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <InputField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onFocus={() => setConfirmPasswordFocused(true)}
            placeholder="Re-enter your password"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
          
          {/* Password Match Indicator */}
          {confirmPasswordFocused && formData.confirmPassword.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {passwordsMatch ? (
                  <>
                    <span className="text-green-500 text-sm">✓</span>
                    <span className="text-xs text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-500 text-sm">✗</span>
                    <span className="text-xs text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <TextArea
          label="Bio (Optional)"
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={200}
          rows={4}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm -mt-3">{errors.bio}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-3 rounded-lg transition-colors duration-200 mt-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Terms */}
      <div className="text-center mt-4">
        <p className="text-brand-muted text-sm">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-brand-primary hover:text-brand-primary-dark transition-colors">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-brand-primary hover:text-brand-primary-dark transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-brand-dark text-base">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-brand-primary hover:text-brand-primary-dark font-medium transition-colors"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

