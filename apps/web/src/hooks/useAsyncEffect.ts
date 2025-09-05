import React, { useEffect } from 'react';

export function useAsyncEffect(
  effect: () => Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    effect();
  }, [...deps]);
}
