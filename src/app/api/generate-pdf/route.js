export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateJuzProgressEnhanced } from "@/utils/juzcalculation";

// Untuk generate PDF, kita akan menggunakan library puppeteer atau jsPDF
// Install dengan: npm install jspdf jspdf-autotable

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const guruId = searchParams.get("guruId");
    const walisantriId = searchParams.get("walisantriId");
    const reportType = searchParams.get("reportType") || "summary";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    let whereClause = {};
    if (guruId) whereClause.guru_id = parseInt(guruId);
    if (walisantriId) whereClause.walisantri_id = parseInt(walisantriId);

    // Fetch data santri
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

    const santriWithProgress = santriList.map((santri) => {
      const hafalanList = santri.history || [];
      const progress = calculateJuzProgressEnhanced(hafalanList);
      const allActiveJuz = [
        ...progress.completedJuz,
        ...progress.inProgressJuz.map((j) => j.juz),
      ].sort((a, b) => b - a);
      const juzTerakhir = allActiveJuz.length > 0 ? allActiveJuz[0] : 0;

      return {
        id: santri.id,
        nama: santri.nama,
        kelas: santri.kelas,
        walisantri: santri.walisantri?.nama || "-",
        guru: santri.guru?.nama || "-",
        juzSelesai: progress.summary.completedJuz,
        juzProgress: progress.summary.inProgressJuz,
        persenTotal: progress.summary.percentageTotal,
        totalHalaman: progress.summary.totalHalamanDihafal,
        juzTerakhir,
      };
    });

    // Calculate statistics
    const totalSantri = santriWithProgress.length;
    const santriKhatam = santriWithProgress.filter(
      (s) => s.juzSelesai === 5,
    ).length;
    const santriProgress = santriWithProgress.filter(
      (s) => s.juzSelesai < 5 && s.juzSelesai > 0,
    ).length;
    const avgJuzPerSantri =
      totalSantri > 0
        ? (
            santriWithProgress.reduce((sum, s) => sum + s.juzSelesai, 0) /
            totalSantri
          ).toFixed(1)
        : 0;
    const totalJuzDiselesaikan = santriWithProgress.reduce(
      (sum, s) => sum + s.juzSelesai,
      0,
    );
    const totalHalamanDihafal = santriWithProgress.reduce(
      (sum, s) => sum + s.totalHalaman,
      0,
    );

    const topSantri = [...santriWithProgress]
      .sort((a, b) => {
        if (b.juzSelesai !== a.juzSelesai) {
          return b.juzSelesai - a.juzSelesai;
        }
        return b.persenTotal - a.persenTotal;
      })
      .slice(0, 5);

    // Generate PDF HTML
    const html = generatePDFHTML(reportType, {
      santri: santriWithProgress,
      statistics: {
        totalSantri,
        santriKhatam,
        santriProgress,
        avgJuzPerSantri,
        totalJuzDiselesaikan,
        totalHalamanDihafal,
        topSantri,
      },
      startDate,
      endDate,
    });

    // Return HTML that can be printed to PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat PDF",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

