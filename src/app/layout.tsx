import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; // SWR provider
import { Navbar } from '../components/Navbar';
import { DonationBar } from '../components/DonationBar';
import { LiveTicker } from '../components/LiveTicker';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Iran War Tracker · Live Intelligence',
  description: 'Zero-bias. AI-verified. Real-time geopolitical intelligence dashboard for the Middle East conflict.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Handle RTL for Arabic and Persian
  const dir = ['ar', 'fa'].includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark">
      <body className={`${inter.className} bg-war-bg text-war-text antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <DonationBar />
            <LiveTicker />
            <Navbar />
            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
