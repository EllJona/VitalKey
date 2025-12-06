# Script para iniciar o servidor Angular para acesso mobile
Write-Host "`n=== Iniciando Servidor Angular ===" -ForegroundColor Green
Write-Host ""

# Verifica se há processos na porta 4200
$porta = netstat -ano | findstr :4200
if ($porta) {
    Write-Host "⚠️  Porta 4200 já está em uso!" -ForegroundColor Yellow
    Write-Host "Parando processos na porta 4200..." -ForegroundColor Yellow
    $processos = netstat -ano | findstr :4200 | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($pid in $processos) {
        if ($pid -and $pid -ne "0") {
            taskkill /F /PID $pid 2>$null
            Write-Host "   Processo $pid finalizado" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
}

# Obtém o IP local
Write-Host "`n📱 Seu IP local para acesso mobile:" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -ExpandProperty IPAddress

if ($ips) {
    foreach ($ip in $ips) {
        Write-Host "   http://$ip:4200" -ForegroundColor White -BackgroundColor DarkBlue
    }
} else {
    Write-Host "   Nenhum IP encontrado" -ForegroundColor Red
}

Write-Host "`n🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host "   Aguarde a mensagem '✔ Compiled successfully'" -ForegroundColor Yellow
Write-Host "   Pressione Ctrl+C para parar o servidor`n" -ForegroundColor Gray

# Inicia o servidor
npm run start:mobile

