import { useEffect } from 'react';
import { useHydration } from '@/store/use-hydration';

export function useMounted() {
  const { isHydrated, setHydrated } = useHydration();

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  return isHydrated;
}
