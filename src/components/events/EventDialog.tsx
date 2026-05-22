import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { useEvents } from "@/providers/EventsProvider";
import type { CategoryId, EventDraft } from "@/types/event";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  eventId: string | null;
  defaultStart?: Date;
  defaultCategory?: CategoryId;
}

export function EventDialog({ open, onOpenChange, eventId, defaultStart, defaultCategory }: Props) {
  const { getEvent, createEvent, updateEvent, deleteEvent } = useEvents();
  const initial = eventId ? getEvent(eventId) : undefined;

  const handleSubmit = (draft: EventDraft) => {
    if (initial) updateEvent(initial.id, draft);
    else createEvent(draft);
    onOpenChange(false);
  };

  const handleDelete = initial
    ? () => {
        deleteEvent(initial.id);
        onOpenChange(false);
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>
        <EventForm
          initial={initial}
          defaultStart={defaultStart}
          defaultCategory={defaultCategory}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}