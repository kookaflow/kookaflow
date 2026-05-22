import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShiftTemplates } from "@/providers/ShiftTemplatesProvider";
import { SHIFT_STAMPS, LEAVE_STAMPS, type StampDef } from "@/lib/stamps";
import { ShiftEditorSheet } from "@/components/shifts/ShiftEditorSheet";
import type { ShiftTemplateDTO } from "@/lib/shift-templates.functions";
import { getIcon } from "@/components/events/IconPicker";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shifts")({
  component: ShiftsPage,
});

function durationLabel(start?: string | null, end?: string | null) {
  if (!start || !end) return "All day";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function timeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "All day";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

function ShiftsPage() {
  const { templates, remove } = useShiftTemplates();
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftTemplateDTO | null>(null);

  const filter = (label: string) => label.toLowerCase().includes(search.toLowerCase());

  const builtinWorking = SHIFT_STAMPS.filter((s) => s.category !== "travel" && filter(s.label));
  const builtinLeave = LEAVE_STAMPS.filter((s) => s.kind === "shift" && filter(s.label));
  const builtinNonWorking = LEAVE_STAMPS.filter((s) => s.kind === "clear" || s.kind === "rest").filter((s) => filter(s.label));

  const customAll = useMemo(
    () => templates.filter((t) => filter(t.name)).sort((a, b) => a.sortOrder - b.sortOrder),
    [templates, search],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/calendar"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="flex-1 text-lg font-semibold">Shifts</h1>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" /> New
          </Button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shifts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-6">
        {customAll.length > 0 && (
          <Section title="MY CUSTOM SHIFTS">
            {customAll.map((t) => (
              <CustomRow
                key={t.id}
                template={t}
                onEdit={() => { setEditing(t); setEditorOpen(true); }}
                onDelete={() => remove(t.id)}
              />
            ))}
          </Section>
        )}
        <Section title="WORKING">
          {builtinWorking.map((s) => (
            <BuiltinRow key={s.id} stamp={s} />
          ))}
        </Section>
        <Section title="LEAVE">
          {builtinLeave.map((s) => (<BuiltinRow key={s.id} stamp={s} />))}
        </Section>
        <Section title="NON-WORKING">
          {builtinNonWorking.map((s) => (<BuiltinRow key={s.id} stamp={s} />))}
        </Section>
      </main>
      <ShiftEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editing}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

function BuiltinRow({ stamp }: { stamp: StampDef }) {
  const Icon = stamp.Icon;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div
        className="flex h-10 w-14 items-center justify-center rounded-lg text-white text-[11px] font-semibold"
        style={{ backgroundColor: stamp.colour }}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{stamp.label}</div>
        <div className="text-xs text-muted-foreground">
          {stamp.allDay ? "All day" : `${stamp.startTime} – ${stamp.endTime}`}
          {!stamp.allDay && stamp.startTime && stamp.endTime && (
            <> · {durationLabel(stamp.startTime, stamp.endTime)}</>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">Built-in</span>
    </div>
  );
}

function CustomRow({
  template,
  onEdit,
  onDelete,
}: {
  template: ShiftTemplateDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = getIcon(template.iconName) ?? Sparkles;
  const totalLabel = template.totalHours != null
    ? `${template.totalHours}h`
    : durationLabel(template.defaultStart, template.defaultEnd);
  const showAs = template.showAs ?? template.name.slice(0, 6);
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
    >
      <div
        className="flex h-10 w-14 items-center justify-center rounded-lg text-white text-[11px] font-semibold"
        style={{ backgroundColor: template.colour }}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{template.name}</div>
        <div className="text-xs text-muted-foreground">
          {showAs} · {timeRange(template.defaultStart, template.defaultEnd)} · {totalLabel}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Delete"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
      <Pencil className="size-4 text-muted-foreground" />
    </button>
  );
}