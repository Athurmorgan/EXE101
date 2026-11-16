-- AlterTable
ALTER TABLE "places" ADD COLUMN     "checkin_lat" DOUBLE PRECISION,
ADD COLUMN     "checkin_lng" DOUBLE PRECISION,
ADD COLUMN     "submitted_by_id" UUID;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
