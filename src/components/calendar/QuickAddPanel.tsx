import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Settings2, PenLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStamp } from "@/providers/StampProvider";
import { useShiftTemplates } from "@/providers/ShiftTemplatesProvider";
import { SHIFT_STAMPS, LEAVE_STAMPS, ICON_STAMPS, type StampDef } from "@/lib/stamps";
import { getIcon } from "@/components/events/IconPicker";
import { Sparkles } from "lucide-react";

interface Props {
  onOpenDetailedEvent: () => void;
}

export function QuickAddPanel({ onOpenDetailedEvent }: Props) {
  const { panelOpen, setPanelOpen, selected, setSelected } = useStamp();
  const { templates } = useShiftTemplates();
  const [tab, setTab] = useState("shifts");
  if (!panelOpen) return null;

  const customStamps: StampDef[] = templates.map((t) => ({
    id: `tpl_${t.id}`,
    kind: "shift",
    label: t.name,
    shortLabel: t.name.slice(0, 8),
    colour: t.colour,
    Icon: getIcon(t.iconName) ?? Sparkles,
    category: t.category === "leave" ? "work" : t.category === "non_working" ? "rest" : "work",
    allDay: !t.defaultStart || !t.defaultEnd,
    startTime: t.defaultStart ?? undefined,
    endTime: t.defaultEnd ?? undefined,
    iconName: t.iconName ?? undefined,
  }));

  const shiftItems = [...SHIFT_STAMPS, ...customStamps];

  return (
    <>
      {/* click-outside catcher (transparent) */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={() => {
          setPanelOpen(false);
          setSelected(null);
        }}
        className="fixed inset-x-0 top-0 bottom-[34vh] z-30 cursor-default bg-transparent"
      />
      <div className="fixed inset-x-0 bottom-0 z-40 h-[34vh] min-h-[300px] rounded-t-2xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200 flex flex-col">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
          <div className="text-xs text-muted-foreground">
            {selected
              ? `Tap days to apply "${selected.label}"`
              : "Select a shift, then tap days to apply"}
          </div>
          <button
            type="button"
            onClick={() => {
              setPanelOpen(false);
              setSelected(null);
            }}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-3 mt-2">
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="leave">Leave / Off</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="shifts" className="flex-1 overflow-y-auto px-3 pb-2">
            <StampGrid items={shiftItems} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="leave" className="flex-1 overflow-y-auto px-3 pb-2">
            <StampGrid items={LEAVE_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="icons" className="flex-1 overflow-y-auto px-3 pb-2">
            <StampGrid items={ICON_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
            <Link to="/shifts">
              <Settings2 className="size-3.5" />
              Manage shifts
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenDetailedEvent} className="gap-1.5 text-xs">
            <PenLine className="size-3.5" />
            Detailed event
          </Button>
        </div>
      </div>
    </>
  );
}

function StampGrid({
  items,
  selected,
  onPick,
}: {
  items: StampDef[];
  selected: StampDef | null;
  onPick: (s: StampDef | null) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 pt-2 sm:grid-cols-4">
      {items.map((s) => {
        const isActive = selected?.id === s.id;
        const Icon = s.Icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(isActive ? null : s)}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-white shadow-sm transition-all",
              "hover:-translate-y-0.5 hover:shadow-md",
              isActive && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-[1.02]",
            )}
            style={{ backgroundColor: s.colour }}
          >
            <Icon className="size-5" />
            <span className="text-[11px] font-semibold leading-none">{s.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}