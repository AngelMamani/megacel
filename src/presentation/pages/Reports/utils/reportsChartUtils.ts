export function GetChartScaleMax(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function GetRelativeBarPercent(value: number, maxValue: number): number {
  if (maxValue <= 0 || value <= 0) return 0;
  return (value / maxValue) * 100;
}

/** Ticks enteros del máximo real hacia 0 (sin decimales en el eje Y). */
export function BuildIntegerYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0];

  if (maxValue <= 6) {
    return Array.from({ length: maxValue + 1 }, (_, index) => maxValue - index);
  }

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    Math.round((maxValue * (tickCount - 1 - index)) / (tickCount - 1))
  );

  return [...new Set(ticks)].sort((a, b) => b - a);
}

export function FormatIntegerQuantity(value: number): string {
  return Math.round(value).toLocaleString('es-PE');
}
