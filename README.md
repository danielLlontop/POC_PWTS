# Framework de Automatización E2E — Sauce Demo
### Playwright + TypeScript + Cucumber BDD

Proyecto de referencia diseñado para la transición y adopción moderna de pruebas automatizadas E2E, evolucionando desde soluciones tradicionales basadas en Selenium/Serenity hacia la velocidad, estabilidad y trazabilidad nativa de **Playwright** con **TypeScript** y **Cucumber**.

---

## 1. Justificación Técnica: De Serenity BDD (Java) a Playwright + Cucumber (TypeScript)

| Dimensión | Serenity BDD + Java | Playwright + TS + Cucumber | Ventaja Estratégica |
| :--- | :--- | :--- | :--- |
| **Cultura BDD** | Gherkin (`.feature`) | Gherkin (`.feature`) | **Cero fricción de negocio**: Las especificaciones y criterios de aceptación se mantienen idénticos. |
| **Arquitectura de Drivers** | Selenium WebDriver / ChromeDriver externos | Binarios herméticos controlados por Playwright | **Sin desalineación de binarios**: Se eliminan fallos por actualizaciones de navegador en CI/CD. |
| **Velocidad de Ejecución** | Tiempo de arranque alto (JVM) | Motor Node.js / V8 ultra liviano | **60% a 70% más rápido**, optimizando costos y tiempos de pipeline. |
| **Auto-Waiting** | `WebDriverWait` explícitos y propensos a errores | Auto-waiting nativo en todas las acciones | **Pruebas determinísticas**: Playwright verifica visibilidad, estabilidad y habilitación antes de interactuar. |
| **Trazabilidad y Depuración** | Capturas estáticas y logs pesados | **Playwright Traces (.zip)** interactivos | Inspección milisegundo a milisegundo de eventos del DOM, red, consola y snapshots históricos. |
| **Tipado y Mantenimiento** | Clases verbosas en Java | Tipos estrictos e interfaces en TypeScript | Código limpio, autodocumentado y con autocompletado en el IDE. |

---

## 2. Estructura del Proyecto

El proyecto sigue una arquitectura modular en capas inspirada en los estándares de ingeniería de software para pruebas (ISTQB CTAL-TAE):

```text
saucedemo-playwright/
├── src/
│   └── saucedemo/
│       ├── test/
│       │   ├── features/               # Escenarios Gherkin en español (declarativos)
│       │   │   ├── SD-01-Autenticacion.feature
│       │   │   ├── SD-02-CatalogoProductos.feature
│       │   │   └── SD-03-FlujoCompra.feature
│       │   ├── pageObjects/            # Page Object Model (heredan de CommonPage)
│       │   │   ├── CommonPage.ts       # Métodos y esperas base
│       │   │   ├── LoginPage.ts        # Acceso y control de errores
│       │   │   ├── InventoryPage.ts    # Catálogo, filtros y selección
│       │   │   ├── CartPage.ts         # Revisión de carrito de compras
│       │   │   └── CheckoutPage.ts     # Datos de envío, resumen y confirmación
│       │   ├── stepDefinitions/        # Implementación técnica de los steps
│       │   │   ├── commonSteps.ts      # Pasos transversales y reutilizables
│       │   │   ├── loginSteps.ts       # Pasos de autenticación
│       │   │   ├── inventorySteps.ts   # Pasos de catálogo
│       │   │   └── checkoutSteps.ts    # Pasos de compra E2E
│       │   ├── traces/                 # Playwright Traces generados en fallos
│       │   ├── testFiles/json/         # Data de prueba estructurada
│       │   └── utils/                  # Infraestructura y utilitarios
│       │       ├── .env                # Variables de entorno y credenciales
│       │       ├── consts.ts           # Carga tipada de configuración
│       │       ├── pageFixture.ts      # Fixture compartido (Browser, Context, Page)
│       │       ├── CustomStateWorld.ts # Estado compartido entre steps del escenario
│       │       ├── executionLogger.ts  # Registro de logs por escenario (.txt)
│       │       ├── hooks.ts            # Hooks de ciclo de vida (Traces, Screenshots)
│       │       ├── commonUtils.ts      # Parsers y helpers matemáticos
│       │       ├── runner.js           # Orquestador con soporte de paralelismo
│       │       └── types/              # Modelado estricto con barrel export
│       │           ├── index.ts
│       │           ├── auth.ts
│       │           ├── product.ts
│       │           └── checkout.ts
│       ├── CHANGELOG.md                # Bitácora de versiones
│       └── cucumber-report.html        # Reporte HTML generado tras la ejecución
├── cucumber.json                       # Configuración base de Cucumber.js
├── playwright.config.ts                # Configuración de Playwright
├── tsconfig.json                       # Reglas del compilador TypeScript
├── package.json                        # Scripts npm y dependencias
└── README.md
```

