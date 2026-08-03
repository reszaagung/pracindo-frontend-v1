# Arsitektur RBAC — Pemetaan Otorisasi Modul (Frontend)

Laporan pemeriksaan, bukan perbaikan. Semua isi di bawah adalah keadaan
kode **saat file ini ditulis**. Tidak ada kode yang diubah untuk
menghasilkan laporan ini.

Legenda:
- **TERVERIFIKASI** — dibaca langsung dari kode di repo, atau dari respons
  server nyata.
- **DUGAAN** — masuk akal berdasarkan bacaan kode, tapi belum dibuktikan
  dengan menjalankan sesuatu.

---

## 1. Alur data otorisasi — langkah demi langkah

```
LoginView.vue                          useAuth.js login()
┌─────────────────────┐                ┌──────────────────────────────┐
│ handleLogin()        │  form.identifier│                              │
│                      │───password────▶│ POST auth/login/             │
│                      │                │ { username, password }       │
│                      │                │                              │
│                      │◀───{success,   │ const { data } = await       │
│                      │     data}──────│   api.post(...)               │
│                      │  data =        │ simpan(data)   ◀── (lihat     │
│                      │  {token,       │                    blok B)    │
│                      │   profil,      │ return { success:true, data } │
│                      │   modul}       │ (data.modul = MENTAH dari     │
│                      │  MENTAH        │  backend, TIDAK terpengaruh   │
│                      │  dari respons  │  override di simpan())        │
└──────────┬───────────┘                └──────────────────────────────┘
           │
           │ hasil.data.modul  (mentah, dari respons axios langsung)
           ▼
  daftarModul = modul.map(m => String(m.kode).toLowerCase())
  if includes('akunting')  -> router.push('/accounting')
  else if includes('warehouse') -> router.push('/warehouse')
  else -> router.push('/')          [LoginView.vue:152-163]


  ── Blok B: useAuth.js simpan(data) [useAuth.js:42-68] ──────────────
  token.value  = data.token
  profil.value = data.profil                      (utuh, tidak diubah)

  userRole = data.profil?.role || ''               [baris 51]
  overrideModul = MODUL_KATALOG
      .filter(m => m.roles && m.roles.includes(userRole))
      .map(m => ({ kode: m.id }))                  [baris 55-57]
  modulDiizinkan = overrideModul.length > 0
      ? overrideModul
      : (data.modul || [])                         [baris 61]

  modul.value = modulDiizinkan                      [baris 63]
  localStorage['modul'] = JSON.stringify(modulDiizinkan)


  ── Navigasi berikutnya: router/guards.js beforeEach ────────────────
  auth = useAuth()                                  [guards.js:12]
  jika rute publik & sudah login:
      daftarModul = auth.modul.value.map(m => m.kode)   [baris 16]
      (auth.modul di sini = modul.value HASIL OVERRIDE, bukan
       hasil.data.modul yang dipakai LoginView.vue — dua sumber
       berbeda, lihat §2)
  jika rute butuh login & belum login -> redirect /login
  jika rute punya meta.modul & !auth.bisaAkses(meta.modul)
      -> alert + blokir                             [guards.js:33-36]

  bisaAkses(kode) = modul.value.some(m => m.kode === kode)
                                                     [useAuth.js:29]


  ── DashboardView.vue (route '/') ───────────────────────────────────
  const { kartu, logout } = useAuth()               [baris 77]
  ⚠ `modul` TIDAK didestrukturisasi dari useAuth() di sini.

  const modulSaya = computed(() =>
      modulDariBackend(modul.value))                [baris 79]
  ⚠ `modulDariBackend` TIDAK diimpor (baris 73 cuma impor
    `MODUL as MODUL_KATALOG`).
  ⚠ `modul` bukan variabel yang ada di scope manapun di file ini.

  Template memakai `modulSaya` di v-for [baris 32] dan
  `modulSaya.length` [baris 36] — computed ini WAJIB dievaluasi saat
  render. Lihat §4 untuk detail kegagalannya.


  ── config/modules.js — sumber katalog UI + roles override ──────────
  MODUL = [{ id, nama, ringkas, ikon, rute, siap, roles, menu }, ...]
  modulDariBackend(modulBackend) mencocokkan modulBackend[].kode
      dengan cariModul(kode) yang mem-filter MODUL by `id`
      (TIDAK memakai field `roles` sama sekali — lihat §3)
```

