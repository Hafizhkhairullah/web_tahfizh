// Juz yang akan dipantau: 30, 29, 28, 1, 2
export const JUZ_DATA = [
  {
    juz: 30,
    startPage: 582,
    endPage: 604,
    startSurah: "An-Naba'",
    startSurahNumber: 78,
    startAyat: 1,
    endSurah: "An-Nas",
    endSurahNumber: 114,
    endAyat: 6,
  },
  {
    juz: 29,
    startPage: 562,
    endPage: 581,
    startSurah: "Al-Mulk",
    startSurahNumber: 67,
    startAyat: 1,
    endSurah: "Al-Mursalat",
    endSurahNumber: 77,
    endAyat: 50,
  },
  {
    juz: 28,
    startPage: 542,
    endPage: 561,
    startSurah: "Al-Mujadilah",
    startSurahNumber: 58,
    startAyat: 1,
    endSurah: "At-Tahrim",
    endSurahNumber: 66,
    endAyat: 12,
  },
  {
    juz: 1,
    startPage: 1,
    endPage: 21,
    startSurah: "Al-Fatihah",
    startSurahNumber: 1,
    startAyat: 1,
    endSurah: "Al-Baqarah",
    endSurahNumber: 2,
    endAyat: 141,
  },
  {
    juz: 2,
    startPage: 22,
    endPage: 41,
    startSurah: "Al-Baqarah",
    startSurahNumber: 2,
    startAyat: 142,
    endSurah: "Al-Baqarah",
    endSurahNumber: 2,
    endAyat: 252,
  },
];

export function getJuzFromPage(halaman) {
  if (halaman < 1 || halaman > 604) {
    return null;
  }

  for (const juz of JUZ_DATA) {
    if (halaman >= juz.startPage && halaman <= juz.endPage) {
      return juz.juz;
    }
  }

  return null;
}

/**
 * Get detail juz berdasarkan nomor juz
 */
export function getJuzDetail(juzNumber) {
  return JUZ_DATA.find((juz) => juz.juz === juzNumber) || null;
}

/**
 * Get detail juz berdasarkan surat dan ayat
 */
export function getJuzFromSurahAyat(surahNumber, ayat) {
  for (const juz of JUZ_DATA) {
    if (surahNumber === juz.startSurahNumber) {
      if (
        ayat >= juz.startAyat &&
        (surahNumber < juz.endSurahNumber || ayat <= juz.endAyat)
      ) {
        return juz;
      }
    } else if (
      surahNumber > juz.startSurahNumber &&
      surahNumber < juz.endSurahNumber
    ) {
      return juz;
    } else if (surahNumber === juz.endSurahNumber && ayat <= juz.endAyat) {
      return juz;
    }
  }
  return null;
}

/**
 * Validasi apakah hafalan masuk dalam range juz tertentu
 */
export function validateHafalanInJuz(
  juzNumber,
  surahNumber,
  ayatMulai,
  ayatSelesai,
) {
  const juz = getJuzDetail(juzNumber);
  if (!juz) return false;

  if (surahNumber < juz.startSurahNumber || surahNumber > juz.endSurahNumber) {
    return false;
  }

  if (surahNumber === juz.startSurahNumber && ayatMulai < juz.startAyat) {
    return false;
  }

  if (surahNumber === juz.endSurahNumber && ayatSelesai > juz.endAyat) {
    return false;
  }

  return true;
}

/**
 * FUNGSI LAMA - Hitung total juz yang telah dihafal santri (DEPRECATED)
 * Gunakan calculateJuzProgressEnhanced untuk fitur terbaru
 */
