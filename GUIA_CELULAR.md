# 📱 Como Rodar no Celular

## Passos Rápidos

### 1️⃣ Inicie o servidor para acesso mobile

No terminal, execute:

```bash
npm run start:mobile
```

Ou:

```bash
ng serve --host 0.0.0.0 --port 4200
```

Aguarde até ver a mensagem: `✔ Compiled successfully.`

### 2️⃣ Descubra o IP do seu computador

**No Windows:**
1. Abra o PowerShell
2. Execute: `ipconfig`
3. Procure por "Adaptador Ethernet" ou "Adaptador Wi-Fi"
4. Anote o número em "Endereço IPv4" (exemplo: `192.168.1.100`)

**Ou execute o script:**
```powershell
.\get-ip.ps1
```

**No Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 3️⃣ Acesse no celular

1. ✅ **Conecte o celular na mesma rede Wi-Fi** do computador
2. ✅ Abra o **Chrome** ou **Edge** no celular (importante para NFC!)
3. ✅ Digite no navegador: `http://SEU_IP:4200`
   - Exemplo: `http://192.168.1.100:4200`
4. ✅ A aplicação deve carregar!

## 🔧 Solução de Problemas

### Não consegue acessar?
- ✅ Verifique se o celular está na **mesma rede Wi-Fi**
- ✅ Verifique se o **firewall do Windows** está bloqueando a porta 4200
- ✅ Tente desativar temporariamente o firewall para testar
- ✅ Certifique-se de que o servidor está rodando (`npm run start:mobile`)

### Como liberar a porta no Firewall do Windows:
1. Abra "Firewall do Windows Defender"
2. Clique em "Configurações avançadas"
3. Clique em "Regras de Entrada" → "Nova Regra"
4. Escolha "Porta" → Próximo
5. Selecione "TCP" e digite `4200` → Próximo
6. Escolha "Permitir a conexão" → Próximo
7. Marque todas as opções → Próximo
8. Dê um nome (ex: "Angular Dev") → Concluir

### NFC não funciona?
- ✅ Use **Chrome** ou **Edge** (não funciona no Firefox)
- ✅ Ative o **NFC** nas configurações do celular
- ✅ A leitura NFC funciona apenas em **Android**
- ✅ Se não houver suporte, a aplicação usará modo de simulação

## 📝 Exemplo Completo

```bash
# 1. Inicie o servidor
npm run start:mobile

# 2. Descubra seu IP (Windows)
ipconfig

# 3. No celular, acesse:
# http://192.168.1.100:4200
```

Pronto! 🎉