---

## 2. Tabel pencocokan — apa yang dikirim backend vs apa yang dibaca frontend

| Titik | Field yang dibaca | Bentuk yang diharapkan (SPEK-BACKEND.md §3.1) | Status |
|---|---|---|---|
| `useAuth.js:51` — `simpan()` | `data.profil?.role` | String **UPPERCASE**, mis. `"AKUNTING"`, `"GUDANG"`, `"SUPERVISOR"` (contoh literal di SPEK-BACKEND.md baris 87: `"role": "AKUNTING"`) | TERVERIFIKASI |
| `config/modules.js:16` — daftar `roles` modul `akunting` | `roles: ['AKUNTAN', 'SUPERVISOR']` | — | TERVERIFIKASI (baca kode) |
| Pencocokan | `m.roles.includes(userRole)` di `useAuth.js:56` — membandingkan `'AKUNTAN'` (string di config) dengan `'AKUNTING'` (string dari backend) | String harus identik persis, case-sensitive (`.includes()` JS array, bukan pencarian longgar) | TERVERIFIKASI: `'AKUNTAN' !== 'AKUNTING'` — dua kata yang berbeda, bukan cuma beda huruf besar/kecil |
| `LoginView.vue:152` | `String(m.kode).toLowerCase()` dibandingkan ke literal `'akunting'` | `modul[].kode` dari backend: `"akunting"`, `"warehouse"`, dst. (SPEK-BACKEND.md baris 90) — sudah lowercase | TERVERIFIKASI cocok — tidak ada masalah case di titik ini |
| `useAuth.js:29` — `bisaAkses(kode)` | `modul.value.some(m => m.kode === kode)` | Membandingkan `m.kode` (dari `modul.value`, yang BISA berupa hasil override `{kode: m.id}` — lihat §1 blok B) dengan `kode` yang dikirim `guards.js`/`router meta.modul`, mis. `'akunting'`, `'warehouse'`, `'master'`, `'inventory'` | TERVERIFIKASI: kalau `modul.value` berasal dari override, `kode` di situ adalah `m.id` dari `config/modules.js` (mis. `'akunting'`) — SAMA persis dengan `id` yang dipakai di konfigurasi, karena override memetakan `m.id` langsung, bukan field independen |
| `config/modules.js:141-154` — `modulDariBackend()` | `cariModul(mb.kode)` mencocokkan lewat `MODUL.find(m => m.id === id)` [baris 139] | Mencocokkan **`id`** di katalog lokal dengan **`kode`** dari backend/`modul.value` | TERVERIFIKASI: `id` di katalog (`'akunting'`, `'warehouse'`, `'master'`, `'produksi'`, `'logistik'`, `'sales_order'`, `'work_order'`, `'inventory'`, `'keuangan'`, `'pajak'`, `'dokumen'`) — semuanya sudah dalam ejaan yang sama dengan `kode` backend yang didokumentasikan (`akunting`, bukan `accounting`; tidak ada modul bernama `rnd` atau `logistic` di katalog ini) |
| `config/modules.js:141-154` — `modulDariBackend()` | **TIDAK membaca field `roles` sama sekali** | — | TERVERIFIKASI: fungsi ini hanya memakai `nama`, `ikon`, `rute`, `ringkas`, `catatan`, `siap`, `menu` dari `cariModul()`. Properti `roles` yang ditambahkan di setiap entri `config/modules.js` adalah **field mati** dari sudut pandang fungsi ini — tidak pernah dibaca di sini |

