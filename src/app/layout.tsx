import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Note Board",
  description: "A board for your notes",
  icons: {
    icon: "/note.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
