import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/landing/hero-demo";
import { Reveal } from "@/components/landing/reveal";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8 lg:py-24">
      <Reveal from="left">
        <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
          Ask questions and get answers you can trace back to your own notes.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Upload your documents into a project, then chat with an assistant
          that answers only from what you gave it — every claim links back to
          the passage it came from.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/login">Get started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </Reveal>

      <Reveal from="right" delayMs={150}>
        <HeroDemo />
      </Reveal>
    </section>
  );
}
