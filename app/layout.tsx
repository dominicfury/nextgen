import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NextGen Diesel Tuning",
    template: "%s · NextGen Diesel",
  },
  description:
    "Pre-made diesel tuning files for serious truck owners. Buy, download, send it.",
  applicationName: "NextGen Diesel",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfd",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
