'use client';

import {useRouter} from 'next/navigation';
import { useLocale } from 'next-intl';
import {usePathname} from 'next/navigation';
import {useTransition} from 'react';

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'en' ? 'nl' : 'en';

  const handleChange = () => {
    startTransition(() => {
      const newPath = pathname.replace(/^\/[^\/]+/, `/${otherLocale}`);
      router.push(newPath as any);
    });
  };

  return (
    <button
      onClick={handleChange}
      disabled={isPending}
      className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending ? 'Switching...' : otherLocale.toUpperCase()}
    </button>
  );
}