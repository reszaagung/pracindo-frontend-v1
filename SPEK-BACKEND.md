# SPEK BACKEND — kontrak API Pracindo ERP

Diperbarui terhadap backend `pracindo_backend_v1` yang berjalan sekarang.

Versi sebelumnya ditulis terhadap backend lama (app `purchase_order`,
`stock_raw`, `entitas.Akun`, `RiwayatPembayaranPO`). Struktur itu sudah
tidak ada. Koreksinya di §9.

---

## 1. Status per modul

| Modul | Model | Service | Endpoint |
|---|---|---|---|
| `staff_user` | ada | ada | **ada** |
| `warehouse` | ada | ada | **ada** |
| `akunting` | ada | ada | **ada** |
| `core` | ada | ada | sengaja tanpa endpoint |
| `inventory` | ada | ada | **ada** |
| `produksi` | ada | ada | belum |
| `master` | ada | ada | **ada** |
| `dokumen` | ada | — | belum |
| `keuangan` | ada | sebagian | sebagian, lewat akunting |
| `sales_order` | **kosong** | — | belum |
| `logistik` | **kosong** | — | belum |
| `pajak` | **kosong** | — | belum |
| `work_order` | **kosong** | — | belum |

Yang bertanda **ada** boleh langsung dipakai. Sisanya jangan ditembak —
akan `404`, bukan `403`.

---

## 2. Aturan lintas modul

**Autentikasi DRF Token, bukan JWT.** Header `Authorization: Token xxx`.
Kata kuncinya `Token`, bukan `Bearer`. Umur 12 jam, tidak diperpanjang
aktivitas. Logout menghapus barisnya; tidak ada blacklist.

**Semua daftar berpaginasi.** `{ count, next, previous, results }`,
`PAGE_SIZE=25`. Selalu unwrap `.results`.

**Desimal dikirim sebagai STRING.** `"1500000.00"`, bukan angka. Ini
disengaja — float JavaScript kehilangan presisi di nilai Rupiah besar.

**Akses modul dari backend.** `GET auth/portal/` mengembalikan daftar
modul yang boleh dimasuki. Jangan menulis aturan role di kode Vue.

**Gudang tidak pernah menerima harga.** `harga_per_kg`, `amount`,
`total_nilai`, `nilai_selisih`, `nilai_klaim` tidak ada di respons modul
warehouse — bukan bernilai null, memang tidak ada di serializer-nya.

---

## 3. Endpoint yang SUDAH ADA

### 3.1 Auth — `/api/auth/`

| Metode | Path | Payload |
|---|---|---|
| POST | `login/` | `{ username, password }` |
| POST | `register/` | `{ nama_lengkap, username, email, telepon, password }` |
| POST | `logout/` | kosong |
| GET | `portal/` | — |
| POST | `ganti-password/` | `{ password_lama, password_baru }` |
| GET | `profil/saya/` | — |
| GET | `profil/menunggu/` | Supervisor |
| POST | `profil/{id}/aktifkan/` | Supervisor |
| POST | `profil/{id}/tolak/` | Supervisor |
| GET/POST | `jabatan/` | |

`daftar/` adalah alias `register/`.

Respons login: `{ token, profil, modul }`. `modul` berisi
`[{ kode, label, ikon, rute }]`.

Kode gagal: `401` kredensial salah, `403` akun belum disetujui.
Pendaftaran menghasilkan akun **nonaktif** sampai Supervisor menyetujui.

**`GET portal/`** — `PortalView` di `staff_user/views.py`, dipanggil
setelah login (bukan cuma sekali saat masuk) untuk mengisi ulang `modul`
dan **entitas**. Respons punya tiga field:

```json
{
  "profil":  { "id": 3, "username": "budi", "nama": "Budi Santoso",
               "role": "AKUNTING", "nip": "PC-0012",
               "entitas_default": 1, "entitas_default_kode": "PT",
               "is_active": true, "..." : "field lain di bawah" },
  "modul":   [{ "kode": "akunting", "label": "Akunting",
                "ikon": "buku", "rute": "/accounting" }],
  "entitas": [{ "id": 1, "kode": "PT", "nama": "PT Pracindo Jaya Makmur" }]
}
```

`entitas` berasal dari `entitas_terlihat()` dan **sudah tersaring** sesuai
izin pengguna — jangan filter ulang di frontend, dan jangan bikin
endpoint/composable entitas terpisah. Entitas tinggal di app `core` dan
sengaja tidak diekspos sebagai resource tersendiri; ini satu-satunya
tempat mengambilnya.

**`profil` bukan cuma app `core`/PortalView — sumbernya `ProfilSerializer`
di `staff_user/serializers.py`.** Field lengkapnya (bukan cuma yang
ditampilkan di contoh di atas):

```
id, username, first_name, last_name, nama, email, nip, role, jabatan,
jabatan_nama, foto, nomor_hp, atasan, atasan_nama, entitas_default,
entitas_default_kode, entitas_diizinkan, status_kerja, tanggal_masuk,
tanggal_keluar, is_active, last_login
```

Dua jebakan yang sudah pernah bikin bug di frontend:

