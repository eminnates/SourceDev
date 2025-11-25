"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken, setUser } from "@/utils/auth";

const decodePayload = (payload) => {
  if (!payload) return null;

  try {
    let normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) {
      normalized += "=";
    }
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode GitHub payload:", error);
    return null;
  }
};

export default function GitHubSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Finishing GitHub sign-in...");

  useEffect(() => {
    const payload = searchParams.get("payload");
    const data = decodePayload(payload);

    if (!data || !data.token || !data.user) {
      setStatusMessage("Unable to finalize GitHub login. Redirecting…");
      const fallback = setTimeout(() => router.replace("/login?error=invalid_payload"), 1500);
      return () => clearTimeout(fallback);
    }

    setToken(data.token);
    setUser(data.user);
    router.replace(data.redirect || "/");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold text-brand-dark">{statusMessage}</p>
        <p className="text-brand-muted text-sm">You can close this tab if nothing happens.</p>
      </div>
    </div>
  );
}

