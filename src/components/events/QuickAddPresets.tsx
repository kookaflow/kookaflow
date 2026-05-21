import { PRESETS, type PresetDef } from "./presets";

interface Props {
  onPick: (p: PresetDef) => void;
}

export function QuickAddPresets({ onPick }: Props) {
  return (
    <div className="-mx-1">
      <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick add
      </p>
      <div className="flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {PRESETS.map((p) => {
          const Icon = p.Icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p)}
              className="group flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95"
              style={{
                backgroundColor: `${p.color}26`,
                color: p.color,
              }}
            >
              <Icon className="size-3.5" strokeWidth={2.5} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
