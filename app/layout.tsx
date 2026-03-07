import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import StatusPill from "@/components/StatusPill";
import ThreeBackground from "@/components/ThreeBackground";
import CinematicOverlays from "@/components/CinematicOverlays";

export const metadata: Metadata = {
  title: "Sandbox.fun — Control Room",
  description: "ComfyUI workflow deployment control plane",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fafafa] text-neutral-900 antialiased h-screen w-full overflow-hidden flex selection:bg-neutral-200 selection:text-black">
        {/* Three.js Animated Background */}
        <ThreeBackground state="idle" />
        <CinematicOverlays active={false} />

        {/* Left icon rail */}
        <Navigation />

        {/* Main area */}
        <main className="flex-1 flex flex-col relative min-w-0 z-20 overflow-hidden">
          {/* Header */}
          <header className="h-20 flex items-center justify-between lg:justify-end px-8 z-30 shrink-0 w-full pointer-events-none">
            {/* Mobile branding */}
            <div className="lg:hidden pointer-events-auto flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white shadow-sm">
                <span className="text-[10px] font-medium tracking-tighter">SB</span>
              </div>
            </div>
            {/* Status pill */}
            <div className="pointer-events-auto">
              <StatusPill />
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 pointer-events-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
