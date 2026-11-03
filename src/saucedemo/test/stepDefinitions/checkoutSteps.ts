import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomStateWorld } from "../utils/CustomStateWorld";
import { pageFixture } from "../utils/pageFixture";
import { InventoryPage } from "../pageObjects/InventoryPage";
import { CartPage } from "../pageObjects/CartPage";
import { CheckoutPage } from "../pageObjects/CheckoutPage";
import { generateRandomCustomer } from "../utils/commonUtils";

/**
 * Steps para el flujo de Checkout y confirmación de compra
 */

Given(
  "que el cliente tiene {int} productos agregados en el carrito de compras",
  async function (this: CustomStateWorld, count: number) {
    const inventoryPage = new InventoryPage(pageFixture.page);
    const added = await inventoryPage.addCheapestProducts(count);
    this.selectedProducts = added;
    await inventoryPage.goToCart();
  }
);

When(
  "inicia el proceso de compra",
  async function (this: CustomStateWorld) {
    const cartPage = new CartPage(pageFixture.page);
    await cartPage.proceedToCheckout();
  }
);

When(
  "completa el formulario con sus datos de envío",
  async function (this: CustomStateWorld) {
    const checkoutPage = new CheckoutPage(pageFixture.page);
    const customer = generateRandomCustomer();
    this.customerInfo = customer;

    await checkoutPage.fillCustomerInformation(customer);
    await checkoutPage.continueToOverview();
  }
);

When(
  "completa el formulario de envío con nombre {string}, apellido {string} y código postal {string}",
  async function (
    this: CustomStateWorld,
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    const checkoutPage = new CheckoutPage(pageFixture.page);
    const customer = { firstName, lastName, postalCode };
    this.customerInfo = customer;

    await checkoutPage.fillCustomerInformation(customer);
    await checkoutPage.continueToOverview();
  }
);

When(
  "confirma la orden de compra",
  async function (this: CustomStateWorld) {
    const checkoutPage = new CheckoutPage(pageFixture.page);
    // Guardar resumen financiero antes de dar clic en Finish
    this.orderSummary = await checkoutPage.getOrderSummary();
    await checkoutPage.finishOrder();
  }
);

Then(
  "se visualiza la pantalla de confirmación con el mensaje {string}",
  async function (this: CustomStateWorld, expectedHeader: string) {
    const checkoutPage = new CheckoutPage(pageFixture.page);
    const actualHeader = await checkoutPage.getConfirmationHeader();

    expect(
      actualHeader.toLowerCase(),
      `El encabezado de confirmación '${actualHeader}' no coincide con el esperado: '${expectedHeader}'`
    ).toContain(expectedHeader.toLowerCase());
  }
);

Then(
  "el total calculado de la compra coincide con el subtotal más los impuestos",
  async function (this: CustomStateWorld) {
    expect(
      this.orderSummary,
      "No se capturó el resumen de orden antes de confirmar la compra."
    ).toBeDefined();

    const { itemTotal, tax, total } = this.orderSummary!;
    const expectedTotal = parseFloat((itemTotal + tax).toFixed(2));

    expect(
      total,
      `El total calculado ($${total}) no coincide con la suma de subtotal ($${itemTotal}) + impuestos ($${tax}) = $${expectedTotal}`
    ).toBeCloseTo(expectedTotal, 2);
  }
);

Then(
  "el número de ítems en el resumen de orden es {int}",
  async function (this: CustomStateWorld, expectedCount: number) {
    expect(
      this.orderSummary,
      "No se capturó el resumen de orden antes de confirmar la compra."
    ).toBeDefined();

    expect(
      this.orderSummary!.itemCount,
      `La cantidad de productos en el resumen (${this.orderSummary!.itemCount}) no coincide con la esperada (${expectedCount})`
    ).toBe(expectedCount);
  }
);

