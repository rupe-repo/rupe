/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** n8n webhook that receives the brief form (automation/README.md). */
  readonly VITE_LEADS_WEBHOOK_URL?: string;
}
