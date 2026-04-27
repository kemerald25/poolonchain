import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/ui/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PoolOnChain",
  description: "Web3 8-Ball Pool with XRP Wagers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-pool-dark text-white min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 flex flex-col relative">
            {children}
        </main>
      </body>
    </html>
  );
}