- **`nama` sudah jadi nama tampil** (`CharField(source='nama_lengkap')`
  di serializer) — key JSON-nya `nama`, bukan `nama_lengkap`. Field
  `nama_lengkap` **tidak pernah muncul** di respons; jangan cari itu.
- **`entitas_default_kode` sudah flat di root `profil`**, bukan nested
  di `profil.akun.kode`. Tidak ada objek `akun` di respons ini sama
  sekali.
- `role_display` **tidak dikirim backend** — `role` mentah saja
  (enum). Kalau butuh label tampil, turunkan di frontend dari `role`.

### 3.2 Master — `/api/master/`

| Metode | Path |
|---|---|
| GET/POST | `suplier/` |
| GET/POST | `produk/` |
| GET/POST | `kategori/` |
| GET/POST | `satuan/` |
| GET/POST | `pelanggan/` |

Baca terbuka untuk siapa pun yang login. Tulis (POST/PATCH) hanya
`ADMIN` dan `SUPERVISOR` — role lain dapat `403`. Itu bukan bug; sembunyikan
tombol tambah/ubah di UI untuk role tanpa izin alih-alih membiarkan
pengguna menekan lalu kena `403`.

Query param yang didukung `suplier/` dan `produk/`: `?ringkas=1`
(bentuk ramping untuk dropdown, lewat `get_serializer_class()`),
`?aktif=true` (django-filter `filterset_fields`), `?search=`.
`produk/` juga menerima `?jenis=` (django-filter, bukan logika kustom).

`?search=` **tidak menyisir field yang sama di semua resource** —
diverifikasi langsung dari `master/views.py`:

| Resource | `search_fields` |
|---|---|
| `produk/` | `kode`, `nama` |
| `suplier/` | `kode`, `nama`, `npwp`, `kontak_nama` |
| `kategori/`, `satuan/` | `kode`, `nama` |
| `pelanggan/` | `kode`, `nama`, `npwp` |

**Ejaan `suplier` satu p** — bukan `supplier`.

Bentuk respons:

```json
// suplier, ringkas=1
{ "id": 4, "kode": "SUP-004", "nama": "CV Sumber Makmur",
  "termin_hari_default": 30 }

// suplier, lengkap
{ "id": 4, "kode": "SUP-004", "nama": "CV Sumber Makmur",
  "npwp": "01.234.567.8-901.000", "pkp": true,
  "alamat": "Jl. Industri No. 12", "kontak_nama": "Budi Santoso",
  "kontak_hp": "081234567890", "email": "budi@sumbermakmur.co.id",
  "termin_hari_default": 30, "aktif": true }

// produk, ringkas=1
{ "id": 7, "kode": "ST-001", "nama": "Gula pasir",
  "satuan_kode": "kg", "jenis": "BAHAN_BAKU" }

// produk, lengkap
{ "id": 7, "kode": "ST-001", "nama": "Gula pasir",
  "kategori": 2, "kategori_nama": "Bahan baku gula",
  "satuan": 1, "satuan_kode": "kg", "jenis": "BAHAN_BAKU",
  "jenis_label": "Bahan baku", "disimpan_di_tanki": false,
  "aktif": true }
```

`jenis` produk: `BAHAN_BAKU`, `BARANG_JADI`, `KEMASAN`, `LAIN`.

Data contoh yang sudah ada di database dev: entitas PT/CV/AGUS/MARSINI,
suplier CV Sumber Makmur, produk `ST-001` dan dua produk uji berakhiran
`TEST`.

**`Satuan` ADALAH tabel master**, bukan `CharField` bebas — `Produk.satuan`
adalah FK ke sana.

**Kemasan bukan master data.** Dia enum `JenisKemasan` di
`warehouse.models`, dipakai saat penerimaan (§3.3), bukan lewat
`master/`.

### 3.3 Gudang — `/api/warehouse/`

| Metode | Path |
|---|---|
| GET | `po-siap-terima/` |
| GET/POST | `penerimaan/` |
| GET | `penerimaan/{id}/ringkasan/` |
| GET/POST | `laporan-selisih/` |
| GET | `laporan-selisih/terbuka/` |
| POST | `laporan-selisih/{id}/ajukan/` |
| POST | `laporan-selisih/{id}/selesaikan/` |
| POST | `laporan-selisih/{id}/tutup/` |
| GET/POST | `packaging/` |

**`GET po-siap-terima/`** — berpaginasi, `search_fields=['no_po','suplier__nama']`,
`filterset_fields=['suplier','entitas']`. Bukan daftar item datar — PO
dengan item bersarang:

```json
{ "id": 12, "no_po": "PO/PCJM/2026/VIII/0012", "tanggal": "2026-08-01",
  "entitas_kode": "PT", "suplier": 4, "suplier_nama": "CV Sumber Makmur",
  "status": "TERKIRIM", "tanggal_kirim_diminta": "2026-08-10", "catatan": "",
  "item": [{ "id": 33, "produk": 7, "produk_kode": "ST-001",
             "nama_item": "Gula pasir", "satuan": "kg",
             "qty_pesan": "500.000", "qty_diterima": "0.000",
             "sisa_qty": "500.000" }] }
```

`sisa_qty` adalah `qty_pesan − qty_diterima` (property model, read-only) —
itulah batas atas input timbang, bukan `qty_pesan`.

