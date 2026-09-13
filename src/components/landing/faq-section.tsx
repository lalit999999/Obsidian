import Link from "next/link";

import { Reveal } from "@/components/landing/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/faq";

const LANDING_FAQ_ITEMS = FAQ_ITEMS.slice(0, 6);

export function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <Reveal>
        <h2 className="max-w-xl font-display text-3xl tracking-[-0.02em] sm:text-4xl">
          Questions people actually ask.
        </h2>
      </Reveal>

      <Reveal delayMs={100} className="mt-10 max-w-3xl">
        <Accordion type="single" collapsible>
          {LANDING_FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Link
          href="/help"
          className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          See all answers
        </Link>
      </Reveal>
    </section>
  );
}
