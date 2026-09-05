"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = mounted && theme === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => setTheme(option.value)}
              >
                <Icon className="size-4" />
                {option.label}
              </Button>
            );
          })}
        </ButtonGroup>
      </CardContent>
    </Card>
  );
}
