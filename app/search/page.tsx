import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
  }>;
}

// ── Google Sitelinks SearchAction Endpoint: /search?q={search_term_string} ──
export default async function SearchRoutePage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const term = query.q || query.search || '';
  const category = query.category || '';

  const params = new URLSearchParams();
  if (term) params.set('search', term);
  if (category) params.set('category', category);

  const queryStr = params.toString();
  redirect(queryStr ? `/produse?${queryStr}` : '/produse');
}
