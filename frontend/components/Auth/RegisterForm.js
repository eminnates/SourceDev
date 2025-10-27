"use client";

import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import SocialLoginButton from "./SocialLoginButton";
import InputField from "./InputField";
import TextArea from "./TextArea";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    bio: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    console.log("Register:", registerData);
 
  };

  const handleSocialLogin = (provider) => {
    console.log(`Register with ${provider}`);
    
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-black text-white px-6 py-3 rounded-lg mb-6">
          <span className="text-3xl font-bold">SourceDev</span>
        </div>
        <h1 className="text-brand-dark text-3xl font-bold mb-3">
          Create your account
        </h1>
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

        <InputField
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="At least 6 characters"
          required
        />
        {errors.password && (
          <p className="text-red-500 text-sm -mt-3">{errors.password}</p>
        )}

        <InputField
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          placeholder="Re-enter your password"
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm -mt-3">{errors.confirmPassword}</p>
        )}

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
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-3 rounded-lg transition-colors duration-200 mt-2"
        >
          Create Account
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

