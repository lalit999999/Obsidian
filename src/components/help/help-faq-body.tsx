"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategory } from "@/lib/faq";

type CategoryFilter = FaqCategory | "all";

export function HelpFaqBody() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        category === "all" || item.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          type="search"
          placeholder="Search questions..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10"
          aria-label="Search FAQ"
        />

        <ToggleGroup
          type="single"
          value={category}
          onValueChange={(value) => {
            if (value) {
              setCategory(value as CategoryFilter);
            }
          }}
          variant="outline"
          className="flex-wrap justify-start"
        >
          <ToggleGroupItem value="all" className="rounded-full px-3">
            All
          </ToggleGroupItem>
          {FAQ_CATEGORIES.map((cat) => (
            <ToggleGroupItem
              key={cat.value}
              value={cat.value}
              className="rounded-full px-3"
            >
              {cat.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filteredItems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No matching questions</EmptyTitle>
            <EmptyDescription>
              Try a different search term or category.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Accordion type="single" collapsible>
          {filteredItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
