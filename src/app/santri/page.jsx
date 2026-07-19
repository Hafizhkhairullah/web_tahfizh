import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users, BookOpen, UserCheck, GraduationCap } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function SantriListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "GURU") {
    redirect("/unauthorized");
  }

  if (!session.user.guru_id) {
    redirect("/unauthorized");
  }

  const santriList = await prisma.santri.findMany({
    where: {
      guru_id: Number(session.user.guru_id),
    },
    include: {
      walisantri: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  const kelasList = [...new Set(santriList.map((santri) => santri.kelas))]
    .filter(Boolean)
    .sort();
  const waliCount = santriList.filter((santri) => santri.walisantri).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border-t-4 border-emerald-500 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Daftar Siswa/i
                </h1>
              </div>
              <p className="text-gray-600">
                Siswa/i yang terhubung dengan akun guru Anda.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {santriList.length} siswa/i terdaftar
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <Users className="mb-3 h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{santriList.length}</div>
            <div className="text-sm opacity-90">Total Siswa/i</div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <GraduationCap className="mb-3 h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{kelasList.length}</div>
            <div className="text-sm opacity-90">Jumlah Kelas</div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
            <UserCheck className="mb-3 h-8 w-8 opacity-80" />
            <div className="text-3xl font-bold">{waliCount}</div>
            <div className="text-sm opacity-90">Wali Siswa/i Terdaftar</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Data Siswa/i</h2>
            </div>
          </div>

          {santriList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                      Kelas
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                      Wali Siswa/i
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {santriList.map((santri) => (
                    <tr
                      key={santri.id}
                      className="transition-colors hover:bg-emerald-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {santri.nama}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {santri.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {santri.walisantri?.nama || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p>Belum ada siswa/i yang terhubung dengan guru ini.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
