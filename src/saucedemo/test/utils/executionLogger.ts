import * as fs from "fs";
import * as path from "path";
import * as util from "util";

/**
 * REGISTRO DE EJECUCIÓN EN ARCHIVO (.txt)
 * Captura la salida de consola y la organiza cronológicamente por escenario y steps Gherkin.
 * Produce archivos .txt individuales por escenario en `logs/{SUITE}_{fecha}/`
 * y se adjunta al reporte HTML tanto inline como descargable.
 */

const TIME_ZONE = "America/Lima";
const INLINE_ATTACH_MAX_CHARS = 20000;
const RULE_WIDTH = 80;

function resolveRunContext() {
  const envRunId = process.env.RUN_ID;
  const suite = process.env.SUITE_NAME || "SAUCEDEMO";
  const runId = envRunId || buildRunId(new Date());
  const baseDir = process.env.LOG_DIR || path.resolve(process.cwd(), "logs", `${suite}_${runId}`);

  return {
    runId,
    suite,
    baseDir,
    tags: process.env.RUN_TAGS || "",
    workerId: process.env.CUCUMBER_WORKER_ID ?? "principal",
  };
}

const RUN = resolveRunContext();

export function isLoggingEnabled(): boolean {
  return true;
}

function zonedParts(d: Date): Record<string, string> {
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
  const parts: Record<string, string> = {};
  for (const part of fmt.formatToParts(d)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return parts;
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function formatDateTime(d: Date): string {
  const p = zonedParts(d);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}.${pad3(d.getMilliseconds())}`;
}

export function formatTime(d: Date): string {
  const p = zonedParts(d);
  return `${p.hour}:${p.minute}:${p.second}.${pad3(d.getMilliseconds())}`;
}

export function buildRunId(d: Date): string {
  const p = zonedParts(d);
  return `${p.year}-${p.month}-${p.day}_${p.hour}-${p.minute}-${p.second}`;
}

export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "");
}

interface StepLog {
  keyword: string;
  text: string;
  startedAt?: Date;
  durationMs?: number;
  status?: string;
  errorMessage?: string;
  consoleLines: string[];
}

interface ScenarioLogState {
  name: string;
  tags: string[];
  uri?: string;
  line?: number;
  startedAt: Date;
  plannedSteps: { keyword: string; text: string }[];
  currentStepIndex: number;
  steps: StepLog[];
  unattributedConsole: string[];
}

let activeScenario: ScenarioLogState | null = null;
let consoleInstalled = false;

export function installConsoleCapture(): void {
  if (consoleInstalled) return;
  consoleInstalled = true;

  const originalLog = console.log.bind(console);
  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  function capture(level: string, args: any[]) {
    try {
      const formatted = util.format(...args);
      const clean = stripAnsi(formatted);
      const timestamp = formatTime(new Date());
      const line = `[${timestamp}] [${level.toUpperCase()}] ${clean}`;

      if (activeScenario) {
        const currentStep = activeScenario.steps[activeScenario.currentStepIndex];
        if (currentStep) {
          currentStep.consoleLines.push(line);
        } else {
          activeScenario.unattributedConsole.push(line);
        }
      }
    } catch {
      // Ignorar fallos de captura
    }
  }

  console.log = (...args: any[]) => {
    originalLog(...args);
    capture("info", args);
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    capture("error", args);
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    capture("warn", args);
  };
}

export function startScenario(options: {
  name: string;
  tags: string[];
  uri?: string;
  line?: number;
  plannedSteps: { keyword: string; text: string }[];
}): void {
  activeScenario = {
    name: options.name,
    tags: options.tags,
    uri: options.uri,
    line: options.line,
    startedAt: new Date(),
    plannedSteps: options.plannedSteps,
    currentStepIndex: -1,
    steps: [],
    unattributedConsole: [],
  };
}

export function startStep(keyword: string, text: string): void {
  if (!activeScenario) return;
  activeScenario.currentStepIndex++;
  activeScenario.steps.push({
    keyword,
    text,
    startedAt: new Date(),
    consoleLines: [],
  });
}

export function endStep(status: string, durationMs: number, errorMessage?: string): void {
  if (!activeScenario) return;
  const step = activeScenario.steps[activeScenario.currentStepIndex];
  if (step) {
    step.status = status;
    step.durationMs = durationMs;
    step.errorMessage = errorMessage ? stripAnsi(errorMessage) : undefined;
  }
}

export function finishScenario(
  finalStatus: string,
  scenarioError?: string
): { fileName: string; text: string; inlineText: string } | null {
  if (!activeScenario) return null;

  const endedAt = new Date();
  const elapsedMs = endedAt.getTime() - activeScenario.startedAt.getTime();

  // Crear directorio de logs si no existe
  if (!fs.existsSync(RUN.baseDir)) {
    fs.mkdirSync(RUN.baseDir, { recursive: true });
  }

  const tagLabel = activeScenario.tags.find((t) => /-[EC\d]+/i.test(t)) ||
    activeScenario.tags[0] ||
    "ESCENARIO";
  const cleanTag = tagLabel.replace(/[@:]/g, "").replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `${cleanTag}_${formatTime(activeScenario.startedAt).replace(/[:.]/g, "-")}.txt`;
  const filePath = path.join(RUN.baseDir, fileName);

  const lines: string[] = [];
  lines.push("=".repeat(RULE_WIDTH));
  lines.push(` ESCENARIO: ${activeScenario.name}`);
  lines.push(` Tags     : ${activeScenario.tags.join(" ")}`);
  lines.push(` Inicio   : ${formatDateTime(activeScenario.startedAt)}`);
  lines.push(` Fin      : ${formatDateTime(endedAt)}`);
  lines.push(` Duración : ${(elapsedMs / 1000).toFixed(2)}s`);
  lines.push(` Estado   : ${finalStatus}`);
  lines.push("=".repeat(RULE_WIDTH));
  lines.push("");

  if (activeScenario.unattributedConsole.length > 0) {
    lines.push("--- [HOOKS SETUP] ---");
    activeScenario.unattributedConsole.forEach((l) => lines.push(`  ${l}`));
    lines.push("");
  }

  lines.push("--- [PASOS GHERKIN] ---");
  activeScenario.steps.forEach((step, idx) => {
    const statusIcon = step.status === "PASSED" ? "✓" : step.status === "FAILED" ? "✗" : "○";
    const duration = step.durationMs !== undefined ? `(${(step.durationMs / 1000).toFixed(2)}s)` : "";
    lines.push(` ${idx + 1}. [${statusIcon} ${step.status || "SKIPPED"}] ${step.keyword} ${step.text} ${duration}`);

    if (step.consoleLines.length > 0) {
      step.consoleLines.forEach((cl) => lines.push(`     | ${cl}`));
    }
    if (step.errorMessage) {
      lines.push("     | [ERROR]:");
      step.errorMessage.split("\n").forEach((el) => lines.push(`     |   ${el}`));
    }
  });

  if (scenarioError) {
    lines.push("");
    lines.push("--- [ERROR DEL ESCENARIO] ---");
    stripAnsi(scenarioError).split("\n").forEach((el) => lines.push(`  ${el}`));
  }

  lines.push("");
  lines.push("=".repeat(RULE_WIDTH));

  const fullText = lines.join("\n");

  try {
    fs.writeFileSync(filePath, fullText, "utf-8");
  } catch (err: any) {
    console.error(`[LOGGER] Error escribiendo archivo de log ${filePath}: ${err.message}`);
  }

  const inlineText = fullText.length > INLINE_ATTACH_MAX_CHARS
    ? fullText.slice(0, INLINE_ATTACH_MAX_CHARS) + "\n\n... [LOG TRUNCADO PARA REPORTE INLINE]"
    : fullText;

  activeScenario = null;

  return {
    fileName,
    text: fullText,
    inlineText,
  };
}

export function durationToMs(duration: any): number {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  if (typeof duration.seconds === "number" || typeof duration.nanos === "number") {
    return (duration.seconds || 0) * 1000 + (duration.nanos || 0) / 1000000;
  }
  return 0;
}

export function findStepKeyword(gherkinDocument: any, pickleStep: any): string {
  try {
    const astSteps = gherkinDocument.feature?.children?.flatMap((c: any) =>
      c.scenario?.steps || c.background?.steps || []
    ) || [];
    const ast = astSteps.find((s: any) => s.id === pickleStep.astNodeIds?.[0]);
    return ast?.keyword?.trim() || "And";
  } catch {
    return "And";
  }
}

export function findScenarioLine(gherkinDocument: any, pickle: any): number {
  try {
    const scenario = gherkinDocument.feature?.children?.find(
      (c: any) => c.scenario?.id === pickle.astNodeIds?.[0]
    )?.scenario;
    return scenario?.location?.line || 0;
  } catch {
    return 0;
  }
}

