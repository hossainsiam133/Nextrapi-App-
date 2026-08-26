import "./globals.css";
import Nav from "../components/Nav";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
