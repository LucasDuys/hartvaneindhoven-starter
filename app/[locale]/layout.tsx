import {NextIntlClientProvider} from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {notFound} from 'next/navigation';
import {getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import Link from 'next/link';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  const t = await getTranslations('Nav');
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <header className="container py-6 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">Hart van Eindhoven</Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/activities">{t('viewActivities')}</Link>
              <Link href="/booking" className="btn-primary">{t('reserve')}</Link>
              <LanguageToggle />
            </nav>
          </header>
          <main className="container pb-20">{children}</main>
          <div className="fixed bottom-4 right-4 md:hidden z-50">
            <Link href="/booking" className="btn-primary shadow-soft" aria-label="Book now">Reserveer nu</Link>
          </div>
          <footer className="container py-12 text-sm text-white/70">
            © {new Date().getFullYear()} Hart van Eindhoven
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}