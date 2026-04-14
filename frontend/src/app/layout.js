import "./globals.css";

export const metadata = {
  title: "B2World LMS",
  description: "White-label multi-tenant LMS platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}