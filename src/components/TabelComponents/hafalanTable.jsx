import React from "react";

const HafalanTable = ({
  filteredData,
  hafalanList,
  santriList,
  surahList,
  editingId,
  editData,
  loading,
  setEditData,
  setEditingId,
  handleUpdate,
  handleEdit,
  handleViewHistory,
  handleDelete,
  getSantriName,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Siswa/i
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Surah
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ayat
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Halaman
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Catatan
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Juz
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData?.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
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
                      {hafalanList.length === 0
                        ? "Belum ada data hafalan"
                        : "Tidak ada data yang sesuai dengan filter"}
                    </p>
                    {hafalanList.length > 0 && (
                      <p className="text-gray-400 text-sm mt-2">
                        Coba ubah kriteria pencarian atau filter Anda
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredData?.map((h, index) => (
                <tr
                  key={h.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  {editingId === h.id ? (
                    <>
                      <td className="px-4 py-3">
                        <select
                          value={editData.santri_id}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              santri_id: e.target.value,
                            })
                          }
                          disabled
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        >
                          {santriList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nama} - Kelas {s.kelas}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={editData.tanggal}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              tanggal: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={editData.jenis}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              jenis: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        >
                          <option value="ZIYADAH">Ziyadah</option>
                          <option value="MUROJA">Muroja'ah</option>
                          <option value="TASMI">Tasmi'</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          list="surah-list-edit"
                          value={editData.surah}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              surah: e.target.value,
                            })
                          }
                          placeholder="Ketik atau pilih..."
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                        <datalist id="surah-list-edit">
                          {surahList.map((surah, index) => (
                            <option key={index} value={surah}>
                              {index + 1}. {surah}
                            </option>
                          ))}
                        </datalist>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            value={editData.ayat_mulai}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                ayat_mulai: e.target.value,
                              })
                            }
                            className="w-16 border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={editData.ayat_selesai}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                ayat_selesai: e.target.value,
                              })
                            }
                            className="w-16 border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              status: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        >
                          <option value="LULUS">Lulus</option>
                          <option value="MENGULANG">Mengulang</option>
                          <option value="BELUM_HAFALAN">Belum Hafalan</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            value={editData.halaman_awal || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                halaman_awal: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={editData.halaman_akhir || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                halaman_akhir: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.catatan}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              catatan: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editData.juz}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              juz: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 px-2 py-1.5 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdate(h.id)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {getSantriName(h.santri_id).charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {getSantriName(h.santri_id).split(" - ")[0]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getSantriName(h.santri_id).split(" - ")[1]}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(h.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            h.jenis === "ZIYADAH"
                              ? "bg-blue-100 text-blue-800"
                              : h.jenis === "MUROJA"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {h.jenis}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {h.surah}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {h.ayat_mulai} - {h.ayat_selesai}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            h.status === "LULUS"
                              ? "bg-green-100 text-green-800"
                              : h.status === "MENGULANG"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {h.halaman_awal ?? "-"} - {h.halaman_akhir ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {h.catatan || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {h.juz || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(h)}
                            className="group relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                            title="Edit"
                          >
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
                          </button>

                          <button
                            onClick={() => handleViewHistory(h.id)}
                            className="group relative p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                            title="Lihat Riwayat"
                          >
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(h.id)}
                            disabled={loading}
                            className="group relative p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {filteredData?.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan{" "}
              <span className="font-medium">{filteredData?.length}</span> dari{" "}
              <span className="font-medium">{hafalanList.length}</span> data
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HafalanTable;
