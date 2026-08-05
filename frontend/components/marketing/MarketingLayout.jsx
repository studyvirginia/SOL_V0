import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-lg font-bold">
            SOL Prep
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/sol" className="text-muted-foreground hover:text-foreground">
              Subjects
            </Link>
            <Link href="/guides" className="text-muted-foreground hover:text-foreground">
              Guides
            </Link>
            <Button asChild size="sm">
              <a href="https://app.solprep.com">Try the app</a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="container mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} SOL Prep. Built for Virginia SOL exam prep.</p>
            <nav className="flex gap-4">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <Link href="/sol" className="hover:text-foreground">All subjects</Link>
              <Link href="/guides" className="hover:text-foreground">Guides</Link>
              <a href="mailto:hello@solprep.com" className="hover:text-foreground">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
