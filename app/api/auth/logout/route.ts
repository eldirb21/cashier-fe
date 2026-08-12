import { NextResponse } from "next/server";
const baseUrl = process.env.API_URL;

export async function POST(req: Request) {
  try {
    const cookieStore = req.headers.get("cookie") || "";

    // ambil refreshToken dari cookie
    const refreshToken = cookieStore
      .split("; ")
      .find((c) => c.startsWith("refreshToken="))
      ?.split("=")[1];

    // call backend logout
    if (refreshToken) {
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    }

    const res = NextResponse.json({ message: "Logout berhasil" });

    // 🔥 hapus semua cookie
    res.cookies.set("token", "", { maxAge: 0, path: "/" });
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error) {
    return NextResponse.json({ message: "Logout gagal" }, { status: 500 });
  }
}
