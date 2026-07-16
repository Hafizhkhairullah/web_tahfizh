// app/api/walisantri/santri/[id]/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import {
  calculateJuzProgressEnhanced,
  JUZ_DATA,
} from "../../../../../utils/juzcalculation";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Validasi session
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ Validasi role
    if (session.user.role !== "WALISANTRI") {
      return NextResponse.json(
        { success: false, message: "Access denied. Walisantri only." },
        { status: 403 },
      );
    }

    const walisantriId = session.user.walisantri_id;
    const santriId = params.id;

    if (!walisantriId || !santriId) {
      return NextResponse.json(
        { success: false, message: "Invalid parameters" },
        { status: 400 },
      );
    }

    console.log("🔍 Fetching santri detail:", santriId);

    // ========================================
    // QUERY SANTRI
    // ========================================
    const santri = await prisma.santri.findFirst({
      where: {
        id: Number(santriId),
        walisantri_id: Number(walisantriId), // ✅ Pastikan santri ini milik walisantri yang login
      },
      include: {
        walisantri: true,
        guru: true,
        history: {
          where: {
            status: "LULUS",
            jenis: "ZIYADAH",
          },
          orderBy: {
            tanggal: "desc",
          },
        },
      },
    });

    // ✅ Validasi kepemilikan
    if (!santri) {
      return NextResponse.json(
        {
          success: false,
          message: "Santri tidak ditemukan atau bukan anak Anda",
        },
        { status: 404 },
      );
    }

    console.log("✅ Santri found:", santri.nama);

    // ========================================
    // CALCULATE PROGRESS
    // ========================================
    const hafalanList = santri.history || [];
    const progress = calculateJuzProgressEnhanced(hafalanList);

    // ========================================
    // JUZ PROGRESS DETAIL (OUR SELECTED JUZ: 30, 29, 28, 1, 2)
    // ========================================
    const juzStructure = JUZ_DATA.map((juz) => ({
      ...juz,
      totalPages: juz.endPage - juz.startPage + 1,
    }));

    const juzProgress = juzStructure.map((juzInfo) => {
      const isCompleted = progress.completedJuz.includes(juzInfo.juz);

      let pagesCompleted = 0;
      let percentage = 0;

      if (isCompleted) {
        pagesCompleted = juzInfo.totalPages;
        percentage = 100;
      } else {
        const inProgress = progress.inProgressJuz.find(
          (j) => j.juz === juzInfo.juz,
        );
        if (inProgress) {
          pagesCompleted = juzInfo.totalPages - inProgress.remainingPages;
          percentage = inProgress.percentage;
        }
      }

      return {
        juz: juzInfo.juz,
        isCompleted,
        pagesCompleted,
        totalPages: juzInfo.totalPages,
        percentage,
      };
    });

    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      data: {
        santri: {
          id: santri.id,
          nama: santri.nama,
          kelas: santri.kelas,
          tanggal_lahir: santri.tanggal_lahir,
          guru: santri.guru?.nama || "-",
          juzSelesai: progress.summary.completedJuz,
          persenTotal: progress.summary.percentageTotal,
          totalHalaman: progress.summary.totalHalamanDihafal,
        },
        juzProgress,
        history: hafalanList.map((h) => ({
          tanggal: h.tanggal,
          surah: h.surah,
          halaman_awal: h.halaman_awal,
          halaman_akhir: h.halaman_akhir,
          ayat_mulai: h.ayat_mulai,
          ayat_selesai: h.ayat_selesai,
          status: h.status,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching santri detail:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
