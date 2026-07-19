"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function HistoryHafalanClient({ hafalan, history, pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page) => {
    router.push(`/guru/hafalan-history/${hafalan.id}?page=${page}`);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border"
        }`}
      >
        ←
      </button>,
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border transition-colors"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2 text-gray-400">
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === i
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2 text-gray-400">
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border transition-colors"
        >
          {pagination.totalPages}
        </button>,
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
          currentPage === pagination.totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border"
        }`}
      >
        →
      </button>,
    );

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/guru/dashboard")}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-3 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali ke Daftar Hafalan
            </button>
            <h1 className="text-3xl font-bold">Riwayat Perubahan Hafalan</h1>
            <p className="text-white/90 mt-2">
              Lihat semua perubahan yang dilakukan pada hafalan ini
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* DATA HAFALAN TERKINI */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 py-8 px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Data Hafalan Terkini
            </h2>
            <p className="text-sm text-gray-500">Status hafalan saat ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Siswa/i</div>
            <div className="font-semibold text-gray-800">
              {hafalan.santri.nama}
            </div>
            <div className="text-sm text-gray-600">
              Kelas {hafalan.santri.kelas}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Tanggal</div>
            <div className="font-semibold text-gray-800">
              {new Date(hafalan.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Jenis Hafalan</div>
            <div className="font-semibold text-gray-800">{hafalan.jenis}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Surah</div>
            <div className="font-semibold text-gray-800">{hafalan.surah}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Ayat</div>
            <div className="font-semibold text-gray-800">
              {hafalan.ayat_mulai} - {hafalan.ayat_selesai}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                hafalan.status === "LULUS"
                  ? "bg-green-100 text-green-800"
                  : hafalan.status === "MENGULANG"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {hafalan.status}
            </span>
          </div>

          {(hafalan.halaman_awal || hafalan.halaman) && (
            <div className="bg-gray-50 p-4 rounded-xl border">
              <div className="text-xs text-gray-500 mb-1">Halaman</div>
              <div className="font-semibold text-gray-800">
                {hafalan.halaman_awal ?? hafalan.halaman}
                {hafalan.halaman_akhir &&
                hafalan.halaman_akhir !== hafalan.halaman_awal
                  ? ` - ${hafalan.halaman_akhir}`
                  : ""}
              </div>
            </div>
          )}

          {hafalan.catatan && (
            <div className="bg-gray-50 p-4 rounded-xl border md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Catatan</div>
              <div className="font-semibold text-gray-800">
                {hafalan.catatan}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 mb-1">Guru Pengampu</div>
            <div className="font-semibold text-gray-800">
              {hafalan.guru.nama}
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT PERUBAHAN */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Riwayat Perubahan
              </h2>
              <p className="text-sm text-gray-500">
                Total {pagination.totalItems} perubahan
              </p>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              Halaman {currentPage} dari {pagination.totalPages}
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 font-medium">
              Belum ada riwayat perubahan
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Perubahan akan muncul di sini setelah melakukan update
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {history.map((item, index) => {
                const globalIndex =
                  (currentPage - 1) * pagination.itemsPerPage + index;
                return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {globalIndex + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            Perubahan oleh: {item.guru.nama}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                        Update #{pagination.totalItems - globalIndex}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">
                          Tanggal
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(item.tanggal).toLocaleDateString("id-ID")}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Jenis</div>
                        <div className="text-sm font-medium text-gray-800">
                          {item.jenis}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Surah</div>
                        <div className="text-sm font-medium text-gray-800">
                          {item.surah}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Ayat</div>
                        <div className="text-sm font-medium text-gray-800">
                          {item.ayat_mulai} - {item.ayat_selesai}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "LULUS"
                              ? "bg-green-100 text-green-800"
                              : item.status === "MENGULANG"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {(item.halaman_awal || item.halaman) && (
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-xs text-gray-500 mb-1">
                            Halaman
                          </div>
                          <div className="text-sm font-medium text-gray-800">
                            {item.halaman_awal ?? item.halaman}
                            {item.halaman_akhir &&
                            item.halaman_akhir !== item.halaman_awal
                              ? ` - ${item.halaman_akhir}`
                              : ""}
                          </div>
                        </div>
                      )}

                      {item.catatan && (
                        <div className="bg-white p-3 rounded-lg border md:col-span-2">
                          <div className="text-xs text-gray-500 mb-1">
                            Catatan
                          </div>
                          <div className="text-sm font-medium text-gray-800">
                            {item.catatan}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <div className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                  -{" "}
                  {Math.min(
                    currentPage * pagination.itemsPerPage,
                    pagination.totalItems,
                  )}{" "}
                  dari {pagination.totalItems} data
                </div>
                <div className="flex gap-2">{renderPagination()}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
