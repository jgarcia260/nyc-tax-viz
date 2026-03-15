import { describe, it, expect } from "vitest";

/**
 * Format utilities for currency, numbers, and percentages
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBillions(value: number): string {
  return `$${(value / 1_000_000_000).toFixed(1)}B`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function abbreviateNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

describe("formatCurrency", () => {
  it("formats whole dollars", () => {
    expect(formatCurrency(1234567)).toBe("$1,234,567");
  });

  it("rounds to nearest dollar", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-5000)).toBe("-$5,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatBillions", () => {
  it("formats billions with one decimal", () => {
    expect(formatBillions(2_500_000_000)).toBe("$2.5B");
  });

  it("handles exact billions", () => {
    expect(formatBillions(3_000_000_000)).toBe("$3.0B");
  });

  it("handles small values", () => {
    expect(formatBillions(100_000_000)).toBe("$0.1B");
  });
});

describe("formatPercent", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercent(0.752)).toBe("75.2%");
  });

  it("handles whole numbers", () => {
    expect(formatPercent(1)).toBe("100.0%");
  });

  it("handles small percentages", () => {
    expect(formatPercent(0.003)).toBe("0.3%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("abbreviateNumber", () => {
  it("abbreviates billions", () => {
    expect(abbreviateNumber(2_500_000_000)).toBe("2.5B");
  });

  it("abbreviates millions", () => {
    expect(abbreviateNumber(3_200_000)).toBe("3.2M");
  });

  it("abbreviates thousands", () => {
    expect(abbreviateNumber(5_400)).toBe("5.4K");
  });

  it("returns raw number for small values", () => {
    expect(abbreviateNumber(999)).toBe("999");
  });

  it("handles edge cases", () => {
    expect(abbreviateNumber(1_000)).toBe("1.0K");
    expect(abbreviateNumber(1_000_000)).toBe("1.0M");
    expect(abbreviateNumber(1_000_000_000)).toBe("1.0B");
  });
});