export const calculateJuzProgress = (hafalanList) => {
  const validHafalan = hafalanList.filter(
    (h) => h.status === "LULUS" && h.jenis === "ZIYADAH",
  );

  const juzProgress = {};

  JUZ_DATA.forEach((juz) => {
    juzProgress[juz.juz] = {
      juz: juz.juz,
      startPage: juz.startPage,
      endPage: juz.endPage,
      startSurah: juz.startSurah,
      startSurahNumber: juz.startSurahNumber,
      startAyat: juz.startAyat,
      endSurah: juz.endSurah,
      endSurahNumber: juz.endSurahNumber,
      endAyat: juz.endAyat,
      totalPages: juz.endPage - juz.startPage + 1,
      completedPages: new Set(),
      hafalanList: [],
      percentage: 0,
      isComplete: false,
    };
  });

  validHafalan.forEach((hafalan) => {
    try {
      const juzNumber = getJuzFromPage(hafalan.halaman || hafalan.halaman_awal);

      if (juzProgress[juzNumber]) {
        juzProgress[juzNumber].completedPages.add(
          hafalan.halaman || hafalan.halaman_awal,
        );

        juzProgress[juzNumber].hafalanList.push({
          halaman: hafalan.halaman || hafalan.halaman_awal,
          surah: hafalan.surah,
          surahNumber: hafalan.surah_number || hafalan.surahNumber,
          ayatMulai: hafalan.ayat_mulai,
          ayatSelesai: hafalan.ayat_selesai,
          tanggal: hafalan.tanggal,
        });
      }
    } catch (error) {
      console.warn(`Halaman invalid: ${hafalan.halaman}`, error.message);
    }
  });

  const completedJuz = [];

  Object.values(juzProgress).forEach((juz) => {
    const completedPagesCount = juz.completedPages.size;
    juz.percentage = Math.round((completedPagesCount / juz.totalPages) * 100);

    juz.isComplete = true;
    for (let page = juz.startPage; page <= juz.endPage; page++) {
      if (!juz.completedPages.has(page)) {
        juz.isComplete = false;
        break;
      }
    }

    juz.completedPages = completedPagesCount;

    if (juz.isComplete) {
      completedJuz.push(juz.juz);
    }

    juz.hafalanList.sort((a, b) => a.halaman - b.halaman);
  });

  const uniqueHalaman = new Set(
    validHafalan.map((h) => h.halaman || h.halaman_awal),
  );

  // Hitung total halaman dari juz yang dipantau
  const totalHalamanAlQuran = JUZ_DATA.reduce(
    (sum, juz) => sum + (juz.endPage - juz.startPage + 1),
    0,
  );

  return {
    juzCount: completedJuz.length,
    completedJuz,
    progress: juzProgress,
    totalHalaman: uniqueHalaman.size,
    totalPages: totalHalamanAlQuran,
    percentageTotal: Math.round(
      (uniqueHalaman.size / totalHalamanAlQuran) * 100,
    ),
    lastHafalan:
      validHafalan.length > 0 ? validHafalan[validHafalan.length - 1] : null,
  };
};

/**
 * FUNGSI LAMA - Get statistik hafalan per juz (DEPRECATED)
 */
export const getJuzStatistics = (hafalanList) => {
  const progress = calculateJuzProgress(hafalanList);

  const statistics = {
    totalJuz: 5,
    completedJuz: progress.juzCount,
    inProgressJuz: 0,
    notStartedJuz: 0,
    juzDetails: [],
  };

  Object.values(progress.progress).forEach((juz) => {
    if (juz.isComplete) {
      // Already counted in completedJuz
    } else if (juz.completedPages > 0) {
      statistics.inProgressJuz++;
    } else {
      statistics.notStartedJuz++;
    }

    statistics.juzDetails.push({
      juz: juz.juz,
      status: juz.isComplete
        ? "SELESAI"
        : juz.completedPages > 0
          ? "PROSES"
          : "BELUM_MULAI",
      percentage: juz.percentage,
      completedPages: juz.completedPages,
      totalPages: juz.totalPages,
      startSurah: juz.startSurah,
      endSurah: juz.endSurah,
    });
  });

  return statistics;
};

// ============================================
// FUNGSI BARU - ENHANCED VERSION
// ============================================

/**
 * Ekstrak semua halaman yang dihafal dari range halaman_awal sampai halaman_akhir
 */
