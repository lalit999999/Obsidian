import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingButtonProps extends ComponentProps<typeof Button> {
  landingVariant?: "primary" | "secondary";
  children: ReactNode;
}

type ChildElement = ReactElement<{
  children?: ReactNode;
  className?: string;
}>;

function decorate(landingVariant: "primary" | "secondary", inner: ReactNode) {
  if (landingVariant === "secondary") {
    return (
      <>
        <span className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/cta:-translate-x-0.5">
          {inner}
        </span>
        <ChevronRight className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/cta:translate-x-1" />
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/cta:translate-x-full"
      />
      <span className="relative">{inner}</span>
    </>
  );
}

export function LandingButton({
  landingVariant = "primary",
  variant,
  className,
  asChild,
  children,
  ...props
}: LandingButtonProps) {
  const sweepClass =
    landingVariant === "primary"
      ? "group/cta relative isolate overflow-hidden motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.98]"
      : "group/cta motion-safe:transition-colors motion-safe:duration-200";

  const resolvedVariant =
    variant ?? (landingVariant === "secondary" ? "outline" : "default");

  if (asChild && isValidElement(children)) {
    const child = children as ChildElement;
    return (
      <Button
        asChild
        variant={resolvedVariant}
        className={cn(sweepClass, className)}
        {...props}
      >
        {cloneElement(child, {
          children: decorate(landingVariant, child.props.children),
        })}
      </Button>
    );
  }

  return (
    <Button
      variant={resolvedVariant}
      className={cn(sweepClass, className)}
      {...props}
    >
      {decorate(landingVariant, children)}
    </Button>
  );
}
