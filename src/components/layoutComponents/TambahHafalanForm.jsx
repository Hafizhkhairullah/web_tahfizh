"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import HafalanTable from "../TabelComponents/hafalanTable";
import Pagination from "../TabelComponents/Pagination";
// Add custom CSS for animations
const animationStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes progressBar {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }
  
  .animate-progressBar {
    animation: progressBar 4s linear;
  }
`;

export default function TambahHafalanForm({ santriList }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hafalanList, setHafalanList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Inject styles on mount
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const kelasList = [...new Set(santriList.map((s) => s.kelas))].sort();

  const [newHafalan, setNewHafalan] = useState({
    santri_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "ZIYADAH",
    surah: "",
    ayat_mulai: "",
    ayat_selesai: "",
    halaman: "",
    catatan: "",
    status: "LULUS",
  });

  const [editData, setEditData] = useState({});

  // Alert State
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  // Mapping nama surah ke nomor surah
  const surahNumberMap = {
    "Al-Fatihah": 1,
    "Al-Baqarah": 2,
    "Al-Mujadilah": 58,
    "Al-Hashr": 59,
    "Al-Mumtahanah": 60,
    "As-Saff": 61,
    "Al-Jumu'ah": 62,
    "Al-Munafiqun": 63,
    "At-Taghabun": 64,
    "At-Talaq": 65,
    "At-Tahrim": 66,
    "Al-Mulk": 67,
    "Al-Qalam": 68,
    "Al-Haqqah": 69,
    "Al-Ma'arij": 70,
    Nuh: 71,
    "Al-Jinn": 72,
    "Al-Muzzammil": 73,
    "Al-Muddaththir": 74,
    "Al-Qiyamah": 75,
    "Al-Insan": 76,
    "Al-Mursalat": 77,
    "An-Naba'": 78,
    "An-Nazi'at": 79,
    Abasa: 80,
    "At-Takwir": 81,
    "Al-Infitar": 82,
    "Al-Mutaffifin": 83,
    "Al-Inshiqaq": 84,
    "Al-Buruj": 85,
    "At-Tariq": 86,
    "Al-A'la": 87,
    "Al-Ghashiyah": 88,
    "Al-Fajr": 89,
    "Al-Balad": 90,
    "Ash-Shams": 91,
    "Al-Lail": 92,
    "Ad-Duha": 93,
    "Ash-Sharh": 94,
    "At-Tin": 95,
    "Al-'Alaq": 96,
    "Al-Qadr": 97,
    "Al-Bayyinah": 98,
    "Az-Zalzalah": 99,
    "Al-'Adiyat": 100,
    "Al-Qari'ah": 101,
    "At-Takathur": 102,
    "Al-'Asr": 103,
    "Al-Humazah": 104,
    "Al-Fil": 105,
    Quraish: 106,
    "Al-Ma'un": 107,
    "Al-Kawthar": 108,
    "Al-Kafirun": 109,
    "An-Nasr": 110,
    "Al-Masad": 111,
    "Al-Ikhlas": 112,
    "Al-Falaq": 113,
    "An-Nas": 114,
  };

  // Daftar Surah Al-Qur'an yang ada di Juz 1,2,28,29,30
  const surahList = Object.keys(surahNumberMap);

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", title: "", message: "" });
    }, 4000);
  };

  const fetchHafalan = async (page = 1, limit = itemsPerPage) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hafalan?page=${page}&limit=${limit}`);
      const response = await res.json();
      console.log(">>>>>", response.data);
      setHafalanList(response.data);
      setPagination(response.pagination);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error("Error fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHafalan(currentPage, itemsPerPage);
  }, []);

  const handlePageChange = (page, newLimit) => {
    if (newLimit) {
      setItemsPerPage(newLimit);
      fetchHafalan(page, newLimit);
    } else {
      fetchHafalan(page, itemsPerPage);
    }
  };

  // 🔍 FILTERING DATA
  const filteredData = useMemo(() => {
    return hafalanList?.filter((h) => {
      const santri = santriList.find((s) => s.id === h.santri_id);

      const matchSearch =
        santri?.nama.toLowerCase().includes(search.toLowerCase()) ||
        h.surah?.toLowerCase().includes(search.toLowerCase());

      const matchKelas = filterKelas === "" || santri?.kelas === filterKelas;
      const matchJenis = filterJenis === "" || h.jenis === filterJenis;

      return matchSearch && matchKelas && matchJenis;
    });
  }, [hafalanList, santriList, search, filterKelas, filterJenis]);

  const handleAddNew = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hafalan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newHafalan,
          santri_id: Number(newHafalan.santri_id),
          ayat_mulai: Number(newHafalan.ayat_mulai),
          ayat_selesai: Number(newHafalan.ayat_selesai),
          halaman_awal: newHafalan.halaman_awal
            ? Number(newHafalan.halaman_awal)
            : null,
          halaman_akhir: newHafalan.halaman_akhir
            ? Number(newHafalan.halaman_akhir)
            : null,
          surah_number: surahNumberMap[newHafalan.surah],
        }),
      });

      if (response.ok) {
        showAlert("success", "Berhasil!", "Data hafalan berhasil ditambahkan");
        setNewHafalan({
          santri_id: "",
          tanggal: new Date().toISOString().split("T")[0],
          jenis: "ZIYADAH",
          surah: "",
          ayat_mulai: "",
          ayat_selesai: "",
          halaman: "",
          catatan: "",
          status: "LULUS",
        });
        setIsAdding(false);
        fetchHafalan();
        router.refresh();
      } else {
        const err = await response.json();
        showAlert(
          "error",
          "Gagal Menambahkan",
          err.error || "Terjadi kesalahan saat menyimpan data",
        );
      }
    } catch (e) {
      showAlert(
        "error",
        "Terjadi Kesalahan",
        "Tidak dapat terhubung ke server",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (h) => {
    setEditingId(h.id);
    setEditData({
      santri_id: h.santri_id,
      tanggal: new Date(h.tanggal).toISOString().split("T")[0],
      jenis: h.jenis,
      surah: h.surah,
      ayat_mulai: h.ayat_mulai,
      ayat_selesai: h.ayat_selesai,
      halaman_awal: h.halaman_awal || "",
      halaman_akhir: h.halaman_akhir || "",
      catatan: h.catatan || "",
      status: h.status,
      juz: h.juz,
    });
  };

  const handleUpdate = async (id) => {
    if (!editData.surah || !editData.ayat_mulai || !editData.ayat_selesai) {
      showAlert(
        "warning",
        "Data Tidak Lengkap",
        "Mohon lengkapi semua field yang wajib diisi!",
      );
      return;
    }

    // Validasi halaman berurutan
    // const currentHafalan = hafalanList.find((h) => h.id === id);
    // const originalHalaman = currentHafalan?.halaman || null;
    // const newHalaman = editData.halaman ? Number(editData.halaman) : null;

    // if (originalHalaman && newHalaman) {
    //   if (
    //     newHalaman !== originalHalaman + 1 &&
    //     newHalaman !== originalHalaman
    //   ) {
    //     showAlert(
    //       "warning",
    //       "Halaman Tidak Valid",
    //       `Halaman harus berurutan! Halaman saat ini: ${originalHalaman}. Anda hanya bisa mengedit menjadi halaman ${
    //         originalHalaman + 1
    //       } atau tetap ${originalHalaman}.`
    //     );
    //     return;
    //   }
    // }

    setLoading(true);
    try {
      const response = await fetch(`/api/hafalan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          santri_id: Number(editData.santri_id),
          ayat_mulai: Number(editData.ayat_mulai),
          ayat_selesai: Number(editData.ayat_selesai),
          halaman_awal: editData.halaman_awal
            ? Number(editData.halaman_awal)
            : null,
          halaman_akhir: editData.halaman_akhir
            ? Number(editData.halaman_akhir)
            : null,
          surah_number: surahNumberMap[editData.surah],
        }),
      });

      if (response.ok) {
        showAlert(
          "success",
          "Berhasil Diupdate!",
          "Data hafalan berhasil diperbarui",
        );
        setEditingId(null);
        fetchHafalan();
        router.refresh();
      } else {
        const err = await response.json();
        showAlert(
          "error",
          "Gagal Update",
          err.error || "Tidak dapat memperbarui data",
        );
      }
    } catch {
      showAlert(
        "error",
        "Terjadi Kesalahan",
        "Tidak dapat terhubung ke server",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/hafalan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showAlert(
          "success",
          "Berhasil Dihapus!",
          "Data hafalan berhasil dihapus",
        );
        fetchHafalan();
        router.refresh();
      } else {
        showAlert("error", "Gagal Hapus", "Tidak dapat menghapus data");
      }
    } catch {
      showAlert(
        "error",
        "Terjadi Kesalahan",
        "Tidak dapat terhubung ke server",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (id) => {
    router.push(`/guru/hafalan-history/${id}`);
  };

  const getSantriName = (id) => {
    const s = santriList.find((x) => x.id === id);
    return s ? `${s.nama} - Kelas ${s.kelas}` : "-";
  };

  return (
    <div className="space-y-4">
      {/* MODERN PREMIUM ALERT */}
      {alert.show && (
        <div className="fixed bottom-5 right-4 z-50 animate-slideInRight">
          <div
            className={`min-w-[320px] max-w-md rounded-2xl shadow-2xl border-2 overflow-hidden transform transition-all duration-300 ${
              alert.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                : alert.type === "error"
                  ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                  : alert.type === "warning"
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    alert.type === "success"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : alert.type === "error"
                        ? "bg-gradient-to-br from-red-500 to-rose-600"
                        : alert.type === "warning"
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}
                >
                  {alert.type === "success" && (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {alert.type === "error" && (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  {alert.type === "warning" && (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                  {alert.type === "info" && (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-bold text-sm mb-1 ${
                      alert.type === "success"
                        ? "text-green-900"
                        : alert.type === "error"
                          ? "text-red-900"
                          : alert.type === "warning"
                            ? "text-yellow-900"
                            : "text-blue-900"
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className={`text-xs ${
                      alert.type === "success"
                        ? "text-green-700"
                        : alert.type === "error"
                          ? "text-red-700"
                          : alert.type === "warning"
                            ? "text-yellow-700"
                            : "text-blue-700"
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setAlert({ show: false, type: "", title: "", message: "" })
                  }
                  className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors ${
                    alert.type === "success"
                      ? "text-green-700"
                      : alert.type === "error"
                        ? "text-red-700"
                        : alert.type === "warning"
                          ? "text-yellow-700"
                          : "text-blue-700"
                  }`}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className={`mt-3 h-1 rounded-full overflow-hidden ${
                  alert.type === "success"
                    ? "bg-green-200"
                    : alert.type === "error"
                      ? "bg-red-200"
                      : alert.type === "warning"
                        ? "bg-yellow-200"
                        : "bg-blue-200"
                }`}
              >
                <div
                  className={`h-full animate-progressBar ${
                    alert.type === "success"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : alert.type === "error"
                        ? "bg-gradient-to-r from-red-500 to-rose-600"
                        : alert.type === "warning"
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Daftar Hafalan Siswa/i
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data hafalan siswa/i Anda
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isAdding
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            {isAdding ? (
              <>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Tutup Form
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Data Baru
              </>
            )}
          </span>
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-100 p-4 rounded-lg border">
        <input
          type="text"
          placeholder="🔍 Cari nama siswa/i / surah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">📚 Semua Kelas</option>
          {kelasList.map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </select>

        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">📖 Semua Jenis Hafalan</option>
          <option value="ZIYADAH">Ziyadah</option>
          <option value="MUROJA">Muroja'ah</option>
          <option value="TASMI">Tasmi'</option>
        </select>
      </div>

      {/* Info hasil filter */}
      {(search || filterKelas || filterJenis) && (
        <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded border border-blue-200">
          Menampilkan {filteredData?.length} dari {hafalanList.length} data
          {search && ` • Pencarian: "${search}"`}
          {filterKelas && ` • Kelas: ${filterKelas}`}
          {filterJenis && ` • Jenis: ${filterJenis}`}
        </div>
      )}

      {/* FORM TAMBAH */}
      {isAdding && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                Tambah Data Hafalan Baru
              </h4>
              <p className="text-xs text-gray-500">
                Lengkapi formulir di bawah ini
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Siswa/i *
              </label>
              <select
                value={newHafalan.santri_id}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, santri_id: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              >
                <option value="">Pilih Siswa/i</option>
                {santriList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} - Kelas {s.kelas}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tanggal *
              </label>
              <input
                type="date"
                value={newHafalan.tanggal}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, tanggal: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Jenis Hafalan *
              </label>
              <select
                value={newHafalan.jenis}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, jenis: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              >
                <option value="ZIYADAH">Ziyadah</option>
                <option value="MUROJA">Muroja'ah</option>
                <option value="TASMI">Tasmi'</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Surah *
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="surah-list-add"
                  placeholder="Ketik atau pilih surah..."
                  value={newHafalan.surah}
                  onChange={(e) =>
                    setNewHafalan({ ...newHafalan, surah: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400"
                />
                <datalist id="surah-list-add">
                  {surahList.map((surah, index) => (
                    <option key={index} value={surah}>
                      {index + 1}. {surah}
                    </option>
                  ))}
                </datalist>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Ayat Mulai *
              </label>
              <input
                type="number"
                placeholder="1"
                value={newHafalan.ayat_mulai}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, ayat_mulai: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Ayat Selesai *
              </label>
              <input
                type="number"
                placeholder="10"
                value={newHafalan.ayat_selesai}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, ayat_selesai: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-1 mt-2 ">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                Halaman awal *
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={newHafalan.halaman_awal || ""}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, halaman_awal: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-1 mt-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                Halaman akhir *
              </label>
              <input
                type="number"
                placeholder=""
                value={newHafalan.halaman_akhir || ""}
                onChange={(e) =>
                  setNewHafalan({
                    ...newHafalan,
                    halaman_akhir: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Status *
              </label>
              <select
                value={newHafalan.status}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, status: e.target.value })
                }
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
              >
                <option value="BELUM_HAFALAN">Belum Hafalan</option>
                <option value="LULUS">Lulus</option>
                <option value="MENGULANG">Mengulang</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2 lg:col-span-4">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Catatan
              </label>
              <textarea
                placeholder="Tambahkan catatan..."
                value={newHafalan.catatan}
                onChange={(e) =>
                  setNewHafalan({ ...newHafalan, catatan: e.target.value })
                }
                rows={3}
                className="w-full border-2 border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={loading}
              onClick={handleAddNew}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Simpan Data
                  </>
                )}
              </span>
            </button>

            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Batal
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TABEL DATA */}
      <HafalanTable
        filteredData={filteredData}
        hafalanList={hafalanList}
        santriList={santriList}
        surahList={surahList}
        editingId={editingId}
        editData={editData}
        loading={loading}
        setEditData={setEditData}
        setEditingId={setEditingId}
        handleUpdate={handleUpdate}
        handleEdit={handleEdit}
        handleViewHistory={handleViewHistory}
        handleDelete={handleDelete}
        getSantriName={getSantriName}
      />
      {!loading && hafalanList?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
