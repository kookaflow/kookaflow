import logo from "@/assets/kookaflow-logo.png";

export function SettingsHero() {
  return (
    <div
      className="relative mb-6 flex flex-col items-center justify-center overflow-hidden rounded-2xl text-center text-white shadow-lg"
      style={{
        height: 180,
        background:
          "linear-gradient(135deg, #0F172A 0%, #1E3A5F 45%, #F59E0B 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
      <img
        src={logo}
        alt="Kookaflow"
        style={{ height: 60, width: "auto" }}
        className="relative z-10 object-contain drop-shadow"
      />
      <p className="relative z-10 mt-3 px-4 text-sm font-medium text-white/95 sm:text-base">
        Find your flow, whatever your hours
      </p>
    </div>
  );
}