import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { CustomerInformation, OrderSummary, ProductItem, UserCredentials } from "./types";

/**
 * CustomStateWorld extiende el World de Cucumber para permitir el intercambio de estado
 * seguro y tipado entre diferentes Step Definitions a lo largo del ciclo de vida del escenario.
 */
export class CustomStateWorld extends World {
  // Usuario y autenticación
  currentUser?: UserCredentials;
  lastErrorMessage?: string;

  // Catálogo y Carrito
  selectedProducts: ProductItem[] = [];
  expectedCartCount: number = 0;
  sortedProductNames: string[] = [];

  // Proceso de compra / Checkout
  customerInfo?: CustomerInformation;
  orderSummary?: OrderSummary;
  orderConfirmationMessage?: string;

  // Diccionario genérico para variables dinámicas
  variables: Record<string, any> = {};

  constructor(options: IWorldOptions) {
    super(options);
    this.selectedProducts = [];
    this.variables = {};
  }
}

setWorldConstructor(CustomStateWorld);

