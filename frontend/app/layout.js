import "@/styles/globals.css";
import Navbar from "@/components/Navbar/Navbar";

export const metadata = {
  title: "SourceDev - Developer Community",
  description: "A community for developers to share knowledge and connect",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
