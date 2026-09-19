"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ProfilePanel() {
  const router = useRouter();
  const { data, isPending, error } = authClient.useSession();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending) return <p className="muted">Profil wird geladen …</p>;
  if (!data?.user) {
    return (
      <div className="notice notice--warning">
        <strong>Du bist nicht angemeldet.</strong>
        <p>{error?.message ?? "Melde dich an, um deinen Account und gespeicherte Scores zu sehen."}</p>
        <Link className="button button--small" href="/login">Anmelden</Link>
      </div>
    );
  }

  return (
    <section className="profile-card">
      <p className="eyebrow">Angemeldet als</p>
      <h2>{data.user.name}</h2>
      <p>{data.user.email}</p>
      <div className="profile-card__actions">
        <Link className="button button--quiet" href="/leaderboard/snake">Meine Platzierung</Link>
        <button className="button" onClick={signOut} type="button">Abmelden</button>
      </div>
    </section>
  );
}
