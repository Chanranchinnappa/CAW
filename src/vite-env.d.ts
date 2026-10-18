/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the staff API Worker, e.g. https://caw-staff-api.yourname.workers.dev */
  readonly VITE_STAFF_API_URL?: string;
}

declare const __BUILD_TIME__: string;
