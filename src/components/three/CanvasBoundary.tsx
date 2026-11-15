'use client';
import { Component, ReactNode } from 'react';

/** Error boundary around every Canvas: WebGL failure → poster/fallback, never a crash. */
export default class CanvasBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { if (process.env.NODE_ENV !== 'production') console.warn('[Canvas] failed', e); }
  render() {
    if (this.state.failed) return this.props.fallback ?? <div className="grid h-full w-full place-items-center text-sm text-muted">3D preview unavailable</div>;
    return this.props.children;
  }
}
