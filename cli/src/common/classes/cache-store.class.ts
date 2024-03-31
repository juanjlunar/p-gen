import type { CaslPermission } from '../../casl/types';

export class CacheStore {
  protected store: Map<string, CaslPermission> = new Map();

  get(key: string): CaslPermission | undefined {
    return this.store.get(key);
  }

  set(key: string, value: CaslPermission): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  toJSON() {
    return JSON.stringify(Object.fromEntries(this.store));
  }

  toArray() {
    return Array.from(this.store, ([key, value]) => ({ [key]: value }));
  }
}
