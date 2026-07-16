// utils/pdfGenerator.js
// Install: npm install jspdf jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFClient = (reportType, data) => {
  const { santri, statistics } = data;
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text("LAPORAN HAFALAN AL-QUR'AN", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Sistem Monitoring Tahfidz", 105, 28, { align: "center" });

  // Line separator
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  // Info
  doc.setFontSize(10);
  doc.setTextColor(0);
  const now = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Tanggal: ${now}`, 20, 40);

  let reportName = "";
  switch (reportType) {
    case "summary":
      reportName = "Laporan Ringkasan";
      break;
    case "detail":
      reportName = "Laporan Detail Santri";
      break;
    case "progress":
      reportName = "Laporan Progress";
      break;
    case "achievement":
      reportName = "Laporan Prestasi";
      break;
  }
  doc.text(`Jenis: ${reportName}`, 20, 46);

  let yPos = 55;

  // Content based on report type
  switch (reportType) {
    case "summary":
      generateSummaryReport(doc, statistics, yPos);
      break;
    case "detail":
      generateDetailReport(doc, santri, yPos);
      break;
    case "progress":
      generateProgressReport(doc, statistics, yPos);
      break;
    case "achievement":
      generateAchievementReport(doc, statistics, yPos);
      break;
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: "center" });
    doc.text("© 2024 Sistem Tahfidz - Semua hak dilindungi", 105, 295, {
      align: "center",
    });
  }

  // Save PDF
  const filename = `Laporan_${reportType}_${Date.now()}.pdf`;
  doc.save(filename);
};

function generateSummaryReport(doc, stats, startY) {
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("RINGKASAN STATISTIK", 20, startY);

  // Statistics boxes
  const boxY = startY + 10;
  const boxWidth = 85;
  const boxHeight = 25;

  // Box 1: Total Santri
  doc.setFillColor(59, 130, 246); // blue
  doc.roundedRect(20, boxY, boxWidth, boxHeight, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Total Santri", 25, boxY + 8);
  doc.setFontSize(20);
  doc.text(String(stats.totalSantri || 0), 25, boxY + 20);

  // Box 2: Santri Khatam
  doc.setFillColor(16, 185, 129); // green
  doc.roundedRect(110, boxY, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.text("Santri Khatam", 115, boxY + 8);
  doc.setFontSize(20);
  doc.text(String(stats.santriKhatam || 0), 115, boxY + 20);

  // Box 3: Rata-rata Juz
  doc.setFillColor(139, 92, 246); // purple
  doc.roundedRect(20, boxY + 30, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.text("Rata-rata Juz", 25, boxY + 38);
  doc.setFontSize(20);
  doc.text(String(stats.rataRataJuz || 0), 25, boxY + 50);

  // Box 4: Total Juz
  doc.setFillColor(249, 115, 22); // orange
  doc.roundedRect(110, boxY + 30, boxWidth, boxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.text("Total Juz Diselesaikan", 115, boxY + 38);
  doc.setFontSize(20);
  doc.text(String(stats.totalJuzDiselesaikan || 0), 115, boxY + 50);

  // Detail Table
  autoTable(doc, {
    startY: boxY + 65,
    head: [["Keterangan", "Jumlah"]],
    body: [
      ["Santri Khatam (5 Juz)", stats.santriKhatam],
      ["Santri Sedang Progress", stats.santriProgress],
      ["Total Halaman Dihafal", stats.totalHalamanDihafal],
      [
        "Persentase Khatam",
        `${((stats.santriKhatam / stats.totalSantri) * 100).toFixed(1)}%`,
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
  });
}

function generateDetailReport(doc, santri, startY) {
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("DETAIL PROGRESS SANTRI", 20, startY);

  autoTable(doc, {
    startY: startY + 8,
    head: [
      ["No", "Nama Santri", "Kelas", "Guru", "Juz", "Progress", "Halaman"],
    ],
    body: santri.map((s, i) => [
      i + 1,
      s.nama,
      s.kelas,
      s.guru,
      `${s.juzSelesai}/5`,
      `${s.persenTotal}%`,
      s.totalHalaman,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 40 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 35 },
      4: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 22, halign: "center" },
      6: { cellWidth: 20, halign: "center" },
    },
  });
}

function generateProgressReport(doc, stats, startY) {
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("DISTRIBUSI PROGRESS HAFALAN", 20, startY);

  // Progress bars (visual representation using rectangles)
  let y = startY + 15;

  // Khatam
  doc.setFontSize(10);
  doc.text(`Santri Khatam: ${stats.santriKhatam} santri`, 20, y);
  doc.setFillColor(16, 185, 129);
  const khatamWidth = (stats.santriKhatam / stats.totalSantri) * 150;
  doc.roundedRect(20, y + 3, khatamWidth, 8, 2, 2, "F");

  y += 20;

  // Progress
  doc.text(`Sedang Progress: ${stats.santriProgress} santri`, 20, y);
  doc.setFillColor(59, 130, 246);
  const progressWidth = (stats.santriProgress / stats.totalSantri) * 150;
  doc.roundedRect(20, y + 3, progressWidth, 8, 2, 2, "F");

  // Statistics table
  autoTable(doc, {
    startY: y + 20,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Rata-rata Juz per Santri", `${stats.rataRataJuz} Juz`],
      ["Total Halaman Dihafal", `${stats.totalHalamanDihafal} halaman`],
      [
        "Rata-rata Halaman per Santri",
        `${Math.round(stats.totalHalamanDihafal / stats.totalSantri)} halaman`,
      ],
      [
        "Persentase Progress Keseluruhan",
        `${(
          (stats.totalJuzDiselesaikan / (stats.totalSantri * 5)) *
          100
        ).toFixed(1)}%`,
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
  });
}

function generateAchievementReport(doc, stats, startY) {
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("TOP 5 SANTRI BERPRESTASI", 20, startY);

  autoTable(doc, {
    startY: startY + 8,
    head: [["Peringkat", "Nama Santri", "Kelas", "Juz Selesai", "Progress"]],
    body: stats.topSantri.map((s, i) => [
      i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`,
      s.nama,
      s.kelas,
      `${s.juzSelesai}/5`,
      `${s.persenTotal}%`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: {
        cellWidth: 25,
        halign: "center",
        fontSize: 14,
        fontStyle: "bold",
      },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 25, halign: "center" },
    },
  });

  // Add trophy icon for top 3
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "🏆 Selamat kepada santri berprestasi! Terus semangat menghafal Al-Qur'an",
    105,
    finalY,
    { align: "center" },
  );
}
