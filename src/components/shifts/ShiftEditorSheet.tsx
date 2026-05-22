import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/events/IconPicker";
import { useShiftTemplates } from "@/providers/ShiftTemplatesProvider";
import type { ShiftTemplateDTO } from "@/lib/shift-templates.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLOURS = [
  "#F59E0B", "#F97316", "#EF4444", "#EC4899", "#A855F7", "#6366F1",
  "#3B82F6", "#0EA5E9", "#14B8A6", "#10B981", "#22C55E", "#84CC16",
  "#FACC15", "#D4A017", "#64748B", "#94A3B8",
];

const CATEGORIES = [
  { value: "working", label: "Working" },
  { value: "leave", label: "Leave" },
  { value: "non_working", label: "Non-working" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  template: ShiftTemplateDTO | null;
}

export function ShiftEditorSheet({ open, onOpenChange, template }: Props) {
  const { create, update } = useShiftTemplates();
  const [name, setName] = useState("");
  const [colour, setColour] = useState(COLOURS[0]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [category, setCategory] = useState<ShiftTemplateDTO["category"]>("working");
  const [iconName, setIconName] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name);
      setColour(template.colour);
      setStart(template.defaultStart?.slice(0, 5) ?? "09:00");
      setEnd(template.defaultEnd?.slice(0, 5) ?? "17:00");
      setCategory(template.category);
      setIconName(template.iconName ?? undefined);
    } else {
      setName("");
      setColour(COLOURS[0]);
      setStart("09:00");
      setEnd("17:00");
      setCategory("working");
      setIconName(undefined);
    }
  }, [open, template]);

  const duration = (() => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let m = eh * 60 + em - (sh * 60 + sm);
    if (m <= 0) m += 24 * 60;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  })();

  const onSave = async () => {
    if (!name.trim()) {
      toast("Name required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        colour,
        iconName: iconName ?? null,
        defaultStart: start || null,
        defaultEnd: end || null,
        category,
        baseType: null,
      };
      if (template) {
        await update(template.id, payload);
      } else {
        await create({ ...payload });
      }
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{template ? "Edit shift" : "New shift"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="shift-name">Name</Label>
            <Input
              id="shift-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 12))}
              maxLength={12}
              placeholder="e.g. Long Day"
            />
          </div>
          <div>
            <Label>Colour</Label>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  aria-label={c}
                  className={cn(
                    "h-9 rounded-lg transition-transform",
                    colour === c && "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shift-start">Start</Label>
              <Input id="shift-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="shift-end">End</Label>
              <Input id="shift-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Duration: {duration}</p>
          <div>
            <Label>Category</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    category === c.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <IconPicker
            value={iconName}
            gradient="ocean"
            onChange={(name) => setIconName(name)}
          />
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}