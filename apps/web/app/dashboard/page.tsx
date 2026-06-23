import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN:     "/super-admin",
  ADMIN:           "/admin",
  MANAGER:         "/manager",
  CORPORATE_ADMIN: "/corporate",
  MENTOR:          "/mentor",
  MEMBER:          "/member",
};

export default async function DashboardRedirect() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache:   "no-store",
    });

    if (!res.ok) {
      redirect("/");
    }

    const json = await res.json();
    const role: string = json?.data?.user?.role ?? "";
    const home = ROLE_HOME[role] ?? "/";
    redirect(home);
  } catch {
    redirect("/");
  }
}
