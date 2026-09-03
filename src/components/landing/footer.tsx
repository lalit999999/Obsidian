import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-medium text-foreground">Obsidian</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-5">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <p>© 2026 Obsidian</p>
      </div>
    </footer>
  );
}
