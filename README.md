# Total Beauty Salon & Academia - Portal Web

Página de menú y bienvenida diseñada para Total Beauty Salon & Academia, optimizada para su publicación directa en **GitHub Pages**.

---

## Estructura del Proyecto

- **Estilo:** Minimalista y sobrio (Luxury Dark).
- **Paleta de Colores:** Fondo negro profundo (`#070709`) con detalles y gradientes dorados metálicos (`#d4af37`).
- **Arquitectura:**
  - **index.html:** Portal de bienvenida con menú de opciones compacto:
    - **Salón:** Servicios de peluquería, colorimetría, maquillaje y spa.
    - **Academia:** Acceso directo a la página especializada de formación.
  - **academia.html:** Página especializada de la academia con diplomados, masterclasses, filtros por área de especialidad (Estilismo, Colorimetría, Maquillaje, Uñas y Mirada), metodología y contacto de inscripciones.
  - **Cero emojis:** Todos los archivos mantienen una presentación tipográfica y vectorial pura sin emojis.

---

## Estructura de Archivos

```text
TotalBeauty_GitHub/
│
├── index.html              # Portal de bienvenida y menú principal
├── academia.html           # Página especializada de la Academia
├── styles.css              # Hoja de estilos compartida (Luxury Dark & Dorado)
├── script.js               # Control de interacciones, filtros y modales
├── .nojekyll               # Configuración para GitHub Pages
├── README.md               # Documentación
└── assets/
    ├── favicon.ico         # Icono del sitio
    └── images/
        ├── logoheader.png  # Logotipo oficial horizontal
        ├── logo.png        # Logotipo alternativo
        ├── salon.jpg       # Fotografía del Salón
        └── academia.jpg    # Fotografía de la Academia
```

---

## Cómo Publicar en GitHub Pages

1. Inicie sesión en [GitHub](https://github.com/) y cree un nuevo repositorio público (por ejemplo: `total-beauty`).
2. En la terminal dentro de `TotalBeauty_GitHub`, ejecute:

```bash
git add .
git commit -m "Actualizacion de diseno compacto y pagina de academia"
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, ingrese a **Settings** > **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
   - Guarde los cambios para activar la dirección web pública.
