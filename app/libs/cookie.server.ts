"use client"

import { cookies } from "next/headers";

// SET
export const setTokenCookie = async (accessToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
};

// GET
export const getTokenCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
};

// DELETE
export const deleteTokenCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
};