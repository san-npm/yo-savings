'use client';

import { useWebHaptics } from 'web-haptics/react';

/**
 * Thin wrapper around web-haptics for consistent haptic feedback across the app.
 * Falls back silently on unsupported devices.
 */
export function useHaptics() {
  const { trigger, isSupported } = useWebHaptics();

  return {
    /** Light tap — button press, quick amount select */
    tap: () => trigger('light'),
    /** Selection change — account picker, tab switch */
    select: () => trigger('selection'),
    /** Success — deposit/withdraw confirmed */
    success: () => trigger('success'),
    /** Error — validation failure, tx error */
    error: () => trigger('error'),
    /** Confirm action — confirm dialog open */
    confirm: () => trigger('medium'),
    isSupported,
  };
}
