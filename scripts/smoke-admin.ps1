# Kiem thuc nhanh cac luong moi: dang ky -> xac thuc -> admin quan tri tai khoan.
# Chay: pwsh -NoProfile -File scripts/smoke-admin.ps1  (server phai dang chay)
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$pass = 0; $fail = 0

function Check($name, $cond, $detail = '') {
  if ($cond) { $script:pass++; Write-Host "  PASS  $name" -ForegroundColor Green }
  else { $script:fail++; Write-Host "  FAIL  $name  $detail" -ForegroundColor Red }
}

function Post($path, $body, $token) {
  $h = @{ 'Content-Type' = 'application/json' }
  if ($token) { $h['Authorization'] = "Bearer $token" }
  try { Invoke-RestMethod -Uri "$base$path" -Method Post -Body ($body | ConvertTo-Json -Depth 5) -Headers $h }
  catch { @{ _error = $_.Exception.Response.StatusCode.value__; _body = $_.ErrorDetails.Message } }
}
function Get($path, $token) {
  $h = @{}
  if ($token) { $h['Authorization'] = "Bearer $token" }
  try { Invoke-RestMethod -Uri "$base$path" -Method Get -Headers $h }
  catch { @{ _error = $_.Exception.Response.StatusCode.value__ } }
}
function Patch($path, $body, $token) {
  try { Invoke-RestMethod -Uri "$base$path" -Method Patch -Body ($body | ConvertTo-Json) -Headers @{ 'Content-Type' = 'application/json'; 'Authorization' = "Bearer $token" } }
  catch { @{ _error = $_.Exception.Response.StatusCode.value__; _body = $_.ErrorDetails.Message } }
}
function Remove-User($path, $body, $token) {
  try { Invoke-RestMethod -Uri "$base$path" -Method Delete -Body ($body | ConvertTo-Json) -Headers @{ 'Content-Type' = 'application/json'; 'Authorization' = "Bearer $token" } }
  catch { @{ _error = $_.Exception.Response.StatusCode.value__; _body = $_.ErrorDetails.Message } }
}

# Body rong phai gan vao bien truoc — `@{}` truyen truc tiep khong bind duoc vao
# tham so positional cua ham trong PowerShell.
$noBody = @{}

Write-Host "`n=== 1. DANG KY + XAC THUC EMAIL ===" -ForegroundColor Cyan

$email = "smoke$(Get-Random -Max 99999)@test.com"
$reg = Post '/auth/register' @{ email = $email; password = 'matkhau123'; fullName = 'Nguyen Van A'; dateOfBirth = '1995-04-12'; address = '123 Nguyen Hue' }
Check 'dang ky tao tai khoan PENDING' ($reg.data.user.status -eq 'PENDING') "-> $($reg.data.user.status)"
Check 'khong cap access token luc dang ky' ($null -eq $reg.data.accessToken)
$code = $reg.data.devVerificationCode
Check 'tra ma xac thuc o moi truong dev' (-not [string]::IsNullOrEmpty($code))

$bad = Post '/auth/verify-email' @{ email = $email; code = '000000' }
Check 'ma sai bi tu choi' ($bad._error -eq 400)

$ver = Post '/auth/verify-email' @{ email = $email; code = $code }
Check 'ma dung xac thuc thanh cong' ($ver.data.verified -eq $true)
Check 'chuyen sang ACTIVE' ($ver.data.user.status -eq 'ACTIVE') "-> $($ver.data.user.status)"
Check 'co emailVerifiedAt' ($null -ne $ver.data.user.emailVerifiedAt)
Check 'luu ngay sinh' ($null -ne $ver.data.user.dateOfBirth)
Check 'luu dia chi' ($ver.data.user.address -eq '123 Nguyen Hue')

Write-Host "`n=== 2. DANG NHAP ===" -ForegroundColor Cyan
$login = Post '/auth/login' @{ email = $email; password = 'matkhau123' }
$userToken = $login.data.accessToken
Check 'dang nhap duoc access token' (-not [string]::IsNullOrEmpty($userToken))
Check 'khong lo passwordHash' ($null -eq $login.data.user.passwordHash)

$admin = Post '/auth/login' @{ email = 'admin@vivivu.vn'; password = 'Vivivu@2026' }
$adminToken = $admin.data.accessToken
Check 'dang nhap ADMIN duoc' (-not [string]::IsNullOrEmpty($adminToken))

Write-Host "`n=== 3. PHAAN QUYEN (USER KHONG DUOC GOI ADMIN API) ===" -ForegroundColor Cyan
$forbidden = Get '/admin/users' $userToken
Check 'USER bi chan 403 khi goi admin API' ($forbidden._error -eq 403) "-> $($forbidden._error)"

$list = Get '/admin/users?limit=100' $adminToken
Check 'ADMIN xem duoc danh sach' ($null -ne $list.data)
$totalBefore = $list.meta.total
Check 'danh sach co phan trang' ($null -ne $list.meta.totalPages)
Check 'mac dinh an tai khoan da xoa' (@($list.data | Where-Object { $_.status -eq 'DELETED' }).Count -eq 0)

