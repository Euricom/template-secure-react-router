import { expect, test } from "vitest";
import { formatDate } from "./date";

test("date format", () => {
  expect(formatDate(new Date("2021-01-01"))).toBe("01/01/2021");
});

test("date format from string", () => {
  expect(formatDate("2021-12-31")).toBe("31/12/2021");
});

test("date format leap year", () => {
  expect(formatDate(new Date("2020-02-29"))).toBe("29/02/2020");
});

test("date format single digit day and month", () => {
  expect(formatDate(new Date("2021-3-5"))).toBe("05/03/2021");
});

test("date format invalid date string", () => {
  expect(formatDate("invalid-date")).toBe("NaN/NaN/NaN");
});
