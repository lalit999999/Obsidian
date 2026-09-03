"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle>Account settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="button">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
// Create a simple account settings card.
//
// Possible UI:
// - Name input.
// - Email input (disabled or editable visually).
// - Save Changes button.
//
// Important:
// - Do not persist data to a backend.
// - If implementing interaction, update local frontend state only.
//
// Use:
// - shadcn Card.
// - Input.
// - Label.
// - Button.
