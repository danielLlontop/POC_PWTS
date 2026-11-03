# Changelog — Sauce Demo Automation Framework

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [saucedemo/v1.0.0] - 2026-11-03

### Añadido
- Arquitectura base construida sobre el stack **Playwright + TypeScript + Cucumber (BDD)**.
- Integración de convenciones del framework **KiroAutomation** adaptadas a Sauce Demo.
- Page Object Model con clase base `CommonPage` y clases especializadas:
  - `LoginPage.ts`: Autenticación, control de errores y validación de vista de acceso.
  - `InventoryPage.ts`: Catálogo de productos, filtros de ordenamiento y gestión de carrito.
  - `CartPage.ts`: Revisión de artículos seleccionados y avance a checkout.
  - `CheckoutPage.ts`: Información de cliente, cálculo financiero y confirmación de compra.
- Sistema de tipos estrictos en `types/` (`auth.ts`, `product.ts`, `checkout.ts`).
- Estado compartido entre steps mediante `CustomStateWorld.ts`.
- Hooks con captura de logs paso a paso en `.txt` (`executionLogger.ts`).
- Captura automática de **Playwright Traces (.zip)** y **Screenshots** en fallos.
- Orquestador inteligente `runner.js` con soporte para ejecución paralela (`--parallel 2`), modo headed y generación de reportes HTML (`cucumber-html-reporter`).
- Cobertura de 3 features en Gherkin declarativo en español:
  - `SD-01-Autenticacion.feature` (casos positivos y negativos).
  - `SD-02-CatalogoProductos.feature` (ordenamiento por precio y nombre, badge de carrito).
  - `SD-03-FlujoCompra.feature` (E2E completo con validación matemática de total).

