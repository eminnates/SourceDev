import "@/styles/globals.css";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";

export const metadata = {
  title: "SourceDev - Developer Community",
  description: "A community for developers to share knowledge and connect",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
