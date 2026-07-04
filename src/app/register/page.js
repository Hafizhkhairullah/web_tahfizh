"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "WALISANTRI",
    nama: "",
    alamat: "",
    no_hp: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 4) {
      newErrors.username = "Username minimal 4 karakter";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (!formData.nama) {
      newErrors.nama = "Nama lengkap wajib diisi";
    }

    if (formData.role === "WALISANTRI") {
      if (!formData.alamat) {
        newErrors.alamat = "Alamat wajib diisi";
      }
      if (!formData.no_hp) {
        newErrors.no_hp = "Nomor HP wajib diisi";
      } else if (!/^08[0-9]{8,11}$/.test(formData.no_hp)) {
        newErrors.no_hp = "Format nomor HP tidak valid (08xxxxxxxxxx)";
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSuccessMessage("");

  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        nama: formData.nama,
        alamat: formData.alamat,
        no_hp: formData.no_hp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ form: data.error || "Terjadi kesalahan" });
      return;
    }

    // SUCCESS
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      role: "WALISANTRI",
      nama: "",
      alamat: "",
      no_hp: "",
    });

    setSuccessMessage(data.message || "User berhasil dibuat!");
  } catch (error) {
    console.error(error);
    setErrors({ form: "Gagal terhubung ke server" });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 ">
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 md:px-12 py-10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-block p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Daftar Akun Baru
              </h1>
              <p className="text-blue-100 text-lg">
                Buat akun baru untuk mengakses Dashboard Mutaba'ah
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 md:px-12 py-10">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.form && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{errors.form}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["WALISANTRI", "GURU", "ADMIN"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                        formData.role === role
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {role === "WALISANTRI"
                        ? "Wali Murid"
                        : role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username & Nama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Masukkan username"
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.username
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nama Lengkap
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.nama
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                      }`}
                    />
                  </div>
                  {errors.nama && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nama}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Masukkan password"
                      className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.password
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Konfirmasi Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi password"
                      className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Conditional Fields - Walisantri */}
              {formData.role === "WALISANTRI" && (
                <div className="space-y-6 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Alamat Lengkap
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder="Masukkan alamat lengkap"
                        rows="3"
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all resize-none ${
                          errors.alamat
                            ? "border-red-300 bg-red-50 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                        }`}
                      />
                    </div>
                    {errors.alamat && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.alamat}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nomor HP / WhatsApp
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="tel"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleChange}
                        placeholder="08123456789"
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                          errors.no_hp
                            ? "border-red-300 bg-red-50 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500 focus:bg-blue-50/30"
                        }`}
                      />
                    </div>
                    {errors.no_hp && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.no_hp}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <label className="text-sm text-gray-700 leading-relaxed">
                  Saya setuju dengan{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    syarat dan ketentuan
                  </a>{" "}
                  yang berlaku
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menambahkan Akun...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Tambah Akun Baru</span>
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