**`GET penerimaan/`** — berpaginasi, `search_fields=['nomor','no_surat_jalan','purchase_order__no_po']`,
`filterset_fields=['purchase_order','ada_selisih','tanggal']`. Bentuk
list (`PenerimaanListSerializer`): `{id, nomor, tanggal, po_nomor, suplier_nama, no_surat_jalan, ada_selisih}`.

**`POST penerimaan/`**

```json
{
  "po_id": 12,
  "no_surat_jalan": "SJ-2026-0891",
  "tanggal": "2026-08-01",
  "dokumen_id": 45,
  "catatan": "",
  "baris": [
    { "po_item_id": 33, "jenis_kemasan": "KARUNG",
      "jumlah_koli": 20, "isi_per_koli": "25.000",
      "qty_diterima": "498.500", "qty_ditolak": "0",
      "alasan_tolak": "" }
  ]
}
```

Tujuh field per baris. Yang **tidak** dikirim klien:
`grup_bahan_id` (diturunkan dari entitas PO), `tangki_id` (semua
penerimaan masuk rak), `no_kendaraan`, `nama_sopir`, dan harga apa pun.

`jenis_kemasan`: `KARUNG`, `DRUM`, `JERIGEN`, `DUS`, `SAK`, `CURAH`.
Selain `CURAH`, `jumlah_koli` dan `isi_per_koli` wajib.

Respons `201` membawa penerimaan **beserta laporan selisih yang terbit
otomatis** — tidak perlu request kedua:

```json
{ "penerimaan": {...},
  "laporan_selisih": [{ "nomor": "BAS/PCJM/2026/VIII/001",
                        "jenis": "BERAT_KURANG", "qty_selisih": "-1.500" }],
  "pesan": "1 laporan selisih terbit otomatis." }
```
"item": [
  { "id": 5, "nomor_lot": "ST-PT-0001", "nama_item": "Gula pasir",
    "qty_diterima": "498.500", ... }
]
Laporan terbit kalau selisih berat melebihi toleransi **0,5%** atau ada
qty ditolak.

Unggah surat jalan dilakukan lebih dulu lewat modul dokumen; `dokumen_id`
dikirim di payload ini. Jangan gabungkan upload file dengan POST
penerimaan — kegagalan transaksi akan meninggalkan berkas yatim.

**`GET penerimaan/{id}/ringkasan/`** — bukan lewat serializer, `services.ringkasan_penerimaan`
menulis `Response` manual (jadi bukan objek berpaginasi, ya, tapi
memang cuma satu objek):

```json
{ "nomor": "...", "tanggal": "...", "surat_jalan": "...", "po": "...",
  "suplier": "...", "entitas": "...", "total_koli": 20, "ada_selisih": true,
  "item": [{ "nama": "...", "kemasan": "KARUNG", "koli": 20, "isi_per_koli": "25.000",
             "deklarasi": "500.000", "timbang": "498.500", "ditolak": "0",
             "selisih_berat": "-1.500", "persen": "-0.30" }],
  "selisih": [{ "nomor": "...", "jenis": "BERAT_KURANG", "qty": "-1.500",
                "status": "DIBUKA", "resolusi": null, "klaim": null }] }
```

⚠ **Celah**: `selisih[].klaim` (nilai klaim Rupiah) ada di respons ini
**tanpa gerbang `?sisi=` maupun cek peran akunting** — beda dari semua
serializer lain di modul ini yang konsisten menyembunyikan uang dari
gudang. Ini kelihatannya bug backend, bukan desain sengaja. Frontend
gudang (`GoodsReceiptDetail.vue`) sengaja tidak merender field itu;
sebaiknya ditutup di backend, bukan ditambal terus-menerus di setiap
konsumen endpoint ini.

`laporan-selisih/` menerima `?sisi=akunting` untuk menambahkan
`nilai_selisih`, `resolusi`, `resolusi_label`, `nilai_klaim`,
`catatan_resolusi`, `diselesaikan_pada`. Berlaku hanya kalau **query
param terpasang DAN** `request.user.bisa_akses_modul('akunting')` —
tanpa salah satunya, diam-diam jatuh balik ke serializer gudang (tidak
error, cuma tidak menambahkan field-nya).

**`GET laporan-selisih/terbuka/`** — `@action` custom, **bukan berpaginasi**
(`Response` array polos, bukan `{results}`). Jangan unwrap `.results` di sini.

Permission per aksi **tidak seragam**: `ajukan/` cuma butuh akses modul
`warehouse` (siapa pun di gudang boleh submit klaim ke suplier).
`selesaikan/` dan `tutup/` menambah cek manual
`request.user.bisa_akses_modul('akunting')` → `403` tanpanya — itu
keputusan finansial, bukan fakta fisik, jadi memang lebih ketat dari `ajukan/`.

Resolusi: `TERIMA`, `POTONG`, `SUSULAN`, `RETUR`, `GANTI`.
`RETUR` belum didukung backend.

### 3.4 Akunting — `/api/akunting/`

