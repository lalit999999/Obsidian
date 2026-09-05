import { Sparkle } from "lucide-react";

import { CitationText } from "@/components/ui/markdown";
import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker";

interface KeyPointsProps {
  keyPoints: string[];
}

export function KeyPoints({ keyPoints }: KeyPointsProps) {
  if (keyPoints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5 rounded-md border bg-muted/20 p-3">
      {keyPoints.map((point, index) => (
        <Marker key={index}>
          <MarkerIcon>
            <Sparkle className="fill-primary/20 text-primary" />
          </MarkerIcon>
          <MarkerContent>
            <CitationText text={point} />
          </MarkerContent>
        </Marker>
      ))}
    </div>
  );
}
