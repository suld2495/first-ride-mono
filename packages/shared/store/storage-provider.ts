// This file serves as a platform-agnostic entry point
// React Native bundler will automatically resolve to:
// - storage-provider.native.ts for React Native apps
// - storage-provider.web.ts for web apps

export { storage } from './storage-provider.web';
