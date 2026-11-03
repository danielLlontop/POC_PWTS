/**
 * Tipos relacionados con el proceso de checkout y finalización de compra en Sauce Demo
 */

export interface CustomerInformation {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface OrderSummary {
  itemTotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface OrderConfirmation {
  headerMessage: string;
  bodyMessage: string;
  isCompleted: boolean;
}

