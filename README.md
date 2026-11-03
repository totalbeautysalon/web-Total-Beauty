# Total Beauty Salon & Academia - Portal Web

Página de menú y bienvenida diseñada para Total Beauty Salon & Academia, optimizada para su publicación directa en **GitHub Pages**.

---

## Estructura del Proyecto

- **Estilo:** Minimalista y sobrio (Luxury Dark).
- **Paleta de Colores:** Fondo negro profundo (`#070709`) con detalles y gradientes dorados metálicos (`#d4af37`).
- **Arquitectura:**
  - **index.html:** Portal principal con logotipo y acceso directo para alumnas al lado:
    - **Opción Soy Alumna / Ingresar:** Botón de acceso al portal académico / aula virtual junto al logotipo.
    - **Salón:** Servicios de peluquería, colorimetría, maquillaje y spa capilar.
    - **Academia:** Acceso directo a la página especializada de formación.
  - **academia.html:** Página especializada de la academia con diplomados, masterclasses, filtros por área de especialidad (Estilismo, Colorimetría, Maquillaje, Uñas y Mirada), metodología, contacto de inscripciones y botón de acceso a alumnas en la barra superior.
  - **Cero emojis:** Todos los archivos mantienen una presentación tipográfica y vectorial pura sin emojis.

---

## Configuración de Enlaces

En el archivo `script.js` se pueden configurar los siguientes enlaces directos:

```javascript
const config = {
  salonUrl: "",          // Si desea redirigir a un sitio externo de citas
  studentPortalUrl: "",  // Si cuenta con aula virtual / intranet para alumnas
  whatsappNumber: "5210000000000",
};
```

---

## Cómo Publicar en GitHub Pages

1. Inicie sesión en [GitHub](https://github.com/) y cree un repositorio público (por ejemplo: `total-beauty`).
2. En la terminal dentro de `TotalBeauty_GitHub`, ejecute:

```bash
git add .
git commit -m "Agregada opcion de Soy Alumna / Ingresar junto al logo"
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

3. En GitHub, ingrese a **Settings** > **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
   - Guarde los cambios para activar la dirección web pública.
