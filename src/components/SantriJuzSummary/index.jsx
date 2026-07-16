"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Trophy,
  BookOpen,
  TrendingUp,
  Search,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SantriJuzSummary = ({ initialData, role, userId }) => {
  const router = useRouter();
  const [santriList, setSantriList] = useState(initialData?.santri || []);
  const [statistics, setStatistics] = useState(initialData?.statistics || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("ALL");

  useEffect(() => {
    if (initialData) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (role === "GURU") params.append("guruId", userId);
        if (role === "WALISANTRI") params.append("walisantriId", userId);

        console.log("🔍 Fetching with params:", params.toString());

        const response = await fetch(`/api/juz-summary?${params}`);
        const result = await response.json();

        console.log("📦 API Response:", result);

        if (!response.ok) {
          throw new Error(result.message || "Gagal memuat data");
        }

        if (result.success && result.data) {
          setSantriList(result.data.santri || []);
          setStatistics(result.data.statistics || null);
        } else {
          throw new Error("Format response tidak valid");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, role, initialData]);

  // ✅ Safe access to statistics with fallback
  const stats = statistics || {
    totalSantri: 0,
    santriKhatam: 0,
    santriProgress: 0,
    santriBelumMulai: 0,
    rataRataJuz: 0,
    totalJuzDiselesaikan: 0,
    totalHalamanDihafal: 0,
    persenKhatam: 0,
    persenProgress: 0,
  };

  const filteredSantri = santriList.filter((santri) => {
    const matchSearch = santri.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchKelas = filterKelas === "ALL" || santri.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const kelasList = ["ALL", ...new Set(santriList.map((s) => s.kelas))].sort();

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // ✅ NO DATA STATE
  if (!loading && santriList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-t-4 border-emerald-500">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              Ringkasan Progress Hafalan Siswa/i
            </h1>
            <p className="text-gray-600">
              Pantau perkembangan hafalan seluruh siswa/i Anda. Data akan muncul
              setelah siswa/i terdaftar dan memiliki progress hafalan.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tidak Ada Data Siswa/i
            </h3>
            <p className="text-gray-500">
              Belum ada siswa/i yang terdaftar untuk akun Anda
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-t-4 border-emerald-500">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Ringkasan Progress Hafalan Siswa/i
          </h1>
          <p className="text-gray-600">
            Pantau perkembangan hafalan seluruh siswa/i
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <Users className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.totalSantri}</div>
            <div className="text-sm opacity-90">Total Siswa/i</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <Trophy className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.santriKhatam}</div>
            <div className="text-sm opacity-90">Siswa/i Khatam</div>
            {stats.totalSantri > 0 && (
              <div className="text-xs opacity-75 mt-1">
                ({stats.persenKhatam}%)
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <BookOpen className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stats.rataRataJuz}</div>
            <div className="text-sm opacity-90">Rata-rata Juz/(Siswa/i)</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {stats.totalJuzDiselesaikan}
            </div>
            <div className="text-sm opacity-90">Total Juz Diselesaikan</div>
          </div>
        </div>

        {/* Warning jika tidak ada progress */}
        {stats.totalSantri > 0 && stats.totalJuzDiselesaikan === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 mb-1">
                Perhatian: Belum Ada siswa/i yang Memiliki Progress Hafalan 1
                Juz atau Lebih
              </p>
              <p className="text-sm text-yellow-700">
                Semua siswa/i akan tercatat dengan status <strong>LULUS</strong>{" "}
                dan jenis <strong>ZIYADAH</strong>. Data akan tercatat secara
                otomatis saat hafalan selesai.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Kelas */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                {kelasList.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {kelas === "ALL" ? "Semua Kelas" : `Kelas ${kelas}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Santri Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Nama Siswa/i
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Guru
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Juz Selesai
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Progress Khatam
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Halaman
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Terakhir Update
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSantri.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>
                        {searchTerm || filterKelas !== "ALL"
                          ? "Tidak ada siswa/i yang sesuai dengan filter"
                          : "Tidak ada data siswa/i"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSantri.map((santri, index) => (
                    <tr
                      key={santri.id}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {santri.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          {santri.walisantri}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {santri.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {santri.guru}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`text-2xl font-bold ${
                              santri.juzSelesai === 5
                                ? "text-green-600"
                                : santri.juzSelesai >= 3
                                  ? "text-blue-600"
                                  : santri.juzSelesai >= 1
                                    ? "text-yellow-600"
                                    : "text-gray-600"
                            }`}
                          >
                            {santri.juzSelesai}
                          </span>
                          <span className="text-sm text-gray-500">/5</span>
                        </div>
                        {santri.juzSelesai === 5 && (
                          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mt-1" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all ${
                                santri.persenTotal === 100
                                  ? "bg-green-500"
                                  : santri.persenTotal >= 70
                                    ? "bg-blue-500"
                                    : santri.persenTotal >= 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${santri.persenTotal}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {santri.persenTotal}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-semibold text-gray-800">
                          {santri.totalHalaman}
                        </div>
                        <div className="text-xs text-gray-500">dari 604</div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {santri.hafalanTerakhir
                          ? new Date(
                              santri.hafalanTerakhir.tanggal,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            router.push(`/santri/${santri.id}/juz-progress`)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Menampilkan {filteredSantri.length} dari {santriList.length} Siswa/i
        </div>
      </div>
    </div>
  );
};

export default SantriJuzSummary;
