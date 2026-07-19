"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  Eye,
  Clock,
  History,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ============================================
// KOMPONEN STAT CARD
// ============================================
function StatCard({ icon, title, value, subtitle, color }) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-emerald-500 to-teal-600",
    purple: "from-purple-500 to-pink-600",
    orange: "from-orange-500 to-amber-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-xl shadow-lg p-6`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg">{icon}</div>
        <div className="text-right">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-90">{title}</p>
        </div>
      </div>
      <p className="text-sm opacity-80">{subtitle}</p>
    </div>
  );
}

// ============================================
// KOMPONEN CARD PROGRESS ANAK
// ============================================
function ChildProgressCard({ child }) {
  const router = useRouter();

  return (
    <div className="border border-gray-200 rounded-lg p-5 mb-4 hover:shadow-md transition-all hover:border-emerald-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{child.nama}</h3>
          <p className="text-sm text-gray-600">
            Kelas {child.kelas} • Guru: {child.guru}
          </p>
        </div>
        <button
          onClick={() => router.push(`/walisantri/santri/${child.id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Lihat Detail"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress Hafalan</span>
          <span className="font-semibold text-emerald-600">
            {child.juzSelesai}/5 Juz
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(child.juzSelesai / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-500">
            {child.persenTotal.toFixed(1)}% selesai
          </p>
          <p className="text-xs text-gray-500">{child.totalHalaman} halaman</p>
        </div>
      </div>

      {/* Juz dalam Progress */}
      {child.juzDalamProgress && child.juzDalamProgress.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Sedang Menghafal:
          </p>
          <div className="flex gap-2 flex-wrap">
            {child.juzDalamProgress.map((juz) => (
              <div
                key={juz.juz}
                className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 text-xs"
              >
                <span className="font-semibold">Juz {juz.juz}</span>
                <span className="text-gray-600 ml-1">
                  ({juz.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hafalan Terakhir */}
      {child.hafalanTerakhir ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-xs text-emerald-700 font-semibold mb-1">
            Hafalan Terakhir:
          </p>
          <p className="font-semibold text-gray-800">
            {child.hafalanTerakhir.surah}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Hal. {child.hafalanTerakhir.halaman} • Ayat{" "}
            {child.hafalanTerakhir.ayat}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(child.hafalanTerakhir.tanggal).toLocaleDateString(
              "id-ID",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500">Belum ada hafalan tercatat</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// KOMPONEN AKTIVITAS TERBARU
// ============================================
function RecentActivities({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Belum ada aktivitas
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex gap-3 border-l-4 border-blue-500 pl-4 py-2 hover:bg-blue-50 rounded-r transition"
        >
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{activity.santriNama}</p>
            <p className="text-sm text-gray-600">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// KOMPONEN LOADING
// ============================================
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Memuat data...</p>
      </div>
    </div>
  );
}

// ============================================
// KOMPONEN ERROR
// ============================================
function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function WalisantriDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role !== "WALISANTRI") {
      router.push("/");
    }
  }, [session, status]);
  console.log(session?.user, "????>>");
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/walisantri/dashboard");

      if (!res.ok) {
        throw new Error("Gagal memuat data");
      }

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "Gagal memuat data");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data)
    return <ErrorState message="Data tidak ditemukan" onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Walimurid
          </h1>
          <p className="text-gray-600">
            Selamat datang, {session?.user?.name} • Pantau perkembangan hafalan
            anak Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Anak"
            value={data.statistics.totalAnak}
            subtitle="Siswa/i terdaftar"
            color="blue"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Prestasi Tertinggi"
            value={`${data.statistics.maxJuz}/5`}
            subtitle={data.statistics.topSantri || "Belum ada data"}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Hafalan Bulan Ini"
            value={`${data.statistics.halamanBulanIni} hal`}
            subtitle="Progress baru"
            color="purple"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Rata-rata"
            value={`${data.statistics.avgJuz} Juz`}
            subtitle="Per anak"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 kolom */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Per Anak */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                Progress Hafalan Anak
              </h2>

              {data.children && data.children.length > 0 ? (
                data.children.map((child) => (
                  <ChildProgressCard key={child.id} child={child} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada santri yang terdaftar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 kolom */}
          <div className="space-y-6">
            {/* Aktivitas Terbaru */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Aktivitas Terbaru
              </h2>
              <RecentActivities activities={data.recentActivities} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => router.push("/walisantri/dashboard")}
                className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
              >
                <History className="w-8 h-8 mb-2" />
                <h3 className="font-bold mb-1">Riwayat Lengkap</h3>
                <p className="text-sm opacity-90">Lihat semua hafalan anak</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
