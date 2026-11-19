// Resuelve el alias "@/..." de tsconfig y las importaciones sin extensión a archivos .ts,
// para ejecutar los servicios del servidor con Node (--experimental-strip-types) sin compilar.
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

export async function resolve(specifier, context, next) {
  // "server-only" lo resuelve Next internamente; fuera de Next es un marcador sin efecto.
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  let target = specifier;
  if (specifier.startsWith("@/")) target = pathToFileURL(path.join(root, specifier.slice(2))).href;
  try {
    return await next(target, context);
  } catch (error) {
    const isLocal = target.startsWith("file:") || target.startsWith(".");
    if (isLocal && !/\.[cm]?[jt]s$/.test(target)) return next(`${target}.ts`, context);
    throw error;
  }
}
