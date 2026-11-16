import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

const mahasiswaRoutes = Router();

// Pengaturan endpoint utama untuk data mahasiswa
mahasiswaRoutes
  .route("/")
  .get(mahasiswaController.getAll)
  .post(mahasiswaController.create);

// Pengaturan endpoint berdasarkan NIM mahasiswa
mahasiswaRoutes
  .route("/:nim")
  .get(mahasiswaController.getByNim)
  .patch(mahasiswaController.update)
  .delete(mahasiswaController.delete);

// Export router agar dapat digunakan pada file utama
export { mahasiswaRoutes as router };
export default mahasiswaRoutes;