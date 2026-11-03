import { Page } from "@playwright/test";

/**
 * CommonPage — Clase base para todos los Page Objects del proyecto.
 * Centraliza interacciones comunes, esperas y métodos genéricos de validación.
 */
export class CommonPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navega a una URL relativa o absoluta
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  // Obtiene el título principal de la vista actual
  async getPageTitle(): Promise<string> {
    const titleLocator = this.page.locator(".title, [data-test='title']").first();
    await titleLocator.waitFor({ state: "visible", timeout: 15000 });
    return (await titleLocator.textContent())?.trim() || "";
  }

  // Hace clic en un botón accesible por su nombre o rol
  async clickButtonByName(buttonName: string): Promise<void> {
    const button = this.page.getByRole("button", { name: buttonName, exact: false }).first();
    await button.waitFor({ state: "visible", timeout: 15000 });
    await button.click();
  }

  // Valida que un texto específico esté visible en la página
  async isTextVisible(expectedText: string): Promise<boolean> {
    const textLocator = this.page.getByText(expectedText, { exact: false }).first();
    return await textLocator.isVisible().catch(() => false);
  }

  // Espera a que un mensaje o texto sea visible
  async waitForText(expectedText: string, timeoutMs: number = 15000): Promise<void> {
    const textLocator = this.page.getByText(expectedText, { exact: false }).first();
    await textLocator.waitFor({ state: "visible", timeout: timeoutMs });
  }

  // Obtiene la URL actual del navegador
  getCurrentUrl(): string {
    return this.page.url();
  }
}

