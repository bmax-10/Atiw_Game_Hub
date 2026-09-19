import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell not-found">
      <p className="eyebrow">404</p>
      <h1>Hier gibt es kein Spiel.</h1>
      <p>Der Link führt zu keiner bekannten Seite in Game Hub.</p>
      <Link className="button" href="/games">Zu unseren Spielen</Link>
    </main>
  );
}
