"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setIsPending(true);
    setMessage("");

    const result = isRegister
      ? await authClient.signUp.email({
          name: String(formData.get("name") ?? ""),
          email,
          password,
          callbackURL: "/profile",
        })
      : await authClient.signIn.email({ email, password, callbackURL: "/profile" });

    setIsPending(false);
    if (result.error) {
      setMessage(result.error.message ?? "Anmeldung nicht möglich.");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <label>
          Anzeigename
          <input name="name" minLength={2} maxLength={40} required autoComplete="nickname" />
        </label>
      )}
      <label>
        E-Mail-Adresse
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Passwort
        <input name="password" type="password" minLength={8} required autoComplete={isRegister ? "new-password" : "current-password"} />
      </label>
      {message && <p className="form-message" role="status">{message}</p>}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Bitte warten …" : isRegister ? "Account erstellen" : "Anmelden"}
      </button>
      <p className="auth-form__switch">
        {isRegister ? "Schon dabei?" : "Noch kein Account?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Anmelden" : "Jetzt registrieren"}</Link>
      </p>
    </form>
  );
}
