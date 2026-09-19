import Link from "next/link";

export function Navbar() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" href="/" aria-label="Game Hub Startseite">
          <span className="brand__mark" aria-hidden="true">GH</span>
          <span>Game Hub</span>
        </Link>
        <nav className="main-nav" aria-label="Hauptnavigation">
          <Link href="/">Start</Link>
          <Link href="/games">Spiele</Link>
          <Link href="/leaderboard/snake">Leaderboard</Link>
        </nav>
        <div className="site-header__actions">
          <Link className="button button--quiet" href="/login">Anmelden</Link>
          <Link className="button button--small" href="/register">Account erstellen</Link>
        </div>
      </div>
    </header>
  );
}
