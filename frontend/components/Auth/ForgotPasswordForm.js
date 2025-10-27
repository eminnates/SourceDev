"use client";

import { useState } from "react";
import InputField from "./InputField";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Email validation
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    console.log("Password reset requested for:", email);
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-[520px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-black text-white px-6 py-3 rounded-lg mb-6">
            <span className="text-3xl font-bold">SourceDev</span>
          </div>
          <h1 className="text-brand-dark text-3xl font-bold mb-3">
            Check your email
          </h1>
          <p className="text-brand-muted text-base">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="text-brand-primary hover:text-brand-primary-dark font-medium text-base transition-colors"
          >
            Go back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-black text-white px-6 py-3 rounded-lg mb-6">
          <span className="text-3xl font-bold">SourceDev</span>
        </div>
        <h1 className="text-brand-dark text-3xl font-bold mb-3">
          Send me a Sign-in Link
        </h1>
        <p className="text-brand-muted text-base max-w-md mx-auto">
          Enter the email address associated with your account, and we'll send you a one-time link or password reset.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="you@email.com"
          required
        />
        {error && (
          <p className="text-red-500 text-sm -mt-3">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg py-3 rounded-lg transition-colors duration-200"
        >
          Send password reset link
        </button>
      </form>

      <div className="text-center mt-6">
        <a
          href="/login"
          className="text-brand-primary hover:text-brand-primary-dark font-medium text-base transition-colors"
        >
          Go back
        </a>
      </div>
    </div>
  );
}

