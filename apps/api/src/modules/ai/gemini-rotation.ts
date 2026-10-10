export class RoundRobinRotator {
  private currentIndex = 0;
  private readonly keys: string[];

  constructor(keys: string[]) {
    this.keys = keys.filter((k) => k && k.trim().length > 0);
    if (this.keys.length === 0) {
      // Khong throw - de service van start duoc. Su dung placeholder.
      this.keys.push('PLACEHOLDER_API_KEY');
    }
  }

  getActiveKey(): string {
    return this.keys[this.currentIndex] ?? '';
  }

  getActiveIndex(): number {
    return this.currentIndex;
  }

  rotate(): string {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return this.getActiveKey();
  }

  get size(): number {
    return this.keys.length;
  }
}
