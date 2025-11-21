import type React from 'react';
import { useEffect, useCallback } from 'react';

export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps: React.DependencyList,
) {
  const callback = useCallback(effect, [...deps]);

  useEffect(() => {
    const cleanupPromise = callback();
    return () => {
      if (cleanupPromise instanceof Promise) {
        cleanupPromise.then(cleanup => cleanup && cleanup());
      }
    };
  }, [callback]);
}
