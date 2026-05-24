import { Card } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 overflow-hidden relative flex flex-col justify-center">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b]"></div>
      <div className="absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[120px]"></div>
      <div className="absolute -right-40 bottom-20 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-600/20 blur-[120px]"></div>

      <main className="mx-auto w-full grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-cyan-300 ring-1 ring-inset ring-cyan-500/30 mb-2 bg-cyan-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
            FuturaMente Access
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 drop-shadow-sm pb-2">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-lg text-zinc-300 leading-relaxed max-w-md">{subtitle}</p>
          ) : null}

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="group rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all hover:bg-zinc-900/60 hover:-translate-y-1 hover:ring-cyan-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 mb-4 ring-1 ring-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-base">Progreso Claro</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">Analíticas en tiempo real para visualizar el éxito y mejorar resultados.</p>
            </div>

            <div className="group rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all hover:bg-zinc-900/60 hover:-translate-y-1 hover:ring-purple-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 mb-4 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.45m.001 0c0-.01.001-.019.001-.029" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-base">Gestión Ágil</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">Herramientas digitales optimizadas que reducen la carga administrativa.</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-zinc-950/80 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-2xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

