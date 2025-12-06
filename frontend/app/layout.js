import "@/styles/globals.css";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "SourceDev - Developer Community",
  description: "A community for developers to share knowledge and connect",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-brand-background`}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
