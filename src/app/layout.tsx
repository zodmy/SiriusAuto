import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sirius Auto - магазин автомобільних запчастин',
  description: 'Sirius Auto - ваш надійний партнер у світі автомобільних запчастин',
  icons: {
    icon: '/SiriusLogo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='mobile-web-app-capable' content='yes' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-x-hidden w-full min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans`}>{children}</body>
    </html>
  );
}
