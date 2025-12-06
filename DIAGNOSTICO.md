# 🔍 Diagnóstico de Problemas - Acesso Mobile

## ✅ Checklist de Verificação

### 1. Servidor está rodando?
Execute no PowerShell:
```powershell
netstat -ano | findstr :4200
```
**Se não aparecer nada:** O servidor não está rodando. Execute:
```powershell
.\iniciar-servidor.ps1
```

### 2. IP está correto?
Execute:
```powershell
ipconfig | findstr /i "IPv4"
```
Use o IP que começa com `192.168.x.x` (não use `127.0.0.1` ou `169.254.x.x`)

### 3. Celular na mesma rede?
- ✅ Celular e computador devem estar no **mesmo Wi-Fi**
- ❌ Não funciona se um estiver no Wi-Fi e outro em dados móveis
- ❌ Não funciona se estiverem em redes diferentes

### 4. Firewall bloqueando?
Teste desativando temporariamente o firewall do Windows:
1. Abra "Firewall do Windows Defender"
2. Clique em "Ativar ou desativar o Firewall do Windows Defender"
3. Desative temporariamente para testar
4. Se funcionar, reative e libere a porta 4200

### 5. URL está correta?
Use o formato exato:
```
http://192.168.18.79:4200
```
- ✅ Use `http://` (não `https://`)
- ✅ Use o IP correto (não `localhost`)
- ✅ Inclua a porta `:4200`

### 6. Navegador correto?
- ✅ **Chrome** ou **Edge** no Android (para NFC)
- ❌ Firefox não suporta Web NFC
- ❌ Safari no iOS não suporta Web NFC

## 🛠️ Soluções Comuns

### Problema: "Não consegue conectar"
**Solução:**
1. Verifique se o servidor está rodando
2. Verifique se o IP está correto
3. Desative o firewall temporariamente
4. Reinicie o servidor: `.\iniciar-servidor.ps1`

### Problema: "Página não carrega"
**Solução:**
1. Verifique o console do navegador (F12)
2. Verifique se há erros de compilação no terminal
3. Tente acessar de outro navegador
4. Limpe o cache do navegador

### Problema: "NFC não funciona"
**Solução:**
1. Use Chrome ou Edge (não Firefox)
2. Ative o NFC nas configurações do celular
3. Funciona apenas em Android
4. A aplicação tem fallback para simulação

## 📞 Teste Rápido

1. **No computador:** Acesse `http://localhost:4200` - deve funcionar
2. **No celular:** Acesse `http://192.168.18.79:4200` - deve funcionar
3. Se funcionar no computador mas não no celular = problema de rede/firewall
4. Se não funcionar em nenhum = problema no servidor/código

## 🔧 Comandos Úteis

```powershell
# Verificar se porta está em uso
netstat -ano | findstr :4200

# Ver seu IP
ipconfig | findstr /i "IPv4"

# Iniciar servidor
.\iniciar-servidor.ps1

# Parar processos Node
taskkill /F /IM node.exe
```

