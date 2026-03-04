'use client';

import { useState, useEffect } from 'react';
import { useYoClient } from '@yo-protocol/react';
import type { VaultSnapshot } from '@yo-protocol/core';
import type { Address } from 'viem';

interface UseVaultSnapshotResult {
  snapshot: VaultSnapshot | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetches a VaultSnapshot (including yield stats) from the YO API.
 * The SDK doesn't ship a dedicated hook for this, so we wrap client.getVaultSnapshot().
 */
export function useVaultSnapshot(vault: Address): UseVaultSnapshotResult {
  const client = useYoClient();
  const [snapshot, setSnapshot] = useState<VaultSnapshot | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setError(null);

    client
      .getVaultSnapshot(vault)
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setIsError(true);
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, vault]);

  return { snapshot, isLoading, isError, error };
}
