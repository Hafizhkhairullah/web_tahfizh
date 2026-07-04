"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Printer,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Loader2,
} from "lucide-react";

const LaporanPDF = ({ role, userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState("summary");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [userId, role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (role === "GURU") params.append("guruId", userId);
      if (role === "WALISANTRI") params.append("walisantriId", userId);

      const response = await fetch(`/api/juz-summary`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (reportType) => {
    try {
      setGenerating(true);

      // Method 1: Client-side PDF generation (recommended)
      // Uncomment this and comment method 2 if you install jspdf
      /*
      const { generatePDFClient } = await import('@/utils/pdfGenerator');
      generatePDFClient(reportType, {
        santri: santriList,
        statistics: stats
      });
      */

      // Method 2: Server-side HTML to PDF
      const params = new URLSearchParams();
      if (role === "GURU") params.append("guruId", userId);
      if (role === "WALISANTRI") params.append("walisantriId", userId);
      params.append("reportType", reportType);
      params.append("startDate", dateRange.start);
      params.append("endDate", dateRange.end);

      const response = await fetch(`/api/generate-pdf?${params}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get HTML and print to PDF
      const html = await response.text();
      const printWindow = window.open("", "_blank");
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat laporan PDF");
    } finally {
      setGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const stats = data?.statistics || {};
  const santriList = data?.santri || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-emerald-700 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  const reportTypes = [
    {
      id: "summary",
      name: "Laporan Ringkasan",
      description: "Statistik dan ringkasan hafalan keseluruhan",
      icon: FileText,
      color: "blue",
    },
    {
      id: "detail",
      name: "Laporan Detail Santri",
      description: "Progress detail setiap santri",
      icon: Users,
      color: "green",
    },
    {
      id: "progress",
      name: "Laporan Progress",
      description: "Perkembangan hafalan berdasarkan waktu",
      icon: BookOpen,
      color: "purple",
    },
    {
      id: "achievement",
      name: "Laporan Prestasi",
      description: "Top performers dan pencapaian",
      icon: Award,
      color: "yellow",
    },
  ];

  return (
    <div className=" bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-6 pt-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                Laporan Hafalan Santri
              </h1>
              <p className="text-gray-600">
                Cetak dan export laporan hafalan dalam format PDF
              </p>
            </div>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Filter Laporan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchData}
                className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{stats.totalSantri || 0}</p>
            <p className="text-sm opacity-90">Total Santri</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <Award className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{stats.santriKhatam || 0}</p>
            <p className="text-sm opacity-90">Santri Khatam</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <BookOpen className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{stats.rataRataJuz || 0}</p>
            <p className="text-sm opacity-90">Rata-rata Juz</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">
              {stats.totalJuzDiselesaikan || 0}
            </p>
            <p className="text-sm opacity-90">Total Juz</p>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-emerald-500 shadow-xl"
                    : "border-transparent hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-${report.color}-100`}>
                      <Icon className={`w-6 h-6 text-${report.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePDF(report.id);
                  }}
                  disabled={generating}
                  className={`w-full mt-4 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    generating
                      ? "bg-gray-300 cursor-not-allowed"
                      : `bg-${report.color}-600 hover:bg-${report.color}-700 text-white`
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 print:shadow-none mb-10">
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Preview Laporan
            </h2>
            <p className="text-gray-600">
              {reportTypes.find((r) => r.id === selectedReport)?.name}
            </p>
          </div>

          {/* Laporan Ringkasan */}
          {selectedReport === "summary" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Santri</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalSantri}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Santri Khatam</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.santriKhatam}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Rata-rata Juz</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.rataRataJuz}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Total Juz Diselesaikan
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalJuzDiselesaikan}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Laporan Detail Santri */}
          {selectedReport === "detail" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Nama Santri
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Juz Selesai
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {santriList.slice(0, 10).map((santri, index) => (
                    <tr key={santri.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {santri.nama}
                      </td>
                      <td className="py-3 px-4 text-sm">{santri.kelas}</td>
                      <td className="py-3 px-4 text-sm text-center font-semibold">
                        {santri.juzSelesai}/30
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className="font-semibold text-emerald-600">
                          {santri.persenTotal}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Laporan Progress */}
          {selectedReport === "progress" && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Distribusi Progress
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Khatam (30 Juz)
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.santriKhatam} santri
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.persenKhatam}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Sedang Progress
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.santriProgress} santri
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.persenProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Laporan Prestasi */}
          {selectedReport === "achievement" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                Top 5 Siswa/i Berprestasi
              </h3>
              {stats.topSantri?.map((santri, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                            ? "bg-gray-400"
                            : index === 2
                              ? "bg-orange-600"
                              : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {santri.nama}
                      </p>
                      <p className="text-sm text-gray-600">{santri.kelas}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {santri.juzSelesai}/30 Juz
                    </p>
                    <p className="text-sm text-gray-600">
                      {santri.persenTotal}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaporanPDF;
