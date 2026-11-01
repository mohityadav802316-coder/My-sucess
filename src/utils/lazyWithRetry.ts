import React from 'react';

/**
 * Robust lazy-loading wrapper with retry logic for dynamic imports.
 * Protects against transient network dropouts, Vite chunk hash invalidation,
 * and browser caching errors that cause "Failed to fetch dynamically imported module".
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName?: string,
  maxRetries = 2,
  delayMs = 600
): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;

      const executeImport = () => {
        attempts++;
        importFn()
          .then((module) => {
            if (!module) {
              throw new Error('Imported module is undefined');
            }
            if (exportName && module[exportName]) {
              resolve({ default: module[exportName] });
            } else if (module.default) {
              resolve({ default: module.default });
            } else if (typeof module === 'function') {
              resolve({ default: module });
            } else {
              // Try finding any exported React component
              const firstKey = Object.keys(module)[0];
              if (firstKey && module[firstKey]) {
                resolve({ default: module[firstKey] });
              } else {
                resolve({ default: module });
              }
            }
          })
          .catch((err) => {
            console.warn(
              `[lazyWithRetry] Dynamic import attempt ${attempts} failed:`,
              err?.message || err
            );
            if (attempts <= maxRetries) {
              setTimeout(executeImport, delayMs * attempts);
            } else {
              reject(err);
            }
          });
      };

      executeImport();
    });
  });
}
