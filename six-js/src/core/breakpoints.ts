export class Breakpoints {

static parse(attributeValue: string | null): Record<number, any> | null {
    if (!attributeValue) return null;
    try {
      // 1. Chuyển đổi tất cả nháy đơn thành nháy kép
      let fixedJson = attributeValue.replace(/'/g, '"');

      // 2. Tự động bọc ngoặc kép cho các key bị thiếu (như per-view, gap, 1080)
      // Dùng regex nhận diện các từ nằm sau dấu { hoặc , và nằm trước dấu :
      fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":');

      // 3. XÓA DẤU PHẨY THỪA ở cuối mỗi block (nguyên nhân chính làm JSON.parse sập)
      fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1');

      // Chạy JSON.parse nguyên chuẩn một cách an toàn
      return JSON.parse(fixedJson);
    } catch (e) {
      console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", e);
      return null;
    }
  }

  static getMatch(
    containerWidth: number,
    originalOptions: any,
    breakpointsConfig: Record<number, any> | null,
  ): any {
    if (!breakpointsConfig) return { ...originalOptions };

    let mergedOptions = { ...originalOptions };

    const sortedBreakpoints = Object.keys(breakpointsConfig)
      .map(Number)
      .sort((a, b) => a - b);

    for (const bp of sortedBreakpoints) {
      if (containerWidth >= bp) {
        const bpOptions = this.kebabToCamel(breakpointsConfig[bp]);
        mergedOptions = { ...mergedOptions, ...bpOptions };
      }
    }

    return mergedOptions;
  }

  private static kebabToCamel(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    const result: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  }
}
