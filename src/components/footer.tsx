import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="brand">Game Hub</p>
          <p>Unsere selbst programmierten Browser-Games.</p>
        </div>
        <div className="site-footer__links">
          <Link href="/games">Spiele</Link>
          <Link href="/leaderboard/snake">Leaderboard</Link>
          <Link href="/profile">Profil</Link>
        </div>
      </div>
    </footer>
  );
}
