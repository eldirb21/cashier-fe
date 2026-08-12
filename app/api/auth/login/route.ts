import { NextResponse } from "next/server";

const baseUrl = process.env.API_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);

    // 🔥 SET COOKIE DI NEXT (INI KUNCI)
    response.cookies.set("token", data.data.accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Login gagal" }, { status: 500 });
  }
}
