"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Zap,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardHafalan = ({ role, userId }) => {
  const { data: session } = useSession();
  role = role || session?.user?.role;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("bulan_ini");

  useEffect(() => {
    fetchDashboardData();
  }, [userId, role, selectedPeriod]);

  const fetchDashboardData = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.statistics || {};
  const santriList = data?.santri || [];
  const topSantri = stats.topSantri || [];

  // Hitung aktivitas hari ini (mock data - sesuaikan dengan API Anda)
  const todayActivity = {
    ziyadah: Math.floor(Math.random() * 10) + 5,
    muroja: Math.floor(Math.random() * 15) + 10,
    lulus: Math.floor(Math.random() * 8) + 3,
  };

  // Santri yang perlu perhatian (progress < 20%)
  const needAttention = santriList
    .filter((s) => s.persenTotal < 20 && s.juzSelesai > 0)
    .slice(0, 5);

  // Hafalan terbaru
  const recentHafalan = santriList
    .filter((s) => s.hafalanTerakhir)
    .sort(
      (a, b) =>
        new Date(b.hafalanTerakhir.tanggal) -
        new Date(a.hafalanTerakhir.tanggal),
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard Hafalan Al-Qur'an
          </h1>
          <p className="text-gray-600">
            Pantau progress dan perkembangan hafalan siswa/i secara real-time
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Santri */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalSantri || 0}
                </p>
                <p className="text-sm text-gray-500">Total Siswa/i</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Aktif menghafal</span>
              <span className="font-semibold text-blue-600">
                {stats.santriProgress || 0} siswa/i
              </span>
            </div>
          </div>

          {/* Santri Khatam */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">
                  {stats.santriKhatam || 0}
                </p>
                <p className="text-sm text-gray-500">Siswa/i Khatam</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Persentase</span>
              <span className="font-semibold text-green-600">
                {stats.persenKhatam || 0}%
              </span>
            </div>
          </div>

          {/* Rata-rata Juz */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">
                  {stats.rataRataJuz || 0}
                </p>
                <p className="text-sm text-gray-500">Rata-rata Juz</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Per santri</span>
              <span className="font-semibold text-purple-600">
                {((stats.rataRataJuz / 5) * 100).toFixed(0)}% progress
              </span>
            </div>
          </div>

          {/* Total Juz Diselesaikan */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalJuzDiselesaikan || 0}
                </p>
                <p className="text-sm text-gray-500">Total Juz</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Halaman</span>
              <span className="font-semibold text-orange-600">
                {stats.totalHalamanDihafal || 0} halaman
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Santri */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Top 5 Siswa/i Berprestasi
              </h2>
            </div>
            <div className="space-y-3">
              {topSantri.length > 0 ? (
                topSantri.map((santri, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                : "bg-gradient-to-br from-blue-400 to-blue-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {santri.nama}
                        </p>
                        <p className="text-sm text-gray-500">{santri.kelas}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {santri.juzSelesai}/5
                      </p>
                      <p className="text-xs text-gray-500">
                        {santri.persenTotal}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada data</p>
                </div>
              )}
            </div>
          </div>

          {/* Hafalan Terbaru */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Hafalan Terbaru
              </h2>
            </div>
            <div className="space-y-3">
              {recentHafalan.length > 0 ? (
                recentHafalan.map((santri, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {santri.nama}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {santri.hafalanTerakhir?.surah} - Hal.{" "}
                        {santri.hafalanTerakhir?.halaman}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          santri.hafalanTerakhir?.tanggal,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/santri/${santri.id}/juz-progress`)
                      }
                      className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5 text-emerald-600" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada hafalan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Santri yang Perlu Perhatian */}
        {needAttention.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Santri yang Perlu Perhatian
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                Progress &lt; 20%
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {needAttention.map((santri) => (
                <div
                  key={santri.id}
                  className="p-4 border-2 border-orange-200 bg-orange-50 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-800">{santri.nama}</p>
                    <span className="px-2 py-1 bg-orange-200 text-orange-700 rounded text-xs font-medium">
                      {santri.kelas}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Juz Selesai:</span>
                      <span className="font-semibold">
                        {santri.juzSelesai}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${santri.persenTotal}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-semibold text-orange-600">
                        {santri.persenTotal}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(`/santri/${santri.id}/juz-progress`)
                    }
                    className="w-full mt-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mt-8">
          {role === "GURU" && (
            <>
              <button
                onClick={() => router.push("/santri")}
                className="flex-1 min-w-[280px] p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <BarChart3 className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Lihat Semua Siswa/i</h3>
                <p className="text-sm opacity-90">
                  Detail progress setiap siswa/i
                </p>
              </button>
              <button
                onClick={() => router.push("/guru/dashboard")}
                className="flex-1 min-w-[280px] p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <BookOpen className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Input Hafalan</h3>
                <p className="text-sm opacity-90">
                  Tambah hafalan siswa/i baru
                </p>
              </button>

              <button
                onClick={() => router.push("/laporan")}
                className="flex-1 min-w-[280px] p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Target className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Laporan</h3>
                <p className="text-sm opacity-90">Cetak & export laporan</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHafalan;
