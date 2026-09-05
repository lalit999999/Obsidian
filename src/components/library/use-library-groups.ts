"use client";

import { useEffect, useState } from "react";

interface UseLibraryGroupsResult<T> {
  groups: T[] | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
}

export function useLibraryGroups<T>(url: string): UseLibraryGroupsResult<T> {
  const [groups, setGroups] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload?.error?.message ?? "Failed to load library.");
        }
        if (!cancelled) {
          setGroups(payload.data.groups as T[]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load library.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, reloadKey]);

  return { groups, error, isLoading, reload: () => setReloadKey((key) => key + 1) };
}
