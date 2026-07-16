import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// ✅ GET - Ambil detail hafalan berdasarkan ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;

    const hafalan = await prisma.HafalanSantri.findUnique({
      where: { id: Number(id) },
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            kelas: true,
          },
        },
        guru: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    if (!hafalan) {
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Cek permission berdasarkan role
    if (session.user.role === "GURU") {
      if (hafalan.guru_id !== session.user.guru_id) {
        return new Response(
          JSON.stringify({ error: "Forbidden - Bukan data Anda" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } else if (session.user.role === "WALISANTRI") {
      const santri = await prisma.santri.findUnique({
        where: { id: hafalan.santri_id },
      });

      if (santri.walisantri_id !== session.user.walisantri_id) {
        return new Response(
          JSON.stringify({ error: "Forbidden - Bukan santri Anda" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    return new Response(JSON.stringify(hafalan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching hafalan detail:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan",
        detail: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// ✅ PUT - Update data hafalan
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GURU") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const guru_id = session.user.guru_id;

    if (!guru_id) {
      return new Response(
        JSON.stringify({
          error: "Data guru tidak ditemukan. Silakan logout dan login kembali.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { id } = params;

    // Cek apakah hafalan ada
    const existingHafalan = await prisma.HafalanSantri.findUnique({
      where: { id: Number(id) },
    });

    if (!existingHafalan) {
      return new Response(
        JSON.stringify({ error: "Data hafalan tidak ditemukan" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Cek permission - hanya guru yang membuat yang bisa update
    if (existingHafalan.guru_id !== guru_id) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Bukan data Anda" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = await request.json();
    const {
      status,
      ayat_mulai,
      catatan,
      ayat_selesai,
      surah,
      halaman_awal,
      halaman_akhir,
      juz,
      tanggal,
      jenis,
    } = body;

    // Validasi field wajib
    if (!status || !tanggal || !jenis) {
      return new Response(
        JSON.stringify({ error: "Field wajib belum lengkap" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ============================
    // PERBAIKAN HALAMAN
    // ============================
    let validatedHalamanAwal = halaman_awal;
    let validatedHalamanAkhir = halaman_akhir;

    if (!validatedHalamanAkhir || validatedHalamanAkhir === "") {
      validatedHalamanAkhir = validatedHalamanAwal;
    }

    if (Number(validatedHalamanAkhir) < Number(validatedHalamanAwal)) {
      [validatedHalamanAwal, validatedHalamanAkhir] = [
        validatedHalamanAkhir,
        validatedHalamanAwal,
      ];
    }

    // Gunakan transaction untuk memastikan history tersimpan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan data lama ke history
      await tx.historyHafalan.create({
        data: {
          hafalan_id: existingHafalan.id,
          tanggal: existingHafalan.tanggal,
          surah: existingHafalan.surah,
          jenis: existingHafalan.jenis,
          ayat_mulai: existingHafalan.ayat_mulai,
          ayat_selesai: existingHafalan.ayat_selesai,
          halaman_awal: existingHafalan.halaman_awal,
          halaman_akhir: existingHafalan.halaman_akhir,
          juz: existingHafalan.juz,
          status: existingHafalan.status,
          catatan: existingHafalan.catatan,
          guru_id: existingHafalan.guru_id,
          santri_id: existingHafalan.santri_id,
        },
      });

      // 2. Update data hafalan dengan data baru
      const updatedHafalan = await tx.HafalanSantri.update({
        where: { id: Number(id) },
        data: {
          tanggal: new Date(tanggal),
          surah,
          jenis,
          ayat_mulai: ayat_mulai ? Number(ayat_mulai) : null,
          ayat_selesai: ayat_selesai ? Number(ayat_selesai) : null,
          halaman_awal: validatedHalamanAwal
            ? Number(validatedHalamanAwal)
            : null,
          halaman_akhir: validatedHalamanAkhir
            ? Number(validatedHalamanAkhir)
            : null,
          juz: juz ? Number(juz) : null,
          status,
          catatan: catatan || null,
          guru_id: Number(guru_id),
        },
        include: {
          santri: {
            select: {
              id: true,
              nama: true,
              kelas: true,
            },
          },
          guru: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      return updatedHafalan;
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating hafalan:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan",
        detail: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// ✅ DELETE - Hapus data hafalan
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GURU") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;
    const guru_id = session.user.guru_id;

    if (!guru_id) {
      return new Response(
        JSON.stringify({ error: "Data guru tidak ditemukan" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Cek apakah data ada dan milik guru yang login
    const existingHafalan = await prisma.HafalanSantri.findUnique({
      where: { id: Number(id) },
    });

    if (!existingHafalan) {
      return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (existingHafalan.guru_id !== Number(guru_id)) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Anda tidak bisa hapus data ini" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Hapus data
    await prisma.HafalanSantri.delete({
      where: { id: Number(id) },
    });

    return new Response(
      JSON.stringify({
        message: "Data berhasil dihapus",
        id: Number(id),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting hafalan:", error);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan",
        detail: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
