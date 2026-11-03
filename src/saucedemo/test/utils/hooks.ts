import { Browser, BrowserContext, chromium } from "@playwright/test";
import {
  After,
  AfterStep,
  Before,
  BeforeStep,
  setDefaultTimeout,
  Status,
} from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import "./CustomStateWorld";
import { pageFixture } from "./pageFixture";
import { VIEWPORT } from "./consts";
import {
  durationToMs,
  findScenarioLine,
  findStepKeyword,
  finishScenario,
  installConsoleCapture,
  isLoggingEnabled,
  startScenario,
  startStep,
  endStep,
} from "./executionLogger";

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, ".env") });

let browser: Browser;
let context: BrowserContext;

// Timeout por defecto para acciones y steps (60 segundos)
setDefaultTimeout(60000);

// =============================================================================
// REGISTRO Y CAPTURA DE LOGS DE EJECUCIÓN (Consola + Archivo .txt)
// =============================================================================
installConsoleCapture();

Before(function (scenario) {
  if (!isLoggingEnabled()) return;

  startScenario({
    name: scenario.pickle.name,
    tags: scenario.pickle.tags.map((tag) => tag.name),
    uri: scenario.pickle.uri,
    line: findScenarioLine(scenario.gherkinDocument, scenario.pickle),
    plannedSteps: scenario.pickle.steps.map((step) => ({
      keyword: findStepKeyword(scenario.gherkinDocument, step),
      text: step.text,
    })),
  });
});

BeforeStep(function ({ gherkinDocument, pickleStep }) {
  startStep(findStepKeyword(gherkinDocument, pickleStep), pickleStep.text);
});

AfterStep(function ({ result }) {
  endStep(result.status, durationToMs(result.duration), result.message);
});

After(async function (scenario) {
  const log = finishScenario(scenario.result?.status ?? "UNKNOWN", scenario.result?.message);
  if (!log) return;

  try {
    // 1. Adjunto inline legible directamente en el reporte HTML
    await this.attach(log.inlineText, "text/plain");

    // 2. Archivo descargable completo
    await this.attach(Buffer.from(log.text, "utf-8"), {
      mediaType: "application/octet-stream",
      fileName: log.fileName,
    });
  } catch (error: any) {
    console.warn(`[LOGGER WARN] No se pudo adjuntar el log al reporte: ${error.message}`);
  }
});

// =============================================================================
// GESTIÓN DE ESCENARIOS @ignore
// =============================================================================
Before({ tags: "@ignore" }, function (scenario) {
  console.log(`[IGNORE] Escenario excluido por tag @ignore: ${scenario.pickle.name}`);
  return "skipped";
});

// =============================================================================
// CICLO DE VIDA DEL NAVEGADOR Y CONTEXTO PLAYWRIGHT
// =============================================================================
Before(async function (scenario) {
  const isHeadedParam = process.argv.includes("--headed") || process.env.HEADED === "true";
  const isHeadless = !isHeadedParam && process.env.HEADLESS !== "false";

  console.log(`\n▶ [EJECUTANDO ESCENARIO]: ${scenario.pickle.name}`);

  // Lanzar Chromium
  browser = await chromium.launch({
    headless: isHeadless,
    channel: "chrome",
  }).catch(async () => {
    // Si Google Chrome nativo no está disponible, utilizar el binario bundled de Chromium
    return await chromium.launch({
      headless: isHeadless,
    });
  });

  pageFixture.browser = browser;

  // Crear contexto aislado para el escenario
  context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
  });
  pageFixture.context = context;

  // Iniciar trazabilidad detallada (Traces) para capturar pantallazos, DOM y red
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  // Crear página activa
  pageFixture.page = await context.newPage();
});

/**
 * Sanitiza las etiquetas del escenario para nombrar archivos de evidencia sin caracteres inválidos en NTFS/Windows.
 */
function getScenarioFileLabel(tagNames: string[]): string {
  const ecTag = tagNames.find((t) => /-EC\d+/i.test(t));
  const raw = ecTag ?? tagNames[0] ?? "escenario";
  return raw
    .replace(/^@/, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60) || "escenario";
}

After(async function (scenario) {
  const tags = scenario.pickle.tags.map((t) => t.name);
  const fileLabel = getScenarioFileLabel(tags);
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .replace(/\..+/, "");

  const tracesDir = path.resolve(__dirname, "..", "traces");
  const screenshotsDir = path.resolve(process.cwd(), "screenshots");

  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const activePage = pageFixture.page;
  const activeContext = pageFixture.context;

  if (activePage && !activePage.isClosed() && activeContext) {
    try {
      // 1. Manejo de Playwright Traces (.zip)
      if (scenario.result?.status !== Status.PASSED) {
        const tracePath = path.join(tracesDir, `${fileLabel}_${timestamp}_trace.zip`);
        console.log(`[FALLO]: ${scenario.pickle.name} -> Guardando trace en ${tracePath}`);
        await activeContext.tracing.stop({ path: tracePath });

        if (fs.existsSync(tracePath)) {
          await this.attach(fs.readFileSync(tracePath), "application/zip");
          console.log(`[INFO] Trace adjuntado al reporte Cucumber: ${tracePath}`);
        }
      } else {
        await activeContext.tracing.stop();
      }
    } catch (err: any) {
      console.warn(`[WARN] Error procesando trace: ${err.message}`);
    }

    try {
      // 2. Captura de pantalla (Screenshot)
      const screenshotPath = path.join(screenshotsDir, `${fileLabel}_${timestamp}.png`);
      const imgBuffer = await activePage.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      await this.attach(imgBuffer, "image/png");
    } catch (err: any) {
      console.warn(`[WARN] Error capturando screenshot: ${err.message}`);
    }

    // 3. Cierre limpio de página y contexto
    try {
      await activePage.close();
      await activeContext.close();
    } catch {
      // Ignorar errores de cierre
    }
  }

  // 4. Cierre del navegador
  if (browser) {
    try {
      await browser.close();
    } catch {
      // Ignorar errores de cierre
    }
  }
});

