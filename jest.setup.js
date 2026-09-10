// Mock Expo's import meta registry for Jest compatibility
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  globalThis.__ExpoImportMetaRegistry = {
    get: () => ({}),
    set: () => {},
  };
}
