import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePricing } from "../lib/domain/pricing.ts";
import { DomainError } from "../lib/domain/errors.ts";
import { MAX_GROUP_CAPACITY } from "../lib/domain/config.ts";

test("tarifa individual: 65.000 → 39.000 profesor / 26.000 MONLINE", () => {
  const p = calculatePricing(1);
  assert.equal(p.modality, "INDIVIDUAL");
  assert.equal(p.totalPrice, 65_000);
  assert.equal(p.professorAmount, 39_000);
  assert.equal(p.platformAmount, 26_000);
  assert.equal(p.professorPercent, 60);
  assert.equal(p.platformPercent, 40);
});

test("tarifa grupal de 2: 75.000 → 45.000 / 30.000", () => {
  const p = calculatePricing(2);
  assert.equal(p.modality, "GROUP");
  assert.equal(p.totalPrice, 75_000);
  assert.equal(p.professorAmount, 45_000);
  assert.equal(p.platformAmount, 30_000);
});

test("tarifa grupal de 3 o más: 85.000 → 51.000 / 34.000", () => {
  for (const n of [3, 4, 7, MAX_GROUP_CAPACITY]) {
    const p = calculatePricing(n);
    assert.equal(p.totalPrice, 85_000, `capacidad ${n}`);
    assert.equal(p.professorAmount, 51_000);
    assert.equal(p.platformAmount, 34_000);
    assert.equal(p.participants, n);
  }
});

test("los valores son enteros y suman el total", () => {
  for (let n = 1; n <= MAX_GROUP_CAPACITY; n++) {
    const p = calculatePricing(n);
    assert.ok(Number.isInteger(p.professorAmount) && Number.isInteger(p.platformAmount));
    assert.equal(p.professorAmount + p.platformAmount, p.totalPrice);
  }
});

test("rechaza capacidades inválidas", () => {
  for (const n of [0, -1, 1.5, Number.NaN, MAX_GROUP_CAPACITY + 1]) {
    assert.throws(() => calculatePricing(n), DomainError, `capacidad ${n}`);
  }
});
