// Minimal declaration for file-saver to satisfy TypeScript when @types/file-saver is not installed
declare module 'file-saver' {
  export function saveAs(data: Blob | File | string, filename?: string, disableAutoBOM?: boolean): void;
  const _default: {
    saveAs: typeof saveAs;
  };
  export default _default;
}