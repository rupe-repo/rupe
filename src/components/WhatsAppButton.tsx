import { useContent } from '../i18n/context';
import './WhatsAppButton.css';

/**
 * Brazil only: a WhatsApp button that stays in reach. In Brazil a small
 * business expects to talk to a site on WhatsApp, and a visitor who has to
 * scroll back to find the number is a visitor lost. Renders nothing in a
 * market without a WhatsApp number.
 */
export function WhatsAppButton() {
  const t = useContent();
  if (!t.whatsapp) return null;

  return (
    <a
      className="wa-float"
      href={`https://wa.me/${t.whatsapp.number}?text=${encodeURIComponent(t.whatsapp.message)}`}
      target="_blank"
      rel="noopener"
      aria-label={`${t.whatsapp.label} · ${t.whatsapp.display}`}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M16 3C8.82 3 3 8.7 3 15.74c0 2.48.73 4.8 2 6.76L3.7 28.6l6.3-1.63a13.2 13.2 0 0 0 6 1.45c7.18 0 13-5.7 13-12.74S23.18 3 16 3Zm0 23.2c-1.94 0-3.84-.51-5.5-1.48l-.4-.23-3.74.97.99-3.6-.26-.38a10.3 10.3 0 0 1-1.6-5.5C5.49 10 10.2 5.4 16 5.4S26.5 10 26.5 15.74 21.8 26.2 16 26.2Zm5.77-7.66c-.32-.16-1.87-.9-2.16-1-.29-.1-.5-.16-.71.16-.21.31-.82 1-.99 1.2-.18.21-.37.23-.68.08-.32-.16-1.33-.48-2.53-1.54-.94-.82-1.57-1.83-1.75-2.14-.18-.31-.02-.48.14-.63.14-.14.32-.37.47-.55.16-.18.21-.31.32-.52.1-.21.05-.39-.03-.55-.08-.15-.71-1.68-.97-2.3-.26-.6-.52-.52-.71-.53h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.06-1.1 2.6 0 1.53 1.13 3.01 1.28 3.22.16.2 2.22 3.32 5.38 4.65.75.32 1.34.51 1.8.65.75.23 1.44.2 1.98.12.6-.09 1.87-.75 2.13-1.47.27-.72.27-1.34.19-1.47-.08-.13-.29-.21-.6-.36Z"
        />
      </svg>
    </a>
  );
}
