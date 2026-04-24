/**
 * Build-time client gate for the chat surface (ADR-0002 §11).
 *
 * Set VITE_OIA_CHAT_ENABLED=false to remove the Chat section, the CHAT
 * top-nav chip, and the command-palette entry. The server endpoint has
 * a separate runtime kill switch (OIA_CHAT_ENABLED — handlers.ts §POST
 * /chat) so an operator can disable the back-end without rebuilding.
 *
 * Default is enabled. Setting the env to literally "false" disables.
 */
export const CHAT_ENABLED: boolean =
  (import.meta.env.VITE_OIA_CHAT_ENABLED as string | undefined) !== 'false';
