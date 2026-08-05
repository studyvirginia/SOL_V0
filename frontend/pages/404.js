import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold">This page doesn't exist</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for was moved or never existed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
