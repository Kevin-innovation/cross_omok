import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connect Four Online",
  description: "Play Connect Four online with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