**Ringkasan pertanyaan §2 dari instruksi:**

- Frontend membandingkan role dengan string **apa adanya dari backend** (`data.profil?.role`, tanpa transformasi kapitalisasi) — TAPI daftar `roles` yang dibandingkan di `config/modules.js` ditulis manual, dan untuk modul `akunting` ditulis `'AKUNTAN'`, bukan `'AKUNTING'`. Ini bukan soal Title Case vs UPPERCASE — keduanya sudah UPPERCASE, tapi **kata yang berbeda**. TERVERIFIKASI, `useAuth.js:56` + `config/modules.js:16`.
- Modul dicocokkan lewat `kode` (dari backend / `modul.value`) terhadap `id` di `config/modules.js`, lewat `cariModul()`/`modulDariBackend()`. Nilai `id` di katalog sudah konsisten dengan `kode` yang didokumentasikan backend (`akunting`, `warehouse`, `master`, `inventory`, dst) — TIDAK ditemukan mismatch penamaan seperti `accounting` vs `akunting` di titik pencocokan `id`/`kode` ini. TERVERIFIKASI.
- Ada tempat yang memfilter modul berdasarkan role di frontend: **`useAuth.js:53-61`, fungsi `simpan()`**, memakai field `roles` yang ditambahkan di **`config/modules.js`** (setiap entri `MODUL`, mis. baris 16, 29, 42, 55, dst). Ini persis bertentangan dengan SPEK-BACKEND.md baris 46-47: *"Akses modul dari backend... Jangan menulis aturan role di kode Vue."* TERVERIFIKASI.

---

## 3. Override dan mock yang ditemukan

| # | Lokasi | Mengubah apa | Akibat kalau backend sudah mengirim data yang benar |
|---|---|---|---|
| 1 | `useAuth.js:42-68`, fungsi `simpan()` | Menimpa `modul.value` (dan `localStorage['modul']`) dengan hasil filter `MODUL_KATALOG` berdasarkan `roles` di `config/modules.js`, alih-alih memakai `data.modul` dari backend apa adanya. Fallback ke `data.modul` cuma terjadi kalau hasil filter **kosong** (`overrideModul.length > 0 ? overrideModul : data.modul`, baris 61). | Kalau backend sudah benar, override ini **tetap jalan** selama ada minimal satu entri `roles` yang cocok dengan `userRole` — backend tidak pernah dilihat sebagai sumber kebenaran untuk kasus itu. Untuk modul `akunting` spesifik, karena `roles` di config salah eja (`AKUNTAN`), override untuk role `AKUNTING` selalu kosong dan JATUH BALIK ke `data.modul` asli — jadi untuk kasus `akunting` khusus, override ini **tidak berdampak** (baca §4). Untuk role lain yang string-nya kebetulan cocok (mis. `SUPERVISOR`, `GUDANG`), override **tetap aktif** dan menggantikan keputusan backend, termasuk untuk modul yang backend-nya belum tentu memberi akses (lihat §5). |
| 2 | `config/modules.js` — properti `roles` di setiap 11 entri `MODUL` (baris 16, 29, 42, 55, 66, 77, 88, 98, 112, 123, 134), ditambah komentar header baris 4-5 yang secara eksplisit menyatakan *"backend tidak mengembalikan hak akses dengan benar, penentuan akses di-override di frontend"* | Menyimpan aturan role di kode Vue — persis yang dilarang SPEK-BACKEND.md §2. | Field ini dibaca satu-satunya oleh `useAuth.js:56` (lihat baris di atas). `modulDariBackend()` di file yang sama TIDAK membacanya (§2) — jadi properti ini punya SATU konsumen aktif, bukan dua. |
| 3 | `useAuth.js:16-23` — peta `PERAN_LABEL`, entri `AKUNTAN: 'AKUNTAN'` (baris 22) | Menambahkan entri label tampilan untuk kunci `'AKUNTAN'`. | Field ini murni tampilan (`kartu.role_display`, dipakai `DashboardView.vue:23`). Karena `profil.value.role` yang dikirim backend adalah `'AKUNTING'` (bukan `'AKUNTAN'`), entri `AKUNTAN: 'AKUNTAN'` di peta ini **tidak pernah cocok** untuk pengguna beneran — `PERAN_LABEL[profil.value.role]` akan `undefined` untuk role `AKUNTING`, lalu jatuh ke fallback `|| profil.value.role` (baris 38), sehingga label yang tampil tetap `"AKUNTING"` apa adanya. Tidak menyebabkan crash, hanya menunjukkan entri peta ini ditambahkan berdasarkan asumsi ejaan yang sama (`AKUNTAN`) dengan yang dipakai di `config/modules.js`. |
| 4 | `src/mock/` + `src/utils/mock.js` (flag `pakaiMock`, `VITE_USE_MOCK`) | Menyediakan data statis HANYA untuk `useWorkOrder.js` (modul `work_order`, yang memang belum dimodelkan sama sekali di backend — SPEK-BACKEND.md §8.3). | Tidak menyentuh alur otorisasi modul (`modul`/`bisaAkses`/dashboard). Tidak relevan untuk dugaan "dashboard kosong untuk AKUNTING", dicatat di sini hanya karena termasuk kategori "override/mock data dari backend" yang diminta diperiksa. |
| 5 | `DashboardView.vue:86` — `useWorkOrder()` dipanggil tanpa argumen, hasilnya didestrukturisasi `{ hitungan, mading, terlambat, isLoading }` | `useWorkOrder()` (lihat `features/work-order/composables/useWorkOrder.js:19-...`) **tidak pernah mengembalikan properti `hitungan`** di objek return-nya. | Ini bukan override data backend, tapi dicatat karena termasuk "data statis di komponen" yang diminta diperiksa: `hitungan` akan selalu `undefined` di komponen ini. Dipakai di template baris 33: `:hitung="hitungan[m.id] || 0"`. Lihat §4 — baris ini tidak pernah tercapai saat ini karena crash lain terjadi lebih dulu, tapi ini bug laten kedua di jalur yang sama. |

