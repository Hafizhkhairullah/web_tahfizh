// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcryptjs");

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Mulai seeding database...");

//   const hashedAdminPassword = await bcrypt.hash("admin123", 10);
//   const hashedWaliPassword = await bcrypt.hash("wali123", 10);
//   const hashedGuruPassword = await bcrypt.hash("guru123", 10);

//   await prisma.$transaction(async (tx) => {
//     // ADMIN
//     const admin = await tx.user.upsert({
//       where: {
//         username: "admin",
//       },
//       update: {
//         password: hashedAdminPassword,
//         role: "ADMIN",
//       },
//       create: {
//         username: "admin",
//         password: hashedAdminPassword,
//         role: "ADMIN",
//       },
//     });

//     console.log("✅ Admin:", admin.username);

//     // WALISANTRI
//     const wali = await tx.user.upsert({
//       where: {
//         username: "wali1",
//       },
//       update: {
//         password: hashedWaliPassword,
//       },
//       create: {
//         username: "wali1",
//         password: hashedWaliPassword,
//         role: "WALISANTRI",
//         walisantri: {
//           create: {
//             nama: "Bapak Ahmad Santoso",
//             alamat: "Jl. Merdeka No.123, Jakarta",
//             no_hp: "08123456789",
//           },
//         },
//       },
//       include: {
//         walisantri: true,
//       },
//     });

//     console.log("✅ Walisantri:", wali.username);

//     // GURU
//     const guru = await tx.user.upsert({
//       where: {
//         username: "guru1",
//       },
//       update: {
//         password: hashedGuruPassword,
//       },
//       create: {
//         username: "guru1",
//         password: hashedGuruPassword,
//         role: "GURU",
//         guru: {
//           create: {
//             nama: "Ustadz Mahmud Al-Hafidz",
//           },
//         },
//       },
//       include: {
//         guru: true,
//       },
//     });

//     console.log("✅ Guru:", guru.username);
//   });

//   console.log("🎉 Seeding selesai.");
// }

// main()
//   .catch((error) => {
//     console.error("❌ Seed gagal:");
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
