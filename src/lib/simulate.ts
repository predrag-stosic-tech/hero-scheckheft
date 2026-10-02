let scale = 1;

/** Tests set this to 0 so simulated server work resolves immediately. */
export function setSimulateScale(value: number): void {
  scale = value;
}

/**
 * Stands in for server work. Callers pass a fixed delay between 600 and 1500 ms
 * and write state only after it resolves.
 */
export function simulate(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms * scale));
}
