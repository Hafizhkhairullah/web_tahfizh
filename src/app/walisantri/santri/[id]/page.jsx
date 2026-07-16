// app/walisantri/santri/[id]/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Loader2,
  FileText,
} from "lucide-react";

// ============================================
// KOMPONEN JUZ CARD
// ============================================
function JuzCard({
  juzNumber,
  isCompleted,
  percentage,
  pagesCompleted,
  totalPages,
}) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isCompleted
          ? "bg-emerald-50 border-emerald-500"
          : percentage > 0
          ? "bg-amber-50 border-amber-400"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-lg">Juz {juzNumber}</h4>
        {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-600" />}
      </div>

      {percentage > 0 && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${
                isCompleted ? "bg-emerald-600" : "bg-amber-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {pagesCompleted}/{totalPages} halaman ({percentage.toFixed(0)}%)
          </p>
        </>
      )}

      {percentage === 0 && (
        <p className="text-xs text-gray-400">Belum dimulai</p>
      )}
    </div>
  );
}

// ============================================
// KOMPONEN RIWAYAT HAFALAN
// ============================================
function HafalanHistoryTable({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Belum ada riwayat hafalan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Surah
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Halaman
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Ayat
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {history.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                {new Date(item.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-sm font-medium">{item.surah}</td>
              <td className="px-4 py-3 text-sm">
                {item.halaman_awal}
                {item.halaman_akhir && ` - ${item.halaman_akhir}`}
              </td>
              <td className="px-4 py-3 text-sm">
                {item.ayat_mulai} - {item.ayat_selesai}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === "LULUS"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function DetailSantriPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/walisantri/santri/${params.id}`);

      if (!res.ok) {
        throw new Error("Gagal memuat data santri");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data santri...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error || "Data tidak ditemukan"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { santri, juzProgress, history } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        {/* Profil Santri */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {santri.nama.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {santri.nama}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Kelas: {santri.kelas}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Guru: {santri.guru}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Lahir:{" "}
                    {new Date(santri.tanggal_lahir).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Progress: {santri.juzSelesai}/5 Juz (
                    {santri.persenTotal.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Cetak Laporan
              </button>
            </div>
          </div>
        </div>

        {/* Progress Juz */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Progress Per Juz
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {juzProgress.map((juz) => (
              <JuzCard
                key={juz.juz}
                juzNumber={juz.juz}
                isCompleted={juz.isCompleted}
                percentage={juz.percentage}
                pagesCompleted={juz.pagesCompleted}
                totalPages={juz.totalPages}
              />
            ))}
          </div>
        </div>

        {/* Riwayat Hafalan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Riwayat Hafalan
          </h2>
          <HafalanHistoryTable history={history} />
        </div>
      </div>
    </div>
  );
}
