import "@/styles/globals.css";
import "@/styles/design-tokens.css";

// Next.js 16 supports metadata in the layout
export const metadata = {
  title: "EXCHKR",
  icons: {
    icon: "/icons/icon.png", // This sets the favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