---

## 3. Requisitos Previos

- **Node.js**: Versión 18.x o superior (recomendado v20+ o v24+).
- **Google Chrome** o navegador **Chromium** instalado.

---

## 4. Instalación

1. Navegar a la carpeta del proyecto:
   ```bash
   cd c:\Automatizacion\saucedemo-playwright
   ```

2. Instalar las dependencias de Node.js:
   ```bash
   npm install
   ```

3. (Opcional) Instalar los navegadores de Playwright si no se cuenta con Chrome en el sistema:
   ```bash
   npx playwright install chromium
   ```

---

## 5. Comandos de Ejecución

El proyecto utiliza un orquestador inteligente (`runner.js`) que administra políticas de paralelismo, captura de logs y generación de reportes HTML:

### Ejecución de Toda la Suite (Paralelo por defecto con 2 workers)
```bash
npm test
```

### Ejecución por Etiquetas de Negocio (Tags)
```bash
# Ejecutar solo pruebas de humo (Smoke)
npm run test:smoke

# Ejecutar el flujo de compra E2E
npm run test:compra

# Ejecutar autenticación
npm run test:auth

# Ejecutar catálogo de productos
npm run test:catalogo
```

### Ejecución con Navegador Visible (Modo Headed)
```bash
npm run test:headed
```

### Ejecución Secuencial (1 Worker)
```bash
npm run test:serial
```

### Filtrado Dinámico por Etiquetas mediante CLI
```bash
node src/saucedemo/test/utils/runner.js --tags "@SD-01-EC01 or @SD-03"
```

---

## 6. Sistema de Reportes y Evidencias

### A. Reporte HTML Interactivo (`cucumber-report.html`)
Al finalizar la ejecución, se genera automáticamente el reporte interactivo en:
`src/saucedemo/cucumber-report.html`.

Para abrirlo en el navegador predeterminado:
```bash
npm run report
```
El reporte incluye:
- Gráficos de escenarios aprobados/fallidos.
- Duración por paso.
- Capturas de pantalla (screenshots) adjuntas a cada escenario.
- **Log de ejecución incrustado (inline)** y archivo `.txt` descargable.
- **Playwright Trace (.zip)** adjunto en caso de fallo.

### B. Playwright Traces (.zip)
Cuando un escenario falla, Playwright empaqueta una traza forense completa en `src/saucedemo/test/traces/`.
Para visualizar la traza de forma interactiva:
```bash
npx playwright show-trace src/saucedemo/test/traces/{nombre_del_trace}.zip
```

### C. Log de Ejecución (.txt)
Cada ejecución registra:
- Logs individuales por escenario en: `logs/SAUCEDEMO_{timestamp}/`.
- Archivo consolidado `execution.txt` que resume la corrida completa.

---

## 7. Buenas Prácticas Aplicadas

1. **Gherkin Declarativo en Español**: Los escenarios describen la regla de negocio y comportamiento esperado, evitando describir clics o selectores técnicos.
2. **Prioridad de Localizadores (Locator Priority)**:
   - `getByRole` con nombre accesible.
   - `getByPlaceholder` / `getByLabel`.
   - `getByText`.
   - `data-test` como atributo de prueba semántico.
3. **Aserciones en los Steps**: Los Page Objects sólo exponen acciones y obtención de datos; las aserciones (`expect`) se realizan en los Step Definitions para facilitar la reutilización y el diagnóstico.
4. **Independencia de Escenarios**: Cada escenario inicializa su propio contexto de navegador y memoria aislada en `CustomStateWorld`.

