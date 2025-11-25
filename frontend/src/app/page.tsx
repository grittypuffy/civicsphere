import { redirect } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';

// This page only renders when the user is at the root
export default function RootPage() {
    redirect(`/${routing.defaultLocale}`);
}
