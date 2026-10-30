import Link from 'next/link';
import { Tag, Sparkles, Compass } from 'lucide-react';
import { SEOManager } from '@/lib/seo';

interface PopularSearchesProps {
  categorySlug: string;
  categoryName?: string;
  title?: string;
  className?: string;
}

export default function PopularSearches({
  categorySlug,
  categoryName,
  title,
  className = '',
}: PopularSearchesProps) {
  return null;
}
