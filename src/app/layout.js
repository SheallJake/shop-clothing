import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";
import ClientLayout from "@/components/ClientLayout";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { LoadingProvider } from "@/components/LoadingManager";
import { Inter } from "next/font/google";
import { ChatProvider } from "@/context/ChatContext";
import ChatWidget from "@/components/ChatWidget";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthModalProvider } from "@/context/AuthModalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Магазин одягу",
  description: "Next.js магазин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider>
          <LoadingProvider>
            <CartProvider>
              <WishlistProvider>
                <AuthModalProvider>
                  <ClientLayout>
                    <div className="flex flex-col min-h-[calc(100vh-64px)]">
                      <Header />
                      <ChatProvider>
                        <main className="flex-1 py-6 relative max-w-[80%] mx-auto px-4 w-full mt-24">
                          {children}
                        </main>
                        <ChatWidget />
                      </ChatProvider>
                      <Footer />
                    </div>
                  </ClientLayout>
                </AuthModalProvider>
              </WishlistProvider>
            </CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--card-bg)",
                  color: "var(--foreground)",
                  border: "1px solid var(--card-border)",
                },
              }}
            />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
