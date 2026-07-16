"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Circle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const JuzProgressDashboard = ({ initialData = null, santriId }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data dari API
  const fetchData = async () => {
    if (!santriId) {
      setError("ID Santri tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/santri/${santriId}/juz-progress`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memuat data");
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "Data tidak valid");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    fetchData();
  }, [santriId, initialData]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  console.log("Data state:", data);
  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Memuat data hafalan...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Belum ada data hafalan untuk santri ini
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "SELESAI":
        return "bg-green-500";
      case "PROSES":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SELESAI":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PROSES":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Convert detailJuz object to array
  const juzDetailsArray =
    data.statistics?.juzDetails || Object.values(data.detailJuz || {}) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {data.santri?.nama}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Kelas {data.santri?.kelas}
                </span>
                <span>👨‍🏫 {data.santri?.guru}</span>
                <span>👨‍👩‍👦 {data.santri?.walisantri}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-5xl font-bold text-emerald-600">
                  {data.summary?.juzSelesai || 0}
                </div>
                <div className="text-sm text-gray-600">Juz Selesai</div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Memperbarui..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">
                Progress Keseluruhan
              </span>
              <span className="font-bold text-emerald-600">
                {data.summary?.persenTotal || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${data.summary?.persenTotal || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>{data.summary?.totalHalaman || 0} halaman</span>
              <span>{data.summary?.dariTotalHalaman || 604} halaman</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {data.statistics?.completedJuz || 0}
            </div>
            <div className="text-sm opacity-90">Juz Selesai</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <Clock className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {data.statistics?.inProgressJuz || 0}
            </div>
            <div className="text-sm opacity-90">Sedang Proses</div>
          </div>

          <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl shadow-lg p-6 text-white">
            <Circle className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {data.statistics?.notStartedJuz || 0}
            </div>
            <div className="text-sm opacity-90">Belum Dimulai</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {Math.round(data.summary?.persenTotal || 0)}%
            </div>
            <div className="text-sm opacity-90">Total Progress</div>
          </div>
        </div>

        {/* Last Hafalan */}
        {data.hafalanTerakhir && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-800">
                Hafalan Terakhir
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tanggal:</span>
                <p className="font-semibold text-gray-800">
                  {new Date(data.hafalanTerakhir.tanggal).toLocaleDateString(
                    "id-ID",
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Surah:</span>
                <p className="font-semibold text-gray-800">
                  {data.hafalanTerakhir.surah}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Ayat:</span>
                <p className="font-semibold text-gray-800">
                  {data.hafalanTerakhir.ayat_mulai} -{" "}
                  {data.hafalanTerakhir.ayat_selesai}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Halaman:</span>
                <p className="font-semibold text-gray-800">
                  {data.hafalanTerakhir.halaman_awal ??
                    data.hafalanTerakhir.halaman}
                  {data.hafalanTerakhir.halaman_akhir &&
                  data.hafalanTerakhir.halaman_akhir !==
                    data.hafalanTerakhir.halaman_awal
                    ? ` - ${data.hafalanTerakhir.halaman_akhir}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Juz Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-600" />
            Progress per Juz
          </h3>

          {juzDetailsArray.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Belum ada data hafalan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {juzDetailsArray.map((juz) => (
                <div
                  key={juz.juz}
                  className={`relative rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                    juz.status === "SELESAI"
                      ? "bg-green-50 border-green-300 hover:shadow-lg hover:shadow-green-200"
                      : juz.status === "PROSES"
                        ? "bg-yellow-50 border-yellow-300 hover:shadow-lg hover:shadow-yellow-200"
                        : "bg-gray-50 border-gray-200 hover:shadow-lg"
                  }`}
                >
                  {/* Badge Status */}
                  <div className="absolute -top-2 -right-2">
                    {getStatusIcon(juz.status)}
                  </div>

                  {/* Juz Number */}
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      juz.status === "SELESAI"
                        ? "text-green-600"
                        : juz.status === "PROSES"
                          ? "text-yellow-600"
                          : "text-gray-400"
                    }`}
                  >
                    {juz.juz}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getStatusColor(
                        juz.status,
                      )}`}
                      style={{ width: `${juz.percentage || 0}%` }}
                    ></div>
                  </div>

                  {/* Percentage */}
                  <div className="text-xs font-semibold text-gray-700">
                    {juz.percentage || 0}%
                  </div>

                  {/* Pages Info */}
                  <div className="text-xs text-gray-600 mt-1">
                    {juz.completedPages || 0}/{juz.totalPages || 20} hal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Selesai (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">Sedang Proses</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Belum Dimulai</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuzProgressDashboard;
