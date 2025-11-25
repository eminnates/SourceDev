"use server";

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const FIVE_MINUTES = 60 * 5;

export async function GET(request) {
  const url = new URL(request.url);
  const state = randomBytes(16).toString("hex");
  const requestedRedirect = url.searchParams.get("redirect") || "/";
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT || `${url.origin}/api/oauth/github/callback`;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured. Missing GITHUB_CLIENT_ID." },
      { status: 500 }
    );
  }

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set("github_oauth_state", `${state}:${encodeURIComponent(requestedRedirect)}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: FIVE_MINUTES,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

