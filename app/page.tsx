import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token") ?? false;

  switch (!!token) {
    case true:
      redirect("/dashboard");
      break;
    case false:
      redirect("/auth/login");
      break;
  }
}
