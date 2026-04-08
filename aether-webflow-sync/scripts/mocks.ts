// Global Mocks for Node Environment
if (typeof global.ProgressEvent === 'undefined') {
  global.ProgressEvent = class ProgressEvent {
    constructor() {}
  };
}

if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof global.window === 'undefined') {
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    innerWidth: 1920,
    innerHeight: 1080,
    navigator: { userAgent: 'node' },
  } as any;
}

if (typeof global.document === 'undefined') {
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    body: { style: {}, classList: { add: () => {}, remove: () => {}, contains: () => false } },
    documentElement: { style: {} },
    getElementById: () => null,
    createElement: () => ({ style: {}, getContext: () => ({}) }),
  } as any;
}

if (typeof global.navigator === 'undefined') {
  global.navigator = { userAgent: 'node' };
}
