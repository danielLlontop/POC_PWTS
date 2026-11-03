import dotenv from "dotenv";
import path from "path";
import { UserCredentials, UserProfile } from "./types";

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const MAIN_URL = process.env.MAIN_URL || "https://www.saucedemo.com";

export const COMMON_PASSWORD = process.env.COMMON_PASSWORD || "secret_sauce";

export const USERS: Record<UserProfile, UserCredentials> = {
  STANDARD: {
    username: process.env.USER_STANDARD || "standard_user",
    password: COMMON_PASSWORD,
  },
  LOCKED_OUT: {
    username: process.env.USER_LOCKED || "locked_out_user",
    password: COMMON_PASSWORD,
  },
  PROBLEM: {
    username: process.env.USER_PROBLEM || "problem_user",
    password: COMMON_PASSWORD,
  },
  PERFORMANCE_GLITCH: {
    username: process.env.USER_PERFORMANCE || "performance_glitch_user",
    password: COMMON_PASSWORD,
  },
  ERROR: {
    username: process.env.USER_ERROR || "error_user",
    password: COMMON_PASSWORD,
  },
  VISUAL: {
    username: process.env.USER_VISUAL || "visual_user",
    password: COMMON_PASSWORD,
  },
};

export const VIEWPORT = {
  width: 1366,
  height: 768,
};

export const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT) || 30000;

export const SORT_SELECTORS: Record<string, string> = {
  "Nombre (A a Z)": "az",
  "Nombre (Z a A)": "za",
  "Precio (menor a mayor)": "lohi",
  "Precio (mayor a menor)": "hilo",
};

