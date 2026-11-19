import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSlotTimes,
  epochToLocalDate,
  intervalsOverlap,
  localDayRange,
  localToEpoch,
} from "../lib/domain/schedule.ts";
import { DomainError } from "../lib/domain/errors.ts";

// 2026-11-20 12:00 hora Colombia = 17:00 UTC
const NOW = Date.UTC(2026, 10, 20, 17, 0);

test("convierte hora local de Colombia (UTC-5) a epoch", () => {
  assert.equal(localToEpoch("2026-11-23", "08:00"), Date.UTC(2026, 10, 23, 13, 0));
  assert.equal(localToEpoch("2026-11-23", "23:30"), Date.UTC(2026, 10, 24, 4, 30));
  assert.equal(epochToLocalDate(Date.UTC(2026, 10, 24, 4, 30)), "2026-11-23");
});

test("rechaza fechas y horas inválidas", () => {
  assert.equal(localToEpoch("2026-02-30", "08:00"), null);
  assert.equal(localToEpoch("2026-11-23", "24:00"), null);
  assert.equal(localToEpoch("23/11/2026", "08:00"), null);
  assert.equal(localDayRange("nope"), null);
});

test("franja válida calcula duración", () => {
  const s = buildSlotTimes({ date: "2026-11-23", startTime: "08:00", endTime: "10:00" }, NOW);
  assert.equal(s.durationMinutes, 120);
  assert.equal(s.endAt - s.startAt, 2 * 3600_000);
});

test("rechaza fin anterior o igual al inicio", () => {
  assert.throws(
    () => buildSlotTimes({ date: "2026-11-23", startTime: "10:00", endTime: "08:00" }, NOW),
    /posterior/,
  );
  assert.throws(
    () => buildSlotTimes({ date: "2026-11-23", startTime: "10:00", endTime: "10:00" }, NOW),
    DomainError,
  );
});

test("rechaza duración fuera de rango, pasado y demasiado lejos", () => {
  assert.throws(() => buildSlotTimes({ date: "2026-11-23", startTime: "08:00", endTime: "08:15" }, NOW), /al menos/);
  assert.throws(() => buildSlotTimes({ date: "2026-11-23", startTime: "08:00", endTime: "13:00" }, NOW), /más de/);
  assert.throws(() => buildSlotTimes({ date: "2026-11-19", startTime: "08:00", endTime: "09:00" }, NOW), /después/);
  // hoy a las 12:10 (menos de 30 min de antelación)
  assert.throws(() => buildSlotTimes({ date: "2026-11-20", startTime: "12:10", endTime: "13:00" }, NOW), /después/);
  assert.throws(() => buildSlotTimes({ date: "2027-06-01", startTime: "08:00", endTime: "09:00" }, NOW), /días/);
});

test("detección de cruces (intervalos semiabiertos)", () => {
  const a = { startAt: 100, endAt: 200 };
  assert.equal(intervalsOverlap(a, { startAt: 150, endAt: 250 }), true);
  assert.equal(intervalsOverlap(a, { startAt: 50, endAt: 120 }), true);
  assert.equal(intervalsOverlap(a, { startAt: 120, endAt: 180 }), true);
  assert.equal(intervalsOverlap(a, { startAt: 200, endAt: 300 }), false, "contiguas no se cruzan");
  assert.equal(intervalsOverlap(a, { startAt: 0, endAt: 100 }), false);
});
