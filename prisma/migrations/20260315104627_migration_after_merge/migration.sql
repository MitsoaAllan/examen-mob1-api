-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "subscriptionType" TEXT NOT NULL DEFAULT 'ESSENTIAL'
);
INSERT INTO "new_Account" ("email", "id", "password", "username") SELECT "email", "id", "password", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
