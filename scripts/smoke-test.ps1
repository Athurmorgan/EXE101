# Kiem tra thu API vivivu - chay khi server dang hoat dong
#   pwsh -NoProfile -File scripts/smoke-test.ps1
$ErrorActionPreference = "Stop"
$base = "http://localhost:3000/api/v1"
$email = "khach$((Get-Random -Max 9999))@example.com"
$password = "matkhau123"

# Moi phien rieng biet: cookie cu phien A khong duoc lan sang phien B.
$jar = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$script:token = $null
$script:pass = 0
$script:fail = 0

function Check($label, $ok, $detail) {
  if ($ok) { Write-Host "  [PASS] $label" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "  [FAIL] $label - $detail" -ForegroundColor Red; $script:fail++ }
}

# Giai ma payload JWT de doc claim `exp` — dung de kiem tra token da xoay vong
# chua (hai token cap trong cung giay co the giong het phia chuoi ky).
function Get-TokenExpiry($token) {
  try {
    $part = ($token -split '\.')[1].Replace('-', '+').Replace('_', '/')
    while ($part.Length % 4 -ne 0) { $part += '=' }
    $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($part))
    return [DateTimeOffset]::FromUnixTimeSeconds([int64]($json | ConvertFrom-Json).exp)
  } catch { return [DateTimeOffset]::MinValue }
}

function Call($method, $path, $body, $useAuth) {
  $headers = @{}
  if ($useAuth -and $script:token) { $headers["Authorization"] = "Bearer $script:token" }
  $p = @{
    Uri = "$base$path"; Method = $method; Headers = $headers
    WebSession = $jar; ContentType = "application/json"
  }
  # Phai truyen **chuoi JSON**, khong phai hashtable. `ConvertTo-Json` tren
  # hashtable PowerShell 5.1 tao ra `{"password":{"value":"..."}}` khi
  # hashtable long nhau — server nhan duoc object thi validation bao
  # "password must be a string".
  if ($null -ne $body) { $p["Body"] = (ConvertTo-Json -InputObject $body -Depth 5 -Compress) }
  try { return @{ ok = $true; body = (Invoke-RestMethod @p -UseBasicParsing) } }
  catch {
    return @{
      ok = $false
      code = $_.Exception.Response.StatusCode.value__
      message = $_.ErrorDetails.Message
    }
  }
}

Write-Host "`n=== 1. Health ===" -ForegroundColor Cyan
$r = Call GET "/health" $null $false
Check "GET /health" $r.ok $r.message
if ($r.ok) { Write-Host "         $($r.body.data.status) / $($r.body.data.service)" }

Write-Host "`n=== 2. Dang ky ($email) ===" -ForegroundColor Cyan
$r = Call POST "/auth/register" @{ email=$email; password=$password; fullName="Nguyen Van A"; locale="vi" } $false
Check "POST /auth/register" $r.ok $r.message
if ($r.ok) {
  $script:token = $r.body.data.accessToken
  Write-Host "         user  : $($r.body.data.user.email)"
  Write-Host "         role  : $($r.body.data.user.role)"
  Write-Host "         status: $($r.body.data.user.status)"
  Check "role = USER" ($r.body.data.user.role -eq "USER") "got $($r.body.data.user.role)"
  Check "status = ACTIVE" ($r.body.data.user.status -eq "ACTIVE") "got $($r.body.data.user.status)"
  Check "access token tra ve" ($r.body.data.accessToken.Length -gt 20) "thieu token"
  Check "het han 900s" ($r.body.data.expiresIn -eq 900) "got $($r.body.data.expiresIn)"
  $cookie = $jar.Cookies.GetCookies([uri]"http://localhost:3000/") | Where-Object { $_.Name -eq "vivivu_refresh" }
  # PowerShell chi doc cookie domain goc (`localhost`), nen `GetCookies($base)`
  # voi base co duong dan `/api/v1` se khong tra ve gi.
  Check "cookie vivivu_refresh duoc gui" ($cookie -ne $null) "thieu cookie"
  Check "cookie httpOnly" ($cookie.HttpOnly) "cookie khong httpOnly"
  Check "cookie KHONG co Secure (http local)" (-not $cookie.Secure) "cookie bi gan Secure"
  Check "cookie SameSite=Lax" ($cookie.SameSite -eq "Lax" -or $cookie.SameSite -eq "None") "got $($cookie.SameSite)"
}

Write-Host "`n=== 3. Dang ky trung email (phai 409) ===" -ForegroundColor Cyan
$r = Call POST "/auth/register" @{ email=$email; password=$password; fullName="Trung" } $false
Check "HTTP 409" ($r.code -eq 409) "got $($r.code)"
$j = $r.message | ConvertFrom-Json
Check "code = EMAIL_ALREADY_EXISTS" ($j.code -eq "EMAIL_ALREADY_EXISTS") "got $($j.code)"

Write-Host "`n=== 4. Dang ky sai dinh dang (phai 400) ===" -ForegroundColor Cyan
$r = Call POST "/auth/register" @{ email="khong-hop-le"; password="123"; fullName="A" } $false
Check "HTTP 400" ($r.code -eq 400) "got $($r.code)"
$j = $r.message | ConvertFrom-Json
Check "code = VALIDATION_FAILED" ($j.code -eq "VALIDATION_FAILED") "got $($j.code)"
Check "bao loi tung field" ($j.details.message.Count -ge 3) "chi $($j.details.message.Count) loi"

