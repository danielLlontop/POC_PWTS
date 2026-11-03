import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomStateWorld } from "../utils/CustomStateWorld";
import { pageFixture } from "../utils/pageFixture";
import { LoginPage } from "../pageObjects/LoginPage";
import { CommonPage } from "../pageObjects/CommonPage";
import { USERS } from "../utils/consts";
import { UserProfile } from "../utils/types";

/**
 * Steps comunes y transversales del proyecto Sauce Demo
 */

Given(
  "que el cliente se encuentra en la página de inicio de sesión de Sauce Demo",
  async function (this: CustomStateWorld) {
    const loginPage = new LoginPage(pageFixture.page);
    await loginPage.navigate();
  }
);

Given(
  "que el cliente ha iniciado sesión como {string}",
  async function (this: CustomStateWorld, profileName: string) {
    const loginPage = new LoginPage(pageFixture.page);
    await loginPage.navigate();

    const normalizedKey = profileName.toUpperCase().replace(/\s+/g, "_") as UserProfile;
    const credentials = USERS[normalizedKey] || USERS.STANDARD;

    this.currentUser = credentials;
    await loginPage.login(credentials);
  }
);

When(
  "hace clic en el botón {string}",
  async function (this: CustomStateWorld, buttonName: string) {
    const commonPage = new CommonPage(pageFixture.page);
    await commonPage.clickButtonByName(buttonName);
  }
);

Then(
  "se visualiza el título de página {string}",
  async function (this: CustomStateWorld, expectedTitle: string) {
    const commonPage = new CommonPage(pageFixture.page);
    const actualTitle = await commonPage.getPageTitle();
    expect(
      actualTitle.toLowerCase(),
      `El título de la página '${actualTitle}' no coincide con el esperado: '${expectedTitle}'`
    ).toContain(expectedTitle.toLowerCase());
  }
);

Then(
  "permanece en la pantalla de inicio de sesión",
  async function (this: CustomStateWorld) {
    const loginPage = new LoginPage(pageFixture.page);
    const isLoginVisible = await loginPage.isLoginButtonVisible();
    expect(
      isLoginVisible,
      "Se esperaba que el usuario permanezca en la pantalla de inicio de sesión pero el botón de login no está visible."
    ).toBeTruthy();
  }
);

