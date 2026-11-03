import { CustomerInformation } from "./types";

/**
 * Convierte un texto con símbolo de moneda (ej: "$29.99") a número flotante.
 */
export function parsePrice(priceText: string): number {
  const clean = priceText.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Formatea un valor numérico a formato monetario (ej: 29.99 -> "$29.99").
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Genera datos aleatorios para el formulario de cliente en checkout.
 */
export function generateRandomCustomer(): CustomerInformation {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    firstName: `QA_Tester_${randomSuffix}`,
    lastName: `Automation_${randomSuffix}`,
    postalCode: `${randomSuffix}`,
  };
}

/**
 * Verifica si un arreglo numérico o de strings se encuentra ordenado ascendentemente.
 */
export function isSortedAscending<T extends number | string>(arr: T[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Verifica si un arreglo numérico o de strings se encuentra ordenado descendentemente.
 */
export function isSortedDescending<T extends number | string>(arr: T[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < arr[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Espera pasiva controlada (usar con precaución, preferir auto-waiting de Playwright).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

