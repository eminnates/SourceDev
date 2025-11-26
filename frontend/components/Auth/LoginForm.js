"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import SocialLoginButton from "./SocialLoginButton";
import InputField from "./InputField";
import Checkbox from "./Checkbox";
import { login } from "@/utils/api/authApi";
import { isAuthenticated } from "@/utils/auth";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hata ve başarı mesajlarını temizle
    setError(null);
    setSuccessMessage(null);
    
    setIsLoading(true);

    try {
      const result = await login({
        emailOrUsername: email,
        password: password,
        rememberMe: rememberMe
      });
      
      if (result.success) {
        setSuccessMessage(result.message || 'Login successful!');
        
        // Redirect to home and reload to update navbar
        setTimeout(() => {
          router.push('/');
          window.location.reload();
        }, 300);
      } else {
        // Hata mesajını göster - eğer mesaj yoksa varsayılan mesaj kullan
        const errorMsg = result.message || result.error || 'Invalid email or password. Please try again.';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Beklenmeyen hatalar için (network hatası vs.)
      const errorMsg = err?.message || err?.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
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
    
    console.log(`Login with ${provider}`);
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
          Log in to your account
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

      {/* Divider */}
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

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <a
            href="/forgot-password"
            className="text-brand-primary hover:text-primary_dark font-medium text-base transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-1.5 rounded-lg transition-colors duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-6">
        <p className="text-brand-dark text-base">
          New to SourceDev Community?{" "}
          <a
            href="/register"
            className="text-brand-primary hover:text-brand-primary-dark font-medium transition-colors"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}

