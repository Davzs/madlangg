'use client';

import { useMounted } from '@/hooks/use-mounted';

interface ClientOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ClientOnly({ children, className }: ClientOnlyProps) {
  const isMounted = useMounted();

  if (!isMounted) {
    return <div className={className} style={{ visibility: 'hidden' }} />;
  }

  return <>{children}</>;
}
