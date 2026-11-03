/**
 * Tipos relacionados con autenticación y perfiles de usuario en Sauce Demo
 */

export type UserProfile =
  | "STANDARD"
  | "LOCKED_OUT"
  | "PROBLEM"
  | "PERFORMANCE_GLITCH"
  | "ERROR"
  | "VISUAL";

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserProfileConfig {
  profile: UserProfile;
  credentials: UserCredentials;
  description: string;
}

