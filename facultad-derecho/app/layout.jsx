import "./globals.css";
import { AuthProvider } from "@/components/AuthCont";

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="bg-[#f2f2f2] ">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
