import { prisma } from "../config/client.ts";

/**
 * Error ketika data mahasiswa yang dicari tidak tersedia.
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;
  readonly code: string = "NOT_FOUND";

  constructor(message: string = "Mahasiswa tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Error apabila terdapat data yang memiliki nilai unik sama.
 */
export class ConflictError extends Error {
  readonly statusCode: number = 409;
  readonly code: string = "CONFLICT";

  constructor(message: string = "NIM sudah terdaftar") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Parameter yang digunakan untuk menyaring data mahasiswa.
 */
export interface MahasiswaFilter {
  prodi?: string;
  angkatan?: number;
}

/**
 * Format data yang dibutuhkan saat menambahkan mahasiswa.
 */
export interface CreateMahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

/**
 * Format data untuk mengubah informasi mahasiswa.
 */
export interface UpdateMahasiswaDTO {
  nama?: string;
  prodi?: string;
  angkatan?: number;
}

/**
 * Menampilkan seluruh mahasiswa berdasarkan filter yang diberikan.
 */
export const findAll = async (filters?: MahasiswaFilter) => {
  const where: { prodi?: string; angkatan?: number } = {};

  if (filters?.prodi && filters.prodi.trim() !== "") {
    where.prodi = filters.prodi.trim();
  }

  if (filters?.angkatan !== undefined) {
    where.angkatan = filters.angkatan;
  }

  const result = await prisma.mahasiswa.findMany({
    where: where,
    orderBy: {
      nim: "asc",
    },
  });

  return result;
};

/**
 * Mencari informasi mahasiswa menggunakan NIM.
 */
export const findByNim = async (nim: string) => {
  const result = await prisma.mahasiswa.findUnique({
    where: {
      nim: nim,
    },
  });

  if (result === null) {
    throw new NotFoundError(`Mahasiswa dengan NIM '${nim}' tidak ditemukan`);
  }

  return result;
};

/**
 * Menyimpan data mahasiswa baru ke dalam database.
 */
export const create = async (data: CreateMahasiswaDTO) => {
  try {
    const newMahasiswa = await prisma.mahasiswa.create({
      data: {
        nim: data.nim.trim(),
        nama: data.nama.trim(),
        prodi: data.prodi.trim(),
        angkatan: data.angkatan,
      },
    });

    return newMahasiswa;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new ConflictError(`NIM '${data.nim}' sudah terdaftar`);
    }

    throw error;
  }
};

/**
 * Mengubah informasi mahasiswa yang sudah tersimpan.
 */
export const update = async (nim: string, data: UpdateMahasiswaDTO) => {
  const updateData: {
    nama?: string;
    prodi?: string;
    angkatan?: number;
  } = {};

  if (data.nama !== undefined) {
    updateData.nama = data.nama.trim();
  }

  if (data.prodi !== undefined) {
    updateData.prodi = data.prodi.trim();
  }

  if (data.angkatan !== undefined) {
    updateData.angkatan = data.angkatan;
  }

  try {
    const updatedMahasiswa = await prisma.mahasiswa.update({
      where: {
        nim: nim,
      },
      data: updateData,
    });

    return updatedMahasiswa;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string };

      switch (prismaError.code) {
        case "P2025":
          throw new NotFoundError(
            `Mahasiswa dengan NIM '${nim}' tidak ditemukan`
          );

        case "P2002":
          throw new ConflictError("NIM sudah terdaftar");
      }
    }

    throw error;
  }
};

/**
 * Menghapus mahasiswa dari database berdasarkan NIM.
 */
export const deleteMahasiswa = async (nim: string) => {
  try {
    const deletedMahasiswa = await prisma.mahasiswa.delete({
      where: {
        nim: nim,
      },
    });

    return deletedMahasiswa;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      throw new NotFoundError(`Mahasiswa dengan NIM '${nim}' tidak ditemukan`);
    }

    throw error;
  }
};

export { deleteMahasiswa as delete };

/**
 * Menggabungkan seluruh fungsi service agar mudah digunakan.
 */
export const mahasiswaService = {
  findAll: findAll,
  findByNim: findByNim,
  create: create,
  update: update,
  delete: deleteMahasiswa,
};

export default mahasiswaService;