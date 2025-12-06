# VitalKey

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Rodando no Celular

Para acessar a aplicação no seu celular:

### Passo 1: Iniciar o servidor para acesso mobile

```bash
npm run start:mobile
```

Ou:

```bash
ng serve --host 0.0.0.0 --port 4200
```

### Passo 2: Descobrir o IP da sua máquina

**No Windows (PowerShell):**
```powershell
.\get-ip.ps1
```

**No Linux/Mac:**
```bash
./get-ip.sh
```

**Ou manualmente:**
- Windows: Abra o PowerShell e execute `ipconfig`, procure por "IPv4 Address"
- Linux/Mac: Execute `ifconfig` ou `ip addr` e procure pelo IP da sua interface de rede

### Passo 3: Acessar no celular

1. **Certifique-se de que o celular está na mesma rede Wi-Fi** que o computador
2. Abra o navegador no celular (Chrome ou Edge para suporte NFC)
3. Digite o IP mostrado no passo 2 seguido de `:4200`
   - Exemplo: `http://192.168.1.100:4200`
4. A aplicação deve carregar no celular!

### Importante para NFC

- **Use Chrome ou Edge** no Android (suporte Web NFC)
- O NFC precisa estar **ativado** no celular
- A leitura de NFC funciona apenas em **dispositivos Android** com Chrome/Edge
- Em dispositivos sem suporte NFC, a aplicação usará um modo de simulação

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
