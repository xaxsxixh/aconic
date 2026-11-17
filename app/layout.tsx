import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixIt — Campus issue reporting",
  description: "Report campus issues, support existing reports, and follow progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
