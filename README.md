# Total Beauty Salon & Academia - Portal Web

Página web de bienvenida y menú diseñada para Total Beauty Salon & Academia, optimizada para su publicación en **GitHub Pages** y visualización impecable en teléfonos móviles y computadoras.

---

## Estructura y Novedades del Proyecto

- **Página Principal (index.html):**
  - Encabezado con logotipo centrado y elegante sin elementos distractores.
  - Menú de 2 opciones optimizado para pantallas táctiles y móviles: **Salón** y **Academia**.
  - Anuncio intersticial modal al entrar con temporizador de 5 segundos antes de habilitar el botón de cierre.
- **Página de Academia (academia.html):**
  - Oferta completa de cursos prácticos (90% práctico y 10% teórico) con entrega de constancia de finalización.
  - Botón de acceso exclusivo para alumnas en la barra superior (**Soy Alumna / Ingresar**).
  - Filtro por especialidades con desplazamiento táctil horizontal en móviles.
- **Panel de Administración (Enlace en pie de página):**
  - Acceso mediante PIN administrativo: `ADMIN2026` (o `04012021`).
  - **Módulo de Anuncios Intersticiales:** Activar o desactivar anuncio al entrar, editar título, imagen, descripción, enlace o WhatsApp de destino y botón de acción, con opción de previsualización inmediata.
  - **Módulo de Alumnas:** Restablecer contraseñas olvidadas a la clave inicial por defecto (`TB2026`).

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
git commit -m "Optimizacion movil, encabezado con logo centrado y sistema de anuncios"
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, ingrese a **Settings** > **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
   - Guarde los cambios para activar su enlace web público.
