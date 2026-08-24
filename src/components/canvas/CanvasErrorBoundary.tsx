'use client';

import { Component, type ReactNode } from 'react';
import { siteConfig } from '@/lib/config';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * The entire chapter journey — including all text, not just the 3D visuals —
 * lives inside the R3F <Scroll html> tree, so a WebGL failure (unsupported
 * browser, driver crash, lost context during the session) would otherwise
 * take the whole site down to a blank screen with no way to reach the
 * content at all. This keeps that failure from being silent or total.
 */
export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 flex flex-col items-center justify-center bg-void px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-silver/60">
            The Universe of {siteConfig.father.displayName}
          </p>
          <p className="font-display italic text-xl md:text-2xl text-warm-white/90 mt-6 max-w-md">
            This experience needs a browser with 3D graphics support.
          </p>
          <p className="text-silver/70 text-sm mt-3 max-w-sm">
            Try reloading, or open this link in a recent version of Chrome, Edge, or Safari.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
