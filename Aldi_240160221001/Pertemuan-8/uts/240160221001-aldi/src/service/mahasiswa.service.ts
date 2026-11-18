
import { prisma } from "../config/client.ts";

// Error ketika data mahasiswa tidak tersedia
export class NotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message = "Data mahasiswa tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Error ketika terjadi data yang sama
export class ConflictError extends Error {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  constructor(message = "Data NIM telah digunakan") {
    super(message);
    this.name = "ConflictError";
  }
}

// Parameter untuk pencarian mahasiswa
export interface MahasiswaFilter {
  prodi?: string;
  angkatan?: number;
}

// Struktur data saat menambahkan mahasiswa
export interface CreateMahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

// Struktur data untuk proses perubahan
export interface UpdateMahasiswaDTO {
  nama?: string;
  prodi?: string;
  angkatan?: number;
}

// Menampilkan data mahasiswa dengan pencarian berdasarkan filter
export const findAll = async (filter?: MahasiswaFilter) => {
  const kondisi = {
    ...(filter?.prodi?.trim()
      ? { prodi: filter.prodi.trim() }
      : {}),
    ...(filter?.angkatan !== undefined
      ? { angkatan: filter.angkatan }
      : {}),
  };

  const hasil = await prisma.mahasiswa.findMany({
    where: kondisi,
    orderBy: {
      nim: "asc",
    },
  });

  return hasil;
};

// Mencari data mahasiswa menggunakan NIM
export const findByNim = async (nomorInduk: string) => {
  const hasil = await prisma.mahasiswa.findUnique({
    where: {
      nim: nomorInduk,
    },
  });

  if (hasil === null) {
    throw new NotFoundError(
      `Data mahasiswa dengan NIM '${nomorInduk}' tidak tersedia`
    );
  }

  return hasil;
};

// Menyimpan mahasiswa baru ke dalam database
export const create = async (payload: CreateMahasiswaDTO) => {
  const dataMahasiswa = {
    nim: payload.nim.trim(),
    nama: payload.nama.trim(),
    prodi: payload.prodi.trim(),
    angkatan: payload.angkatan,
  };

  try {
    const dataTersimpan = await prisma.mahasiswa.create({
      data: dataMahasiswa,
    });

    return dataTersimpan;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new ConflictError(
        `NIM '${payload.nim}' sudah digunakan oleh mahasiswa lain`
      );
    }

    throw err;
  }
};

// Mengubah informasi mahasiswa berdasarkan nomor induk
export const update = async (
  nomorInduk: string,
  payload: UpdateMahasiswaDTO
) => {
  const perubahan: UpdateMahasiswaDTO = {};

  const daftarField = ["nama", "prodi", "angkatan"] as const;

  for (const field of daftarField) {
    const nilai = payload[field];

    if (nilai !== undefined) {
      if (typeof nilai === "string") {
        perubahan[field] = nilai.trim();
      } else {
        perubahan[field] = nilai;
      }
    }
  }

  try {
    return await prisma.mahasiswa.update({
      where: {
        nim: nomorInduk,
      },
      data: perubahan,
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err) {
      if (err.code === "P2025") {
        throw new NotFoundError(
          `Mahasiswa dengan NIM '${nomorInduk}' tidak ditemukan`
        );
      }

      if (err.code === "P2002") {
        throw new ConflictError(
          "Terjadi duplikasi pada data mahasiswa"
        );
      }
    }

    throw err;
  }
};

// Menghilangkan data mahasiswa dari database
export const deleteMahasiswa = async (nomorInduk: string) => {
  try {
    const dataDihapus = await prisma.mahasiswa.delete({
      where: {
        nim: nomorInduk,
      },
    });

    return dataDihapus;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2025"
    ) {
      throw new NotFoundError(
        `Data mahasiswa dengan NIM '${nomorInduk}' tidak ditemukan`
      );
    }

    throw err;
  }
};

// Nama alternatif untuk fungsi delete
export { deleteMahasiswa as delete };

// Kumpulan method service mahasiswa
export const mahasiswaService = {
  findAll,
  findByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaService;
