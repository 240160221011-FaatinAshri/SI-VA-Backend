import { prisma } from "../config/client.ts";

// Error ketika data mahasiswa tidak ditemukan
export class NotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message = "Data mahasiswa tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

// Error ketika terjadi duplikasi data
export class ConflictError extends Error {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  constructor(message = "NIM sudah digunakan") {
    super(message);
    this.name = "ConflictError";
  }
}

// Tipe data untuk pencarian mahasiswa
export interface MahasiswaFilter {
  prodi?: string;
  angkatan?: number;
}

// Tipe data untuk menambahkan mahasiswa
export interface CreateMahasiswaDTO {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

// Tipe data untuk mengubah data mahasiswa
export interface UpdateMahasiswaDTO {
  nama?: string;
  prodi?: string;
  angkatan?: number;
}

// Mengambil daftar mahasiswa berdasarkan filter
export const findAll = async (filters: MahasiswaFilter = {}) => {
  const { prodi, angkatan } = filters;

  return prisma.mahasiswa.findMany({
    where: {
      ...(prodi?.trim() ? { prodi: prodi.trim() } : {}),
      ...(angkatan !== undefined ? { angkatan } : {}),
    },
    orderBy: {
      nim: "asc",
    },
  });
};

// Mencari mahasiswa menggunakan NIM
export const findByNim = async (nim: string) => {
  const result = await prisma.mahasiswa.findUnique({
    where: { nim },
  });

  if (result === null) {
    throw new NotFoundError(
      `Mahasiswa dengan NIM '${nim}' tidak ditemukan`
    );
  }

  return result;
};

// Memeriksa kode error dari Prisma
const handlePrismaError = (error: unknown, nim: string): never => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;

    if (code === "P2002") {
      throw new ConflictError(`NIM '${nim}' sudah terdaftar`);
    }

    if (code === "P2025") {
      throw new NotFoundError(
        `Mahasiswa dengan NIM '${nim}' tidak ditemukan`
      );
    }
  }

  throw error;
};

// Menambahkan mahasiswa baru
export const create = async (data: CreateMahasiswaDTO) => {
  try {
    return await prisma.mahasiswa.create({
      data: {
        nim: data.nim.trim(),
        nama: data.nama.trim(),
        prodi: data.prodi.trim(),
        angkatan: data.angkatan,
      },
    });
  } catch (error) {
    handlePrismaError(error, data.nim);
  }
};

// Memperbarui informasi mahasiswa
export const update = async (
  nim: string,
  data: UpdateMahasiswaDTO
) => {
  const changes: UpdateMahasiswaDTO = {};

  if (data.nama !== undefined) {
    changes.nama = data.nama.trim();
  }

  if (data.prodi !== undefined) {
    changes.prodi = data.prodi.trim();
  }

  if (data.angkatan !== undefined) {
    changes.angkatan = data.angkatan;
  }

  try {
    return await prisma.mahasiswa.update({
      where: { nim },
      data: changes,
    });
  } catch (error) {
    handlePrismaError(error, nim);
  }
};

// Menghapus mahasiswa dari database
export const deleteMahasiswa = async (nim: string) => {
  try {
    return await prisma.mahasiswa.delete({
      where: { nim },
    });
  } catch (error) {
    handlePrismaError(error, nim);
  }
};

// Alias fungsi hapus
export { deleteMahasiswa as delete };

// Kumpulan fungsi service mahasiswa
const mahasiswaService = {
  findAll,
  findByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export { mahasiswaService };
export default mahasiswaService;