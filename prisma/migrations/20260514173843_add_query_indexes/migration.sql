-- CreateIndex
CREATE INDEX "collections_updatedAt_idx" ON "collections"("updatedAt");

-- CreateIndex
CREATE INDEX "collections_isFavorite_updatedAt_idx" ON "collections"("isFavorite", "updatedAt");

-- CreateIndex
CREATE INDEX "item_collections_collectionId_idx" ON "item_collections"("collectionId");

-- CreateIndex
CREATE INDEX "items_isFavorite_idx" ON "items"("isFavorite");

-- CreateIndex
CREATE INDEX "items_isPinned_idx" ON "items"("isPinned");
