-- CreateEnum
CREATE TYPE "LostFoundType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "LostFoundCategory" AS ENUM ('ELECTRONICS', 'DOCUMENTS', 'CLOTHING', 'ACCESSORIES', 'BOOKS', 'KEYS', 'BAGS', 'OTHER');

-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "type" "LostFoundType" NOT NULL,
    "category" "LostFoundCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(200),
    "imageUrl" TEXT,
    "contactInfo" VARCHAR(200),
    "status" "LostFoundStatus" NOT NULL DEFAULT 'OPEN',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundClaim" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostFoundClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LostFoundItem_authorId_idx" ON "LostFoundItem"("authorId");

-- CreateIndex
CREATE INDEX "LostFoundItem_type_idx" ON "LostFoundItem"("type");

-- CreateIndex
CREATE INDEX "LostFoundItem_status_idx" ON "LostFoundItem"("status");

-- CreateIndex
CREATE INDEX "LostFoundItem_category_idx" ON "LostFoundItem"("category");

-- CreateIndex
CREATE INDEX "LostFoundItem_createdAt_idx" ON "LostFoundItem"("createdAt");

-- CreateIndex
CREATE INDEX "LostFoundClaim_itemId_idx" ON "LostFoundClaim"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "LostFoundClaim_itemId_userId_key" ON "LostFoundClaim"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundClaim" ADD CONSTRAINT "LostFoundClaim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LostFoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundClaim" ADD CONSTRAINT "LostFoundClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
