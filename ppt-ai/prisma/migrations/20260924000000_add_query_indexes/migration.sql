-- Remove duplicate favorites before adding the unique constraint (keeps one row per user/document).
DELETE FROM "FavoriteDocument" a
USING "FavoriteDocument" b
WHERE a."userId" = b."userId"
  AND a."documentId" = b."documentId"
  AND a."id" > b."id";

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "BaseDocument_userId_updatedAt_idx" ON "BaseDocument"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "BaseDocument_isPublic_updatedAt_idx" ON "BaseDocument"("isPublic", "updatedAt");

-- CreateIndex
CREATE INDEX "Presentation_customThemeId_idx" ON "Presentation"("customThemeId");

-- CreateIndex
CREATE INDEX "FavoriteDocument_documentId_idx" ON "FavoriteDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteDocument_userId_documentId_key" ON "FavoriteDocument"("userId", "documentId");

-- CreateIndex
CREATE INDEX "GeneratedImage_userId_idx" ON "GeneratedImage"("userId");

