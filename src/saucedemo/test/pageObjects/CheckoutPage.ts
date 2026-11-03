import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { CustomerInformation, OrderSummary } from "../utils/types";
import { parsePrice } from "../utils/commonUtils";

/**
 * CheckoutPage — Page Object para el flujo completo de checkout en Sauce Demo
 * (Información del cliente, Resumen de orden y Confirmación final).
 */
export class CheckoutPage extends CommonPage {
  // Paso 1: Información
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputPostalCode: Locator;
  readonly btnContinue: Locator;

  // Paso 2: Resumen (Overview)
  readonly summarySubtotal: Locator;
  readonly summaryTax: Locator;
  readonly summaryTotal: Locator;
  readonly btnFinish: Locator;

  // Paso 3: Confirmación (Complete)
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly btnBackHome: Locator;

  constructor(page: Page) {
    super(page);
    this.inputFirstName = page.getByPlaceholder("First Name");
    this.inputLastName = page.getByPlaceholder("Last Name");
    this.inputPostalCode = page.getByPlaceholder("Zip/Postal Code");
    this.btnContinue = page.locator("[data-test='continue']");

    this.summarySubtotal = page.locator("[data-test='subtotal-label']");
    this.summaryTax = page.locator("[data-test='tax-label']");
    this.summaryTotal = page.locator("[data-test='total-label']");
    this.btnFinish = page.locator("[data-test='finish']");

    this.completeHeader = page.locator("[data-test='complete-header']");
    this.completeText = page.locator("[data-test='complete-text']");
    this.btnBackHome = page.locator("[data-test='back-to-products']");
  }

  // Completa el formulario de datos personales y de envío
  async fillCustomerInformation(info: CustomerInformation): Promise<void> {
    await this.inputFirstName.waitFor({ state: "visible" });
    await this.inputFirstName.fill(info.firstName);
    await this.inputLastName.fill(info.lastName);
    await this.inputPostalCode.fill(info.postalCode);
  }

  // Continúa a la pantalla de resumen de la orden
  async continueToOverview(): Promise<void> {
    await this.btnContinue.waitFor({ state: "visible" });
    await this.btnContinue.click();
  }

  // Extrae y calcula los valores financieros del resumen de orden
  async getOrderSummary(): Promise<OrderSummary> {
    await this.summarySubtotal.waitFor({ state: "visible", timeout: 15000 });
    const subtotalText = (await this.summarySubtotal.textContent()) || "";
    const taxText = (await this.summaryTax.textContent()) || "";
    const totalText = (await this.summaryTotal.textContent()) || "";

    const itemTotal = parsePrice(subtotalText);
    const tax = parsePrice(taxText);
    const total = parsePrice(totalText);

    const itemsLocator = this.page.locator(".cart_item, [data-test='inventory-item']");
    await itemsLocator.first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    const itemsCount = await itemsLocator.count();

    return {
      itemTotal,
      tax,
      total,
      itemCount: itemsCount,
    };
  }

  // Confirma y finaliza la compra
  async finishOrder(): Promise<void> {
    await this.btnFinish.waitFor({ state: "visible" });
    await this.btnFinish.click();
  }

  // Obtiene el título principal de la pantalla de confirmación
  async getConfirmationHeader(): Promise<string> {
    await this.completeHeader.waitFor({ state: "visible", timeout: 15000 });
    return (await this.completeHeader.textContent())?.trim() || "";
  }

  // Obtiene el mensaje descriptivo de despacho de la orden
  async getConfirmationText(): Promise<string> {
    return (await this.completeText.textContent())?.trim() || "";
  }

  // Valida si la orden fue completada exitosamente
  async isOrderCompleted(): Promise<boolean> {
    return await this.completeHeader.isVisible().catch(() => false);
  }
}

