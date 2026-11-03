import { Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { UserCredentials } from "../utils/types";
import { MAIN_URL } from "../utils/consts";

/**
 * LoginPage — Page Object para la pantalla de inicio de sesión de Sauce Demo.
 */
export class LoginPage extends CommonPage {
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;
  readonly errorContainer: Locator;

  constructor(page: Page) {
    super(page);
    // Prioridad de selectores: getByPlaceholder / getByRole / data-test
    this.inputUsername = page.getByPlaceholder("Username");
    this.inputPassword = page.getByPlaceholder("Password");
    this.btnLogin = page.getByRole("button", { name: "Login" });
    this.errorContainer = page.locator("[data-test='error']");
  }

  // Navega a la pantalla principal de login
  async navigate(): Promise<void> {
    await this.navigateTo(MAIN_URL);
    await this.inputUsername.waitFor({ state: "visible", timeout: 20000 });
  }

  // Completa el formulario e inicia sesión con las credenciales indicadas
  async login(credentials: UserCredentials): Promise<void> {
    await this.enterUsername(credentials.username);
    await this.enterPassword(credentials.password);
    await this.clickLogin();
  }

  // Ingresa el nombre de usuario
  async enterUsername(username: string): Promise<void> {
    await this.inputUsername.waitFor({ state: "visible" });
    await this.inputUsername.fill(username);
  }

  // Ingresa la contraseña
  async enterPassword(password: string): Promise<void> {
    await this.inputPassword.waitFor({ state: "visible" });
    await this.inputPassword.fill(password);
  }

  // Hace clic en el botón de Login
  async clickLogin(): Promise<void> {
    await this.btnLogin.waitFor({ state: "visible" });
    await this.btnLogin.click();
  }

  // Obtiene el texto del mensaje de error desplegado
  async getErrorMessage(): Promise<string> {
    await this.errorContainer.waitFor({ state: "visible", timeout: 10000 });
    return (await this.errorContainer.textContent())?.trim() || "";
  }

  // Verifica si el contenedor de error está visible
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorContainer.isVisible().catch(() => false);
  }

  // Verifica si el botón de login está presente (página de login activa)
  async isLoginButtonVisible(): Promise<boolean> {
    return await this.btnLogin.isVisible().catch(() => false);
  }
}

