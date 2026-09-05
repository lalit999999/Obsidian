import { Mail, MessageCircleQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT } from "@/lib/support";

export function HelpContact() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Still stuck?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <a href={SUPPORT.issuesUrl} target="_blank" rel="noreferrer">
            <MessageCircleQuestion className="size-4" />
            Report an issue
          </a>
        </Button>
        {SUPPORT.email ? (
          <Button asChild variant="outline">
            <a href={`mailto:${SUPPORT.email}`}>
              <Mail className="size-4" />
              {SUPPORT.email}
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
