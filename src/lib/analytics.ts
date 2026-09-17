/**
 * Privacy-conscious client analytics event dispatcher.
 * Strictly adheres to Section 14:
 * Never sends email addresses or preferred bottle numbers.
 */

export type AnalyticsEventName =
  | 'campaign_view'
  | 'design_view'
  | 'lightbox_open'
  | 'auth_started'
  | 'auth_completed'
  | 'vote_started'
  | 'vote_completed'
  | 'vote_changed'
  | 'pledge_started'
  | 'pledge_completed'
  | 'pledge_withdrawn'
  | 'shop_link_clicked';

export function trackEvent(
  eventName: AnalyticsEventName,
  payload?: Record<string, string | number | boolean | undefined>
) {
  // Safe filtering: Ensure no email or bottle numbers are transmitted
  const safePayload: Record<string, unknown> = {};
  if (payload) {
    for (const [key, val] of Object.entries(payload)) {
      if (['email', 'preferred_number', 'user_email', 'phone'].includes(key.toLowerCase())) {
        continue;
      }
      safePayload[key] = val;
    }
  }

  // Push to dataLayer for Google Analytics / Tag Manager if present
  if (typeof window !== 'undefined') {
    const w = window as unknown as { dataLayer?: unknown[] };
    if (w.dataLayer) {
      w.dataLayer.push({
        event: eventName,
        ...safePayload,
        timestamp: Date.now(),
      });
    }

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${eventName}:`, safePayload);
    }
  }
}
