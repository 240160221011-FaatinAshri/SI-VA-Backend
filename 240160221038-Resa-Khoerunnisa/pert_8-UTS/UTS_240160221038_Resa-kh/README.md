# Mini Project — Pertemuan 8 (UTS)

## Sistem Informasi Menu Kedai Kopi — Baloh Kopi Adhikari

Mini project backend berupa REST API untuk mengelola data menu pada usaha **Baloh Kopi Adhikari**. API ini menggunakan Node.js, Express.js 5, Prisma ORM 7, dan SQLite sebagai database.

Struktur project menggunakan pola **Service/Controller/Routes** atau tiga lapisan untuk memisahkan pengelolaan endpoint, proses request, dan operasi database.

## Identitas Mahasiswa

- **Nama:** Resa Khoerunnisa
- **NIM:** 240160221038
- **Program Studi:** Sistem Informasi

## Prasyarat

- Node.js 20+ (`node --version`)
- npm

## Menyiapkan dan Menjalankan

**1. Install dependencies**

```bash
npm install
```

**2. Buat file `.env`**

Salin file `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi database dan port jika diperlukan.

Contoh isi `.env.example`:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3008
```

**3. Jalankan migrasi database**

```bash
npm run prisma:migrate
```

**4. Generate Prisma Client**

```bash
npm run prisma:generate
```

**5. Jalankan server**

```bash
npm run dev
```

Server berjalan di:

`http://localhost:3008`

## Struktur Lapisan

```text
UTS_240160221038_Resa-kh/
├── app.ts
├── server.ts
├── client.ts
├── prisma.config.ts
├── package.json
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── generated/
└── src/
    ├── routes/
    │   └── menu.routes.ts
    ├── controller/
    │   └── menu.controller.ts
    └── service/
        └── menu.service.ts
```

**Keterangan:**

- `app.ts`: Mengatur middleware, route, 404, dan error handler.
- `server.ts`: Menjalankan aplikasi backend.
- `client.ts`: Mengatur koneksi Prisma Client dengan database.
- `prisma/`: Menyimpan skema database dan hasil migrasi.
- `menu.routes.ts`: Mengatur endpoint untuk resource menu.
- `menu.controller.ts`: Mengatur request, validasi input, dan response.
- `menu.service.ts`: Mengatur proses pengolahan data menggunakan Prisma.

**Alur request:**

Client → app.ts → menu.routes.ts → menu.controller.ts → menu.service.ts → Prisma Client → SQLite.

## Endpoint

Semua endpoint menggunakan resource `/menu`.

| Method | Endpoint | Deskripsi | Status Sukses |
|---|---|---|---|
| GET | `/health` | Memeriksa status server | 200 |
| GET | `/menu` | Menampilkan seluruh menu | 200 |
| GET | `/menu/:id` | Menampilkan detail menu | 200 |
| POST | `/menu` | Menambahkan menu | 201 |
| PATCH | `/menu/:id` | Mengubah data menu | 200 |
| DELETE | `/menu/:id` | Menghapus menu | 204 |

## Contoh Penggunaan API dengan cURL

Pengujian API dapat dilakukan menggunakan perintah cURL melalui terminal. Pastikan server sudah berjalan pada port 3008.

### 1. Health Check

```bash
curl -i http://localhost:3008/health
```

### 2. Menampilkan Seluruh Menu

```bash
curl -i http://localhost:3008/menu
```

### 3. Menampilkan Detail Menu

```bash
curl -i http://localhost:3008/menu/1
```

### 4. Menambahkan Menu

```bash
curl -i -X POST http://localhost:3008/menu \
-H "Content-Type: application/json" \
-d '{
  "nama": "Kopi Susu Aren",
  "kategori": "Kopi",
  "harga": 18000,
  "stok": 20,
  "tersedia": true
}'
```

### 5. Mengubah Data Menu

```bash
curl -i -X PATCH http://localhost:3008/menu/1 \
-H "Content-Type: application/json" \
-d '{
  "harga": 20000,
  "stok": 25
}'
```

### 6. Menghapus Menu

```bash
curl -i -X DELETE http://localhost:3008/menu/1
```

## Pengujian Validasi dan Error

### 1. Bad Request (400)

Pengujian dilakukan dengan mengirimkan data menu yang tidak valid, seperti nama kosong dan harga negatif.

```bash
curl -i -X POST http://localhost:3008/menu \
-H "Content-Type: application/json" \
-d '{
  "nama": "",
  "kategori": "Kopi",
  "harga": -1000,
  "stok": 20,
  "tersedia": true
}'
```

**Respons yang diharapkan:**

Status HTTP `400 Bad Request`.

```json
{
  "success": false,
  "message": "Data menu tidak valid"
}
```

### 2. Not Found (404)

Pengujian dilakukan dengan mencari data menu menggunakan ID yang tidak tersedia.

```bash
curl -i http://localhost:3008/menu/9999
```

**Respons yang diharapkan:**

Status HTTP `404 Not Found`.

```json
{
  "success": false,
  "message": "Menu tidak ditemukan"
}
```

## Validasi dan Kode Status HTTP

API menerapkan validasi pada endpoint POST dan PATCH untuk memastikan data yang dikirim sesuai ketentuan.

**Ketentuan validasi:**

- Nama menu harus berupa teks dan tidak boleh kosong.
- Kategori harus berupa teks dan tidak boleh kosong.
- Harga harus berupa angka bulat lebih dari 0.
- Stok harus berupa angka bulat minimal 0.
- Status ketersediaan harus berupa boolean.

**Kode status HTTP yang digunakan:**

| Status | Keterangan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil ditambahkan |
| 204 | Data berhasil dihapus |
| 400 | Data tidak valid |
| 404 | Data tidak ditemukan |
| 500 | Terjadi kesalahan pada server |

## Bukti Pengujian API

Bukti pengujian API disertakan dalam folder `bukti ss`.

Bukti yang perlu disertakan:

1. Hasil pengujian GET `/health`.
2. Hasil pengujian GET `/menu`.
3. Hasil pengujian GET `/menu/:id`.
4. Hasil pengujian POST `/menu`.
5. Hasil pengujian PATCH `/menu/:id`.
6. Hasil pengujian DELETE `/menu/:id`.
7. Hasil pengujian validasi 400 Bad Request.
8. Hasil pengujian 404 Not Found.

Screenshot menunjukkan proses pengujian dan respons yang diterima dari API.

## Skema Database

Database menggunakan SQLite yang terintegrasi dengan Prisma ORM.

Model `Menu` memiliki atribut:

- `id`: ID menu sebagai primary key.
- `nama`: Nama menu.
- `kategori`: Kategori menu.
- `harga`: Harga menu.
- `stok`: Jumlah stok menu.
- `tersedia`: Status ketersediaan menu.

Skema database terdapat pada file `prisma/schema.prisma`, sedangkan hasil migrasi tersimpan pada folder `prisma/migrations/`.

## Pengembangan Lanjutan

Proyek ini dapat dikembangkan dengan menambahkan beberapa fitur, seperti:

- Authentication untuk login dan pengelolaan hak akses.
- JWT untuk melindungi endpoint API.
- Pengelolaan stok bahan baku.
- Pencatatan transaksi penjualan.
- Laporan penjualan dan keuangan.
- Dokumentasi API menggunakan Swagger.

## Kesimpulan

Mini project ini menghasilkan REST API untuk pengelolaan data menu Baloh Kopi Adhikari. Sistem menerapkan operasi CRUD, validasi input, pemisahan struktur tiga lapisan, serta penyimpanan data menggunakan SQLite melalui Prisma ORM.