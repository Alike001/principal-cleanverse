import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Principal",
  description: "Revocable authority for Cleanverse-verified institutional assets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
