import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,166,255,0.12),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-6 py-10 text-white lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