| Metode | Path |
|---|---|
| GET/POST | `purchase-order/` |
| GET | `purchase-order/outstanding/` |
| GET | `purchase-order/preview-nomor/?entitas=1` |
| GET | `purchase-order/{id}/ringkasan/` |
| POST | `purchase-order/{id}/kirim/` |
| POST | `purchase-order/{id}/batalkan/` |
| POST | `purchase-order/{id}/ubah-item/` |
| GET | `faktur/` |
| GET | `faktur/draft-dari-penerimaan/{id}/` |
| POST | `faktur/dari-penerimaan/{id}/` |
| GET | `faktur/jatuh-tempo/?entitas=1` |
| GET | `faktur/aging/?entitas=1` |
| POST | `pembayaran/` |
| GET | `uang-muka/` |
| GET | `jurnal/` |
| POST | `jurnal/{id}/balik/` |
| GET | `akun/` |

**`POST purchase-order/`**

```json
{ "entitas_id": 1, "suplier_id": 4, "tanggal": "2026-08-01",
  "tanggal_kirim_diminta": "2026-08-10", "catatan": "",
  "items": [{ "produk_id": 7, "qty_pesan": "500",
              "harga_per_kg": "12500", "satuan": "kg" }] }
```

PO lahir `DRAFT`. Item hanya bisa diubah saat DRAFT; setelah `kirim/`
terkunci. `batalkan/` butuh `{ alasan }` dan ditolak kalau sudah ada
penerimaan.

**`POST faktur/dari-penerimaan/{id}/`**

```json
{ "nomor_faktur": "INV-8891", "tanggal_faktur": "2026-08-03",
  "total_tagihan": "6231250.00", "termin_hari": 30,
  "dokumen_id": 46, "catatan": "" }
```

Panggil `draft-dari-penerimaan/{id}/` lebih dulu untuk mengisi form.
Responsnya berisi `nilai_penerimaan`, `potongan_klaim`,
`usulan_total_tagihan`, `termin_hari_default`, dan `klaim_terbuka`.

Kalau masih ada klaim terbuka, penerbitan **ditolak** dengan daftar
nomornya. Supervisor bisa memaksa lewat `"abaikan_klaim_terbuka": true`;
non-Supervisor dapat `403`.

**`POST pembayaran/`** — modul **keuangan**, bukan akunting.

```json
{ "entitas_id": 1, "suplier_id": 4, "nominal": "5000000.00",
  "tanggal": "2026-09-02", "referensi": "TRF-8891" }
```

Dialokasikan FIFO ke faktur terbuka berdasarkan jatuh tempo. Kelebihan
otomatis jadi `UangMukaSuplier`.

### 3.5 Inventory — `/api/inventory/`

Semua di bawah **sudah hidup**, diverifikasi langsung dari
`inventory/views.py`/`serializers.py`. Semua `ReadOnlyModelViewSet` —
tidak ada create/update/delete lewat REST di luar tiga aksi POST khusus.

| Metode | Path | Permission |
|---|---|---|
| GET | `stok/`, `stok/{id}/` | modul `inventory` (GUDANG, PRODUKSI, AKUNTING, +Supervisor) |
| GET | `tangki/` | sama |
| GET | `mutasi/` | sama |
| GET | `posisi-klaim/` | sama |
| GET | `isi-pool/` | sama |
| GET | `nilai-ekuivalen/` | sama |
| GET | `verifikasi/` | **Supervisor only** |
| POST | `setor-ke-pool/` | **GUDANG, PRODUKSI** (bukan AKUNTING meski baca boleh) |
| POST | `klaim-hasil/` | **GUDANG, PRODUKSI** |
| POST | `opname/` | **Supervisor only** |

**Paginasi — dua bentuk pengecualian, bukan satu:**

- `stok/`, `tangki/`, `mutasi/`, `nilai-ekuivalen/` — berpaginasi normal (`{results}`).
- `posisi-klaim/` — **array polos**, bukan lewat serializer/paginator sama
  sekali (`list()` di-override, `Response(services.posisi_grup(grup_id))`
  langsung). **`?grup=` wajib** — `400` tanpanya.
- `isi-pool/` — bukan ViewSet, `APIView` polos. Respons **`{produk: [...], total_nilai}`**
  — array-nya ada di dalam key `produk`, bukan array di root. **`?grup=` wajib** — `400` tanpanya.

**`GET stok/`** — `?lapis=RAW|POOL|JADI`, `?grup=`, `?produk=`, dan
`?sisi=akunting` (gerbangnya sama seperti `laporan-selisih/`: query
param DAN `user.bisa_akses_modul('akunting')`).

Field list (tanpa `sisi`): `id, produk, produk_kode, grup_bahan,
grup_bahan_kode, lapis, lapis_label, tangki, tangki_kode, qty` — **tidak
ada** `nilai`/`harga_rata` sama sekali di bentuk ini (bukan null, memang
tidak dideklarasikan).

Dengan `?sisi=akunting`, ditambah `nilai` dan `harga_rata`
(`SerializerMethodField`). Untuk lapis **POOL**, kedua field itu tetap
muncul di JSON tapi **selalu `null`** (`obj.berpemilik` `False` untuk
POOL) — beda dari bentuk gudang yang field-nya memang tidak ada sama sekali.

`stok/{id}/` (retrieve) menambah **`kepemilikan`** — array `SaldoEntitas`:
`[{entitas, entitas_kode, qty}]`, plus `nilai` per baris kalau `?sisi=akunting`.
Untuk lapis POOL, `kepemilikan` **selalu `[]`** — `SaldoEntitas.clean()`
menolak baris di lapis POOL di level model, jadi datanya memang tidak
mungkin ada.

