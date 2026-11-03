const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const util = require("util");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Normalizar letra de unidad en Windows (C: en mayúscula) para evitar duplicación de módulos en require.cache
if (process.platform === "win32" && process.cwd().charAt(1) === ":") {
  const normalizedCwd = process.cwd().charAt(0).toUpperCase() + process.cwd().slice(1);
  if (process.cwd() !== normalizedCwd) {
    process.chdir(normalizedCwd);
  }
}

// Deshabilitar códigos de escape ANSI para reportes limpios
process.env.FORCE_COLOR = "0";
process.env.NO_COLOR = "1";

const TIME_ZONE = "America/Lima";
const RULE_WIDTH = 80;

const runnerLogRecords = [];
["log", "error", "warn"].forEach((level) => {
  const original = console[level].bind(console);
  console[level] = (...args) => {
    original(...args);
    try {
      runnerLogRecords.push({ at: new Date(), level, text: util.format(...args) });
    } catch (e) {}
  };
});

function zonedParts(date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return parts;
}

function buildRunId(date) {
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day}_${p.hour}-${p.minute}-${p.second}`;
}

function formatDateTime(date) {
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

// Configuración de políticas de ejecución
const DEFAULT_POLICIES = {
  PARALLEL_WORKERS: Number(process.env.PARALLEL_WORKERS) || 2,
  FAIL_FAST: false,
  RETRY: 0,
};

const originalArgs = process.argv.slice(2);
const runStartedAt = new Date();
const runId = buildRunId(runStartedAt);
const suiteName = "SAUCEDEMO";
const logDir = path.resolve(process.cwd(), "logs", `${suiteName}_${runId}`);

// Inyectar contexto al proceso y sus workers
process.env.RUN_ID = runId;
process.env.SUITE_NAME = suiteName;
process.env.LOG_DIR = logDir;

console.log("\n" + "=".repeat(RULE_WIDTH));
console.log("   ORQUESTADOR DE PRUEBAS E2E — PLAYWRIGHT + TS + CUCUMBER");
console.log("   Aplicación bajo prueba: Sauce Demo (https://www.saucedemo.com)");
console.log("=".repeat(RULE_WIDTH));
console.log(` Inicio de corrida : ${formatDateTime(runStartedAt)}`);
console.log(` Carpeta de logs   : ${logDir}\n`);

// ── Procesamiento de argumentos ──────────────────────────────────────────────
const cucumberArgs = [];
let parallelWorkers = DEFAULT_POLICIES.PARALLEL_WORKERS;
let failFast = DEFAULT_POLICIES.FAIL_FAST;
let retryCount = DEFAULT_POLICIES.RETRY;
let headedMode = false;

// Limpiar comillas escapadas o barras que Windows CLI pueda inyectar
const cleanedArgs = originalArgs.map((a) => a.replace(/^[\\"'`]+|[\\"'`]+$/g, "").trim());

for (let i = 0; i < cleanedArgs.length; i++) {
  const arg = cleanedArgs[i];

  if (arg === "--tags" && i + 1 < cleanedArgs.length) {
    cucumberArgs.push("--tags", cleanedArgs[++i]);
  } else if (arg.startsWith("@")) {
    cucumberArgs.push("--tags", arg);
  } else if (arg === "--parallel" && i + 1 < cleanedArgs.length) {
    parallelWorkers = Number(cleanedArgs[++i]) || 1;
  } else if (arg === "--fail-fast") {
    failFast = true;
  } else if (arg === "--headed") {
    headedMode = true;
    process.env.HEADLESS = "false";
  } else if (arg === "--retry" && i + 1 < cleanedArgs.length) {
    retryCount = Number(cleanedArgs[++i]) || 0;
  } else {
    cucumberArgs.push(arg);
  }
}

// Añadir políticas
cucumberArgs.push("--parallel", String(parallelWorkers));
if (failFast) cucumberArgs.push("--fail-fast");
if (retryCount > 0) cucumberArgs.push("--retry", String(retryCount));

console.log(`[CONFIG] Paralelismo  : ${parallelWorkers} worker(s)`);
console.log(`[CONFIG] Modo Headed  : ${headedMode ? "SÍ (Visible)" : "NO (Headless)"}`);
console.log(`[CONFIG] Fail-Fast    : ${failFast ? "Activado" : "Desactivado"}`);
console.log(`[CONFIG] Argumentos   : ${cucumberArgs.join(" ") || "(Por defecto: todos los features)"}\n`);

// ── Ejecución de Cucumber ────────────────────────────────────────────────────
console.log("[RUNNER] Iniciando ejecución de pruebas...");

const cucumberBin = path.resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "cucumber-js.cmd" : "cucumber-js"
);

