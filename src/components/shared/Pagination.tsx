import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pageUrl(basePath: string, page: number) {
  return `${basePath}?page=${page}`;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);
  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Pagination">
      {isFirst ? (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground/40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={pageUrl(basePath, page - 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center h-9 w-9 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(basePath, p)}
            className={cn(
              'inline-flex items-center justify-center h-9 w-9 rounded-md text-sm transition-colors',
              p === page
                ? 'bg-primary text-primary-foreground font-medium pointer-events-none'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {isLast ? (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground/40 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={pageUrl(basePath, page + 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