Tidak ditemukan override lain (tidak ada override di `guards.js`, tidak
ada override di `router/index.js`, tidak ada `hitungan`/`mading` statis
berisi data modul-akses di file manapun selain yang dicatat di atas).

---

## 4. DIAGNOSIS — di baris mana persis pencocokan/render gagal

Ada **dua bug independen** di jalur ini. Keduanya ditemukan lewat baca
kode langsung, TERVERIFIKASI.

### Bug A — `DashboardView.vue` crash saat render (baris 77 + 79), berlaku untuk SEMUA role, bukan cuma AKUNTING

```js
// DashboardView.vue baris 68-79
import { useAuth } from '@/composables/useAuth'
import { useWorkOrder } from '@/features/work-order/composables/useWorkOrder'
import { MODUL as MODUL_KATALOG } from '@/config/modules'   // <- HANYA MODUL_KATALOG
import ModuleCard from '@/components/ModuleCard.vue'

const router = useRouter()
const { kartu, logout } = useAuth()                          // <- 'modul' TIDAK diambil

const modulSaya = computed(() => modulDariBackend(modul.value))  // <- BARIS 79
```

Dua identifier di baris 79 tidak ada di scope manapun pada file ini:

- `modulDariBackend` — tidak diimpor. Baris 73 hanya mengimpor
  `{ MODUL as MODUL_KATALOG }` dari `@/config/modules`, padahal
  `config/modules.js` juga mengekspor `modulDariBackend` (baris
  141-154 di file itu) — fungsi itu ada, tapi tidak diambil di sini.
