import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

const mahasiswaRouter = Router();

/**
 * Routing untuk pengelolaan data mahasiswa
 */

// Menampilkan daftar mahasiswa
mahasiswaRouter.get("/", mahasiswaController.getAll);

// Menampilkan data mahasiswa sesuai NIM
mahasiswaRouter.get("/:nim", mahasiswaController.getByNim);

// Menyimpan mahasiswa baru
mahasiswaRouter.post("/", mahasiswaController.create);

// Mengubah sebagian informasi mahasiswa
mahasiswaRouter.patch("/:nim", mahasiswaController.update);

// Menghapus data mahasiswa berdasarkan NIM
mahasiswaRouter.delete("/:nim", mahasiswaController.delete);

// Export router agar dapat digunakan pada file utama aplikasi
export default mahasiswaRouter;
export { mahasiswaRouter as router };
