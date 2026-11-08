import { Capacitor } from "@capacitor/core";

/** True only inside the iOS/Android Capacitor app build. */
export function isNativeApp(): boolean {
  return import.meta.env.VITE_IS_MOBILE_BUILD === true && Capacitor.isNativePlatform();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Write the file to the app cache and open the system share sheet.
 * Returns "shared" or "cancelled"; throws on real failures.
 */
export async function shareFileNatively(
  blob: Blob,
  filename: string,
): Promise<"shared" | "cancelled"> {
  const [fsMod, shareMod] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  const data = await blobToBase64(blob);
  const { uri } = await fsMod.Filesystem.writeFile({
    path: filename,
    data,
    directory: fsMod.Directory.Cache,
  });
  try {
    await shareMod.Share.share({ title: filename, files: [uri], dialogTitle: filename });
    return "shared";
  } catch (e) {
    const msg = String((e as Error)?.message ?? e).toLowerCase();
    if (msg.includes("cancel")) return "cancelled";
    throw e;
  }
}
