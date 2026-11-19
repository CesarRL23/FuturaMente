import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMeetingLink } from "../lib/domain/meeting.ts";
import { DomainError } from "../lib/domain/errors.ts";

test("acepta enlaces HTTPS de Google Meet y Zoom", () => {
  assert.deepEqual(parseMeetingLink(" https://meet.google.com/abc-defg-hij "), {
    provider: "GOOGLE_MEET",
    url: "https://meet.google.com/abc-defg-hij",
  });
  assert.equal(parseMeetingLink("https://zoom.us/j/123456789?pwd=xyz").provider, "ZOOM");
  assert.equal(parseMeetingLink("https://us02web.zoom.us/j/123456789").provider, "ZOOM");
});

test("rechaza enlaces inseguros, de otros dominios o mal formados", () => {
  const bad = [
    "http://meet.google.com/abc-defg-hij", // sin HTTPS
    "https://meet.google.com.evil.com/abc", // dominio suplantado
    "https://evilzoom.us/j/1", // no es subdominio de zoom.us
    "https://teams.microsoft.com/l/meetup", // plataforma no admitida
    "https://user:pass@zoom.us/j/1", // credenciales
    "https://zoom.us:8443/j/1", // puerto
    "https://meet.google.com/", // sin reunión
    "javascript:alert(1)",
    "meet.google.com/abc-defg-hij", // URL incompleta
    "",
  ];
  for (const url of bad) {
    assert.throws(() => parseMeetingLink(url), DomainError, url);
  }
});
