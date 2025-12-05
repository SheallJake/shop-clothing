import "@/styles/globals.css";
import MainLayout from "@/components/MainLayout";
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
import BackgroundWrapper from "@/components/BackgroundWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Магазин одягу",
  description: "Next.js магазин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className="h-full overflow-x-hidden">
      <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}>
        <ThemeProvider>
          <LoadingProvider>
            <AuthModalProvider>
              <CartProvider>
                <WishlistProvider>
                  <ChatProvider>
                    <ClientLayout>
                      <BackgroundWrapper>
                        <MainLayout>
                          {children}
                        </MainLayout>
                        <ChatWidget />
                      </BackgroundWrapper>
                    </ClientLayout>
                  </ChatProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthModalProvider>
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
