import type { GradientId } from "@/types/event";

export interface GradientDef {
  id: GradientId;
  label: string;
  from: string;
  to: string;
  /** Tailwind classes for direct use */
  className: string;
}

export const GRADIENTS: GradientDef[] = [
  { id: "sunrise",  label: "Sunrise",  from: "#F59E0B", to: "#EF4444", className: "bg-gradient-to-br from-[#F59E0B] to-[#EF4444]" },
  { id: "ocean",    label: "Ocean",    from: "#3B82F6", to: "#06B6D4", className: "bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]" },
  { id: "forest",   label: "Forest",   from: "#10B981", to: "#84CC16", className: "bg-gradient-to-br from-[#10B981] to-[#84CC16]" },
  { id: "lavender", label: "Lavender", from: "#8B5CF6", to: "#EC4899", className: "bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]" },
  { id: "slate",    label: "Slate",    from: "#64748B", to: "#475569", className: "bg-gradient-to-br from-[#64748B] to-[#475569]" },
  { id: "coral",    label: "Coral",    from: "#F43F5E", to: "#FB923C", className: "bg-gradient-to-br from-[#F43F5E] to-[#FB923C]" },
];

export const GRADIENT_MAP: Record<GradientId, GradientDef> = GRADIENTS.reduce(
  (a, g) => ((a[g.id] = g), a),
  {} as Record<GradientId, GradientDef>,
);

export function getGradient(id?: GradientId | null): GradientDef {
  return (id && GRADIENT_MAP[id]) || GRADIENTS[0];
}

export function nextGradient(id?: GradientId | null): GradientId {
  const i = GRADIENTS.findIndex((g) => g.id === id);
  return GRADIENTS[(i + 1) % GRADIENTS.length].id;
}
