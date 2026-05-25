import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Settings2, PenLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStamp } from "@/providers/StampProvider";
import { SHIFT_STAMPS, LEAVE_STAMPS, ICON_STAMPS, type StampDef } from "@/lib/stamps";
import { useAllShiftTypes } from "@/hooks/useAllShiftTypes";

interface Props {
  onOpenDetailedEvent: () => void;
}

export function QuickAddPanel({ onOpenDetailedEvent }: Props) {
  const { panelOpen, setPanelOpen, selected, setSelected } = useStamp();
  const { custom } = useAllShiftTypes();
  const [tab, setTab] = useState("shifts");
  if (!panelOpen) return null;

  const customStamps: StampDef[] = custom.map((t) => ({
    id: t.id,
    kind: "shift",
    label: t.label,
    shortLabel: t.shortLabel,
    colour: t.colour,
    Icon: t.Icon,
    category: t.category,
    allDay: t.isAllDay,
    startTime: t.defaultStart ?? undefined,
    endTime: t.defaultEnd ?? undefined,
    iconName: t.iconName,
  }));

  const shiftItems = [...SHIFT_STAMPS, ...customStamps];

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 h-[28vh] min-h-[220px] max-h-[28vh] rounded-t-2xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200 flex flex-col">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-border" style={{ height: 36 }}>
          <div className="text-xs text-muted-foreground">
            {selected
              ? `Tap days to apply "${selected.label}"`
              : "Select a shift, then tap days to apply"}
          </div>
          {/*
            NOTE: There is intentionally NO click-outside overlay on this panel.
            A transparent overlay was previously added twice and removed twice
            because it intercepts calendar day taps and breaks the
            stamp-to-calendar workflow. Do not add one. The X button and FAB
            toggle are the only close affordances.
          */}
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
          <TabsList className="mx-3 mt-1 h-8">
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="leave">Leave / Off</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="shifts" className="flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]">
            <StampGrid items={shiftItems} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="leave" className="flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]">
            <StampGrid items={LEAVE_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
          <TabsContent value="icons" className="flex-1 overflow-y-auto px-3 pb-1 max-h-[20vh]">
            <StampGrid items={ICON_STAMPS} selected={selected} onPick={setSelected} />
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-1">
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