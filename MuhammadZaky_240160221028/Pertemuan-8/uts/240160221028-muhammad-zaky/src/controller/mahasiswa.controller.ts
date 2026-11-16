import type { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../service/mahasiswa.service.ts";
import type {
  MahasiswaFilter,
  CreateMahasiswaDTO,
  UpdateMahasiswaDTO,
} from "../service/mahasiswa.service.ts";

const currentYear = new Date().getFullYear();

// Memastikan request body berbentuk objek
const isValidBody = (body: unknown): body is Record<string, unknown> => {
  return typeof body === "object" && body !== null && !Array.isArray(body);
};

// Memvalidasi nilai teks
const isValidText = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

// Memvalidasi tahun angkatan
const isValidAngkatan = (value: unknown): value is number => {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 2000 &&
    value <= currentYear
  );
};

// Mengirim response error validasi
const badRequest = (res: Response, message: string) => {
  return res.status(400).json({
    success: false,
    message,
  });
};

// GET /mahasiswa
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: MahasiswaFilter = {};
    const { prodi, angkatan } = req.query;

    if (prodi !== undefined) {
      if (!isValidText(prodi)) {
        return badRequest(
          res,
          "Parameter query 'prodi' harus berupa teks yang tidak kosong"
        );
      }

      filters.prodi = prodi.trim();
    }

    if (angkatan !== undefined) {
      if (typeof angkatan !== "string" || !/^\d{4}$/.test(angkatan)) {
        return badRequest(
          res,
          "Parameter query 'angkatan' harus berupa tahun 4 digit, misalnya 2024"
        );
      }

      const year = Number(angkatan);

      if (!isValidAngkatan(year)) {
        return badRequest(
          res,
          `Parameter query 'angkatan' harus berada antara 2000 dan ${currentYear}`
        );
      }

      filters.angkatan = year;
    }

    const data = await mahasiswaService.findAll(filters);

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /mahasiswa/:nim
export const getByNim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (!isValidText(nim)) {
      return badRequest(res, "Parameter NIM harus berupa teks yang tidak kosong");
    }

    const data = await mahasiswaService.findByNim(nim.trim());

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// POST /mahasiswa
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isValidBody(req.body)) {
      return badRequest(res, "Request body harus berupa objek JSON yang valid");
    }

    const { nim, nama, prodi, angkatan } = req.body;

    if (!isValidText(nim)) {
      return badRequest(res, "Field 'nim' wajib diisi berupa teks dan tidak boleh kosong");
    }

    if (!isValidText(nama)) {
      return badRequest(res, "Field 'nama' wajib diisi berupa teks dan tidak boleh kosong");
    }

    if (!isValidText(prodi)) {
      return badRequest(res, "Field 'prodi' wajib diisi berupa teks dan tidak boleh kosong");
    }

    if (!isValidAngkatan(angkatan)) {
      return badRequest(
        res,
        `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${currentYear}`
      );
    }

    const payload: CreateMahasiswaDTO = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi: prodi.trim(),
      angkatan,
    };

    const data = await mahasiswaService.create(payload);

    return res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /mahasiswa/:nim
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (!isValidText(nim)) {
      return badRequest(res, "Parameter NIM harus berupa teks yang tidak kosong");
    }

    if (!isValidBody(req.body)) {
      return badRequest(res, "Request body harus berupa objek JSON yang valid");
    }

    if (Object.hasOwn(req.body, "nim")) {
      return badRequest(res, "Field 'nim' tidak dapat diubah melalui endpoint PATCH");
    }

    const fields = ["nama", "prodi", "angkatan"] as const;
    const payload: UpdateMahasiswaDTO = {};

    const hasField = fields.some((field) => Object.hasOwn(req.body, field));

    if (!hasField) {
      return badRequest(
        res,
        "Isi minimal satu field yang ingin diperbarui (nama, prodi, atau angkatan)"
      );
    }

    if (Object.hasOwn(req.body, "nama")) {
      const nama = req.body.nama;

      if (!isValidText(nama)) {
        return badRequest(res, "Field 'nama' harus berupa teks dan tidak boleh kosong");
      }

      payload.nama = nama.trim();
    }

    if (Object.hasOwn(req.body, "prodi")) {
      const prodi = req.body.prodi;

      if (!isValidText(prodi)) {
        return badRequest(res, "Field 'prodi' harus berupa teks dan tidak boleh kosong");
      }

      payload.prodi = prodi.trim();
    }

    if (Object.hasOwn(req.body, "angkatan")) {
      const angkatan = req.body.angkatan;

      if (!isValidAngkatan(angkatan)) {
        return badRequest(
          res,
          `Field 'angkatan' wajib berupa angka bilangan bulat antara 2000 dan ${currentYear}`
        );
      }

      payload.angkatan = angkatan;
    }

    const data = await mahasiswaService.update(nim.trim(), payload);

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /mahasiswa/:nim
export const deleteMahasiswa = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nim = req.params.nim;

    if (!isValidText(nim)) {
      return badRequest(res, "Parameter NIM harus berupa teks yang tidak kosong");
    }

    await mahasiswaService.delete(nim.trim());

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteMahasiswa as delete };

export const mahasiswaController = {
  getAll,
  getByNim,
  create,
  update,
  delete: deleteMahasiswa,
};

export default mahasiswaController;