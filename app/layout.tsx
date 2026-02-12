import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // Import de la Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wifak Bank - Plateforme IJARA",
  description: "Simulateurs de processus bancaires IJARA, LCI et Délégation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen flex flex-col`}
      >
        {/* Barre de navigation fixe en haut */}
        <Navbar />

        {/* Contenu principal : Occupant toute la largeur sur fond blanc */}
        <main className="flex-1 w-full bg-white animate-in fade-in duration-500">
          {children}
        </main>

        {/* Pied de page simple */}
        <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Wifak Bank - Direction des Systèmes
            d'Information
          </p>
        </footer>
      </body>
    </html>
  );
}
