import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vessel SSH",
  description: "Vessel SSh is a Gui SSH",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.0/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
