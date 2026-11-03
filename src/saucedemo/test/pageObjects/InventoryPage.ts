import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { ProductItem } from "../utils/types";
import { parsePrice } from "../utils/commonUtils";

/**
 * InventoryPage — Page Object para el catálogo de productos (inventario) de Sauce Demo.
 */
export class InventoryPage extends CommonPage {
  readonly titleHeader: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator("[data-test='title']");
    this.sortDropdown = page.locator("[data-test='product-sort-container']");
    this.inventoryItems = page.locator("[data-test='inventory-item']");
    this.cartLink = page.locator("[data-test='shopping-cart-link']");
    this.cartBadge = page.locator("[data-test='shopping-cart-badge']");
  }

  // Verifica si la página de inventario se encuentra desplegada
  async isInventoryPageDisplayed(): Promise<boolean> {
    return await this.titleHeader.isVisible().catch(() => false);
  }

  // Selecciona una opción de ordenamiento en el dropdown (az, za, lohi, hilo)
  async selectSortOption(optionValue: string): Promise<void> {
    await this.sortDropdown.waitFor({ state: "visible" });
    await this.sortDropdown.selectOption(optionValue);
    // Breve espera para que el DOM reordene las tarjetas
    await this.page.waitForTimeout(500);
  }

  // Obtiene los nombres de todos los productos en el orden actual visualizado
  async getAllProductNames(): Promise<string[]> {
    const nameLocators = this.page.locator("[data-test='inventory-item-name']");
    await nameLocators.first().waitFor({ state: "visible", timeout: 15000 });
    return await nameLocators.allTextContents();
  }

  // Obtiene los precios numéricos de todos los productos en el orden actual
  async getAllProductPrices(): Promise<number[]> {
    const priceLocators = this.page.locator("[data-test='inventory-item-price']");
    await priceLocators.first().waitFor({ state: "visible", timeout: 15000 });
    const priceTexts = await priceLocators.allTextContents();
    return priceTexts.map((text) => parsePrice(text));
  }

  // Extrae la lista completa de productos disponibles con sus datos
  async getAllProducts(): Promise<ProductItem[]> {
    await this.inventoryItems.first().waitFor({ state: "visible", timeout: 15000 });
    const count = await this.inventoryItems.count();
    const products: ProductItem[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.inventoryItems.nth(i);
      const name = (await item.locator("[data-test='inventory-item-name']").textContent())?.trim() || "";
      const description = (await item.locator("[data-test='inventory-item-desc']").textContent())?.trim() || "";
      const priceFormatted = (await item.locator("[data-test='inventory-item-price']").textContent())?.trim() || "";
      const price = parsePrice(priceFormatted);

      products.push({
        name,
        description,
        price,
        priceFormatted,
      });
    }

    return products;
  }

  // Agrega un producto al carrito por su nombre exacto
  async addProductToCartByName(productName: string): Promise<ProductItem> {
    const item = this.inventoryItems.filter({ hasText: productName }).first();
    await item.waitFor({ state: "visible" });

    const priceText = (await item.locator("[data-test='inventory-item-price']").textContent())?.trim() || "$0.00";
    const descText = (await item.locator("[data-test='inventory-item-desc']").textContent())?.trim() || "";
    const addBtn = item.getByRole("button", { name: "Add to cart" });

    await addBtn.click();

    return {
      name: productName,
      description: descText,
      price: parsePrice(priceText),
      priceFormatted: priceText,
    };
  }

  // Remueve un producto del carrito desde la vista de catálogo
  async removeProductFromCartByName(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName }).first();
    await item.waitFor({ state: "visible" });
    const removeBtn = item.getByRole("button", { name: "Remove" });
    await removeBtn.click();
  }

  // Agrega los N productos de menor precio al carrito
  async addCheapestProducts(count: number): Promise<ProductItem[]> {
    const allProducts = await this.getAllProducts();
    const sortedByPrice = [...allProducts].sort((a, b) => a.price - b.price);
    const targetProducts = sortedByPrice.slice(0, count);

    const added: ProductItem[] = [];
    for (const prod of targetProducts) {
      const itemAdded = await this.addProductToCartByName(prod.name);
      added.push(itemAdded);
    }

    return added;
  }

  // Obtiene el número mostrado en la burbuja (badge) del carrito
  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible().catch(() => false);
    if (!isVisible) return 0;
    const text = (await this.cartBadge.textContent())?.trim() || "0";
    return parseInt(text, 10);
  }

  // Navega hacia la pantalla del carrito de compras
  async goToCart(): Promise<void> {
    await this.cartLink.waitFor({ state: "visible" });
    await this.cartLink.click();
  }
}

