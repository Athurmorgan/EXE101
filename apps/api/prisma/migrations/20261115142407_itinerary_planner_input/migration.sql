-- AlterTable
ALTER TABLE "itineraries" ADD COLUMN     "dietary" TEXT,
ADD COLUMN     "preferred_place_ids" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "start_label" TEXT,
ADD COLUMN     "start_lat" DOUBLE PRECISION,
ADD COLUMN     "start_lng" DOUBLE PRECISION,
ADD COLUMN     "styles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "travelers" INTEGER;
