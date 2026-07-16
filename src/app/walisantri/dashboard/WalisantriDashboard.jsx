"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Target,
  Book,
} from "lucide-react";

// Pagination Component
const ModernPagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 3;

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 
        disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      <div className="flex gap-2">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-lg scale-110"
                : "bg-white border-2 border-gray-200 hover:border-blue-500"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 
        disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  );
};

// Juz Progress Card
const JuzProgressCard = ({ juzProgress }) => {
  if (!juzProgress) return null;

  const { summary, completedJuz, inProgressJuz } = juzProgress;

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Book className="w-8 h-8" />
        <h3 className="text-2xl font-bold">Progress Hafalan Juz</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm opacity-90">Juz Selesai</p>
          </div>
          <p className="text-3xl font-bold">{summary.completedJuz}</p>
          <p className="text-xs opacity-75">dari 5 juz</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5" />
            <p className="text-sm opacity-90">Dalam Progress</p>
          </div>
          <p className="text-3xl font-bold">{summary.inProgressJuz}</p>
          <p className="text-xs opacity-75">juz sedang dihafal</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5" />
            <p className="text-sm opacity-90">Total Halaman</p>
          </div>
          <p className="text-3xl font-bold">{summary.totalHalamanDihafal}</p>
          <p className="text-xs opacity-75">dari 104 halaman</p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm opacity-90">Progress Total</p>
          </div>
          <p className="text-3xl font-bold">{summary.percentageTotal}%</p>
          <p className="text-xs opacity-75">keseluruhan</p>
        </div>
      </div>

      {/* Completed Juz */}
      {completedJuz.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Juz yang Sudah Selesai ({completedJuz.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {completedJuz.map((juz) => (
              <span
                key={juz}
                className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold"
              >
                Juz {juz}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Juz */}
      {inProgressJuz.length > 0 && (
        <div>
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Juz Sedang Dihafal ({inProgressJuz.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inProgressJuz.map((juz) => (
              <div
                key={juz.juz}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">Juz {juz.juz}</span>
                  <span className="text-sm font-bold">{juz.percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/30 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-300 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${juz.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs opacity-90">
                  <span>{juz.completedPages} halaman</span>
                  <span>Sisa {juz.remainingPages}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {completedJuz.length === 0 && inProgressJuz.length === 0 && (
        <div className="text-center py-8 opacity-75">
          <Book className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p className="text-lg">Belum ada hafalan yang tercatat</p>
          <p className="text-sm">Mulai hafalan untuk melihat progress</p>
        </div>
      )}
    </div>
  );
};

// Hafalan Card
const HafalanCard = ({ hafalan }) => (
  <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all">
    {/* GARIS STATUS */}
    <div
      className={`h-1.5 ${
        hafalan.status === "LULUS"
          ? "bg-green-500"
          : hafalan.status === "MENGULANG"
            ? "bg-yellow-500"
            : "bg-gray-400"
      }`}
    />

    <div className="p-5">
      {/* HEADER HAFALAN */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-blue-600" />
            <h4 className="font-bold text-gray-800 text-lg">{hafalan.surah}</h4>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Ayat {hafalan.ayat_mulai} - {hafalan.ayat_selesai}
          </p>

          {/* Tampilkan Halaman */}
          {hafalan.halaman_awal && (
            <p className="text-gray-500 text-xs mt-1">
              📖 Halaman {hafalan.halaman_awal}
              {hafalan.halaman_akhir &&
              hafalan.halaman_akhir !== hafalan.halaman_awal
                ? ` - ${hafalan.halaman_akhir}`
                : ""}
              {hafalan.juz && ` (Juz ${hafalan.juz})`}
            </p>
          )}
        </div>

        {/* STATUS */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            hafalan.status === "LULUS"
              ? "bg-green-100 text-green-700"
              : hafalan.status === "MENGULANG"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {hafalan.status}
        </span>
      </div>

      {/* DETAIL */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Award size={14} className="text-purple-600" />
          <span className="font-medium">{hafalan.jenis}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} className="text-blue-600" />
          <span>
            {new Date(hafalan.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {hafalan.guru?.nama && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={14} className="text-green-600" />
            <span>Ustadz/ah {hafalan.guru.nama}</span>
          </div>
        )}

        {/* HISTORY HAFALAN */}
        {Array.isArray(hafalan.history) && hafalan.history.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={14} className="text-purple-600" />
              Riwayat Hafalan ({hafalan.history.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {hafalan.history.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col gap-1 text-xs bg-gray-50 p-3 rounded-lg border"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {new Date(h.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        h.status === "LULUS"
                          ? "bg-green-100 text-green-700"
                          : h.status === "MENGULANG"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>

                  <div className="text-gray-600">
                    <span className="font-medium">{h.surah}</span>
                    {" • "}
                    <span>
                      Ayat {h.ayat_mulai} - {h.ayat_selesai}
                    </span>
                  </div>

                  {h.halaman_awal && (
                    <div className="text-gray-500">
                      📖 Halaman {h.halaman_awal}
                      {h.halaman_akhir && h.halaman_akhir !== h.halaman_awal
                        ? ` - ${h.halaman_akhir}`
                        : ""}
                      {h.juz && ` (Juz ${h.juz})`}
                    </div>
                  )}

                  {h.catatan && (
                    <div className="text-gray-600 italic mt-1">
                      💬 {h.catatan}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// DASHBOARD
export default function WalisantriDashboard({ initialData }) {
  const [pageBySantri, setPageBySantri] = useState({});

  const handlePageChange = (santriId, page) => {
    setPageBySantri((prev) => ({
      ...prev,
      [santriId]: page,
    }));
  };
  const itemsPerPage = 6;

  return (
    <div className="min-h-screen  px-6 py-10">
      {initialData.santri.map((santri) => {
        const currentPage = pageBySantri[santri.id] || 1;
        const totalPages = Math.ceil(santri.hafalan.length / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentHafalan = santri.hafalan.slice(
          startIndex,
          startIndex + itemsPerPage,
        );

        return (
          <div key={santri.id} className="mb-12">
            {/* Header Santri */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{santri.nama}</h2>
                  <p className="opacity-90">Kelas {santri.kelas}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Hafalan</p>
                  <p className="text-4xl font-bold">
                    {santri.juzProgress.summary.completedJuz}
                  </p>
                </div>
              </div>
            </div>

            {/* Juz Progress Card */}
            {santri.juzProgress && (
              <JuzProgressCard juzProgress={santri.juzProgress} />
            )}

            {/* Hafalan List */}
            {santri.hafalan.length > 0 ? (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Daftar Hafalan
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentHafalan.map((h) => (
                    <HafalanCard key={h.id} hafalan={h} />
                  ))}
                </div>

                {/* Pagination per santri */}
                <ModernPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => handlePageChange(santri.id, page)}
                />
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Belum Ada Hafalan
                </h3>
                <p className="text-gray-500">
                  Hafalan akan muncul setelah disetujui oleh guru
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
