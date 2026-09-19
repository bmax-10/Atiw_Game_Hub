import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Anmelden" };

export default function LoginPage() {
  return (
    <main className="shell auth-page">
      <section>
        <p className="eyebrow">Willkommen zurück</p>
        <h1>Anmelden</h1>
        <p>Speichere deine Bestleistungen und finde deine Position im Leaderboard.</p>
      </section>
      <AuthForm mode="login" />
    </main>
  );
}
