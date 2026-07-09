# Ansible para CKJ - Sistema de Almacén

Estructura de automatización para desplegar **CKJ** (Angular + Node.js/Express + SQLite) en servidores Linux.

---

## 📁 Estructura

```
ansible/
├── ansible.cfg              # Configuración global
├── inventory.yml            # Inventario de servidores
├── deploy.yml               # 🚀 Playbook principal
├── rollback.yml             # ⏪ Rollback a versión anterior
├── status.yml               # 📊 Ver estado del despliegue
├── group_vars/
│   └── all.yml              # Variables globales
├── roles/
│   ├── common/              # Preparar servidor (Node.js, PM2, etc.)
│   │   ├── tasks/main.yml
│   │   └── handlers/main.yml
│   ├── app/                 # Desplegar la app (clonar, build, iniciar)
│   │   ├── tasks/main.yml
│   │   └── templates/
│   │       └── backend.env.j2
│   └── nginx/               # Reverse proxy (Angular + API)
│       ├── tasks/main.yml
│       ├── handlers/main.yml
│       └── templates/
│           └── ckj.nginx.conf.j2
```

---

## 🚀 Comandos de uso

### 1. Despliegue completo (primera vez)

```bash
# Editar primero las variables en group_vars/all.yml
#   - repo_url     → URL de tu repositorio
#   - nginx_server_name → dominio real

# Desplegar todo
ansible-playbook -i inventory.yml deploy.yml

# Solo una parte específica
ansible-playbook -i inventory.yml deploy.yml --tags "common"    # solo preparar servidor
ansible-playbook -i inventory.yml deploy.yml --tags "app"       # solo actualizar app
ansible-playbook -i inventory.yml deploy.yml --tags "nginx"     # solo nginx
```

### 2. Actualizar la app (código nuevo)

```bash
# Actualizar código, rebuild y reiniciar
ansible-playbook -i inventory.yml deploy.yml --tags "app"
```

### 3. Rollback a versión anterior

```bash
# Volver al commit anterior
ansible-playbook -i inventory.yml rollback.yml

# Volver a una versión específica (tag, commit o branch)
ansible-playbook -i inventory.yml rollback.yml -e "git_ref=v1.0.0"
```

### 4. Verificar estado del servidor

```bash
ansible-playbook -i inventory.yml status.yml
```

---

## ⚙️ Lo que automatiza

| Paso | Descripción |
|---|---|
| 1. **Sistema base** | Instala Node.js 22.x, npm, git, build tools |
| 2. **PM2** | Instala y configura PM2 para gestión de procesos |
| 3. **Código** | Clona/actualiza el repositorio |
| 4. **Dependencias** | `npm install` en raíz y backend |
| 5. **Config** | Genera `.env` con variables de entorno |
| 6. **Build** | Compila Angular en modo producción |
| 7. **Inicio** | Arranca la API con PM2 (auto-reinicio) |
| 8. **Nginx** | Configura reverse proxy con SSL |
| 9. **Rollback** | Vuelve a versión anterior con 1 comando |
| 10. **Status** | Verifica que todo funcione |

---

## 🔧 Requisitos

- **Servidor:** Ubuntu 22.04 / Debian 12+
- **Controladora:** Donde ejecutas Ansible (tu PC o CI/CD)
  ```bash
  # Instalar Ansible
  sudo apt install ansible
  # o con pip
  pip install ansible
  ```
- **SSH:** Acceso SSH al servidor con clave pública

---

## 🔒 Seguridad

1. Cambia `jwt_secret` en `group_vars/all.yml` por una clave segura
2. Usa Let's Encrypt para SSL: `certbot --nginx -d tudominio.com`
3. No subas el archivo `inventory.yml` con IPs reales al repo
