import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b]"></div>
      
      <main className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[120px]"></div>
        <div className="absolute -right-40 bottom-20 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-600/20 blur-[120px]"></div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-cyan-300 ring-1 ring-inset ring-cyan-500/30 mb-8 bg-cyan-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
              Plataforma 3.0 Ya Disponible
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 drop-shadow-sm pb-2">
              FuturaMente
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-zinc-300">
              Transforma la experiencia educativa con nuestra plataforma de gestión académica integral.
              Conecta profesores, estudiantes y administradores en un entorno digital fluido, moderno y eficiente.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="group relative inline-flex justify-center items-center overflow-hidden rounded-xl bg-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-300 hover:scale-105"
              >
                <span className="absolute right-0 translate-x-full transition-transform group-hover:-translate-x-4">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="transition-all group-hover:mr-6">Comenzar ahora</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex justify-center items-center rounded-xl px-8 py-4 text-base font-semibold text-zinc-300 ring-1 ring-inset ring-zinc-700 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800 hover:text-white transition-all duration-300"
              >
                Ir al dashboard
              </Link>
            </div>
            
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 pt-8 border-t border-zinc-800">
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">100%</h3>
                <p className="mt-1 text-sm font-medium text-zinc-400">Digital</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">24/7</h3>
                <p className="mt-1 text-sm font-medium text-zinc-400">Acceso</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Integral</h3>
                <p className="mt-1 text-sm font-medium text-zinc-400">Gestión</p>
              </div>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative rounded-2xl bg-zinc-900/50 p-2 ring-1 ring-white/10 backdrop-blur-2xl shadow-2xl">
              <Image
                src="/futuramente_hero.png"
                alt="FuturaMente Hero Image"
                width={1000}
                height={1000}
                className="rounded-xl ring-1 ring-white/10 w-full h-auto object-cover"
                priority
              />
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-zinc-900/90 p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Alto Rendimiento</p>
                    <p className="text-xs font-medium text-zinc-400">Optimizado para ti</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 rounded-2xl bg-zinc-900/90 p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Análisis Visual</p>
                    <p className="text-xs font-medium text-zinc-400">Gráficos dinámicos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
