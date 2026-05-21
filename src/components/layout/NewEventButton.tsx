import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewEventButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="gap-1.5">
      <Plus className="size-4" />
      New event
    </Button>
  );
}