import {
  Sun, Moon, Sunset, Car, Briefcase, Heart, Dumbbell, Users, Home, Coffee,
  Music, Book, Plane, Utensils, Leaf, Star, Bell, Zap, Thermometer,
  Umbrella, Radio, GitBranch, DollarSign, Baby, Dog,
  Clock3, Flag, ArrowLeftRight, PartyPopper, BedDouble,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GRADIENT_MAP, getGradient, nextGradient } from "@/lib/gradients";
import type { GradientId } from "@/types/event";

export const ICONS: { name: string; Icon: LucideIcon }[] = [
  // Shifts & Time
  { name: "sun", Icon: Sun },
  { name: "moon", Icon: Moon },
  { name: "sunset", Icon: Sunset },
  { name: "zap", Icon: Zap },
  { name: "clock-3", Icon: Clock3 },
  { name: "arrow-left-right", Icon: ArrowLeftRight },

  // Travel & Commute
  { name: "car", Icon: Car },
  { name: "plane", Icon: Plane },

  // Rest & Wellness
  { name: "coffee", Icon: Coffee },
  { name: "bed-double", Icon: BedDouble },
  { name: "leaf", Icon: Leaf },
  { name: "heart", Icon: Heart },
  { name: "thermometer", Icon: Thermometer },
  { name: "dumbbell", Icon: Dumbbell },

  // Family & Social
  { name: "home", Icon: Home },
  { name: "users", Icon: Users },
  { name: "baby", Icon: Baby },
  { name: "party-popper", Icon: PartyPopper },

  // Scheduling & Notes
  { name: "bell", Icon: Bell },
  { name: "flag", Icon: Flag },
  { name: "utensils", Icon: Utensils },
  { name: "umbrella", Icon: Umbrella },
];

const EXTRA_ICON_MAP: Record<string, LucideIcon> = {
  // Preserved for src/lib/shiftConfig.ts and src/lib/stamps.ts references
  // (removed from the picker grid so existing saved data keeps rendering)
  Briefcase,
  Radio,
  GitBranch,
  DollarSign,
  Star,
  Music,
  Book,
  Dog,

  // Backward-compat aliases for events saved with the old PascalCase icon names
  Sun, Moon, Sunset, Zap, Clock3, ArrowLeftRight, Car, Plane,
  Coffee, BedDouble, Leaf, Heart, Thermometer, Dumbbell,
  Home, Users, Baby, PartyPopper, Bell, Flag, Utensils, Umbrella,
};

export const ICON_MAP: Record<string, LucideIcon> = ICONS.reduce(
  (a, i) => ((a[i.name] = i.Icon), a),
  { ...EXTRA_ICON_MAP } as Record<string, LucideIcon>,
);

export function getIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}

interface Props {
  value?: string;
  gradient?: GradientId;
  onChange: (name: string | undefined, gradient: GradientId) => void;
}

export function IconPicker({ value, gradient, onChange }: Props) {
  const activeGradient = gradient ?? "ocean";

  const handleTap = (name: string) => {
    if (value === name) {
      onChange(name, nextGradient(activeGradient));
    } else {
      onChange(name, activeGradient);
    }
  };

  return (
    <div className="space-y-2 mx-0 my-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Icon</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined, activeGradient)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {ICONS.map(({ name, Icon }) => {
          const selected = value === name;
          const g = selected ? getGradient(activeGradient) : GRADIENT_MAP.slate;
          return (
            <button
              key={name}
              type="button"
              onClick={() => handleTap(name)}
              aria-label={name}
              aria-pressed={selected}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-2xl text-white transition-transform active:scale-95",
                g.className,
                !selected && "opacity-60 hover:opacity-100",
                selected &&
                  "ring-2 ring-white ring-offset-2 ring-offset-background shadow-md scale-[1.02]",
              )}
            >
              <Icon className="size-5" strokeWidth={2.25} />
            </button>
          );
        })}
      </div>
      {value && (
        <p className="text-[11px] text-muted-foreground">
          Tap the selected icon again to cycle through colors.
        </p>
      )}
    </div>
  );
}
