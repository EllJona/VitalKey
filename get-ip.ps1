# Script para descobrir o IP local no Windows
Write-Host "`n=== IP Local para Acesso Mobile ===" -ForegroundColor Green
Write-Host "`nCertifique-se de que o servidor está rodando com: npm run start:mobile" -ForegroundColor Yellow
Write-Host "`nSeus IPs locais:" -ForegroundColor Cyan

# Obtém todos os IPs IPv4
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -ExpandProperty IPAddress

if ($ips) {
    foreach ($ip in $ips) {
        Write-Host "  http://$ip:4200" -ForegroundColor White
    }
    Write-Host "`nAcesse pelo celular usando um dos IPs acima!" -ForegroundColor Green
    Write-Host "Certifique-se de que o celular está na mesma rede Wi-Fi.`n" -ForegroundColor Yellow
} else {
    Write-Host "  Nenhum IP encontrado. Verifique sua conexão de rede." -ForegroundColor Red
}

