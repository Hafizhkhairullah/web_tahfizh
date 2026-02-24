export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, role, nama, alamat, no_hp } = body;
    console.log("Received registration data:", body);
    // Validasi input
    if (!username || !password || !role || !nama) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user berdasarkan role
    let newUser;

    if (role === "WALISANTRI") {
      // Validasi data walisantri
      if (!alamat || !no_hp) {
        return NextResponse.json(
          { error: "Alamat dan nomor HP wajib diisi untuk Wali Murid" },
          { status: 400 },
        );
      }

      newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          walisantri: {
            create: {
              nama,
              alamat,
              no_hp,
            },
          },
        },
        include: {
          walisantri: true,
        },
      });
    } else if (role === "GURU") {
      // Validasi data guru
      console.log("Registering guru with nama:", nama);
      if (!nama) {
        return NextResponse.json(
          { error: "Nama wajib diisi untuk Guru" },
          { status: 400 },
        );
      }
      newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          guru: {
            create: {
              nama,
            },
          },
        },
        include: {
          guru: true,
        },
      });
    } else if (role === "ADMIN") {
      newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: "ADMIN",
        },
      });
    } else {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    // Remove password dari response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 },
    );
  }
}
