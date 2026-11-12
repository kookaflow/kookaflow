import { z } from "zod";

const deviceSchema = z.object({
  playerId: z.string().min(1).max(200).nullable(),
  // Sent by older app builds; accepted but never applied to the account.
  enabled: z.boolean().optional(),
  optedIn: z.boolean().optional(),
  platform: z.string().max(20).optional(),
});
export type DeviceUpdate = z.infer<typeof deviceSchema>;

export function parseDeviceUpdate(input: unknown): DeviceUpdate {
  return deviceSchema.parse(input);
}

/** Profile columns a device update may touch. Never the account push setting. */
export function deviceProfileUpdate(d: DeviceUpdate): { onesignal_player_id: string | null } {
  return { onesignal_player_id: d.playerId };
}
