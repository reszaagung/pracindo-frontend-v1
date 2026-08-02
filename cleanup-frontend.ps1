# =========================================================
# cleanup-frontend.ps1
# Menghapus fitur yang backend-nya belum ada.
#
# Yang TETAP: auth (staff_user), warehouse, accounting (akunting).
# Sisanya dibuat ulang setelah endpoint backend-nya jadi.
#
# Jalankan dari root pracindo-frontend:
#     .\cleanup-frontend.ps1 -DryRun     lihat dulu
#     .\cleanup-frontend.ps1             hapus
# =========================================================

param([switch]$DryRun)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path 'package.json')) {
    Write-Host "Jalankan dari root pracindo-frontend." -ForegroundColor Red
    exit 1
}

# Pastikan ada titik kembali sebelum menghapus apa pun.
$bersih = (git status --porcelain 2>$null)
if ($bersih -and -not $DryRun) {
    Write-Host "Ada perubahan belum di-commit. Commit dulu sebagai titik kembali:" -ForegroundColor Yellow
    Write-Host "    git add -A; git commit -m 'checkpoint sebelum cleanup'" -ForegroundColor Yellow
    exit 1
}

# ---------------------------------------------------------
# Folder fitur yang backend-nya kosong
# ---------------------------------------------------------
$folder = @(
    'src/features/logistic',      # logistik: app kosong
    'src/features/work-order',    # work_order: app kosong
    'src/features/rnd',           # produksi: model ada, endpoint belum
    'src/features/executive',     # tidak ada app-nya sama sekali
    'src/features/master',        # master: model ada, endpoint belum
    'src/mock'                    # sudah dihapus, jaga-jaga
)

# ---------------------------------------------------------
# File lepas yang memanggil app mati atau premisnya salah
# ---------------------------------------------------------
$file = @(
    # stock_raw sudah tidak ada; penggantinya inventory (belum ada endpoint)
    'src/features/warehouse/composables/useWarehouse.js',
    'src/features/warehouse/composables/useStockRaw.js',

    # retur belum didukung backend
    'src/features/warehouse/composables/useRetur.js',

    # kemasan BUKAN master data -- dia enum jenis_kemasan yang dikirim
    # inline saat POST warehouse/penerimaan/. Premisnya salah seluruhnya,
    # bukan cuma path-nya.
    'src/features/master/composables/useKemasan.js',

    # master/suplier belum punya endpoint
    'src/components/ui/SupplierQuickAddDialog.vue'
)

Write-Host ""
Write-Host "=== FOLDER ===" -ForegroundColor Cyan
foreach ($f in $folder) {
    if (Test-Path $f) {
        $n = (Get-ChildItem $f -Recurse -File).Count
        if ($DryRun) {
            Write-Host "  akan dihapus  $f  ($n file)" -ForegroundColor Yellow
        } else {
            Remove-Item $f -Recurse -Force
            Write-Host "  dihapus       $f  ($n file)" -ForegroundColor Green
        }
    } else {
        Write-Host "  tidak ada     $f" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== FILE ===" -ForegroundColor Cyan
foreach ($f in $file) {
    if (Test-Path $f) {
        if ($DryRun) {
            Write-Host "  akan dihapus  $f" -ForegroundColor Yellow
        } else {
            Remove-Item $f -Force
            Write-Host "  dihapus       $f" -ForegroundColor Green
        }
    } else {
        Write-Host "  tidak ada     $f" -ForegroundColor DarkGray
    }
}

# ---------------------------------------------------------
# Sisa rujukan yang perlu dibereskan manual
# ---------------------------------------------------------
Write-Host ""
Write-Host "=== SISA RUJUKAN (perbaiki manual) ===" -ForegroundColor Cyan

$pola = @(
    'stock-raw', 'entitas/akun', 'akunting/po/', 'master/supplier',
    'produksi/formula', 'inventory/barang-jadi', 'logistik/',
    'work-order/', 'sales-order/', 'executive/', 'customer/'
)

$ketemu = $false
foreach ($p in $pola) {
    $hit = Get-ChildItem src -Recurse -Include *.js,*.vue -ErrorAction SilentlyContinue |
           Select-String -Pattern ([regex]::Escape($p)) -SimpleMatch
    foreach ($h in $hit) {
        $rel = Resolve-Path $h.Path -Relative
        Write-Host ("  {0}:{1}  {2}" -f $rel, $h.LineNumber, $p) -ForegroundColor Yellow
        $ketemu = $true
    }
}
if (-not $ketemu) { Write-Host "  bersih" -ForegroundColor Green }

# ---------------------------------------------------------
Write-Host ""
Write-Host "=== BERIKUTNYA ===" -ForegroundColor Cyan
Write-Host "  1. Rapikan router: buang rute ke fitur yang dihapus"
Write-Host "  2. Rapikan config/modules.js: sisakan auth, warehouse, accounting"
Write-Host "  3. Dropdown entitas ambil dari GET auth/portal/, bukan endpoint sendiri"
Write-Host "  4. Tulis ulang useReceived.js -> useGoodsReceipt.js (payload berubah total)"
Write-Host "  5. npm run build untuk menemukan import yang menggantung"
Write-Host ""
