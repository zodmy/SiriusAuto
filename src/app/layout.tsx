import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Sirius Auto - магазин автомобільних запчастин',
    template: '%s | Sirius Auto',
  },
  description: 'Sirius Auto - ваш надійний партнер у світі автомобільних запчастин. Великий вибір запчастин, швидка доставка, доступні ціни.',
  keywords: ['автозапчастини', 'запчастини', 'автомобіль', 'ремонт', 'обслуговування', 'Україна'],
  authors: [{ name: 'Sirius Auto' }],
  creator: 'Sirius Auto',
  publisher: 'Sirius Auto',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Sirius Auto',
    title: 'Sirius Auto - магазин автомобільних запчастин',
    description: 'Ваш надійний партнер у світі автомобільних запчастин',
  },
  icons: {
    icon: '/SiriusLogo.svg',
    shortcut: '/SiriusLogo.svg',
    apple: '/SiriusLogo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='uk'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='mobile-web-app-capable' content='yes' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-x-hidden w-full min-h-screen bg-white text-gray-900 font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
