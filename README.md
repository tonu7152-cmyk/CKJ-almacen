# Devops

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

---

## 🔒 DevSecOps - Seguridad integrada

Este proyecto incluye herramientas DevSecOps para mantener la seguridad en cada etapa.

### 📋 Herramientas incluidas

| Herramienta | Archivo | Propósito |
|---|---|---|
| **Helmet** | `backend/server.js` | Cabeceras HTTP seguras (XSS, clickjacking, etc.) |
| **Rate Limiting** | `backend/server.js` | Límite de 100 req/15min global, 5 intentos/login |
| **npm audit** | `ansible/devsecops/scan.yml` | Escaneo de dependencias vulnerables |
| **Trivy** | `ansible/devsecops/scan.yml` | Escaneo de archivos (HIGH/CRITICAL) |
| **Secret Scanner** | `.gitleaks.toml` | Evita commits con contraseñas/tokens |
| **Checkov** | `ansible/devsecops/checkov-config.yml` | Escanea playbooks de Ansible |
| **SonarQube** | `sonar-project.properties` | Calidad de código y seguridad |
| **Snyk** | `.snyk` | Monitoreo continuo de vulnerabilidades |
| **Fail2Ban** | `ansible/roles/security/` | Bloquea IPs por fuerza bruta SSH |
| **UFW** | `ansible/roles/security/` | Firewall (solo 22, 80, 443 abiertos) |
| **Hardening SSH** | `ansible/roles/security/` | Sin root, sin passwords, 3 intentos máx |

### 🚀 Comandos DevSecOps

```bash
# Escaneo rápido de seguridad en el servidor
ansible-playbook ansible/devsecops/scan.yml

# Hardening completo del servidor
ansible-playbook ansible/deploy.yml --tags "security"

# Pipeline DevSecOps completo
ansible-playbook ansible/devsecops/devsecops.yml

# Escanear secretos en commits (local)
gitleaks detect --source . --config .gitleaks.toml

# Analizar código con SonarQube
sonar-scanner

# Escanear dependencias
cd backend && npm audit --audit-level=high
```

### 🔐 Mejoras en el backend

- **JWT_SECRET** ahora se lee de variable de entorno (`process.env.JWT_SECRET`)
- **Helmet** protege contra XSS, clickjacking, MIME sniffing, etc.
- **Rate limiting** por IP para evitar ataques de fuerza bruta
- **Validación de tipos** en inputs del login
- **Límite de tamaño** de body (1MB) para evitar DoS
- En producción, configurar: `JWT_SECRET=clave_segura_aqui`

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