- `modul` — tidak diimpor, tidak dideklarasikan lokal, dan tidak
  didestrukturisasi dari `useAuth()` (baris 77 hanya mengambil
  `kartu` dan `logout`). `useAuth()` memang mengembalikan `modul`
  (`useAuth.js:117`), tapi pemanggil di file ini tidak memintanya.

`computed()` di Vue dievaluasi malas (lazy) — baru dieksekusi saat
`.value`-nya diakses. Template mengakses `modulSaya` di dua tempat:
baris 32 (`v-for="m in modulSaya"`) dan baris 36
(`modulSaya.length < MODUL_KATALOG.length`). Begitu Vue merender
template ini, getter `computed` di baris 79 dieksekusi, dan JavaScript
akan melempar `ReferenceError` karena `modul` (argumen yang dievaluasi
lebih dulu sebelum `modulDariBackend` dipanggil) tidak terdefinisi.

Tidak ada `app.config.errorHandler` yang didaftarkan di `main.js`
(diperiksa, tidak ada), dan komponen ini tidak punya `onErrorCaptured`.
Tanpa penangan error kustom, kegagalan di dalam fase render Vue akan
membuat subtree komponen itu gagal ter-render — yang secara visual
sangat mungkin muncul sebagai "dashboard kosong".

**Ini bug yang berlaku untuk SEMUA pengguna yang benar-benar sampai ke
rute `/`, bukan spesifik role AKUNTING** — sifatnya murni cacat kode
statis (identifier tidak ada), bukan tergantung data/role apa yang
diterima dari backend. TERVERIFIKASI.

### Bug B — mismatch `AKUNTAN` vs `AKUNTING` di override (`useAuth.js:56` + `config/modules.js:16`)

```js
// config/modules.js baris 16
roles: ['AKUNTAN', 'SUPERVISOR'], // Ditambahkan
```
```js
// useAuth.js baris 51 & 55-57
const userRole = data.profil?.role || ''   // backend kirim "AKUNTING"
const overrideModul = MODUL_KATALOG
    .filter(m => m.roles && m.roles.includes(userRole))
    .map(m => ({ kode: m.id }))
```

Untuk pengguna dengan `profil.role === 'AKUNTING'`, `m.roles.includes('AKUNTING')`
akan `false` untuk SEMUA entri `MODUL_KATALOG` yang memakai `'AKUNTAN'`
(bukan `'AKUNTING'`) — yaitu modul `akunting`, `master`, `work_order`,
`keuangan`, `pajak`, `dokumen`. `overrideModul` untuk pengguna ini akan
kosong ATAU cuma berisi modul yang role-nya `GUDANG`/`SUPERVISOR`/dll
kebetulan tidak melibatkan `AKUNTAN` sama sekali dan memang tidak
seharusnya masuk. Karena `overrideModul.length > 0 ? ... : (data.modul || [])`
(baris 61), kalau hasilnya benar-benar kosong maka fallback ke
`data.modul` ASLI dari backend berjalan — artinya untuk kasus role
`AKUNTING` murni, bug ini **secara kebetulan tidak menyuntikkan data
salah**, ia cuma membuat override jadi tidak aktif dan diam-diam
mengembalikan ke data backend asli.

**Konsekuensinya: Bug B sendirian TIDAK cukup untuk menjelaskan
"dashboard kosong untuk AKUNTING".** Bahkan dengan `modul.value` berisi
data backend asli yang benar, Bug A tetap membuat `DashboardView.vue`
gagal render karena itu murni masalah kode, tidak bergantung pada isi
`modul.value`. Kedua bug ini TERVERIFIKASI ada di kode, tapi independen
satu sama lain — Bug A cukup sendirian untuk menjelaskan gejala yang
dilaporkan.

### Kenapa mungkin baru terlihat/dilaporkan lewat role AKUNTING — DUGAAN

