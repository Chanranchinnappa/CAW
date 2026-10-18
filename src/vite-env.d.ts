/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the staff API Worker, e.g. https://caw-staff-api.yourname.workers.dev */
  readonly VITE_STAFF_API_URL?: string;
  /** Address of the GitHub Pages media site, e.g. https://chanranchinnappa.github.io/CAW-media */
  readonly VITE_MEDIA_BASE_URL?: string;
}
