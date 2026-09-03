import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold tracking-tight">Obsidian AI</p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            A polished frontend MVP for building project-based knowledge bases
            and chatting with your notes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            Login
          </Link>
        </div>
      </div>
      <div className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        © 2026 Obsidian AI. Frontend only for Part 1.
      </div>
    </footer>
  );
}
// Create the application footer.
//
// Include:
// - Application name/logo.
// - Short project description.
// - Navigation links.
// - Simple copyright text.
//
// Requirements:
// - Keep it minimal.
// - Use responsive layout.
// - No complex functionality.
