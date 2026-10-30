import type { Metadata } from "next";
import { ProfilePanel } from "@/components/profile-panel";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilePage() {
  return (
    <main className="shell page-section profile-page">
      <p className="eyebrow">Spielerkonto</p>
      <h1 className="page-title">Mein Profil</h1>
      <ProfilePanel />
    </main>
  );
}
