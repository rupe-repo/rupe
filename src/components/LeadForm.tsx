import { useEffect, useId, useState, type FormEvent } from 'react';
import { useContent } from '../i18n/context';
import { onIntent } from '../lib/intent';
import './LeadForm.css';

/**
 * The brief: what the visitor wants, in their colours, with their logo.
 *
 * Posted as multipart/form-data to the n8n webhook in VITE_LEADS_WEBHOOK_URL
 * (see automation/README.md), which emails the lead to the studio with the
 * logo attached and sends the visitor a confirmation. Multipart keeps the
 * request a CORS "simple request", so the browser sends it without a preflight.
 *
 * If the webhook is not configured or the request fails, the visitor is never
 * left with a dead end: the error names the email address (and WhatsApp, where
 * the market has one) to reach the studio directly.
 */

const ENDPOINT = import.meta.env.VITE_LEADS_WEBHOOK_URL as string | undefined;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MAX_COLORS = 5;
const TIMEOUT_MS = 20000;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function LeadForm() {
  const t = useContent();
  const f = t.form;
  const id = useId();

  const types = [...t.pricing.plans.map((p) => p.kind), f.typeCare, f.typeUnsure];
  const [type, setType] = useState(types[0]);
  const [colors, setColors] = useState<string[]>([]);
  const [logoError, setLogoError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sentTo, setSentTo] = useState('');

  // A pricing or maintenance CTA preselects what was clicked.
  useEffect(() => onIntent((intent) => setType(intent)), []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending' || logoError) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: a field no person sees. Anything in it is a bot — pretend it worked.
    if (data.get('website')) {
      setStatus('sent');
      return;
    }

    data.delete('logo');
    const logo = (form.elements.namedItem('logo') as HTMLInputElement | null)?.files?.[0];
    if (logo) data.append('logo', logo, logo.name);
    data.set('colors', colors.join(', '));
    data.set('market', t.locale);
    data.set('page', window.location.href);

    if (!ENDPOINT) {
      console.warn('[RUPE] VITE_LEADS_WEBHOOK_URL is not set — the form cannot send.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', body: data, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSentTo(String(data.get('email') ?? ''));
      setStatus('sent');
    } catch (error) {
      console.error('[RUPE] lead not sent', error);
      setStatus('error');
    } finally {
      window.clearTimeout(timer);
    }
  };

  if (status === 'sent') {
    return (
      <div className="lead lead--done" role="status">
        <p className="lead__done-title">{f.successTitle}</p>
        <p className="lead__done-body">{f.successBody.replace('{email}', sentTo || t.contactEmail)}</p>
      </div>
    );
  }

  const field = (name: string) => `${id}-${name}`;

  return (
    <form className="lead" onSubmit={onSubmit}>
      <p className="lead__title">{f.title}</p>

      <div className="lead__row">
        <label className="lead__field">
          <span>{f.name}</span>
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label className="lead__field">
          <span>{f.email}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
      </div>

      <div className="lead__row">
        <label className="lead__field">
          <span>{f.business}</span>
          <input name="business" autoComplete="organization" maxLength={160} />
        </label>
        <label className="lead__field">
          <span>{f.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>

      <label className="lead__field">
        <span>{f.type}</span>
        <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="lead__field">
        <span>{f.brief}</span>
        <textarea name="brief" rows={4} required maxLength={4000} placeholder={f.briefPlaceholder} />
      </label>

      <fieldset className="lead__field lead__colors">
        <legend>{f.colors}</legend>
        <div className="lead__swatches">
          {colors.map((color, i) => (
            <span className="lead__swatch" key={i} style={{ ['--swatch' as string]: color }}>
              <input
                type="color"
                value={color}
                aria-label={`${f.colors} ${i + 1}`}
                onChange={(e) => setColors((list) => list.map((c, j) => (j === i ? e.target.value : c)))}
              />
              <button
                type="button"
                className="lead__swatch-remove"
                aria-label={f.removeColor}
                onClick={() => setColors((list) => list.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </span>
          ))}
          {colors.length < MAX_COLORS ? (
            <button
              type="button"
              className="lead__swatch-add"
              onClick={() => setColors((list) => [...list, '#5b23b8'])}
            >
              + {f.addColor}
            </button>
          ) : null}
        </div>
        <input name="colorsNote" maxLength={300} placeholder={f.colorsPlaceholder} aria-label={f.colorsPlaceholder} />
      </fieldset>

      <div className="lead__row">
        <label className="lead__field">
          <span>{f.logo}</span>
          <input
            name="logo"
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.pdf,.webp,image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
            aria-describedby={field('logo-hint')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setLogoError(file && file.size > MAX_LOGO_BYTES ? f.logoTooBig : '');
            }}
          />
          <small id={field('logo-hint')} className={logoError ? 'is-error' : undefined}>
            {logoError || f.logoHint}
          </small>
        </label>
        <label className="lead__field">
          <span>{f.reference}</span>
          <input name="reference" type="url" inputMode="url" maxLength={300} placeholder={f.referencePlaceholder} />
        </label>
      </div>

      {/* Honeypot — off screen, out of the tab order, ignored by autofill. */}
      <input className="lead__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label className="lead__consent">
        <input name="consent" type="checkbox" value="yes" required />
        <span>{f.consent}</span>
      </label>

      <button className="lead__submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? f.sending : f.submit}
      </button>

      {status === 'error' ? (
        <p className="lead__error" role="alert">
          <strong>{f.errorTitle}</strong> {f.errorBody}{' '}
          {t.whatsapp ? (
            <a href={`https://wa.me/${t.whatsapp.number}?text=${encodeURIComponent(t.whatsapp.message)}`} target="_blank" rel="noopener">
              WhatsApp {t.whatsapp.display}
            </a>
          ) : (
            <a href={`mailto:${t.contactEmail}`}>{t.contactEmail}</a>
          )}
        </p>
      ) : null}
    </form>
  );
}
