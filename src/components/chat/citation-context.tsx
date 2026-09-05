"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { AnswerCitation } from "@/types/chat";

export interface CitationContextValue {
  citations: AnswerCitation[];
  onOpenSource: (documentId: string, chunkIndex: number) => void;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function CitationProvider({
  citations,
  onOpenSource,
  children,
}: CitationContextValue & { children: ReactNode }) {
  return (
    <CitationContext.Provider value={{ citations, onOpenSource }}>
      {children}
    </CitationContext.Provider>
  );
}

export function useCitations(): CitationContextValue | null {
  return useContext(CitationContext);
}
