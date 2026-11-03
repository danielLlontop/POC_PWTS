import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

/**
 * CartPage — Page Object para la pantalla de carrito de compras en Sauce Demo.
 */
export class CartPage extends CommonPage {
  readonly cartItems: Locator;
  readonly btnCheckout: Locator;
  readonly btnContinueShopping: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator("[data-test='inventory-item']");
    this.btnCheckout = page.locator("[data-test='checkout']");
    this.btnContinueShopping = page.locator("[data-test='continue-shopping']");
  }

  // Obtiene los nombres de los productos contenidos en el carrito
  async getCartItemNames(): Promise<string[]> {
    const nameLocators = this.page.locator("[data-test='inventory-item-name']");
    return await nameLocators.allTextContents();
  }

  // Obtiene la cantidad de ítems presentes en el carrito
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  // Remueve un producto del carrito según su nombre
  async removeItemByName(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName }).first();
    await item.waitFor({ state: "visible" });
    const removeBtn = item.getByRole("button", { name: "Remove" });
    await removeBtn.click();
  }

  // Avanza hacia el flujo de checkout (datos del cliente)
  async proceedToCheckout(): Promise<void> {
    await this.btnCheckout.waitFor({ state: "visible" });
    await this.btnCheckout.click();
  }

  // Regresa al catálogo para continuar comprando
  async continueShopping(): Promise<void> {
    await this.btnContinueShopping.waitFor({ state: "visible" });
    await this.btnContinueShopping.click();
  }
}