Write-Host "`n=== 5. Login sai mat khau (phai 401) ===" -ForegroundColor Cyan
$r = Call POST "/auth/login" @{ email=$email; password="saimatkhau123" } $false
Check "HTTP 401" ($r.code -eq 401) "got $($r.code)"
$j = $r.message | ConvertFrom-Json
Check "code = INVALID_CREDENTIALS" ($j.code -eq "INVALID_CREDENTIALS") "got $($j.code)"
Check "khong lo tai khoan nao ton tai" ($j.message -notmatch "not found") "lo thong tin"

Write-Host "`n=== 6. Login email khong ton tai (thong bao phai giong het) ===" -ForegroundColor Cyan
$r = Call POST "/auth/login" @{ email="khong@co.com"; password=$password } $false
Check "HTTP 401" ($r.code -eq 401) "got $($r.code)"
$j = $r.message | ConvertFrom-Json
Check "thong bao giong sai mat khau" ($j.message -eq "Invalid email or password") "got '$($j.message)'"

Write-Host "`n=== 7. Login dung ===" -ForegroundColor Cyan
$r = Call POST "/auth/login" @{ email=$email; password=$password } $false
Check "POST /auth/login" $r.ok $r.message
if ($r.ok) { $script:token = $r.body.data.accessToken; Write-Host "         token moi nhan duoc" }

Write-Host "`n=== 8. GET /auth/me co token ===" -ForegroundColor Cyan
$r = Call GET "/auth/me" $null $true
Check "HTTP 200" $r.ok $r.message
if ($r.ok) { Check "dung user vua dang nhap" ($r.body.data.email -eq $email) "got $($r.body.data.email)" }

Write-Host "`n=== 9. GET /auth/me KHONG token (phai 401) ===" -ForegroundColor Cyan
$cleanJar = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$saved = $script:token; $script:token = $null
try {
  Invoke-RestMethod "$base/auth/me" -WebSession $cleanJar -ErrorAction Stop | Out-Null
  Check "HTTP 401" $false "tra 200 - KHONG chay guard"
} catch {
  $c = $_.Exception.Response.StatusCode.value__
  Check "HTTP 401" ($c -eq 401) "got $c"
}
$script:token = $saved

Write-Host "`n=== 10. Refresh token (phai xoay vong) ===" -ForegroundColor Cyan
$oldToken = $script:token
$r = Call POST "/auth/refresh" $null $false
Check "POST /auth/refresh" $r.ok $r.message
if ($r.ok) {
  $script:token = $r.body.data.accessToken
  # Hai token cap trong cung giay co the giong nhau phia chuoi ky (iat/exp
  # chi tien 1 giay). So sanh thoi gian het han moi la cach kiem tra dung.
  $oldExp = Get-TokenExpiry $oldToken
  $newExp = Get-TokenExpiry $script:token
  Check "access token moi co han moi hon token cu" ($newExp -gt $oldExp) "cu=$oldExp moi=$newExp"
  Check "refresh token da thu hoi token cu" ($null -eq $oldRefresh) "chua thu hoi"
}

Write-Host "`n=== 11. Logout ===" -ForegroundColor Cyan
$r = Call POST "/auth/logout" $null $true
# `Invoke-RestMethod` nem loi khi nhan 204 (khong co body) — kiem tra theo
# $_.Exception thay vi $r.ok.
if ($r.code -eq 204) { Write-Host "  [PASS] HTTP 204" -ForegroundColor Green; $script:pass++ }
elseif ($r.ok) { Write-Host "  [PASS] logout OK" -ForegroundColor Green; $script:pass++ }
else { Write-Host "  [FAIL] logout - code=$($r.code) $($r.message)" -ForegroundColor Red; $script:fail++ }

Write-Host "`n=== 12. Refresh sau logout (phai 401) ===" -ForegroundColor Cyan
$r = Call POST "/auth/refresh" $null $false
Check "HTTP 401" ($r.code -eq 401) "got $($r.code)"
$j = $r.message | ConvertFrom-Json
Check "code = TOKEN_EXPIRED" ($j.code -eq "TOKEN_EXPIRED") "got $($j.code)"

Write-Host "`n=== 13. Logout-all thu hoi moi phien ===" -ForegroundColor Cyan
$r = Call POST "/auth/login" @{ email=$email; password=$password } $false
if ($r.ok) { $script:token = $r.body.data.accessToken }
$r = Call POST "/auth/logout-all" $null $true
Check "HTTP 200" $r.ok $r.message
if ($r.ok) { Write-Host "         da thu hoi $($r.body.data.revokedSessions) phien" }
$r = Call POST "/auth/refresh" $null $false
Check "refresh sau logout-all bi tu choi" ($r.code -eq 401) "got $($r.code)"

Write-Host "`n=== 14. Moi response co requestId ===" -ForegroundColor Cyan
$rid = (Invoke-WebRequest "$base/health" -UseBasicParsing).Headers['X-Request-Id']
Check "header X-Request-Id ton tai" ($rid -ne $null) "thieu header"

Write-Host "`n===================================" -ForegroundColor Cyan
$color = if ($script:fail -eq 0) { "Green" } else { "Red" }
Write-Host "  PASS: $script:pass    FAIL: $script:fail" -ForegroundColor $color
Write-Host "===================================`n" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:3000/api/docs`n" -ForegroundColor Cyan
