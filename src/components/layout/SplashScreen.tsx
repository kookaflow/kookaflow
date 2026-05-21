import logo from "@/assets/shiftsync-logo.png";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <img
        src={logo}
        alt="ShiftSync"
        style={{ height: 120, width: "auto" }}
        className="object-contain"
      />
    </div>
  );
}