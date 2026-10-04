import { buildPageMeta } from './paginated.dto';

describe('buildPageMeta', () => {
  it('tinh totalPages va co nut bam tiep theo', () => {
    const meta = buildPageMeta(45, { page: 1, limit: 20 });

    expect(meta).toEqual({
      total: 45,
      page: 1,
      limit: 20,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('dung limit mac dinh khi khong truyen', () => {
    expect(buildPageMeta(100).limit).toBe(20);
    expect(buildPageMeta(100).page).toBe(1);
  });

  it('totalPages bang 0 khi khong co ban ghi', () => {
    const meta = buildPageMeta(0, { page: 1, limit: 20 });

    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
  });

  it('suy ra page tu offset (infinite scroll)', () => {
    expect(buildPageMeta(100, { offset: 40, limit: 20 }).page).toBe(3);
    expect(buildPageMeta(100, { offset: 0, limit: 20 }).page).toBe(1);
  });

  it('hasPrevPage dung o giua danh sach', () => {
    const meta = buildPageMeta(45, { page: 2, limit: 20 });
    expect(meta.hasPrevPage).toBe(true);
    expect(meta.hasNextPage).toBe(true);
  });

  it('trang cuoi khong con trang sau', () => {
    const meta = buildPageMeta(45, { page: 3, limit: 20 });
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });
});
