-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'WALISANTRI', 'GURU');

-- CreateEnum
CREATE TYPE "JenisHafalan" AS ENUM ('ZIYADAH', 'MUROJA', 'TASMI');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('LULUS', 'MENGULANG', 'BELUM_HAFALAN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WALISANTRI',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Walisantri" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Walisantri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guru" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Santri" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "kelas" TEXT NOT NULL,
    "guru_id" INTEGER NOT NULL DEFAULT 1,
    "walisantri_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_hafalan" (
    "id" SERIAL NOT NULL,
    "hafalan_id" INTEGER NOT NULL,
    "santri_id" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "surah" TEXT,
    "jenis" TEXT NOT NULL,
    "juz" INTEGER,
    "ayat_mulai" INTEGER,
    "ayat_selesai" INTEGER,
    "halaman_awal" INTEGER,
    "halaman_akhir" INTEGER,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "guru_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_hafalan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HafalanSantri" (
    "id" SERIAL NOT NULL,
    "santri_id" INTEGER NOT NULL,
    "guru_id" INTEGER NOT NULL DEFAULT 1,
    "halaman_awal" INTEGER,
    "halaman_akhir" INTEGER,
    "juz" INTEGER,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenis" "JenisHafalan" NOT NULL,
    "surah" TEXT NOT NULL,
    "ayat_mulai" INTEGER NOT NULL,
    "ayat_selesai" INTEGER NOT NULL,
    "catatan" TEXT,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HafalanSantri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Walisantri_user_id_key" ON "Walisantri"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Guru_user_id_key" ON "Guru"("user_id");

-- CreateIndex
CREATE INDEX "history_hafalan_hafalan_id_idx" ON "history_hafalan"("hafalan_id");

-- CreateIndex
CREATE INDEX "history_hafalan_santri_id_idx" ON "history_hafalan"("santri_id");

-- CreateIndex
CREATE INDEX "history_hafalan_guru_id_idx" ON "history_hafalan"("guru_id");

-- AddForeignKey
ALTER TABLE "Walisantri" ADD CONSTRAINT "Walisantri_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guru" ADD CONSTRAINT "Guru_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_walisantri_id_fkey" FOREIGN KEY ("walisantri_id") REFERENCES "Walisantri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_hafalan" ADD CONSTRAINT "history_hafalan_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "Santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_hafalan" ADD CONSTRAINT "history_hafalan_hafalan_id_fkey" FOREIGN KEY ("hafalan_id") REFERENCES "HafalanSantri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_hafalan" ADD CONSTRAINT "history_hafalan_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HafalanSantri" ADD CONSTRAINT "HafalanSantri_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "Santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HafalanSantri" ADD CONSTRAINT "HafalanSantri_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "Guru"("id") ON DELETE CASCADE ON UPDATE CASCADE;
