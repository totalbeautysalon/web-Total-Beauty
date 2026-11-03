# Total Beauty Salón & Academia - Portal Web

Página web de bienvenida y menú diseñada para Total Beauty Salón & Academia, optimizada para su publicación en **GitHub Pages** y visualización impecable en teléfonos móviles y computadoras.

---

## Estructura y Novedades del Proyecto

- **Página Principal (index.html):**
  - Encabezado con logotipo centrado y elegante sin elementos distractores.
  - Menú de 2 opciones optimizado para pantallas táctiles y móviles: **Salón** y **Academia**.
  - Anuncio intersticial modal al entrar sincronizado con Firebase y con temporizador de 5 segundos antes de habilitar el botón de cierre.
  - Enlace discreto en el pie de página hacia el portal administrativo independiente.
- **Página de Academia (academia.html):**
  - Oferta dinámica de cursos prácticos (90% práctico y 10% teórico) con entrega de constancia de finalización, cargada en tiempo real desde Firebase. Por defecto se ofrece 1 curso práctico activo.
  - Botón de acceso exclusivo para alumnas en la barra superior (**Soy Alumna / Ingresar**).
  - Autenticación y actualización de contraseñas conectadas a Firebase Realtime Database.
  - Filtro por especialidades con desplazamiento táctil horizontal en móviles.
- **Portal de Administración Independiente (admin.html):**
  - Página dedicada y segura con barrera de acceso mediante PIN administrativo: `ADMIN2026` (o `04012021`).
  - Sincronización en la nube con Firebase Realtime Database (`totalbregis`).
  - **Módulo de Anuncios Intersticiales:** Activar o pausar anuncio al entrar, editar título, imagen, descripción, enlace o WhatsApp de destino y botón de acción, con previsualización en vivo (5 segundos).
  - **Configuración de Academia (Cursos de Capacitación):** Gestión completa de cursos prácticos (crear, editar, eliminar y activar) guardados en Firebase. Configurado por defecto con 1 solo curso de capacitación.
  - **Módulo de Alumnas y Contraseñas:** Métricas en tiempo real (KPIs), registro de nuevas alumnas, buscador en vivo y reseteo directo de contraseñas a la clave inicial (`TB2026`) con un solo clic.
- **Módulo Firebase (firebase-config.js):**
  - Conexión centralizada con Firebase Realtime Database y respaldo inteligente en caché local para navegación sin interrupciones.

---

## Sistema de Acceso de Alumnas

1. **Datos de Ingreso:** Exclusivamente **Matrícula** y **Contraseña**.
2. **Contraseña Inicial (`TB2026`):** Al detectarse, el sistema solicita de forma obligatoria que la alumna defina una contraseña nueva personal.
3. **Reseteo Administrativo:** Si la alumna olvida su clave, solo el administrador puede restablecerla a `TB2026` desde el panel.
4. **Soporte:** Enlace directo de asistencia a WhatsApp: **5650560824**.

---

## Estilo y Optimización Móvil

- **Paleta:** Fondo negro obsidiana (`#070709`) con acabados dorados metálicos (`#d4af37`).
- **Móvil:** Adaptabilidad completa para pantallas pequeñas (320px a 430px) y tabletas, con botones amigables para el pulgar, tarjetas proporcionales y prevención de zoom forzado.
- **Cero Emojis:** Se mantiene una estética estrictamente tipográfica y vectorial con iconos SVG minimalistas.

---

## Cómo Publicar en GitHub Pages

1. Inicie sesión en [GitHub](https://github.com/) y cree un repositorio público (por ejemplo: `total-beauty`).
2. En la terminal dentro de `TotalBeauty_GitHub`, ejecute:

```bash
git add .
git commit -m "Optimización móvil, encabezado con logo centrado y sistema de anuncios"
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, ingrese a **Settings** > **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
   - Guarde los cambios para activar su enlace web público.