**`GET mutasi/`** — `?stok=`, `?jenis=` (django-filter `filterset_fields`).
Field: `id, stok, produk_kode, lapis, urutan, tanggal, jenis, jenis_label,
masuk, keluar, saldo_akhir, referensi, dibuat_pada`. `masuk`/`keluar`
dua field terpisah, bukan satu delta.

**`GET tangki/`** — `id, kode, nama, grup_bahan, grup_bahan_kode,
kapasitas_kg, isi_kg, produk_terisi, produk_terisi_kode,
ruang_kosong_kg, persen_terisi, aktif`.

**`GET posisi-klaim/?grup=`** — bentuk **list** (yang dipakai layar
posisi klaim) memakai nama field **beda dari nama model/retrieve**:

```json
[{ "entitas": "PT", "setor": "385", "ambil": "624", "bersih": "-239", "berhutang": true }]
```

`nilai_bersih` (nama field model & serializer `retrieve`) **tidak
dipakai di list** — di sini namanya `bersih`, plus `total_setor`/`total_ambil`
juga diringkas jadi `setor`/`ambil`, dan ada `berhutang` (boolean) siap pakai.

**`GET isi-pool/?grup=`**:

```json
{ "produk": [{ "produk": "GULA-001", "qty": "1.000", "tarif": "1", "nilai": "1" }],
  "total_nilai": "1" }
```
`qty` = sisa qty pool per produk, `tarif` = tarif ekuivalen yang dipakai,
`nilai` = `qty × tarif`. `total_nilai` = jumlah `nilai` semua produk di
grup itu — inilah yang harus sama dengan total `bersih` di `posisi-klaim/`
(§5, invariant "Jumlah posisi bersih = nilai sisa pool").

**`POST setor-ke-pool/`**: `{produk_id, grup_bahan_id, entitas_id, qty,
tanggal, referensi?, idem_key?, tangki_raw_id?, tangki_pool_id?}`

**`POST klaim-hasil/`**: `{produk_id, grup_bahan_id, entitas_id, qty,
tanggal, referensi?, idem_key?, tangki_pool_id?, nilai_perolehan?}`

**`POST opname/`**: `{produk_id, grup_bahan_id, lapis, qty_fisik,
tanggal, referensi?, idem_key?, tangki_id?, entitas_id?, nilai_penyesuaian?}`

**`idem_key`** — field **body**, bukan header, di ketiganya. Opsional;
kalau kosong backend membuat `f'{aksi}:{uuid.uuid4()}'` sendiri —
artinya **tanpa `idem_key` dari klien, retry TIDAK dianggap request yang
sama** (dedup asli terjadi lewat kolom unique `idempotency_key` di
`MutasiStok`/`MutasiKlaim`, dicocokkan ke `idem_key` yang dikirim).
Frontend WAJIB membuat `idem_key` sekali saat form dibuka, simpan di
state form, pakai ulang kalau submit gagal & dicoba lagi — jangan
dibuat baru di dalam handler submit.

Enum `MutasiStok.jenis`: `TERIMA`, `SETOR`, `PAKAI`, `HASIL`, `KLAIM`,
`KIRIM`, `RETUR`, `OPNAME`, `SUSUT`.

### 3.6 Status

`PurchaseOrder`: `DRAFT`, `TERKIRIM`, `SEBAGIAN`, `SELESAI`, `BATAL`
`FakturPembelian`: `BELUM_BAYAR`, `SEBAGIAN`, `LUNAS`, `BATAL`
`LaporanSelisih`: `DIBUKA`, `DIAJUKAN`, `DISEPAKATI`, `DISELESAIKAN`, `DITUTUP`
`SesiProduksi`: `DRAFT`, `BERJALAN`, `SELESAI`, `BATAL`

---

## 4. Alur penerimaan barang — apa yang terjadi di balik satu POST

`POST warehouse/penerimaan/` memicu **empat hal dalam satu transaksi
atomik**. Gagal satu, batal semua. Tidak pernah ada kondisi "stok sudah
naik tapi hutang belum tercatat".

| # | Yang terjadi | Efek yang terlihat frontend |
|---|---|---|
| 1 | Baris penerimaan dan itemnya tercatat | nomor GRN terbit |
| 2 | Stok RAW naik, pemilik = entitas PO | layar stok berubah |
| 3 | Jurnal Dr Persediaan / Cr GRNI | penerimaan bisa difakturkan |
| 4 | Laporan selisih terbit otomatis | muncul di respons |

Konsekuensi untuk UI: setelah `201`, layar stok dan daftar
belum-difaktur perlu di-refresh. Penerimaan itu **langsung** muncul di
`faktur/draft-dari-penerimaan/{id}/`.

### Tiga angka yang bisa berbeda

Form penerimaan **tidak boleh** hanya punya satu kolom qty.

| Angka | Asal | Dipakai untuk |
|---|---|---|
| qty PO | `po_item.sisa_qty` | batas atas input |
| qty deklarasi | `jumlah_koli x isi_per_koli` | kontrol, dihitung frontend |
| qty timbang | `qty_diterima` diketik operator | **stok dan nilai hutang** |

