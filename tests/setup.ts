import { GlobalWindow } from 'happy-dom';
import { afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

const win = new GlobalWindow({ url: 'http://localhost:3000' });
(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).navigator = win.navigator;
(globalThis as any).HTMLElement = win.HTMLElement;
(globalThis as any).customElements = win.customElements;
(globalThis as any).localStorage = win.localStorage;

afterEach(() => {
  cleanup();
});
