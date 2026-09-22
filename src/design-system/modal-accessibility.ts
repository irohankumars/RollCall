import React from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, type Text, type View } from 'react-native';

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useAccessibleModal(visible: boolean, onDismiss: () => void) {
  const contentRef = React.useRef<View>(null);
  const initialRef = React.useRef<Text>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const dismissRef = React.useRef(onDismiss);

  React.useEffect(() => { dismissRef.current = onDismiss; }, [onDismiss]);

  React.useEffect(() => {
    if (!visible) return;
    if (Platform.OS === 'web') {
      restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const node = contentRef.current as unknown as HTMLElement | null;
      const focusable = () => Array.from(node?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      requestAnimationFrame(() => (focusable()[0] ?? node)?.focus());
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          dismissRef.current();
          return;
        }
        if (event.key !== 'Tab') return;
        const items = focusable();
        if (!items.length) { event.preventDefault(); return; }
        const first = items[0]; const last = items.at(-1)!;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        requestAnimationFrame(() => restoreRef.current?.focus());
      };
    }
    const handle = findNodeHandle(initialRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [visible]);

  return { contentRef, initialRef };
}
