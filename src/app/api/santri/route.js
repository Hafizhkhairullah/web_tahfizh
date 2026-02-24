import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =========================
// 📌 CREATE SANTRI (POST)
// =========================
export async function POST(request) {
  try {
    const body = await request.json();

    const { nama, tanggal_lahir, kelas, walisantri_id, guru_id } = body;

    // 🧪 Validasi input
    if (!nama || !tanggal_lahir || !kelas || !walisantri_id || !guru_id) {
      return NextResponse.json(
        { error: "Semua field harus diisi!" },
        { status: 400 },
      );
    }

    // 🧪 Validasi walisantri
    const wali = await prisma.walisantri.findUnique({
      where: { id: Number(walisantri_id) },
    });

    if (!wali) {
      return NextResponse.json(
        { error: "Wali Murid tidak ditemukan" },
        { status: 404 },
      );
    }

    // 🧪 Validasi guru
    const guru = await prisma.guru.findUnique({
      where: { id: Number(guru_id) },
    });

    if (!guru) {
      return NextResponse.json(
        { error: "Guru tidak ditemukan" },
        { status: 404 },
      );
    }

    // ================================
    // 🟢 CREATE SANTRI
    // ================================
    const newSantri = await prisma.santri.create({
      data: {
        nama,
        tanggal_lahir: new Date(tanggal_lahir),
        kelas,
        walisantri_id: Number(walisantri_id),
        guru_id: Number(guru_id),
      },
    });

    return NextResponse.json(
      { message: "Santri berhasil ditambahkan", data: newSantri },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error create santri:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// =========================
// 📌 GET LIST SANTRI
// =========================
export async function GET() {
  try {
    const santri = await prisma.santri.findMany({
      include: {
        walisantri: true,
        guru: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ data: santri }, { status: 200 });
  } catch (error) {
    console.error("Error get santri:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data santri" },
      { status: 500 },
    );
  }
}
