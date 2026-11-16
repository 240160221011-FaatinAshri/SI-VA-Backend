import { Router } from "express";
import { mahasiswaController } from "../controller/mahasiswa.controller.ts";

const mahasiswaRouter = Router();

// Daftar dan tambah data mahasiswa
mahasiswaRouter
  .route("/")
  .get(mahasiswaController.getAll)
  .post(mahasiswaController.create);

// Detail, ubah, dan hapus data mahasiswa berdasarkan NIM
mahasiswaRouter
  .route("/:nim")
  .get(mahasiswaController.getByNim)
  .patch(mahasiswaController.update)
  .delete(mahasiswaController.delete);

export { mahasiswaRouter as router };
export default mahasiswaRouter;