// Usar el binario local si existe, sino npx cucumber-js
const command = fs.existsSync(cucumberBin) ? cucumberBin : "npx";
const spawnArgs = fs.existsSync(cucumberBin) ? cucumberArgs : ["cucumber-js", ...cucumberArgs];

const result = spawnSync(command, spawnArgs, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const executionFailed = result.status !== 0;

// ── Generación de Reporte HTML con cucumber-html-reporter ────────────────────
const jsonReportPath = path.resolve(process.cwd(), "cucumber-report.json");
const htmlReportPath = path.resolve(process.cwd(), "src/saucedemo/cucumber-report.html");

if (fs.existsSync(jsonReportPath)) {
  try {
    const reporter = require("cucumber-html-reporter");
    const options = {
      theme: "bootstrap",
      jsonFile: jsonReportPath,
      output: htmlReportPath,
      reportSuiteAsScenarios: true,
      scenarioTimestamp: true,
      launchReport: false,
      metadata: {
        "App Version": "Sauce Demo v1.0",
        "Test Environment": "PROD / DEMO",
        Browser: "Chromium / Chrome Headless",
        Platform: process.platform,
        Parallel: `${parallelWorkers} Workers`,
        Executed: formatDateTime(new Date()),
      },
    };
    reporter.generate(options);
    console.log(`\n[REPORTE] Reporte HTML generado exitosamente en:`);
    console.log(`          ${htmlReportPath}`);
  } catch (e) {
    console.warn(`[WARN] No se pudo generar reporte con cucumber-html-reporter: ${e.message}`);
  }
}

// ── Consolidación de Log de Ejecución (execution.txt) ─────────────────────────
try {
  if (fs.existsSync(logDir)) {
    const logFiles = fs.readdirSync(logDir).filter((f) => f.endsWith(".txt") && f !== "execution.txt");
    const consolidatedPath = path.join(logDir, "execution.txt");
    const finishedAt = new Date();
    const elapsedSec = ((finishedAt.getTime() - runStartedAt.getTime()) / 1000).toFixed(1);

    const header = [
      "=".repeat(RULE_WIDTH),
      " REPORTE CONSOLIDADO DE EJECUCIÓN — SAUCE DEMO",
      "=".repeat(RULE_WIDTH),
      ` Suite       : ${suiteName}`,
      ` Inicio      : ${formatDateTime(runStartedAt)}`,
      ` Fin         : ${formatDateTime(finishedAt)}`,
      ` Duración    : ${elapsedSec} s`,
      ` Paralelismo : ${parallelWorkers} worker(s)`,
      ` Resultado   : ${executionFailed ? "FALLIDO" : "EXITOSO"}`,
      "=".repeat(RULE_WIDTH),
      "",
    ].join("\n");

    const scenarioBodies = logFiles
      .map((file) => fs.readFileSync(path.join(logDir, file), "utf-8"))
      .join("\n\n");

    fs.writeFileSync(consolidatedPath, header + scenarioBodies, "utf-8");
    console.log(`[LOGS] Log consolidado generado en:`);
    console.log(`       ${consolidatedPath}`);
  }
} catch (e) {
  console.warn(`[WARN] No se pudo generar execution.txt: ${e.message}`);
}

console.log("\n" + "=".repeat(RULE_WIDTH));
console.log(` RESUMEN FINAL: ${executionFailed ? "❌ EJECUCIÓN CON FALLOS" : "✅ EJECUCIÓN EXITOSA"}`);
console.log("=".repeat(RULE_WIDTH) + "\n");

process.exit(result.status || 0);

