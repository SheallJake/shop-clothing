import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";
import ClientLayout from "@/components/ClientLayout";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { LoadingProvider } from "@/components/LoadingManager";
import { Inter } from "next/font/google";
import UserChatWidget from "@/components/UserChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Магазин одягу",
  description: "Next.js магазин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className="h-full">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <LoadingProvider>
          <Header />
          <CartProvider>
            <WishlistProvider>
              <ClientLayout>
                <div className="flex flex-col min-h-[calc(100vh-64px)]">
                  <main className="flex-1 py-6 relative">{children}</main>
                  <UserChatWidget userName="Ruslan" />
                  <Footer />
                </div>
              </ClientLayout>
            </WishlistProvider>
          </CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#22c55e",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />
        </LoadingProvider>
      </body>
    </html>
  );
}