export function extractPagesFromRange(halamanAwal, halamanAkhir) {
  const pages = [];

  if (!halamanAkhir || halamanAwal === halamanAkhir) {
    pages.push(halamanAwal);
    return pages;
  }

  for (let page = halamanAwal; page <= halamanAkhir; page++) {
    pages.push(page);
  }

  return pages;
}

/**
 * Hitung semua juz yang terpengaruh oleh range halaman
 */
export function getAffectedJuz(halamanAwal, halamanAkhir) {
  const juzSet = new Set();
  const endPage = halamanAkhir || halamanAwal;

  for (let page = halamanAwal; page <= endPage; page++) {
    const juzNum = getJuzFromPage(page);
    if (juzNum) {
      juzSet.add(juzNum);
    }
  }

  return Array.from(juzSet).sort((a, b) => a - b);
}

/**
 * ENHANCED - Hitung progress juz berdasarkan halaman_awal dan halaman_akhir
 */
export const calculateJuzProgressEnhanced = (hafalanList) => {
  const validHafalan = hafalanList.filter(
    (h) => h.status === "LULUS" && h.jenis === "ZIYADAH",
  );

  const juzProgress = {};

  JUZ_DATA.forEach((juz) => {
    juzProgress[juz.juz] = {
      juz: juz.juz,
      startPage: juz.startPage,
      endPage: juz.endPage,
      startSurah: juz.startSurah,
      startSurahNumber: juz.startSurahNumber,
      startAyat: juz.startAyat,
      endSurah: juz.endSurah,
      endSurahNumber: juz.endSurahNumber,
      endAyat: juz.endAyat,
      totalPages: juz.endPage - juz.startPage + 1,
      completedPages: new Set(),
      hafalanList: [],
      percentage: 0,
      isComplete: false,
    };
  });

  validHafalan.forEach((hafalan) => {
    const halamanAwal = hafalan.halaman_awal || hafalan.halamanAwal;
    const halamanAkhir =
      hafalan.halaman_akhir || hafalan.halamanAkhir || halamanAwal;

    const pages = extractPagesFromRange(halamanAwal, halamanAkhir);
    const affectedJuz = getAffectedJuz(halamanAwal, halamanAkhir);

    affectedJuz.forEach((juzNum) => {
      if (juzProgress[juzNum]) {
        const juzData = JUZ_DATA.find((j) => j.juz === juzNum);

        pages.forEach((page) => {
          if (page >= juzData.startPage && page <= juzData.endPage) {
            juzProgress[juzNum].completedPages.add(page);
          }
        });

        juzProgress[juzNum].hafalanList.push({
          halamanAwal: halamanAwal,
          halamanAkhir: halamanAkhir,
          surah: hafalan.surah,
          ayatMulai: hafalan.ayat_mulai || hafalan.ayatMulai,
          ayatSelesai: hafalan.ayat_selesai || hafalan.ayatSelesai,
          tanggal: hafalan.tanggal,
          pagesInThisJuz: pages.filter(
            (p) => p >= juzData.startPage && p <= juzData.endPage,
          ),
        });
      }
    });
  });

  const completedJuz = [];
  const inProgressJuz = [];

  Object.values(juzProgress).forEach((juz) => {
    const completedPagesCount = juz.completedPages.size;
    juz.percentage = Math.round((completedPagesCount / juz.totalPages) * 100);
    juz.isComplete = completedPagesCount === juz.totalPages;

    if (juz.isComplete) {
      completedJuz.push(juz.juz);
    } else if (completedPagesCount > 0) {
      inProgressJuz.push({
        juz: juz.juz,
        percentage: juz.percentage,
        completedPages: completedPagesCount,
        totalPages: juz.totalPages,
        remainingPages: juz.totalPages - completedPagesCount,
      });
    }

    juz.completedPagesArray = Array.from(juz.completedPages).sort(
      (a, b) => a - b,
    );
    juz.completedPagesCount = completedPagesCount;
    juz.remainingPages = juz.totalPages - completedPagesCount;
    delete juz.completedPages;

    juz.hafalanList.sort((a, b) => a.halamanAwal - b.halamanAwal);
  });

  // Hitung halaman yang dihafal hanya dari juz yang dipantau
  const allPages = new Set();
  validHafalan.forEach((hafalan) => {
    const halamanAwal = hafalan.halaman_awal || hafalan.halamanAwal;
    const halamanAkhir =
      hafalan.halaman_akhir || hafalan.halamanAkhir || halamanAwal;
    const pages = extractPagesFromRange(halamanAwal, halamanAkhir);

    // Hanya tambahkan halaman yang termasuk dalam juz yang dipantau
    pages.forEach((page) => {
      const isInTargetJuz = JUZ_DATA.some(
        (juz) => page >= juz.startPage && page <= juz.endPage,
      );
      if (isInTargetJuz) {
        allPages.add(page);
      }
    });
  });

  // Hitung total halaman dari juz yang dipantau
  const totalHalamanAlQuran = JUZ_DATA.reduce(
    (sum, juz) => sum + (juz.endPage - juz.startPage + 1),
    0,
  );

  return {
    summary: {
      totalJuz: 5,
      completedJuz: completedJuz.length,
      inProgressJuz: inProgressJuz.length,
      notStartedJuz: 5 - completedJuz.length - inProgressJuz.length,
      totalHalamanDihafal: allPages.size,
      totalHalamanAlQuran: totalHalamanAlQuran,
      percentageTotal: Math.round((allPages.size / totalHalamanAlQuran) * 100),
    },
    completedJuz,
    inProgressJuz,
    detailPerJuz: juzProgress,
    lastHafalan:
      validHafalan.length > 0 ? validHafalan[validHafalan.length - 1] : null,
  };
};

