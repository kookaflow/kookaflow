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
    shortLabel: t.showAs ?? t.name.slice(0, 6),
    colour: t.colour,
    Icon: getIcon(t.iconName) ?? Sparkles,
    category: t.lifeCategory,
    allDay: t.isAllDay || t.is24Hour || !t.defaultStart || !t.defaultEnd,
    startTime: t.defaultStart ?? undefined,
    endTime: t.defaultEnd ?? undefined,
    iconName: t.iconName ?? undefined,
    template: {
      id: t.id,
      isSplitShift: t.isSplitShift,
      splitStart2: t.splitStart2,
      splitEnd2: t.splitEnd2,
      unpaidBreakMinutes: t.unpaidBreakMinutes,
      paidBreakMinutes: t.paidBreakMinutes,
    },
  }));

  // Custom templates first, then built-in shifts
  const shiftItems = [...customStamps, ...SHIFT_STAMPS];

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col max-h-[38vh] md:max-h-[320px] rounded-t-2xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <span className="h-1 w-8 rounded-full bg-foreground/30" aria-hidden />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
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
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col overflow-hidden min-h-0 flex-1">
          <TabsList className="mx-3 mt-2 shrink-0">
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="leave">Leave / Off</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="shifts" className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 mt-2">
            <StampGrid items={shiftItems} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="leave" className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 mt-2">
            <StampGrid items={LEAVE_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="icons" className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 mt-2">
            <StampGrid items={ICON_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-1.5 shrink-0">
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
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {items.map((s) => {
        const isActive = selected?.id === s.id;
        const Icon = s.Icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(isActive ? null : s)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-white shadow-sm transition-all",
              "hover:-translate-y-0.5 hover:shadow-md",
              isActive && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-[1.02]",
            )}
            style={{ backgroundColor: s.colour }}
          >
            <Icon className="size-4" />
            <span className="text-[10px] font-semibold leading-none">{s.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}