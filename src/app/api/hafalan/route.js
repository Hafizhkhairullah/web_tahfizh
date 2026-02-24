import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// =======================================================
// ===============   GET DATA HAFALAN   ===================
// =======================================================
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ambil query params pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    let hafalanList;
    let totalCount = 0;

    // ======================================================
    //  IF ROLE: GURU
    // ======================================================
    if (session.user.role === "GURU") {
      const guru_id = session.user.guru_id;

      if (!guru_id) {
        return new Response(
          JSON.stringify({ error: "Data guru tidak ditemukan" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const countResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT santri_id) as total
        FROM "HafalanSantri"
        WHERE guru_id = ${Number(guru_id)}
      `;
      totalCount = Number(countResult[0].total);

      const rawData = await prisma.$queryRaw`
        SELECT *
        FROM (
          SELECT 
            h.*,
            ROW_NUMBER() OVER (
              PARTITION BY h.santri_id 
              ORDER BY h.created_at DESC, h.id DESC
            ) AS rn
          FROM "HafalanSantri" h
          WHERE h.guru_id = ${Number(guru_id)}
        ) AS x
        WHERE x.rn = 1
        ORDER BY x.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      hafalanList = await Promise.all(
        rawData.map(async (h) => {
          const [santri, guru] = await Promise.all([
            prisma.santri.findUnique({
              where: { id: Number(h.santri_id) },
              select: { id: true, nama: true, kelas: true },
            }),
            prisma.guru.findUnique({
              where: { id: Number(h.guru_id) },
              select: { id: true, nama: true },
            }),
          ]);

          return {
            id: Number(h.id),
            santri_id: Number(h.santri_id),
            guru_id: Number(h.guru_id),
            tanggal: h.tanggal,
            jenis: h.jenis,
            surah: h.surah,
            ayat_mulai: Number(h.ayat_mulai),
            ayat_selesai: Number(h.ayat_selesai),
            catatan: h.catatan,
            juz: h.juz,
            halaman_awal: Number(h.halaman_awal),
            halaman_akhir: Number(h.halaman_akhir),
            status: h.status,
            santri,
            guru,
          };
        }),
      );
    }

    // ======================================================
    //  IF ROLE: WALISANTRI
    // ======================================================
    else if (session.user.role === "WALISANTRI") {
      const walisantri_id = session.user.walisantri_id;

      if (!walisantri_id) {
        return new Response(
          JSON.stringify({ error: "Data wali murid tidak ditemukan" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const countResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT s.id) as total
        FROM Santri s
        WHERE s.walisantri_id = ${Number(walisantri_id)}
      `;
      totalCount = Number(countResult[0].total);

      const rawData = await prisma.$queryRaw`
        SELECT h1.*
        FROM "HafalanSantri" h1
        INNER JOIN Santri s ON h1.santri_id = s.id
        INNER JOIN (
          SELECT 
            h2.santri_id, 
            MAX(h2.tanggal) as max_tanggal
          FROM "HafalanSantri" h2
          INNER JOIN Santri s2 ON h2.santri_id = s2.id
          WHERE s2.walisantri_id = ${Number(walisantri_id)}
          GROUP BY h2.santri_id
        ) latest ON h1.santri_id = latest.santri_id 
                AND h1.tanggal = latest.max_tanggal
        WHERE s.walisantri_id = ${Number(walisantri_id)}
        ORDER BY h1.tanggal DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      hafalanList = await Promise.all(
        rawData.map(async (h) => {
          const [santri, guru] = await Promise.all([
            prisma.santri.findUnique({
              where: { id: Number(h.santri_id) },
              select: { id: true, nama: true, kelas: true },
            }),
            prisma.guru.findUnique({
              where: { id: Number(h.guru_id) },
              select: { id: true, nama: true },
            }),
          ]);

          return {
            id: Number(h.id),
            santri_id: Number(h.santri_id),
            guru_id: Number(h.guru_id),
            tanggal: h.tanggal,
            jenis: h.jenis,
            surah: h.surah,
            ayat_mulai: Number(h.ayat_mulai),
            ayat_selesai: Number(h.ayat_selesai),
            catatan: h.catatan,
            halaman_awal: Number(h.halaman_awal),
            halaman_akhir: Number(h.halaman_akhir),
            status: h.status,
            santri,
            guru,
          };
        }),
      );
    }

    // ======================================================
    //  IF ROLE: ADMIN
    // ======================================================
    else if (session.user.role === "ADMIN") {
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT santri_id) as total
        FROM "HafalanSantri"
      `;
      totalCount = Number(countResult[0].total);

      const rawData = await prisma.$queryRaw`
        SELECT h1.*
        FROM "HafalanSantri" h1
        INNER JOIN (
          SELECT santri_id, MAX(tanggal) as max_tanggal
          FROM "HafalanSantri"
          GROUP BY santri_id
        ) h2 ON h1.santri_id = h2.santri_id 
             AND h1.tanggal = h2.max_tanggal
        ORDER BY h1.tanggal DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      hafalanList = await Promise.all(
        rawData.map(async (h) => {
          const [santri, guru] = await Promise.all([
            prisma.santri.findUnique({
              where: { id: Number(h.santri_id) },
              select: { id: true, nama: true, kelas: true },
            }),
            prisma.guru.findUnique({
              where: { id: Number(h.guru_id) },
              select: { id: true, nama: true },
            }),
          ]);

          return {
            id: Number(h.id),
            santri_id: Number(h.santri_id),
            guru_id: Number(h.guru_id),
            tanggal: h.tanggal,
            jenis: h.jenis,
            surah: h.surah,
            ayat_mulai: Number(h.ayat_mulai),
            ayat_selesai: Number(h.ayat_selesai),
            catatan: h.catatan,
            halaman_awal: Number(h.halaman_awal),
            halaman_akhir: Number(h.halaman_akhir),
            status: h.status,
            santri,
            guru,
          };
        }),
      );
    }

    // Pagination response
    const totalPages = Math.ceil(totalCount / limit);

    return new Response(
      JSON.stringify({
        data: hafalanList,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching hafalan:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

// =======================================================
// ===============   POST DATA HAFALAN   =================
// =======================================================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GURU") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const guru_id = session.user.guru_id;

    const body = await request.json();
    let {
      santri_id,
      status,
      ayat_mulai,
      catatan,
      ayat_selesai,
      surah,
      halaman_awal,
      halaman_akhir,
      tanggal,
      jenis,
    } = body;

    // ============================
    // VALIDASI
    // ============================
    if (!santri_id || !status || !tanggal || !jenis) {
      return new Response(
        JSON.stringify({ error: "Field wajib belum lengkap" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const santriExists = await prisma.santri.findUnique({
      where: { id: Number(santri_id) },
    });

    if (!santriExists) {
      return new Response(
        JSON.stringify({ error: "Data santri tidak ditemukan" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Cek apakah santri sudah punya hafalan pertama
    const existingHafalan = await prisma.HafalanSantri.findFirst({
      where: { santri_id: Number(santri_id) },
    });

    if (existingHafalan) {
      return new Response(
        JSON.stringify({
          error: "Santri ini sudah ada dalam list hafalan",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // ============================
    // PERBAIKAN HALAMAN
    // ============================
    if (!halaman_akhir || halaman_akhir === "") {
      halaman_akhir = halaman_awal;
    }

    if (Number(halaman_akhir) < Number(halaman_awal)) {
      [halaman_awal, halaman_akhir] = [halaman_akhir, halaman_awal];
    }

    // ============================
    // SAVE DATA
    // ============================
    const data = await prisma.HafalanSantri.create({
      data: {
        tanggal: new Date(tanggal),
        surah,
        jenis,
        ayat_mulai: Number(ayat_mulai),
        ayat_selesai: Number(ayat_selesai),
        status,
        santri_id: Number(santri_id),
        halaman_awal: Number(halaman_awal),
        halaman_akhir: Number(halaman_akhir),
        guru_id: Number(guru_id),
        catatan: catatan || null,
      },
      include: {
        santri: { select: { id: true, nama: true, kelas: true } },
        guru: { select: { id: true, nama: true } },
      },
    });

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating hafalan:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
