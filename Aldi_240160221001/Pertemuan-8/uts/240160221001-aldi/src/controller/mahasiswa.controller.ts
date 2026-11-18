
import type { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../service/mahasiswa.service.ts";
import type {
  MahasiswaFilter,
  CreateMahasiswaDTO,
  UpdateMahasiswaDTO,
} from "../service/mahasiswa.service.ts";

/**
 * Menampilkan semua data mahasiswa.
 * Filter dapat menggunakan prodi dan angkatan.
 * GET /mahasiswa
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: MahasiswaFilter = {};
    const { prodi, angkatan } = req.query;
    const tahunSekarang = new Date().getFullYear();

    if (prodi !== undefined) {
      const namaProdi = prodi;

      if (typeof namaProdi !== "string" || !namaProdi.trim()) {
        return res.status(400).json({
          success: false,
          message: "Prodi harus diisi dengan teks yang valid",
        });
      }

      filters.prodi = namaProdi.trim();
    }

    if (angkatan !== undefined) {
      if (typeof angkatan !== "string" || !/^[0-9]{4}$/.test(angkatan)) {
        return res.status(400).json({
          success: false,
          message: "Angkatan harus menggunakan format tahun 4 digit",
        });
      }

      const tahunMasuk = parseInt(angkatan, 10);

      if (tahunMasuk < 2000 || tahunMasuk > tahunSekarang) {
        return res.status(400).json({
          success: false,
          message: `Angkatan harus berada pada rentang 2000 sampai ${tahunSekarang}`,
        });
      }

      filters.angkatan = tahunMasuk;
    }

    const mahasiswa = await mahasiswaService.findAll(filters);

    res.status(200).json({
      success: true,
      total: mahasiswa.length,
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mengambil informasi mahasiswa berdasarkan NIM.
 * GET /mahasiswa/:nim
 */
export const getByNim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nimMahasiswa = req.params.nim;

    if (typeof nimMahasiswa !== "string" || !nimMahasiswa.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM tidak boleh kosong",
      });
    }

    const mahasiswa = await mahasiswaService.findByNim(
      nimMahasiswa.trim()
    );

    res.status(200).json({
      success: true,
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Menyimpan data mahasiswa baru.
 * POST /mahasiswa
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Format request body tidak valid",
      });
    }

    const { nim, nama, prodi, angkatan } = body;
    const tahunSekarang = new Date().getFullYear();

    const dataWajib = [
      { field: nim, name: "nim" },
      { field: nama, name: "nama" },
      { field: prodi, name: "prodi" },
    ];

    for (const item of dataWajib) {
      if (typeof item.field !== "string" || !item.field.trim()) {
        return res.status(400).json({
          success: false,
          message: `Field '${item.name}' wajib diisi dengan teks`,
        });
      }
    }

    if (
      typeof angkatan !== "number" ||
      !Number.isInteger(angkatan) ||
      angkatan < 2000 ||
      angkatan > tahunSekarang
    ) {
      return res.status(400).json({
        success: false,
        message: `Angkatan harus berupa angka bulat dari 2000 hingga ${tahunSekarang}`,
      });
    }

    const mahasiswaBaru: CreateMahasiswaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan: angkatan,
    };

    const hasil = await mahasiswaService.create(mahasiswaBaru);

    res.status(201).json({
      success: true,
      message: "Data mahasiswa berhasil disimpan",
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mengedit informasi mahasiswa berdasarkan NIM.
 * Data NIM tidak dapat diubah.
 * PATCH /mahasiswa/:nim
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nimMahasiswa = req.params.nim;
    const body = req.body;

    if (typeof nimMahasiswa !== "string" || !nimMahasiswa.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM mahasiswa tidak valid",
      });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON",
      });
    }

    if (Object.hasOwn(body, "nim")) {
      return res.status(400).json({
        success: false,
        message: "Perubahan NIM tidak diperbolehkan",
      });
    }

    const fieldDiizinkan = ["nama", "prodi", "angkatan"];
    const fieldDikirim = fieldDiizinkan.filter((key) =>
      Object.hasOwn(body, key)
    );

    if (fieldDikirim.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Masukkan minimal satu data yang akan diperbarui",
      });
    }

    const dataUpdate: UpdateMahasiswaDTO = {};
    const tahunSekarang = new Date().getFullYear();

    if (Object.hasOwn(body, "nama")) {
      if (typeof body.nama !== "string" || !body.nama.trim()) {
        return res.status(400).json({
          success: false,
          message: "Nama harus berupa teks dan tidak boleh kosong",
        });
      }

      dataUpdate.nama = body.nama.trim();
    }

    if (Object.hasOwn(body, "prodi")) {
      if (typeof body.prodi !== "string" || !body.prodi.trim()) {
        return res.status(400).json({
          success: false,
          message: "Program studi harus diisi dengan benar",
        });
      }

      dataUpdate.prodi = body.prodi.trim();
    }

    if (Object.hasOwn(body, "angkatan")) {
      const tahunMasuk = body.angkatan;

      if (
        typeof tahunMasuk !== "number" ||
        !Number.isInteger(tahunMasuk) ||
        tahunMasuk < 2000 ||
        tahunMasuk > tahunSekarang
      ) {
        return res.status(400).json({
          success: false,
          message: `Angkatan harus berupa bilangan bulat antara 2000 dan ${tahunSekarang}`,
        });
      }

      dataUpdate.angkatan = tahunMasuk;
    }

    const hasilUpdate = await mahasiswaService.update(
      nimMahasiswa.trim(),
      dataUpdate
    );

    res.status(200).json({
      success: true,
      message: "Informasi mahasiswa berhasil diubah",
      data: hasilUpdate,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Menghapus data mahasiswa menggunakan NIM.
 * DELETE /mahasiswa/:nim
 */
export const deleteMahasiswa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nimMahasiswa = req.params.nim;

    if (typeof nimMahasiswa !== "string" || !nimMahasiswa.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIM tidak boleh kosong",
      });
    }

    await mahasiswaService.delete(nimMahasiswa.trim());

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Alternatif nama untuk fungsi penghapusan
export { deleteMahasiswa as delete };

// Kumpulan fungsi controller mahasiswa
export const mahasiswaController = {
  getAll,
  getByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaController;
