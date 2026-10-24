import { GlobalWindow } from 'happy-dom';

const win = new GlobalWindow({ url: 'http://localhost:3000' });
(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).navigator = win.navigator;
(globalThis as any).HTMLElement = win.HTMLElement;
(globalThis as any).customElements = win.customElements;
(globalThis as any).localStorage = win.localStorage;
