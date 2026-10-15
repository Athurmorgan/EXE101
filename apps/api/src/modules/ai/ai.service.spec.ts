/**
 * Test cho AiService.calculateDays — chặn tái phát bug precedence (xem PROJECT_STATUS.md #15).
 *
 * Bug gốc:
 *   return Math.max(1, Math.ceil((e.getTime() - s.getTime() / (1000 * 60 * 60 * 24)) + 1));
 *
 * Toán tử `/` có độ ưu tiên cao hơn `-`, nên biểu thức bị đọc thành
 * `e - (s / 86400000) + 1` → trả về số ngày kể từ epoch (≈ 20000+) thay vì
 * khoảng cách giữa hai ngày. Sửa: tách `diffMs` thành biến riêng rồi chia.
 */
import { AiService } from './ai.service';

describe('AiService.calculateDays', () => {
  it('tra ve 1 khi start va end trung ngay', () => {
    expect(AiService.calculateDays('2026-12-01', '2026-12-01')).toBe(1);
  });

  it('tra ve 2 khi cach nhau 1 dem (1 ngay di + 1 ngay ve)', () => {
    expect(AiService.calculateDays('2026-12-01', '2026-12-02')).toBe(2);
  });

  it('tra ve 3 khi cach nhau 2 dem (chuyen di 3 ngay, vi du 1-3/12)', () => {
    expect(AiService.calculateDays('2026-12-01', '2026-12-03')).toBe(3);
  });

  it('tra ve dung so ngay khi chuyen di dai (7 dem = 8 ngay)', () => {
    expect(AiService.calculateDays('2026-12-01', '2026-12-08')).toBe(8);
  });

  it('van tra ve 1 khi end nho hon start (khong am)', () => {
    expect(AiService.calculateDays('2026-12-05', '2026-12-01')).toBe(1);
  });

  it('khong tra ve so hang nghin (canh bao bug precedence cu)', () => {
    // Neu bug cu quay lai, ket qua se la ~20436 thay vi 8.
    const result = AiService.calculateDays('2026-12-01', '2026-12-08');
    expect(result).toBeLessThan(100);
  });
});
