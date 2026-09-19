import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Account erstellen" };

export default function RegisterPage() {
  return (
    <main className="shell auth-page">
      <section>
        <p className="eyebrow">Dein Spielerkonto</p>
        <h1>Account erstellen</h1>
        <p>Wähle einen Anzeigenamen. Dein Passwort wird nie im Klartext gespeichert.</p>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}
