-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "sourceLabel" TEXT,
    "audience" TEXT,
    "durationLabel" TEXT,
    "modulesCount" INTEGER NOT NULL DEFAULT 0,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "image" TEXT,
    "linkedin" TEXT,
    "coInstructors" TEXT,
    "persona" TEXT,
    CONSTRAINT "Instructor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "n" INTEGER NOT NULL,
    "week" INTEGER,
    "weekLabel" TEXT,
    "title" TEXT NOT NULL,
    "blurb" TEXT,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "minutes" INTEGER,
    "hasPreview" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_courseId_key" ON "Instructor"("courseId");
