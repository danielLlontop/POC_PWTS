import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomStateWorld } from "../utils/CustomStateWorld";
import { pageFixture } from "../utils/pageFixture";
import { InventoryPage } from "../pageObjects/InventoryPage";
import { SORT_SELECTORS } from "../utils/consts";
import { isSortedAscending, isSortedDescending } from "../utils/commonUtils";

/**
 * Steps para interacciones con el catálogo de productos y carrito
 */

When(
  "ordena el catálogo de productos por {string}",
  async function (this: CustomStateWorld, sortCriteria: string) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const sortValue = SORT_SELECTORS[sortCriteria] || "az";
    await inventoryPage.selectSortOption(sortValue);
  }
);

Then(
  "los productos se visualizan ordenados alfabéticamente de forma {string}",
  async function (this: CustomStateWorld, orderDirection: string) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const names = await inventoryPage.getAllProductNames();

    const isAscending = orderDirection.toLowerCase().includes("asc") || orderDirection.toLowerCase().includes("a a z");

    if (isAscending) {
      const isSorted = isSortedAscending(names);
      expect(isSorted, `La lista de productos no está ordenada alfabéticamente A-Z: ${JSON.stringify(names)}`).toBeTruthy();
    } else {
      const isSorted = isSortedDescending(names);
      expect(isSorted, `La lista de productos no está ordenada alfabéticamente Z-A: ${JSON.stringify(names)}`).toBeTruthy();
    }
  }
);

Then(
  "los productos se visualizan ordenados por precio de forma {string}",
  async function (this: CustomStateWorld, priceDirection: string) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const prices = await inventoryPage.getAllProductPrices();

    const isLowToHigh = priceDirection.toLowerCase().includes("menor") || priceDirection.toLowerCase().includes("asc");

    if (isLowToHigh) {
      const isSorted = isSortedAscending(prices);
      expect(isSorted, `Los precios no están ordenados de menor a mayor: ${JSON.stringify(prices)}`).toBeTruthy();
    } else {
      const isSorted = isSortedDescending(prices);
      expect(isSorted, `Los precios no están ordenados de mayor a menor: ${JSON.stringify(prices)}`).toBeTruthy();
    }
  }
);

When(
  "agrega el producto {string} al carrito de compras",
  async function (this: CustomStateWorld, productName: string) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const addedProduct = await inventoryPage.addProductToCartByName(productName);
    this.selectedProducts = this.selectedProducts || [];
    this.selectedProducts.push(addedProduct);
  }
);

When(
  "agrega los {int} productos más económicos al carrito",
  async function (this: CustomStateWorld, count: number) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const added = await inventoryPage.addCheapestProducts(count);
    this.selectedProducts = this.selectedProducts || [];
    this.selectedProducts.push(...added);
  }
);

When(
  "remueve el producto {string} del catálogo",
  async function (this: CustomStateWorld, productName: string) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    await inventoryPage.removeProductFromCartByName(productName);
    this.selectedProducts = this.selectedProducts.filter((p) => p.name !== productName);
  }
);

Then(
  "el contador del carrito muestra {int} producto(s)",
  async function (this: CustomStateWorld, expectedCount: number) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const actualCount = await inventoryPage.getCartCount();

    expect(
      actualCount,
      `El badge del carrito muestra ${actualCount} ítems, pero se esperaban ${expectedCount}`
    ).toBe(expectedCount);
  }
);

When(
  "navega al carrito de compras",
  async function (this: CustomStateWorld) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    await inventoryPage.goToCart();
  }
);

