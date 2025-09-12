import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import SafeYear from "../components/SafeYear";

export const metadata: Metadata = {
  title: "Hart van Eindhoven",
  description: "Bowling in a church, karaoke, and more — book your experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="container py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Hart van Eindhoven</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/activities" className="btn-primary">Activiteiten</Link>
            <Link href="/booking" className="btn-primary shadow-soft">Reserveer</Link>
          </nav>
        </header>
        <main className="container pb-20">{children}</main>
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <Link href="/booking" className="btn-primary shadow-soft" aria-label="Book now">Reserveer nu</Link>
        </div>
        <footer className="container py-12 text-sm text-white/70">
          © <SafeYear /> Hart van Eindhoven
        </footer>
      </body>
    </html>
  );
}