`LoginView.vue:146-163` melakukan redirect segera setelah login,
memakai `hasil.data.modul` — ini array `modul` **mentah dari respons
axios**, BUKAN `modul.value` hasil `simpan()` (lihat §1 blok B: `data`
yang dikembalikan `login()` tidak pernah dimutasi oleh `simpan()`).
Kalau `data.modul` (asli backend) berisi `kode: 'akunting'`, pengguna
langsung diarahkan ke `/accounting` dan TIDAK PERNAH me-render
`DashboardView.vue` lewat alur login normal — Bug A tidak akan
terpicu di jalur itu.

Dashboard (`/`) baru ter-render kalau:
- pengguna secara manual membuka `/` (mengetik URL / menekan tautan
  "Semua modul" dari layar lain), atau
- `data.modul` dari backend TIDAK berisi `'akunting'` maupun
  `'warehouse'`, sehingga `LoginView.vue` baris 160-162 jatuh ke
  `router.push('/')`, atau
- `guards.js:24` mengembalikan `{ name: 'dashboard' }` sebagai
  fallback saat pengguna yang sudah login membuka `/login`/`/register`
  dan `daftarModul` (dari `modul.value` hasil override, bukan
  `data.modul` mentah) tidak mengandung `'akunting'`/`'warehouse'`.

Ini **DUGAAN**, bukan terverifikasi — tidak ada bukti langsung dari
kode tentang bagaimana pengguna AKUNTING yang melapor ini benar-benar
sampai ke `/`. Yang TERVERIFIKASI hanyalah bahwa begitu `/` ter-render,
Bug A pasti menyebabkan kegagalan render, untuk role apa pun.

### Bug laten ketiga (tidak tereksekusi saat ini) — `hitungan` undefined

`DashboardView.vue:86`: `const { hitungan, mading, terlambat, isLoading } = useWorkOrder()`.
`useWorkOrder()` tidak mengembalikan `hitungan` — lihat
`features/work-order/composables/useWorkOrder.js`, objek return di
akhir file tidak menyertakan key itu. Template baris 33 memakai
`hitungan[m.id]` di dalam `v-for="m in modulSaya"`. Kalau Bug A
diperbaiki tapi ini tidak, baris 33 akan melempar
`TypeError: Cannot read properties of undefined (reading 'id')` segera
setelah `modulSaya` berhasil dihitung — dashboard akan tetap gagal
render, dengan pesan error yang berbeda. TERVERIFIKASI ada di kode;
belum tereksekusi/teramati karena Bug A gagal lebih dulu.

---

## 5. Konsekuensi override — kalau frontend menambahkan modul yang tidak dikirim backend

**Alur render kartu:** `modulDariBackend(modul.value)` mengubah setiap
entri `modul.value` (baik dari backend asli maupun hasil override
`useAuth.js`) menjadi kartu, menggabungkan `siap`/`menu`/`ikon` dari
katalog lokal (`config/modules.js:141-154`). Fungsi ini **tidak
memeriksa lagi apakah backend benar-benar mengizinkan modul itu** — ia
percaya penuh pada isi `modul.value`.

**Alur klik kartu:** `ModuleCard.vue:10` merender `<router-link>` HANYA
kalau `modul.siap === true` (kalau `false`, dirender `<div>` biasa,
tidak bisa diklik — baris 10, 13, 21). Untuk modul yang override-nya
memasukkan modul dengan `siap: true` di katalog (saat ini: `akunting`,
`warehouse`, `master`, `inventory`), kartu itu benar-benar bisa diklik
dan menavigasi ke `rute` yang terdaftar.

**Yang terjadi setelah navigasi — dua lapis pemeriksaan independen:**

1. **Router guard (`guards.js:33-36`)** — memeriksa
   `auth.bisaAkses(to.meta.modul)`, yang membaca `modul.value` yang
   SAMA dengan yang baru saja dipakai untuk merender kartu (satu
   sumber state, `useAuth.js:10`). Karena kartu yang bisa diklik
   berasal dari `modul.value` itu sendiri, guard di titik ini **selalu
   meloloskan** navigasi untuk modul yang override tambahkan — guard
   sisi-klien tidak bisa menangkap kesalahan yang ia sendiri warisi
   dari sumber data yang sama. TERVERIFIKASI (baca kode, keduanya
   membaca `modul.value` yang sama).

