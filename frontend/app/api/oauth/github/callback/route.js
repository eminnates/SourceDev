"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5254/api";

const jsonBase64Url = (data) =>
  Buffer.from(JSON.stringify(data), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const clearStateCookie = (response) => {
  response.cookies.set("github_oauth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const buildDerivedPassword = (githubId) => {
  const pepper = process.env.GITHUB_OAUTH_PEPPER;
  if (!pepper) {
    throw new Error("GITHUB_OAUTH_PEPPER is not configured.");
  }

  const base = createHash("sha256").update(`${githubId}:${pepper}`).digest("hex");
  const numericChunk = base.replace(/\D/g, "");
  const numberPart = numericChunk.slice(0, 4) || "1234";
  const lowerPart = base.slice(0, 6);
  return `A${lowerPart}${numberPart}!`;
};

const fetchGitHubAccessToken = async (code, redirectUri) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured properly.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: params,
  });

  if (!res.ok) {
    throw new Error("Failed to exchange code for access token.");
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(data.error_description || "GitHub did not return an access token.");
  }

  return data.access_token;
};

const fetchGitHubProfile = async (token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "SourceDevApp",
    Accept: "application/json",
  };

  const [profileRes, emailRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers }),
    fetch("https://api.github.com/user/emails", { headers }),
  ]);

  if (!profileRes.ok) {
    throw new Error("Failed to fetch GitHub profile.");
  }

  const profile = await profileRes.json();

  if (!emailRes.ok) {
    throw new Error("Failed to fetch GitHub emails.");
  }

  const emails = await emailRes.json();
  const primaryEmailEntry = emails.find((entry) => entry.primary && entry.verified) || emails.find((entry) => entry.verified);
  const email = primaryEmailEntry?.email || profile.email;

  if (!email) {
    throw new Error("GitHub account does not have a verified email address.");
  }

  return { profile, email };
};

const parseAuthResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!data.success || !data.token || !data.user) {
    throw new Error(data.message || "Authentication failed.");
  }
  return { token: data.token, user: data.user };
};

const loginOrRegister = async ({ username, email, password, displayName }) => {
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      emailOrUsername: username,
      password,
      rememberMe: true,
    }),
  });

  if (loginResponse.ok) {
    return parseAuthResponse(loginResponse);
  }

  if (loginResponse.status !== 401) {
    const errorBody = await loginResponse.json().catch(() => ({}));
    throw new Error(errorBody.message || "GitHub login failed.");
  }

  const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      displayName: displayName || username,
    }),
  });

  if (!registerResponse.ok) {
    const errorBody = await registerResponse.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to register with GitHub credentials.");
  }

  return parseAuthResponse(registerResponse);
};

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const incomingState = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedStateCookie = cookieStore.get("github_oauth_state");

  if (!storedStateCookie) {
    return NextResponse.redirect(new URL("/login?error=missing_state", url.origin));
  }

  const [storedState, encodedRedirect] = storedStateCookie.value.split(":");

  if (!incomingState || incomingState !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  try {
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT || `${url.origin}/api/oauth/github/callback`;
    const accessToken = await fetchGitHubAccessToken(code, redirectUri);
    const { profile, email } = await fetchGitHubProfile(accessToken);
    const derivedPassword = buildDerivedPassword(profile.id.toString());

    const authResult = await loginOrRegister({
      username: profile.login,
      email,
      password: derivedPassword,
      displayName: profile.name || profile.login,
    });

    const payloadData = {
      token: authResult.token,
      user: authResult.user,
      redirect: decodeURIComponent(encodedRedirect || "%2F"),
    };

    const response = NextResponse.redirect(new URL(`/login/github-success?payload=${jsonBase64Url(payloadData)}`, url.origin));
    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    const response = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
    clearStateCookie(response);
    return response;
  }
}

