import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpIntro() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Answers to common questions about uploading documents, chatting
          over them, and what to do when something looks stuck.
        </p>
      </CardContent>
    </Card>
  );
}