function generatePDFHTML(reportType, data) {
  const { santri, statistics, startDate, endDate } = data;
  const now = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let content = "";

  switch (reportType) {
    case "summary":
      content = `
        <div class="statistics-grid">
          <div class="stat-card">
            <h3>Total Santri</h3>
            <p class="stat-number">${statistics.totalSantri}</p>
          </div>
          <div class="stat-card">
            <h3>Santri Khatam</h3>
            <p class="stat-number green">${statistics.santriKhatam}</p>
          </div>
          <div class="stat-card">
            <h3>Rata-rata Juz</h3>
            <p class="stat-number blue">${statistics.avgJuzPerSantri}</p>
          </div>
          <div class="stat-card">
            <h3>Total Juz Diselesaikan</h3>
            <p class="stat-number purple">${statistics.totalJuzDiselesaikan}</p>
          </div>
        </div>
        <div class="section">
          <h2>Distribusi Progress</h2>
          <table>
            <tr>
              <td>Santri Khatam (5 Juz)</td>
              <td class="text-right"><strong>${statistics.santriKhatam}</strong></td>
            </tr>
            <tr>
              <td>Santri Sedang Progress</td>
              <td class="text-right"><strong>${statistics.santriProgress}</strong></td>
            </tr>
            <tr>
              <td>Total Halaman Dihafal</td>
              <td class="text-right"><strong>${statistics.totalHalamanDihafal}</strong></td>
            </tr>
          </table>
        </div>
      `;
      break;

    case "detail":
      content = `
        <div class="section">
          <h2>Detail Progress Santri</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Santri</th>
                <th>Kelas</th>
                <th>Guru</th>
                <th class="text-center">Juz Selesai</th>
                <th class="text-center">Progress</th>
                <th class="text-center">Halaman</th>
              </tr>
            </thead>
            <tbody>
              ${santri
                .map(
                  (s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s.nama}</td>
                  <td>${s.kelas}</td>
                  <td>${s.guru}</td>
                  <td class="text-center"><strong>${
                    s.juzSelesai
                  }/5</strong></td>
                  <td class="text-center"><strong class="green">${
                    s.persenTotal
                  }%</strong></td>
                  <td class="text-center">${s.totalHalaman}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
      break;

    case "progress":
      content = `
        <div class="section">
          <h2>Distribusi Progress Hafalan</h2>
          <div class="progress-section">
            <div class="progress-item">
              <div class="progress-label">
                <span>Santri Khatam (5 Juz)</span>
                <strong>${statistics.santriKhatam} santri</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: ${
                  (statistics.santriKhatam / statistics.totalSantri) * 100
                }%"></div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>Sedang Progress (1-4 Juz)</span>
                <strong>${statistics.santriProgress} santri</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill blue" style="width: ${
                  (statistics.santriProgress / statistics.totalSantri) * 100
                }%"></div>
              </div>
            </div>
          </div>
          
          <h3 style="margin-top: 30px;">Statistik Progress</h3>
          <table>
            <tr>
              <td>Rata-rata Juz per Santri</td>
              <td class="text-right"><strong>${
                statistics.avgJuzPerSantri
              } Juz</strong></td>
            </tr>
            <tr>
              <td>Total Halaman Dihafal</td>
              <td class="text-right"><strong>${
                statistics.totalHalamanDihafal
              } halaman</strong></td>
            </tr>
            <tr>
              <td>Rata-rata Halaman per Santri</td>
              <td class="text-right"><strong>${Math.round(
                statistics.totalHalamanDihafal / statistics.totalSantri,
              )} halaman</strong></td>
            </tr>
            <tr>
              <td>Persentase Progress Keseluruhan</td>
              <td class="text-right"><strong class="green">${(
                (statistics.totalJuzDiselesaikan /
                  (statistics.totalSantri * 5)) *
                100
              ).toFixed(1)}%</strong></td>
            </tr>
          </table>
        </div>
      `;
      break;

    case "achievement":
      content = `
        <div class="section">
          <h2>Top 5 Santri Berprestasi</h2>
          <table>
            <thead>
              <tr>
                <th class="text-center">Peringkat</th>
                <th>Nama Santri</th>
                <th>Kelas</th>
                <th class="text-center">Juz Selesai</th>
                <th class="text-center">Progress</th>
              </tr>
            </thead>
            <tbody>
              ${statistics.topSantri
                .map(
                  (s, i) => `
                <tr>
                  <td class="text-center">
                    <div class="rank-badge ${
                      i === 0
                        ? "gold"
                        : i === 1
                          ? "silver"
                          : i === 2
                            ? "bronze"
                            : ""
                    }">
                      ${i + 1}
                    </div>
                  </td>
                  <td><strong>${s.nama}</strong></td>
                  <td>${s.kelas}</td>
                  <td class="text-center"><strong>${
                    s.juzSelesai
                  }/5</strong></td>
                  <td class="text-center"><strong class="green">${
                    s.persenTotal
                  }%</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Laporan Hafalan Santri</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #10b981;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #10b981;
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .header .subtitle {
          color: #666;
          font-size: 14px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 10px;
          background: #f3f4f6;
          border-radius: 5px;
        }
        
        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          border: 2px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-card h3 {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .stat-number.green { color: #10b981; }
        .stat-number.blue { color: #3b82f6; }
        .stat-number.purple { color: #8b5cf6; }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          color: #1f2937;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 2px solid #10b981;
          padding-bottom: 5px;
        }
        
        .section h3 {
          color: #374151;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        table th {
          background: #10b981;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        
        table td {
          padding: 8px 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        table tbody tr:hover {
          background: #f9fafb;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .green { color: #10b981; }
        .blue { color: #3b82f6; }
        
        .rank-badge {
          display: inline-block;
          width: 30px;
          height: 30px;
          line-height: 30px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          font-weight: bold;
        }
        
        .rank-badge.gold { background: #f59e0b; }
        .rank-badge.silver { background: #9ca3af; }
        .rank-badge.bronze { background: #ea580c; }
        
        .progress-section {
          margin: 20px 0;
        }
        
        .progress-item {
          margin-bottom: 20px;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .progress-bar {
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .progress-fill.green { background: #10b981; }
        .progress-fill.blue { background: #3b82f6; }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 11px;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📖 LAPORAN HAFALAN AL-QUR'AN</h1>
        <p class="subtitle">Sistem Monitoring Tahfidz</p>
      </div>
      
      <div class="info-row">
        <div>
          <strong>Jenis Laporan:</strong> 
          ${
            reportType === "summary"
              ? "Laporan Ringkasan"
              : reportType === "detail"
                ? "Laporan Detail Santri"
                : reportType === "progress"
                  ? "Laporan Progress"
                  : "Laporan Prestasi"
          }
        </div>
        <div>
          <strong>Tanggal Cetak:</strong> ${now}
        </div>
      </div>
      
      ${
        startDate && endDate
          ? `
      <div class="info-row">
        <div><strong>Periode:</strong> ${new Date(startDate).toLocaleDateString(
          "id-ID",
        )} - ${new Date(endDate).toLocaleDateString("id-ID")}</div>
      </div>
      `
          : ""
      }
      
      ${content}
      
      <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh Sistem Tahfidz</p>
        <p>© ${new Date().getFullYear()} - Semua hak dilindungi</p>
      </div>
    </body>
    </html>
  `;
}
