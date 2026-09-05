"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserSettings, UserUsage } from "@/types/library";
import { SearchQualityCard } from "./search-quality-card";
import { UsageCard } from "./usage-card";

type SettingsField = "hydeEnabled" | "retrievalLimit";

interface SettingsViewProps {
  /** Rendered between the search-quality and usage cards regardless of
   *  load state, for settings (like appearance) that don't depend on the
   *  /api/settings fetch. */
  children?: ReactNode;
}

export function SettingsView({ children }: SettingsViewProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<SettingsField | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch("/api/settings")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(
            payload?.error?.message ?? "Failed to load settings.",
          );
        }
        if (!cancelled) {
          setSettings(payload.data.settings);
          setUsage(payload.data.usage);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load settings.",
          );
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
  }, [reloadKey]);

  const patchSettings = async (
    field: SettingsField,
    patch: Partial<UserSettings>,
  ) => {
    if (!settings) {
      return;
    }

    const previous = settings;
    setPendingField(field);
    setSettings({ ...settings, ...patch });

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Failed to save settings.",
        );
      }
      setSettings(payload.data.settings);
      toast.success("Settings saved");
    } catch (err) {
      setSettings(previous);
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    } finally {
      setPendingField(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-48 rounded-lg" />
        {children}
        <Skeleton className="h-24 rounded-lg" />
      </>
    );
  }

  if (error || !settings || !usage) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Couldn't load your settings</EmptyTitle>
            <EmptyDescription>
              {error ?? "Something went wrong."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setReloadKey((key) => key + 1)}>
              Retry
            </Button>
          </EmptyContent>
        </Empty>
        {children}
      </>
    );
  }

  return (
    <>
      <SearchQualityCard
        settings={settings}
        pendingField={pendingField}
        onChangeHyde={(value) =>
          void patchSettings("hydeEnabled", { hydeEnabled: value })
        }
        onChangeRetrievalLimit={(value) =>
          void patchSettings("retrievalLimit", { retrievalLimit: value })
        }
      />
      {children}
      <UsageCard usage={usage} />
    </>
  );
}
