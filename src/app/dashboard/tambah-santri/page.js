"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
} from "lucide-react";

export default function TambahSantri() {
  const [gurus, setGurus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [walisantris, setWalisantris] = useState([]);
  const [santriData, setSantriData] = useState({
    nama: "",
    tanggal_lahir: "",
    kelas: "",
    walisantri_id: "",
    guru_id: "",
  });

  // Ambil data wali santri saat mount
  useEffect(() => {
    async function fetchWalisantri() {
      try {
        const res = await fetch("/api/walisantri");
        const data = await res.json();
        if (res.ok) {
          setWalisantris(data.data || []);
        } else {
          console.error("Gagal mengambil data wali murid");
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchWalisantri();
  }, []);

  // Ambil data guru saat mount
  useEffect(() => {
    async function fetchGuru() {
      try {
        const res = await fetch("/api/guru");
        const data = await res.json();
        if (res.ok) {
          setGurus(data.data || []);
        }
      } catch (error) {
        console.error("Gagal fetch guru:", error);
      }
    }

    fetchGuru();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSantriData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!santriData.walisantri_id) {
      setMessage({ type: "error", text: "Silakan pilih wali murid" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/santri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(santriData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Santri berhasil ditambahkan!" });
        setSantriData({
          nama: "",
          tanggal_lahir: "",
          kelas: "",
          walisantri_id: "",
          guru_id: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Gagal menambahkan santri",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-3xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 md:px-12 py-10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-block p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Tambah Data Santri
              </h1>
              <p className="text-emerald-100 text-lg">
                Isi data santri dan pilih wali santri yang sudah terdaftar
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 md:px-12 py-10">
            {/* Message Alert */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span
                  className={
                    message.type === "success"
                      ? "text-green-800 font-medium"
                      : "text-red-800 font-medium"
                  }
                >
                  {message.text}
                </span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Nama Santri */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Santri <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="nama"
                    value={santriData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap santri"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all"
                  />
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={santriData.tanggal_lahir}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all"
                    />
                  </div>
                </div>

                {/* Kelas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                    <select
                      name="kelas"
                      value={santriData.kelas}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all appearance-none bg-white"
                    >
                      <option value="">Pilih Kelas</option>
                      <option value="1A">Kelas 1A</option>
                      <option value="1B">Kelas 1B</option>
                      <option value="2A">Kelas 2A</option>
                      <option value="2B">Kelas 2B</option>
                      <option value="3A">Kelas 3A</option>
                      <option value="3B">Kelas 3B</option>
                      <option value="4A">Kelas 4A</option>
                      <option value="4B">Kelas 4B</option>
                      <option value="5A">Kelas 5A</option>
                      <option value="5B">Kelas 5B</option>
                      <option value="6A">Kelas 6A</option>
                      <option value="6B">Kelas 6B</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guru Pembimbing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Guru Pembimbing <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                  <select
                    name="guru_id"
                    value={santriData.guru_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all appearance-none bg-white"
                  >
                    <option value="">Pilih Guru</option>
                    {gurus.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Wali Santri */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Wali Murid <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                  <select
                    name="walisantri_id"
                    value={santriData.walisantri_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all appearance-none bg-white"
                  >
                    <option value="">Pilih Wali Murid</option>
                    {walisantris.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama} - {w.no_hp}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Informasi Penting</p>
                    <p className="text-blue-700">
                      Pastikan semua data santri sudah benar sebelum menyimpan.
                      {/* Data yang sudah tersimpan dapat diubah melalui menu edit
                      santri. */}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Simpan Data Santri</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
