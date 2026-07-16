export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { calculateJuzProgressEnhanced } from "../../../utils/juzcalculation";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userRole = session.user.role;
    const guruId = session.user.guru_id;

    console.log("👤 User Role:", userRole);
    console.log("👨‍🏫 Guru ID:", guruId);

    // ✅ Build where clause berdasarkan role
    let whereClause = {};

    if (userRole === "GURU") {
      // GURU hanya bisa lihat santri yang dia ajar
      if (!guruId) {
        return NextResponse.json(
          {
            success: false,
            message: "Guru ID tidak ditemukan",
          },
          { status: 400 },
        );
      }
      whereClause = {
        guru_id: Number(guruId),
      };
      console.log("🔍 Filter: Santri dengan guru_id =", guruId);
    } else if (userRole === "ADMIN") {
      // ADMIN bisa lihat semua santri
      whereClause = {};
      console.log("🔍 Filter: Semua santri (ADMIN access)");
    } else {
      // Role lain tidak diizinkan
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized role",
        },
        { status: 403 },
      );
    }

    const santriList = await prisma.santri.findMany({
      where: whereClause,
      include: {
        walisantri: true,
        guru: true,
        history: {
          where: {
            status: "LULUS",
            jenis: "ZIYADAH",
          },
          orderBy: {
            tanggal: "asc",
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    console.log("📊 Total santri ditemukan:", santriList.length);

    // ✅ Debug setiap santri dan history-nya
    santriList.forEach((santri, index) => {
      if (santri.history && santri.history.length > 0) {
        console.log(`   📖 Detail history:`);
        santri.history.forEach((h, i) => {
          console.log(
            `      ${i + 1}. ${h.surah} (Hal ${h.halaman_awal}-${
              h.halaman_akhir || h.halaman_awal
            })`,
          );
        });
      } else {
        console.log(`   ⚠️  Tidak ada history hafalan LULUS + ZIYADAH`);
      }
    });

    const santriWithProgress = santriList.map((santri) => {
      const hafalanList = santri.history || [];

      // Gunakan fungsi enhanced
      const progress = calculateJuzProgressEnhanced(hafalanList);

      // Hitung juz terakhir yang dihafal
      const allActiveJuz = [
        ...progress.completedJuz,
        ...progress.inProgressJuz.map((j) => j.juz),
      ].sort((a, b) => b - a);

      const juzTerakhir = allActiveJuz.length > 0 ? allActiveJuz[0] : 0;

      return {
        id: santri.id,
        nama: santri.nama,
        kelas: santri.kelas,
        tanggal_lahir: santri.tanggal_lahir,
        walisantri: santri.walisantri?.nama || "-",
        guru: santri.guru?.nama || "-",
        guru_id: santri.guru_id,
        walisantri_id: santri.walisantri_id,

        // Progress summary
        juzSelesai: progress.summary.completedJuz,
        juzProgress: progress.summary.inProgressJuz,
        persenTotal: progress.summary.percentageTotal,
        totalHalaman: progress.summary.totalHalamanDihafal,

        // Juz terakhir yang dihafal
        juzTerakhir,

        // Hafalan terakhir dengan format yang baik
        hafalanTerakhir: progress.lastHafalan
          ? {
              tanggal: progress.lastHafalan.tanggal,
              surah: progress.lastHafalan.surah,
              halaman: progress.lastHafalan.halaman_akhir
                ? `${progress.lastHafalan.halaman_awal}-${progress.lastHafalan.halaman_akhir}`
                : `${progress.lastHafalan.halaman_awal}`,
              ayat: `${progress.lastHafalan.ayat_mulai}-${progress.lastHafalan.ayat_selesai}`,
            }
          : null,

        // Detail juz dalam progress (top 3)
        juzDalamProgress: progress.inProgressJuz.slice(0, 3).map((j) => ({
          juz: j.juz,
          percentage: j.percentage,
          remainingPages: j.remainingPages,
        })),

        // ✅ TAMBAHAN: Raw history count untuk debugging
        totalHistoryRecords: hafalanList.length,
      };
    });

    console.log("\n=== HASIL AKHIR ===");
    console.log("📋 Total santri dengan progress:", santriWithProgress.length);

    // ========================================
    // STATISTIK KESELURUHAN
    // ========================================
    const totalSantri = santriWithProgress.length;

    const avgJuzPerSantri =
      totalSantri > 0
        ? (
            santriWithProgress.reduce((sum, s) => sum + s.juzSelesai, 0) /
            totalSantri
          ).toFixed(1)
        : 0;

    const santriKhatam = santriWithProgress.filter(
      (s) => s.juzSelesai === 5,
    ).length;

    const santriProgress = santriWithProgress.filter(
      (s) => s.juzSelesai < 5 && s.juzSelesai > 0,
    ).length;

    const santriBelumMulai = santriWithProgress.filter(
      (s) => s.juzSelesai === 0 && s.juzProgress === 0,
    ).length;

    const totalJuzDiselesaikan = santriWithProgress.reduce(
      (sum, s) => sum + s.juzSelesai,
      0,
    );

    const totalHalamanDihafal = santriWithProgress.reduce(
      (sum, s) => sum + s.totalHalaman,
      0,
    );

    // Distribusi juz
    const juzDistribution = {};
    for (let i = 0; i <= 5; i++) {
      juzDistribution[i] = santriWithProgress.filter(
        (s) => s.juzTerakhir === i,
      ).length;
    }

    // Top 5 santri
    const topSantri = [...santriWithProgress]
      .sort((a, b) => {
        if (b.juzSelesai !== a.juzSelesai) {
          return b.juzSelesai - a.juzSelesai;
        }
        return b.persenTotal - a.persenTotal;
      })
      .slice(0, 5)
      .map((s) => ({
        nama: s.nama,
        kelas: s.kelas,
        juzSelesai: s.juzSelesai,
        persenTotal: s.persenTotal,
      }));

    console.log("\n📊 Statistik:");
    console.log(`   Total Santri: ${totalSantri}`);
    console.log(`   Santri Khatam: ${santriKhatam}`);
    console.log(`   Santri Progress: ${santriProgress}`);
    console.log(`   Santri Belum Mulai: ${santriBelumMulai}`);
    console.log(`   Rata-rata Juz: ${avgJuzPerSantri}`);

    return NextResponse.json({
      success: true,
      data: {
        santri: santriWithProgress,
        statistics: {
          totalSantri,
          santriKhatam,
          santriProgress,
          santriBelumMulai,
          rataRataJuz: parseFloat(avgJuzPerSantri),
          totalJuzDiselesaikan,
          totalHalamanDihafal,
          persenKhatam:
            totalSantri > 0
              ? Math.round((santriKhatam / totalSantri) * 100)
              : 0,
          persenProgress:
            totalSantri > 0
              ? Math.round((santriProgress / totalSantri) * 100)
              : 0,
          juzDistribution,
          topSantri,
        },
        // ✅ Metadata untuk frontend
        meta: {
          userRole,
          isFiltered: userRole === "GURU",
          filteredBy: userRole === "GURU" ? `guru_id: ${guruId}` : null,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching juz summary:", error);
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