2. **Endpoint backend yang ditembak layar tersebut** — TERVERIFIKASI
   dari sesi pemeriksaan backend sebelumnya (lihat SPEK-BACKEND.md
   §3.2, §3.3, §3.5): setiap ViewSet warehouse/inventory/master punya
   `permission_classes` sendiri di server (`AksesModul`,
   `GudangProduksi`, `HanyaSupervisor`, dll.) yang mengevaluasi
   **role asli pengguna** (dari token yang sama, sesi Django), bukan
   apa pun yang dikirim atau diasumsikan frontend. Kalau role asli
   pengguna tidak diizinkan modul itu di backend, setiap panggilan API
   dari layar yang "seharusnya tidak boleh dimasuki" itu akan
   menerima `403`, ditangani `bacaError()` (`utils/error.js:52`) yang
   mengembalikan pesan generik *"Kamu tidak punya akses untuk tindakan
   ini."* — bukan data.

**Kesimpulan poin 5:** Kartu/rute yang muncul karena override BISA
diklik dan BISA masuk ke layarnya (guard sisi-klien tidak menghalangi,
karena ia memakai sumber data yang sama dengan yang menghasilkan
kartunya). Tapi data sungguhan tidak akan pernah termuat kalau backend
sebenarnya menolak role itu untuk modul tersebut — layar akan tampil
kosong/berisi pesan galat 403 per-panggilan API, bukan membocorkan
data. Ini TERVERIFIKASI sebagai pola arsitektur umum (permission_classes
ada dan independen di backend untuk warehouse/inventory/master, sudah
diverifikasi langsung dari source `pracindo_backend_v1` di sesi
sebelumnya). Yang **DUGAAN** adalah kombinasi role-modul spesifik mana
yang saat ini benar-benar menghasilkan mismatch begini di
`config/modules.js` — dari 11 entri, kombinasi role/modul yang
`roles`-nya belum pernah diverifikasi terhadap `permission_classes`
backend sebenarnya adalah: `produksi`, `logistik`, `sales_order`,
`work_order`, `keuangan`, `pajak`, `dokumen` (modul-modul ini
`siap: false` di katalog sehingga kartunya tidak bisa diklik sama
sekali saat ini — lihat `ModuleCard.vue:10` — jadi konsekuensi di atas
untuk modul-modul ini murni teoretis selama `siap` tetap `false`).

---

## 6. Verifikasi jalur nyata (poin 4 instruksi)

Server backend **berhasil dijangkau** dari lingkungan pemeriksaan ini
saat laporan ini ditulis:

```
GET http://127.0.0.1:8000/api/auth/portal/ -> 401  (tanpa token — sesuai dugaan)
GET http://127.0.0.1:8000/api/auth/login/  -> 405  (endpoint ini POST-only — sesuai dugaan)
```

Ini TERVERIFIKASI: server hidup dan endpoint-nya ada.

**Login sungguhan sebagai akun role AKUNTING TIDAK dilakukan** — tidak
ada kredensial akun AKUNTING (atau role apa pun) yang tersedia di
repo ini maupun repo backend (`pracindo_backend_v1`). Diperiksa:
tidak ada `fixtures/`, tidak ada `management/commands/seed*`, tidak
ada `conftest.py`, tidak ada kredensial di `.env` backend (isinya
hanya konfigurasi DB/Django, bukan akun aplikasi), tidak ada dokumentasi
akun demo di `README.md`. Tanpa kredensial, bagian ini **TIDAK
TERVERIFIKASI** — bentuk persis respons `modul` untuk akun AKUNTING
sungguhan tidak dilaporkan di sini karena tidak ada cara memperolehnya
tanpa kredensial yang valid.
