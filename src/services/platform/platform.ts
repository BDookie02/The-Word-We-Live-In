/** Runtime platform detection. Capacitor injects `window.Capacitor` inside the native shell. */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

function cap(): CapacitorGlobal | undefined {
  return (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function isNative(): boolean {
  return cap()?.isNativePlatform?.() ?? false;
}

export function platformName(): 'android' | 'ios' | 'web' {
  const name = cap()?.getPlatform?.();
  return name === 'android' || name === 'ios' ? name : 'web';
}
