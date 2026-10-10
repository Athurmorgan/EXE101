-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_city" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "polygon" JSONB,
    "parent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'USER_SUBMITTED',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_hidden_place" BOOLEAN NOT NULL DEFAULT false,
    "cuisine_type" TEXT,
    "meal_type" TEXT,
    "price_range" TEXT,
    "avg_meal_price" INTEGER,
    "google_place_id" TEXT,
    "google_rating" DOUBLE PRECISION,
    "google_reviews" INTEGER,
    "region_id" UUID,
    "ai_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_photos" (
    "id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by_name" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "place_id" UUID,
    "region_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_media" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploaded_by_name" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "place_id" UUID,
    "post_id" UUID,
    "parent_id" UUID,
    "author_name" TEXT NOT NULL,
    "author_avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "place_id" UUID,
    "post_id" UUID,
    "user_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_regions" (
    "id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "region_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "selected_option" INTEGER,
    "days" INTEGER NOT NULL,
    "estimated_cost" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_stops" (
    "id" UUID NOT NULL,
    "itinerary_id" UUID NOT NULL,
    "place_id" UUID,
    "place_name" TEXT NOT NULL,
    "place_lat" DOUBLE PRECISION NOT NULL,
    "place_lng" DOUBLE PRECISION NOT NULL,
    "place_address" TEXT,
    "day_number" INTEGER NOT NULL,
    "order_in_day" INTEGER NOT NULL,
    "estimated_duration" INTEGER,
    "estimated_cost" INTEGER,
    "stop_type" TEXT NOT NULL DEFAULT 'visit',
    "meal_type" TEXT,
    "notes" TEXT,
    "option_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE INDEX "region_slug_idx" ON "regions"("slug");

-- CreateIndex
CREATE INDEX "region_is_city_idx" ON "regions"("is_city");

-- CreateIndex
CREATE INDEX "place_region_idx" ON "places"("region_id");

-- CreateIndex
CREATE INDEX "place_category_idx" ON "places"("category");

-- CreateIndex
CREATE INDEX "place_cuisine_idx" ON "places"("cuisine_type");

-- CreateIndex
CREATE INDEX "place_price_idx" ON "places"("price_range");

-- CreateIndex
CREATE INDEX "place_status_idx" ON "places"("status");

-- CreateIndex
CREATE INDEX "place_is_hidden_idx" ON "places"("is_hidden_place");

-- CreateIndex
CREATE INDEX "place_photo_place_idx" ON "place_photos"("place_id");

-- CreateIndex
CREATE UNIQUE INDEX "opening_hour_place_day_idx" ON "opening_hours"("place_id", "day_of_week");

-- CreateIndex
CREATE INDEX "shortlist_user_idx" ON "shortlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "shortlist_user_place_unique" ON "shortlists"("user_id", "place_id");

-- CreateIndex
CREATE INDEX "post_author_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "post_status_idx" ON "posts"("status");

-- CreateIndex
CREATE INDEX "post_region_idx" ON "posts"("region_id");

-- CreateIndex
CREATE INDEX "post_media_post_idx" ON "post_media"("post_id");

-- CreateIndex
CREATE INDEX "comment_author_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "comment_place_idx" ON "comments"("place_id");

-- CreateIndex
CREATE INDEX "comment_post_idx" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "comment_parent_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "reaction_place_idx" ON "reactions"("place_id");

-- CreateIndex
CREATE INDEX "reaction_post_idx" ON "reactions"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_user_place_unique" ON "reactions"("user_id", "place_id");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_user_post_unique" ON "reactions"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "manager_region_manager_idx" ON "manager_regions"("manager_id");

-- CreateIndex
CREATE INDEX "manager_region_region_idx" ON "manager_regions"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_region_unique" ON "manager_regions"("manager_id", "region_id");

-- CreateIndex
CREATE INDEX "itinerary_user_idx" ON "itineraries"("user_id");

-- CreateIndex
CREATE INDEX "itinerary_status_idx" ON "itineraries"("status");

-- CreateIndex
CREATE INDEX "itinerary_stop_itinerary_idx" ON "itinerary_stops"("itinerary_id");

-- CreateIndex
CREATE INDEX "itinerary_stop_option_idx" ON "itinerary_stops"("option_number");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_regions" ADD CONSTRAINT "manager_regions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_regions" ADD CONSTRAINT "manager_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
