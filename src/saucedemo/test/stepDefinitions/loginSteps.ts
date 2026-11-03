import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomStateWorld } from "../utils/CustomStateWorld";
import { pageFixture } from "../utils/pageFixture";
import { LoginPage } from "../pageObjects/LoginPage";
import { USERS } from "../utils/consts";
import { UserProfile } from "../utils/types";

/**
 * Steps para validaciones de autenticación y login
 */

When(
  "inicia sesión con usuario {string} y contraseña {string}",
  async function (this: CustomStateWorld, username: string, password: string) {
    const loginPage = new LoginPage(pageFixture.page);
    this.currentUser = { username, password };
    await loginPage.login(this.currentUser);
  }
);

When(
  "intenta iniciar sesión con el perfil de usuario {string}",
  async function (this: CustomStateWorld, profileName: string) {
    const loginPage = new LoginPage(pageFixture.page);
    const normalizedKey = profileName.toUpperCase().replace(/\s+/g, "_") as UserProfile;
    const credentials = USERS[normalizedKey];

    if (!credentials) {
      throw new Error(`El perfil '${profileName}' no está configurado en consts.ts`);
    }

    this.currentUser = credentials;
    await loginPage.login(credentials);
  }
);

Then(
  "se visualiza el mensaje de error {string}",
  async function (this: CustomStateWorld, expectedError: string) {
    const loginPage = new LoginPage(pageFixture.page);
    const actualError = await loginPage.getErrorMessage();
    this.lastErrorMessage = actualError;

    expect(
      actualError,
      `El mensaje de error visualizado no coincide con el esperado.`
    ).toContain(expectedError);
  }
);

Then(
  "se visualiza un mensaje de error que contiene {string}",
  async function (this: CustomStateWorld, partialText: string) {
    const loginPage = new LoginPage(pageFixture.page);
    const actualError = await loginPage.getErrorMessage();

    expect(
      actualError.toLowerCase(),
      `El mensaje de error '${actualError}' no contiene el fragmento esperado: '${partialText}'`
    ).toContain(partialText.toLowerCase());
  }
);