Yang masuk stok dan menjadi hutang **selalu qty timbang**. Deklarasi
hanya alat kontrol — dia yang membuat selisih berat bisa terdeteksi.

Tampilkan selisih secara langsung saat operator mengetik:

```
Deklarasi   20 karung x 25 kg  =  500,000 kg
Timbangan                         498,500 kg
Selisih                            -1,500 kg  (-0,30%)
```

### Dua jenis selisih, makna berbeda

| Jenis | Rumus | Artinya | Tindak lanjut |
|---|---|---|---|
| `BERAT_KURANG` | timbang − deklarasi | koli lengkap, isinya kurang | klaim ke suplier |
| `KURANG_KIRIM` | deklarasi − sisa PO | koli-nya memang kurang | kiriman susulan |
| `RUSAK` | `qty_ditolak` | mutu tidak diterima | retur atau ganti |

Backend menerbitkan `BERAT_KURANG` otomatis kalau melebihi toleransi
**0,5%**, dan `RUSAK` otomatis kalau ada `qty_ditolak`. `KURANG_KIRIM`
tidak otomatis — PO tetap terbuka, jadi kekurangan itu bukan selisih
melainkan sisa yang menunggu kiriman berikutnya.

### Barang ditolak tidak masuk hitungan PO

`qty_ditolak` **tidak** menambah `qty_diterima` di PO item. Sisa PO tetap
terbuka untuk pengganti, dan barang yang ditolak tidak pernah jadi milik
kita — jadi tidak pernah jadi hutang juga.

### Penerimaan bertahap

Satu PO boleh punya banyak penerimaan. Input dikunci ke `sisa_qty`,
**bukan** `qty_pesan`. Setelah penerimaan sebagian, PO berstatus
`SEBAGIAN` dan bisa diterima lagi.

Penerimaan **tidak bisa diubah atau dihapus** — jurnalnya sudah
terposting. Koreksi lewat laporan selisih manual (`POST
laporan-selisih/`) atau retur.

### Jalur klaim sampai faktur

```
Selisih terbit  ->  Ajukan ke suplier  ->  Selesaikan dengan resolusi
   (DIBUKA)           (DIAJUKAN)              (DISELESAIKAN)
```

Resolusi `POTONG` dengan `nilai_klaim` akan **mengurangi usulan tagihan**
di `draft-dari-penerimaan/`. Resolusi lain tidak mengubah nilai.

Faktur **menolak terbit** kalau masih ada laporan berstatus `DIBUKA`,
`DIAJUKAN`, atau `DISEPAKATI`. Pesannya berisi daftar nomor laporan.

---

## 5. Alur inventory — tiga lapis dan buku klaim

Endpoint bagian ini **sudah hidup** — lihat §3.5 untuk kontrak persisnya
(payload, `idem_key`, permission per peran). Bagian ini menjelaskan
modelnya supaya layar gudang, inventory, dan akunting tidak dibangun
dengan asumsi yang salah.

### Perpindahan antar lapis

| Fungsi | Dari | Ke | Kepemilikan | Endpoint |
|---|---|---|---|---|
| `terima_raw()` | suplier | RAW | melekat ke entitas PO | `POST warehouse/penerimaan/` |
| `setor_ke_pool()` | RAW | POOL | **dilepas**, jadi klaim + | `POST inventory/setor-ke-pool/` |
| `pakai_dari_pool()` | POOL | produksi | tidak ada | belum ada (internal produksi) |
| `hasil_ke_pool()` | produksi | POOL | tidak ada | belum ada (internal produksi) |
| `klaim_hasil()` | POOL | JADI | melekat lagi, klaim − | `POST inventory/klaim-hasil/` |

`pakai_dari_pool()`/`hasil_ke_pool()` tidak punya endpoint langsung —
dipicu dari siklus sesi produksi (§7.1), yang endpoint-nya sendiri
masih belum ada.

### Kenapa POOL tidak punya pemilik

Analoginya setoran bank. Lembar uang yang Anda setor bercampur di brankas
dan bukan milik Anda lagi, tapi Anda memegang saldo. POOL adalah
brankasnya; `MutasiKlaim` adalah buku saldonya.

`SaldoEntitas.clean()` **menolak** lapis POOL. Kalau ada layar yang
mencoba menampilkan "stok pool milik CV", itu salah konsep — yang ada
adalah "posisi klaim CV atas pool".

### Contoh perhitungan klaim

Tarif ekuivalen: gula 1 per gram, teh celup 50 per pcs.
Resep: 1 teh kemasan = 1 celup + 2 g gula, jadi nilainya 52.

Setoran:

| | Gula | Celup | Nilai setor |
|---|---|---|---|
| PT | 35 g | 7 | 35 + 350 = **385** |
| CV | 10 g | 15 | 10 + 750 = **760** |
| Pool | 45 g | 22 | 1.145 |

Kapasitas produksi: gula cukup untuk 22,5 unit, celup untuk 22 unit.
**Maksimum 22 unit, dibatasi celup**, sisa 1 g gula.

Pengambilan: PT 12 kemasan, CV 10 kemasan.