$targetId = $reg.data.user.id

Write-Host "`n=== 4. KHOA TAI KHOAN ===" -ForegroundColor Cyan
$susp = Post "/admin/users/$targetId/suspend" @{ reason = 'Test khoa tai khoan' } $adminToken
Check 'khoa thanh cong' ($susp.data.status -eq 'SUSPENDED') "-> $($susp.data.status)"
Check 'thu hoi phien cua tai khoan' ($susp.data.revokedSessions -ge 0)

$denied = Post '/auth/login' @{ email = $email; password = 'matkhau123' }
Check 'tai khoan bi khoa KHONG dang nhap duoc' ($denied._error -eq 401) "-> $($denied._error)"

$self = Post "/admin/users/$targetId/suspend" $noBody $userToken
# 401 (khong phai 403) la dung: tai khoan vua bi khoa nen chinh token cua
# no da bi thu hoi — `JwtStrategy` chan truoc khi `RolesGuard` kip kiem tra.
Check 'token cua tai khoan bi khoa bi chan ngay' ($self._error -eq 401) "-> $($self._error)" "-> $($self._error)"

$un = Post "/admin/users/$targetId/unsuspend" $noBody $adminToken
Check 'mo khoa thanh cong' ($un.data.status -eq 'ACTIVE')
$relogin = Post '/auth/login' @{ email = $email; password = 'matkhau123' }
Check 'sau khi mo khoa dang nhap lai duoc' ($null -ne $relogin.data.accessToken)

Write-Host "`n=== 5. XOA MEM / KHOI PHUC ===" -ForegroundColor Cyan
$del = Remove-User "/admin/users/$targetId" $noBody $adminToken
Check 'xoa mem thanh cong' ($del.data.mode -eq 'soft') "-> $($del.data.mode)"

$afterDel = Get '/admin/users?limit=100' $adminToken
Check 'danh sach mac dinh KHONG con tai khoan da xoa' ($afterDel.meta.total -eq ($totalBefore - 1)) "-> $($afterDel.meta.total) vs $totalBefore"

# So sanh tuong doi, khong tuong doi: `includeDeleted=true` hien them ca tai
# khoan DELETED co san tu seed (`deleted@vivivu.vn`) — nen chi kiem tra
# `includeDeleted` luon >= mac dinh va chua dung tai khoan vua xoa.
$withDel = Get '/admin/users?includeDeleted=true&limit=100' $adminToken
$stillListed = @($withDel.data | Where-Object { $_.id -eq $targetId })
Check 'includeDeleted=true thi thay lai tai khoan vua xoa' ($withDel.meta.total -ge $afterDel.meta.total) "-> $($withDel.meta.total) vs $($afterDel.meta.total)"
Check 'tai khoan vua xoa xuat hien trong danh sach day du' ($stillListed.Count -eq 1)
Check 'tai khoan vua xoa co status DELETED' ($stillListed[0].status -eq 'DELETED') "-> $($stillListed[0].status)"

$restore = Post "/admin/users/$targetId/restore" $noBody $adminToken
Check 'khoi phuc duoc' ($restore.data.status -eq 'ACTIVE')

Write-Host "`n=== 6. DOI VAI TRO ===" -ForegroundColor Cyan
$role = Patch "/admin/users/$targetId/role" @{ role = 'MANAGER' } $adminToken
Check 'doi sang MANAGER' ($role.data.role -eq 'MANAGER') "-> $($role.data.role)"

$adminMe = Get '/auth/me' $adminToken
$adminSelf = Patch "/admin/users/$($adminMe.data.id)/role" @{ role = 'USER' } $adminToken
Check 'ADMIN khong doi duoc vai tro cua chinh minh' ($adminSelf._error -eq 400) "-> $($adminSelf._error)"

$onlyAdmin = Remove-User "/admin/users/$($adminMe.data.id)" $noBody $adminToken
Check 'ADMIN khong xoa duoc chinh minh' ($onlyAdmin._error -eq 400) "-> $($onlyAdmin._error)"

Write-Host "`n=== 7. XOA HAN ===" -ForegroundColor Cyan
$hard = Remove-User "/admin/users/$targetId" @{ hard = $true } $adminToken
Check 'xoa han thanh cong' ($hard.data.mode -eq 'hard') "-> $($hard.data.mode)"

$gone = Get "/admin/users/$targetId" $adminToken
Check 'tai khoan khong con trong DB' ($gone._error -eq 404) "-> $($gone._error)"

Write-Host "`n=== 8. CLEANUP ===" -ForegroundColor Cyan
$stale = Post '/auth/register' @{ email = $email; password = 'matkhau123'; fullName = 'Test User' }
Check 'dang ky trung email da xoa han duoc' ($null -ne $stale.data.user) "-> $($stale._error)"

Write-Host "`n================================`n  PASS: $pass   FAIL: $fail`n" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }
