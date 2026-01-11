import type React from 'react';
import { useCallback, useEffect } from 'react';

export function useAsyncEffect(
  effect: () => Promise<any | (() => void)>,
  deps: React.DependencyList,
) {
  const callback = useCallback(effect, [...deps]);

  useEffect(() => {
    const cleanupPromise = callback();
    return () => {
      if (cleanupPromise instanceof Promise) {
        cleanupPromise.then((cleanup) => cleanup?.());
      }
    };
  }, [callback]);
}
