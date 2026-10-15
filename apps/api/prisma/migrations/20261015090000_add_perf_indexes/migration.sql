-- CreateIndex
-- Composite index cho hot path Place: filter `status` + `category` (search nhanh).
CREATE INDEX IF NOT EXISTS "place_status_category_idx" ON "places"("status", "category");
-- Composite index cho hot path Place: filter `status` + `regionId` (danh sach theo vung).
CREATE INDEX IF NOT EXISTS "place_status_region_idx" ON "places"("status", "region_id");
-- Composite index cho hot path Post: feed `status = APPROVED ORDER BY createdAt DESC`.
CREATE INDEX IF NOT EXISTS "post_status_createdAt_idx" ON "posts"("status", "created_at" DESC);
