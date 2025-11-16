export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

function sendBeacon(path: string, payload: unknown): void {
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      // No-op endpoint; replace with a real API route when available
      navigator.sendBeacon(path, blob);
    }
  } catch {
    // Silent failure; fallback to console
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  const event: AnalyticsEvent = { name, properties };
  try {
    // Console logging for visibility in development
    // Replace with GA4/Segment/Mixpanel as needed
    console.info('[Analytics]', event);
    sendBeacon('/api/analytics', { event, ts: Date.now() });
  } catch {
    // Keep analytics non-blocking
  }
}

export function trackNavigation(step: string, details?: Record<string, unknown>): void {
  trackEvent(`navigation:${step}`, details);
}

export function trackAuth(step: string, details?: Record<string, unknown>): void {
  trackEvent(`auth:${step}`, details);
}