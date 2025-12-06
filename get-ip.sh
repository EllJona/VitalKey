#!/bin/bash
# Script para descobrir o IP local no Linux/Mac

echo ""
echo "=== IP Local para Acesso Mobile ==="
echo ""
echo "Certifique-se de que o servidor está rodando com: npm run start:mobile"
echo ""
echo "Seus IPs locais:"

# Linux
if command -v hostname &> /dev/null; then
    hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^127\.' | grep -v '^169\.254\.' | while read ip; do
        echo "  http://$ip:4200"
    done
fi

# Mac
if command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | while read ip; do
        echo "  http://$ip:4200"
    done
fi

echo ""
echo "Acesse pelo celular usando um dos IPs acima!"
echo "Certifique-se de que o celular está na mesma rede Wi-Fi."
echo ""