/**
 * ENHANCED - Get statistik hafalan per juz dengan informasi lengkap
 */
export const getJuzStatisticsEnhanced = (hafalanList) => {
  const progress = calculateJuzProgressEnhanced(hafalanList);

  const statistics = {
    ...progress.summary,
    juzDetails: [],
  };

  Object.values(progress.detailPerJuz).forEach((juz) => {
    let status = "BELUM_MULAI";
    if (juz.isComplete) {
      status = "SELESAI";
    } else if (juz.completedPagesCount > 0) {
      status = "PROSES";
    }

    statistics.juzDetails.push({
      juz: juz.juz,
      status,
      percentage: juz.percentage,
      completedPages: juz.completedPagesCount,
      totalPages: juz.totalPages,
      remainingPages: juz.remainingPages,
      startPage: juz.startPage,
      endPage: juz.endPage,
      startSurah: juz.startSurah,
      endSurah: juz.endSurah,
      completedPagesArray: juz.completedPagesArray,
      hafalanCount: juz.hafalanList.length,
    });
  });

  return statistics;
};

/**
 * Validasi range halaman untuk hafalan baru
 */
export function validateHalamanRange(halamanAwal, halamanAkhir) {
  if (halamanAwal < 1 || halamanAwal > 604) {
    return {
      valid: false,
      message: "Halaman awal harus antara 1-604",
      affectedJuz: [],
    };
  }

  const endPage = halamanAkhir || halamanAwal;

  if (endPage < halamanAwal) {
    return {
      valid: false,
      message: "Halaman akhir tidak boleh lebih kecil dari halaman awal",
      affectedJuz: [],
    };
  }

  if (endPage > 604) {
    return {
      valid: false,
      message: "Halaman akhir harus antara 1-604",
      affectedJuz: [],
    };
  }

  const affectedJuz = getAffectedJuz(halamanAwal, endPage);
  const totalPages = endPage - halamanAwal + 1;

  return {
    valid: true,
    message: `Valid: ${totalPages} halaman di ${affectedJuz.length} juz`,
    affectedJuz,
    totalPages,
    details: affectedJuz.map((juz) => {
      const juzData = getJuzDetail(juz);
      return {
        juz,
        name: `${juzData.startSurah} - ${juzData.endSurah}`,
        pageRange: `${juzData.startPage}-${juzData.endPage}`,
      };
    }),
  };
}