| | Setor | Ambil | Posisi bersih |
|---|---|---|---|
| PT | 385 | 12 x 52 = 624 | **−239** |
| CV | 760 | 10 x 52 = 520 | **+240** |
| Jumlah | | | **+1** |

Jumlah posisi bersih = 1, tepat sama dengan nilai sisa pool (1 g gula).
**PT berhutang 239 kepada CV.**

Ini bukan kebetulan — itu invariant sistemnya, dan jadi cara paling cepat
memeriksa apakah angka di layar benar.

### Kapasitas vs penyelesaian — jangan dicampur

**Kelayakan fisik**: berapa unit yang bisa diproduksi. `min()` atas
ketersediaan tiap bahan. Nilai ekuivalen **tidak berlaku** di sini —
klaim senilai Rp 50.000 tidak bisa jadi teh kemasan kalau celupnya habis.

**Penyelesaian finansial**: siapa berhutang berapa. Di sinilah
ekuivalensi bekerja; N produk x M entitas runtuh jadi M angka.

Layar produksi menampilkan yang pertama. Layar posisi klaim menampilkan
yang kedua. Jangan digabung dalam satu tabel.

### Nilai ekuivalen bukan harga

Tarif tetap untuk menyetarakan barang berbeda jenis. **Bukan harga
pasar, bukan harga perolehan.** Nilai perolehan rupiah disimpan terpisah
di `SaldoEntitas.nilai`.

Tarif yang dipakai **tersimpan di setiap baris `MutasiKlaim`**. Kalau
tarif gula naik tahun depan, setoran lama tetap tercatat dengan tarif
lamanya — perubahan tarif tidak pernah menulis ulang sejarah hutang.

Karena itu jangan pernah menghitung ulang nilai klaim di frontend dari
tarif yang berlaku sekarang. Pakai `nilai` yang dikirim backend.

---

## 6. Invariant — patokan kalau angka terlihat aneh

Backend menjaga enam invariant. Empat yang relevan untuk frontend:

| # | Invariant | Kalau melenceng |
|---|---|---|
| 1 | Jumlah `PosisiKlaim.nilai_bersih` = nilai sisa POOL per grup | perhitungan hutang antar entitas salah |
| 2 | Jumlah `SaldoEntitas.qty` = `Stok.qty` untuk RAW dan JADI | ada stok tanpa pemilik tercatat |
| 3 | `saldo_akhir[n]` = `saldo_akhir[n-1]` + masuk − keluar | rantai mutasi korup |
| 4 | Jumlah `sisa_hutang` faktur terbuka = saldo akun 2100 | buku pembantu dan buku besar tidak cocok |

Kalau layar menampilkan angka yang melanggar ini, **jangan dibulatkan
atau ditambal di frontend**. Itu tanda ada bug di backend, dan menutupinya
membuat masalahnya baru ketahuan saat audit.

Backend punya `verifikasi_kepemilikan()`, `verifikasi_pool_bersih()`,
`verifikasi_posisi_cache()`, dan `verifikasi_rantai_saldo()` untuk
memeriksanya. Endpoint-nya belum ada; untuk sekarang dijalankan dari
shell.


---

## 7. Model dan service ADA, endpoint belum

Bagian ini bukan usulan — logikanya sudah ditulis dan diuji. Yang kurang
hanya serializer, view, dan url. Kontrak di bawah mengikuti signature
service yang sudah ada, jadi jangan diubah bentuknya.

(Master §3.2 dan inventory §3.5 **sudah punya** endpoint sekarang.
Bagian ini cuma sisa untuk produksi.)

### 7.1 Produksi

```
GET  produksi/resep/            ?aktif=true
GET  produksi/kapasitas/        ?grup=1&produk=7  -> hitung_kapasitas()
GET  produksi/sesi/             ?status=
GET  produksi/sesi/{id}/
POST produksi/sesi/             -> buat_sesi()
POST produksi/sesi/{id}/mulai/  -> mulai_sesi()
POST produksi/sesi/{id}/selesai/ -> selesaikan_sesi()  { qty_hasil }
POST produksi/sesi/{id}/batal/  -> batalkan_sesi()     hanya saat DRAFT
```

`hitung_kapasitas()` mengembalikan `maksimum`, `pembatas` (bahan yang
membatasi), `rincian` per bahan, dan `sisa_bila_maksimum`.

**Kapasitas tidak pernah memakai nilai ekuivalen.** Murni `min()` atas
ketersediaan fisik. Klaim senilai Rp 50.000 tidak bisa jadi produk kalau
bahannya habis.

**Packaging bukan bagian dari sesi produksi.** Ada di
`warehouse/packaging/`, dikerjakan gudang. Sesi selesai cukup dengan
`{ qty_hasil }`.

Nama tabelnya `Resep`, bukan `formula`.

---

## 8. BELUM ADA sama sekali

Model kosong, tidak ada service, tidak ada endpoint. Bagian di bawah
adalah usulan yang belum dibangun; jangan ditembak dari frontend.

### 8.1 Sales order dan piutang

Polanya **cermin dari pembelian**, dan itu berarti:

```
FakturPenjualan   <- cermin FakturPembelian
KartuPiutang      <- cermin KartuHutang
alokasi_penerimaan_piutang()  <- cermin alokasi_pembayaran()
```

