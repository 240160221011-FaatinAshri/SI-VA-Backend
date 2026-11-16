import type { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../service/mahasiswa.service.ts";
import type {
  MahasiswaFilter,
  CreateMahasiswaDTO,
  UpdateMahasiswaDTO,
} from "../service/mahasiswa.service.ts";

/**
 * Mengambil seluruh informasi mahasiswa beserta filter pencarian.
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prodi, angkatan } = req.query;
    const filters: MahasiswaFilter = {};
    const tahunSekarang = new Date().getFullYear();

    // Memeriksa parameter program studi
    if (prodi !== undefined) {
      if (typeof prodi !== "string" || prodi.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'prodi' harus berupa teks yang tidak kosong",
        });
      }

      filters.prodi = prodi.trim();
    }

    // Memeriksa format tahun angkatan
    if (angkatan !== undefined) {
      if (typeof angkatan !== "string" || !/^\d{4}$/.test(angkatan)) {
        return res.status(400).json({
          success: false,
          message: "Parameter query 'angkatan' harus berupa tahun 4 digit, misalnya 2024",
        });
      }

      const tahunAngkatan = parseInt(angkatan, 10);

      if (
        !Number.isInteger(tahunAngkatan) ||
        tahunAngkatan < 2000 ||
        tahunAngkatan > tahunSekarang
      ) {
        return res.status(400).json({
          success: false,
          message: `Parameter query 'angkatan' harus berupa bilangan bulat antara 2000 dan ${tahunSekarang}`,
        });
      }

      filters.angkatan = tahunAngkatan;
    }

    const mahasiswa = await mahasiswaService.findAll(filters);

    return res.status(200).json({
      success: true,
      total: mahasiswa.length,
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Menampilkan data mahasiswa secara spesifik melalui NIM.
 */
export const getByNim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (typeof nim !== "string" || nim.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    const mahasiswa = await mahasiswaService.findByNim(nim.trim());

    return res.status(200).json({
      success: true,
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Memproses penambahan data mahasiswa baru.
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    const { nim, nama, prodi, angkatan } = req.body;
    const tahunSekarang = new Date().getFullYear();

    // Pemeriksaan data NIM
    if (typeof nim !== "string" || nim.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Pemeriksaan nama mahasiswa
    if (typeof nama !== "string" || nama.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'nama' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Pemeriksaan program studi
    if (typeof prodi !== "string" || prodi.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'prodi' wajib diisi berupa teks dan tidak boleh kosong",
      });
    }

    // Tahun angkatan harus berupa angka bulat dalam rentang yang ditentukan
    if (
      typeof angkatan !== "number" ||
      !Number.isInteger(angkatan) ||
      angkatan < 2000 ||
      angkatan > tahunSekarang
    ) {
      return res.status(400).json({
        success: false,
        message: `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${tahunSekarang}`,
      });
    }

    const mahasiswaBaru: CreateMahasiswaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan: angkatan,
    };

    const hasil = await mahasiswaService.create(mahasiswaBaru);

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Memperbarui informasi mahasiswa berdasarkan nomor induk mahasiswa.
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (typeof nim !== "string" || nim.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request body harus berupa objek JSON yang valid",
      });
    }

    // NIM hanya digunakan sebagai identitas dan tidak boleh diganti
    if (Object.hasOwn(req.body, "nim")) {
      return res.status(400).json({
        success: false,
        message: "Field 'nim' tidak dapat diubah melalui endpoint PATCH",
      });
    }

    const fields = ["nama", "prodi", "angkatan"];
    const fieldTersedia = fields.filter((item) =>
      Object.hasOwn(req.body, item)
    );

    if (fieldTersedia.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Isi minimal satu field yang ingin diperbarui (nama, prodi, atau angkatan)",
      });
    }

    const dataUpdate: UpdateMahasiswaDTO = {};
    const tahunSekarang = new Date().getFullYear();

    // Memeriksa perubahan nama
    if (Object.hasOwn(req.body, "nama")) {
      const nama = req.body.nama;

      if (typeof nama !== "string" || nama.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Field 'nama' harus berupa teks dan tidak boleh kosong",
        });
      }

      dataUpdate.nama = nama.trim();
    }

    // Memeriksa perubahan program studi
    if (Object.hasOwn(req.body, "prodi")) {
      const prodi = req.body.prodi;

      if (typeof prodi !== "string" || prodi.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Field 'prodi' harus berupa teks dan tidak boleh kosong",
        });
      }

      dataUpdate.prodi = prodi.trim();
    }

    // Memeriksa perubahan tahun angkatan
    if (Object.hasOwn(req.body, "angkatan")) {
      const angkatan = req.body.angkatan;

      if (
        typeof angkatan !== "number" ||
        !Number.isInteger(angkatan) ||
        angkatan < 2000 ||
        angkatan > tahunSekarang
      ) {
        return res.status(400).json({
          success: false,
          message: `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${tahunSekarang}`,
        });
      }

      dataUpdate.angkatan = angkatan;
    }

    const hasilUpdate = await mahasiswaService.update(
      nim.trim(),
      dataUpdate
    );

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: hasilUpdate,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Menghapus data mahasiswa yang dipilih berdasarkan NIM.
 */
export const deleteMahasiswa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (typeof nim !== "string" || nim.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter NIM harus berupa teks yang tidak kosong",
      });
    }

    await mahasiswaService.delete(nim.trim());

    // Mengirim status 204 apabila penghapusan berhasil
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Menyediakan fungsi hapus dengan nama delete
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