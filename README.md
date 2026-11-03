# Total Beauty Salon & Academia - Portal Web

Página de bienvenida y menú principal diseñada para Total Beauty Salon & Academia, optimizada para su publicación directa en **GitHub Pages**.

---

## Características del Diseño

- **Estilo:** Minimalista, sobrio y de alta gama (Luxury Dark).
- **Paleta de Colores:** Fondo negro profundo con detalles y gradientes dorados metalizados.
- **Estructura:**
  - Encabezado con logotipo oficial y tipografía de lujo.
  - Mensaje de bienvenida formal y exclusivo.
  - Menú principal con 2 opciones destacadas: **Salón** y **Academia**.
  - Imágenes fotográficas de alta resolución para cada opción con superposición estética para máxima legibilidad.
  - Modal interactivo con sub-opciones y enlaces de contacto directo.
  - Pie de página con enlaces a redes sociales oficiales (Instagram y Facebook).
  - Cero emojis en todos los archivos del proyecto, manteniendo una estética puramente tipográfica y vectorial.

---

## Estructura de Archivos

```text
TotalBeauty_GitHub/
│
├── index.html              # Archivo principal de la página
├── styles.css              # Estilos CSS premium (responsivo y animaciones)
├── script.js               # Control de interacciones y ventana modal
├── .nojekyll               # Archivo de configuración para GitHub Pages
├── README.md               # Instrucciones de uso y despliegue
└── assets/
    ├── favicon.ico         # Icono del sitio
    └── images/
        ├── logoheader.png  # Logotipo oficial horizontal
        ├── logo.png        # Logotipo alternativo
        ├── salon.jpg       # Fotografía representativa del Salón
        └── academia.jpg    # Fotografía representativa de la Academia
```

---

## Cómo Publicar en GitHub Pages

Para publicar este portal y tener una dirección web pública y gratuita (por ejemplo: `https://tu-usuario.github.io/total-beauty/`):

### Paso 1: Crear el repositorio en GitHub
1. Inicie sesión en [GitHub](https://github.com/).
2. Haga clic en el botón **New** (Nuevo repositorio).
3. Asigne un nombre al repositorio (por ejemplo: `total-beauty` o `menu-total-beauty`).
4. Seleccione **Public** (Público).
5. Deje las casillas de inicialización vacías y haga clic en **Create repository**.

### Paso 2: Subir los archivos
Puede subir los archivos mediante la terminal de comandos o directamente en la página web de GitHub:

#### Opción A: Por línea de comandos (Git)
Abra una terminal en la carpeta `TotalBeauty_GitHub` y ejecute:

```bash
git init
git add .
git commit -m "Publicacion portal Total Beauty Salon y Academia"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

#### Opción B: Desde el navegador
1. En la página de su repositorio recién creado en GitHub, haga clic en **uploading an existing file**.
2. Arrastre todo el contenido de la carpeta `TotalBeauty_GitHub` (el archivo `index.html`, `styles.css`, `script.js`, `.nojekyll` y la carpeta `assets`).
3. Haga clic en **Commit changes**.

---

### Paso 3: Activar GitHub Pages
1. Dentro de su repositorio en GitHub, vaya a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, seleccione **Pages**.
3. En la sección **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** Seleccione `main` y la carpeta `/ (root)`
4. Haga clic en **Save** (Guardar).
5. Espere entre 1 y 2 minutos. GitHub generará un enlace público en la parte superior de esa misma sección.

---

## Personalización de Enlaces Directos

Si desea que al hacer clic en **Ingresar al Salón** o **Ingresar a la Academia** el usuario sea redirigido directamente a páginas externas en lugar de abrir el menú interactivo:

1. Abra el archivo `script.js`.
2. Modifique las primeras líneas con las direcciones que desee:

```javascript
const config = {
  salonUrl: "https://tudominio.com/salon",        // Su enlace para Salón
  academiaUrl: "https://tudominio.com/academia",  // Su enlace para Academia
  whatsappNumber: "521XXXXXXXXXX",               // Su número de WhatsApp
};
```
Si deja las comillas vacías (`""`), la página abrirá automáticamente la ventana modal con las opciones de reserva y contacto.