**BUKAN** `SalesOrder.status_pembayaran` + `RiwayatPembayaranSO`. Spek
lama menyarankan itu karena mencontoh `RiwayatPembayaranPO` di backend
lama — tapi model itu sudah dibuang, justru karena membayar langsung ke
PO adalah kesalahan yang sama dengan menagih langsung ke SO.

Alasannya: SO adalah komitmen jual, bukan kejadian ekonomi. Piutang lahir
saat barang **dikirim**, bukan saat SO dibuat. Kalau `status_pembayaran`
ditempel ke SO, nilai piutang akan mengikuti total SO, bukan qty yang
benar-benar terkirim.

Simetri lengkapnya:

| Pembelian | Penjualan |
|---|---|
| PO terbit — tanpa jurnal | SO terbit — tanpa jurnal |
| Terima barang — Dr Persediaan / Cr GRNI | Kirim barang — Dr HPP / Cr Persediaan |
| Faktur masuk — Dr GRNI / Cr Hutang | Faktur terbit — Dr Piutang / Cr Penjualan |
| Bayar — Dr Hutang / Cr Kas | Terima — Dr Kas / Cr Piutang |

### 8.2 Logistik

Usulan `SuratJalan` di spek lama **masih berlaku** dan analisisnya bagus.
Tiga keputusan desainnya benar dan konsisten dengan pola penerimaan PO:

1. Partial delivery lewat banyak SJ per SO, dengan `kuantitas_terkirim`
   dan `status_pengiriman` — cermin `qty_diterima` dan status PO
2. Status kurir **diturunkan** dari SJ, bukan disimpan
3. Transisi status SO dimiliki logistik lewat kejadian fisik

Siklus: `DISIAPKAN` → `DALAM_PERJALANAN` → `TERKIRIM` (+ `DIBATALKAN`).
`kuantitas_terkirim` naik saat **berangkat**.

Bergantung pada `sales_order` yang juga belum ada.

### 8.3 Pajak, work order

Belum dimodelkan. `pajak` menunggu kepastian status PKP tiap entitas —
penomoran faktur pajak diatur DJP dan tidak boleh memakai 
`CounterDokumen`.

---

## 9. Koreksi terhadap spek lama

Tujuh hal yang berubah karena backend-nya berbeda.

**`Akun` bukan entitas.** Di backend lama `entitas.Akun` berarti unit
usaha. Sekarang `core.Entitas` adalah unit usaha, dan `akunting.Akun`
adalah **kode akun buku besar** (1100 Kas, 2190 GRNI, dst). Dua hal yang
sama sekali berbeda. Semua rujukan "akun CV" di spek lama berarti
"entitas CV".

**Empat entitas, dua pool bahan.** PT, CV, AGUS, MARSINI. PT punya pool
sendiri; CV, Agus, dan Marsini berbagi pool `BERSAMA`.

**Model waktu debit berubah total.** Spek lama:

> masuk tangki = fisik pindah, kepemilikan TETAP
> sesi SELESAI = saldo didebit

Yang berlaku sekarang: kepemilikan **dilepas saat setor ke pool** dan
berubah jadi klaim. Sesi produksi mengonsumsi dari pool yang memang sudah
tak bertuan. Penyelesaian siapa berhutang berapa terjadi lewat
`PosisiKlaim`, bukan lewat pendebitan saldo saat sesi selesai.

**`deviasi_invariant` tidak ada.** Penggantinya
`inventory.services.verifikasi_kepemilikan()` yang mengembalikan
`stok.qty − Σ kepemilikan`. Positif berarti ada stok fisik yang tidak
punya pemilik tercatat.

**Enum mutasi berbeda.** Bukan `PENERIMAAN`/`PEMAKAIAN`/`KOREKSI`, tapi
sembilan nilai di §3.5.

**Pembayaran tidak menempel ke PO.** Tidak ada `RiwayatPembayaranPO`,
tidak ada `PurchaseOrder.status_pembayaran`. Hutang hidup di
`FakturPembelian` dengan ledger `KartuHutang`, dan pembayaran
dialokasikan FIFO lintas faktur lewat `POST akunting/pembayaran/`.

**`Satuan` adalah tabel master**, `Kemasan` adalah enum. Spek lama
menyatakan sebaliknya.

---

## 10. Yang harus dikonfirmasi sebelum layar dibuat

**Arah selisih.** `verifikasi_kepemilikan()` mengembalikan
`stok.qty − Σ SaldoEntitas.qty`. Panel deviasi harus mengikuti arah ini.

**Akses tangki — DIKONFIRMASI.** `Tangki` ada di `inventory`
(`TangkiViewSet.permission_classes = [AksesModul]`, `modul='inventory'`),
terbuka untuk role `GUDANG`, `PRODUKSI`, `AKUNTING` (+Supervisor selalu
boleh). Layar monitor tangki hidup di `/inventory/tangki`
(`TankMonitor.vue`, modul frontend `inventory`) dan menembak
`inventory/tangki/` langsung — bukan di bawah `/warehouse`, dan bukan
`produksi/tanki/`.

**Nilai ekuivalen wajib diisi** sebelum setoran pool pertama.
`NilaiEkuivalen.tarif()` melempar error kalau produk belum punya tarif.

**Resep wajib ada** sebelum kapasitas bisa dihitung.