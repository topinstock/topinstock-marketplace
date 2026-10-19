import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panou Administrare — TOPinStock',
  description: 'Panoul de control pentru administrarea catalogului, produselor și comenzilor TOPinStock.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
