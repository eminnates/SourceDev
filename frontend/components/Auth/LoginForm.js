"use client";

import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import SocialLoginButton from "./SocialLoginButton";
import InputField from "./InputField";
import Checkbox from "./Checkbox";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { email, password, rememberMe });
    // API call will be implemented here
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // OAuth implementation will be here
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-black text-white px-6 py-3 rounded-lg mb-6">
          <span className="text-3xl font-bold">SourceDev</span>
        </div>
        <h1 className="text-brand-dark text-3xl font-bold mb-3">
          Join the SourceDev Community
        </h1>
        <p className="text-brand-dark text-lg">
          SourceDev Community is a community of{" "}
          <span className="font-semibold">amazing</span> developers
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <SocialLoginButton
          provider="Google"
          icon={FaGoogle}
          onClick={() => handleSocialLogin("Google")}
        />
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
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-1.5 rounded-lg transition-colors duration-200"
        >
          Log in
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

