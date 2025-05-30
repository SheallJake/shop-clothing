import '@/styles/globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = {
  title: 'Магазин одягу',
  description: 'Next.js магазин',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <Header />
        <main className="flex-1 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
