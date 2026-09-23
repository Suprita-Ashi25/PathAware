import { Link } from 'wouter';

export default function PathAwareLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center group" aria-label="PathAware home">
      <img
        src="/pathaware-logo.svg"
        alt="PathAware"
        className={compact ? 'h-9 w-auto' : 'h-12 w-auto'}
      />
    </Link>
  );
}
