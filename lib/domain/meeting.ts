import { MEETING_PROVIDERS } from "./config.ts";
import { DomainError } from "./errors.ts";

export type MeetingProvider = keyof typeof MEETING_PROVIDERS;

export type ParsedMeetingLink = {
  provider: MeetingProvider;
  url: string;
};

function hostMatches(host: string, allowed: readonly string[], allowSubdomains: boolean) {
  return allowed.some((h) => host === h || (allowSubdomains && host.endsWith(`.${h}`)));
}

/**
 * Valida un enlace de videoconferencia ingresado manualmente.
 * Exige HTTPS, sin credenciales ni puerto, y un dominio de Google Meet o Zoom.
 */
export function parseMeetingLink(raw: string): ParsedMeetingLink {
  const value = raw.trim();
  if (value.length > 500) throw new DomainError("El enlace es demasiado largo.");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DomainError("Ingresa una URL completa, por ejemplo https://meet.google.com/abc-defg-hij.");
  }

  if (url.protocol !== "https:") throw new DomainError("El enlace debe usar HTTPS.");
  if (url.username || url.password || url.port) {
    throw new DomainError("El enlace no debe incluir usuario, contraseña ni puerto.");
  }

  const host = url.hostname.toLowerCase();
  for (const [provider, cfg] of Object.entries(MEETING_PROVIDERS) as [
    MeetingProvider,
    (typeof MEETING_PROVIDERS)[MeetingProvider],
  ][]) {
    const allowSub = "allowSubdomains" in cfg ? cfg.allowSubdomains : false;
    if (hostMatches(host, cfg.hosts, allowSub)) {
      if (url.pathname === "/" || url.pathname === "") {
        throw new DomainError(`El enlace de ${cfg.label} debe apuntar a una reunión concreta.`);
      }
      return { provider, url: url.toString() };
    }
  }

  throw new DomainError("Solo se admiten enlaces de Google Meet (meet.google.com) o Zoom (zoom.us).");
}

export function meetingProviderLabel(provider: MeetingProvider) {
  return MEETING_PROVIDERS[provider].label;
}
