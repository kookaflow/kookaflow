import {
  Sun, Moon, Sunset, Car, Briefcase, Heart, Dumbbell, Users, Home, Coffee,
  Music, Book, Plane, Utensils, Bike, Leaf, Star, Bell, Zap, Thermometer,
  Umbrella, Radio, GitBranch, DollarSign, Baby, Dog, Gamepad2, ShoppingBag,
  Stethoscope, Bus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GRADIENT_MAP, getGradient, nextGradient } from "@/lib/gradients";
import type { GradientId } from "@/types/event";

export const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "Sun", Icon: Sun },
  { name: "Moon", Icon: Moon },
  { name: "Sunset", Icon: Sunset },
  { name: "Car", Icon: Car },
  { name: "Briefcase", Icon: Briefcase },
  { name: "Heart", Icon: Heart },
  { name: "Dumbbell", Icon: Dumbbell },
  { name: "Users", Icon: Users },
  { name: "Home", Icon: Home },
  { name: "Coffee", Icon: Coffee },
  { name: "Music", Icon: Music },
  { name: "Book", Icon: Book },
  { name: "Plane", Icon: Plane },
  { name: "Utensils", Icon: Utensils },
  { name: "Bike", Icon: Bike },
  { name: "Leaf", Icon: Leaf },
  { name: "Star", Icon: Star },
  { name: "Bell", Icon: Bell },
  { name: "Zap", Icon: Zap },
  { name: "Thermometer", Icon: Thermometer },
  { name: "Umbrella", Icon: Umbrella },
  { name: "Radio", Icon: Radio },
  { name: "GitBranch", Icon: GitBranch },
  { name: "DollarSign", Icon: DollarSign },
  { name: "Baby", Icon: Baby },
  { name: "Dog", Icon: Dog },
  { name: "Gamepad", Icon: Gamepad2 },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "Stethoscope", Icon: Stethoscope },
  { name: "Bus", Icon: Bus },
];

export const ICON_MAP: Record<string, LucideIcon> = ICONS.reduce(
  (a, i) => ((a[i.name] = i.Icon), a),
  {} as Record<string, LucideIcon>,
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
    <div className="space-y-2">
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
                "relative flex aspect-square items-center justify-center rounded-2xl text-white transition-transform active:scale-95",
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
