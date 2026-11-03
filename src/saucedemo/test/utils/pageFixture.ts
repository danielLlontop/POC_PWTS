import { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * Fixture compartido para gestionar la instancia de Browser, Context y Page activa.
 * Se inicializa en el hook Before y se limpia en el hook After de hooks.ts.
 */
export const pageFixture = {
  // @ts-ignore
  page: undefined as Page,
  // @ts-ignore
  context: undefined as BrowserContext,
  // @ts-ignore
  browser: undefined as Browser,
};

