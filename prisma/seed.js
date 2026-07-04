const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database...");

  // Hash password
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedWaliPassword = await bcrypt.hash("wali123", 10);
  const hashedGuruPassword = await bcrypt.hash("guru123", 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.username);

  // 2. Create Walisantri User
  const waliUser = await prisma.user.upsert({
    where: { username: "wali1" },
    update: {},
    create: {
      username: "wali1",
      password: hashedWaliPassword,
      role: "WALISANTRI",
      walisantri: {
        create: {
          nama: "Bapak Ahmad Santoso",
          alamat: "Jl. Merdeka No. 123, Jakarta",
          no_hp: "08123456789",
        },
      },
    },
  });
  console.log("✅ Walisantri user created:", waliUser.username);

  // 3. Create Guru User
  const guruUser = await prisma.user.upsert({
    where: { username: "guru1" },
    update: {},
    create: {
      username: "guru1",
      password: hashedGuruPassword,
      role: "GURU",
      guru: {
        create: {
          nama: "Ustadz Mahmud Al-Hafidz",
          mapel: "Tahfidz Al-Quran",
        },
      },
    },
  });
  console.log("✅ Guru user created:", guruUser.username);

  console.log("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
