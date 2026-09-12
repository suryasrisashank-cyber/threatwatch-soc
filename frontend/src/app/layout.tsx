import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SentinelLab — SOC L1 Attack Detection & Incident Response Platform",
  description: "Professional Blue Team & SOC L1 educational training laboratory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-soc-bg text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-6 overflow-x-hidden">
            {children}
          </main>
          <footer className="border-t border-soc-border py-4 px-6 bg-soc-panel/60 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">SentinelLab</span>
              <span>— SOC L1 Attack Detection & Incident Response Platform</span>
            </div>
            <div className="text-[11px] font-mono-code text-cyan-400/90 font-medium">
              Educational Security Lab • Authorized Environments Only
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
