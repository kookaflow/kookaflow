import { Languages } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DisplayPreferences() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-4 text-primary" /> Display
        </CardTitle>
        <CardDescription>Language and regional display options.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <div className="text-sm font-medium">Language</div>
            <div className="text-xs text-muted-foreground">More languages coming soon.</div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            English
          </span>
        </div>
      </CardContent>
    </Card>
  );
}