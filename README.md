# Total Beauty Salon & Academia - Portal Web

Página de menú y bienvenida diseñada para Total Beauty Salon & Academia, optimizada para su publicación en **GitHub Pages**.

---

## Estructura del Proyecto

- **Estilo:** Minimalista y sobrio (Luxury Dark).
- **Paleta de Colores:** Fondo negro profundo (`#070709`) con detalles y gradientes dorados metálicos (`#d4af37`).
- **Arquitectura:**
  - **index.html:** Portal principal con logotipo y acceso directo para alumnas al lado:
    - **Opción Soy Alumna / Ingresar:** Sistema de autenticación de alumnas.
    - **Salón:** Servicios de peluquería, colorimetría, maquillaje y spa capilar.
    - **Academia:** Acceso directo a la página especializada de cursos.
  - **academia.html:** Página especializada de la academia con cursos profesionales (90% práctico y 10% teórico), filtros por área (Estilismo, Colorimetría, Maquillaje, Uñas y Mirada), entrega de Constancia de Finalización y contacto directo por WhatsApp.
  - **Cero emojis:** Todos los archivos mantienen una presentación tipográfica y vectorial pura sin emojis.

---

## Sistema de Acceso de Alumnas (Portal Académico)

1. **Datos de Acceso:**
   - Se ingresa exclusivamente con **Matrícula** y **Contraseña**.
   - La contraseña inicial asignada por defecto es **TB2026**.

2. **Detección y Cambio Obligatorio:**
   - Al detectar la contraseña por defecto (**TB2026**), el sistema solicita de forma obligatoria que la alumna defina una contraseña nueva y personal para continuar.

3. **Restablecimiento Administrativo:**
   - Únicamente el administrador puede resetear la contraseña de una alumna a la clave por defecto (**TB2026**) desde el enlace de administración del portal.
   - Una vez reseteada, cuando la alumna vuelva a ingresar se le solicitará nuevamente cambiarla.

4. **Soporte y Recuperación:**
   - Si una alumna olvida su contraseña, el enlace de soporte dirige a WhatsApp al número oficial de Total Beauty Academia: **5650560824**.

---

## Metodología y Oferta Académica

- **Formato:** Exclusivamente **Cursos de Capacitación** (sin diplomados).
- **Metodología:** **90% Práctico y 10% Teórico** en modelos reales.
- **Acreditación:** Obtención de **Constancia de Finalización** oficial al concluir las horas prácticas.

---

## Cómo Publicar en GitHub Pages

1. Inicie sesión en [GitHub](https://github.com/) y cree un repositorio público (por ejemplo: `total-beauty`).
2. En la terminal dentro de `TotalBeauty_GitHub`, ejecute:

```bash
git add .
git commit -m "Portal de alumnas con regla TB2026 y cursos 90 por ciento practicos"
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, ingrese a **Settings** > **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
   - Guarde los cambios para activar la dirección web pública.
