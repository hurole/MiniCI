import { useCallback, useEffect } from 'react';
import type React from 'react';

export function useAsyncEffect(effect: () => Promise<any | (() => void)>, deps: React.DependencyList) {
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(effect, [...deps]);

  useEffect(() => {
    const cleanupPromise = callback();
    return () => {
      if (cleanupPromise instanceof Promise) {
        cleanupPromise.then(cleanup => cleanup?.());
      }
    };
  }, [callback]);
}
