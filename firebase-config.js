/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Modulo de Configuracion y Servicios Firebase Realtime Database
 * Proyecto: totalbregis (https://totalbregis-default-rtdb.firebaseio.com)
 * Cero Emojis - Arquitectura Segura con Respaldo Offline
 */

const TB_FIREBASE = (function () {
  'use strict';

  const CONFIG = {
    apiKey: "AIzaSyAcQRVT7DUGeJs63yWejuxGGaX9Hnv15xI",
    authDomain: "totalbregis.firebaseapp.com",
    databaseURL: "https://totalbregis-default-rtdb.firebaseio.com",
    projectId: "totalbregis",
    storageBucket: "totalbregis.firebasestorage.app",
    messagingSenderId: "630616601479",
    appId: "1:630616601479:web:3cf47df60bdc3aca165922"
  };

  const PATHS = {
    announcement: "portal_web/anuncio",
    alumnas: "portal_web/alumnas"
  };

  const LOCAL_CACHE = {
    announcement: "totalbeauty_announcement_data",
    alumnas: "totalbeauty_alumnas_db"
  };

  const DEFAULT_ANNOUNCEMENT = {
    enabled: true,
    title: "Inscripciones Abiertas a Cursos Practicos",
    image: "assets/images/academia.jpg",
    text: "Inicia tu formacion profesional con metodologia 90% practica en modelos reales. Cupo limitado para atencion personalizada en cabina.",
    link: "https://api.whatsapp.com/send?phone=525650560824&text=Hola%20Total%20Beauty%20Academia,%20deseo%20solicitar%20informes%20sobre%20las%20inscripciones%20a%20los%20cursos.",
    btnText: "Solicitar Informes por WhatsApp"
  };

  const DEFAULT_ALUMNAS = {
    "TB-01": {
      matricula: "TB-01",
      nombre: "Valeria Soto",
      curso: "Colorimetria y Balayage",
      password: "TB2026",
      isDefault: true,
      telefono: "5650560824"
    },
    "TB-02": {
      matricula: "TB-02",
      nombre: "Mariana Gomez",
      curso: "Estilismo y Corte Profesional",
      password: "TB2026",
      isDefault: true,
      telefono: "5650560824"
    },
    "TB-03": {
      matricula: "TB-03",
      nombre: "Camila Hernandez",
      curso: "Maquillaje Profesional y Social",
      password: "TB2026",
      isDefault: true,
      telefono: "5650560824"
    }
  };

  function getUrl(path) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${CONFIG.databaseURL}/${cleanPath}.json?_cb=${Date.now()}`;
  }

  // ==========================================
  // GESTION DE ANUNCIO INTERSTICIAL
  // ==========================================
  async function getAnnouncement() {
    try {
      const res = await fetch(getUrl(PATHS.announcement), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          localStorage.setItem(LOCAL_CACHE.announcement, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("Conexion a Firebase no disponible para anuncio. Usando cache local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.announcement);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer cache local de anuncio:", e);
    }

    localStorage.setItem(LOCAL_CACHE.announcement, JSON.stringify(DEFAULT_ANNOUNCEMENT));
    return DEFAULT_ANNOUNCEMENT;
  }

  async function saveAnnouncement(data) {
    const payload = {
      ...data,
      updatedAt: Date.now()
    };

    localStorage.setItem(LOCAL_CACHE.announcement, JSON.stringify(payload));

    try {
      const res = await fetch(getUrl(PATHS.announcement), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Error al guardar anuncio en Firebase Realtime Database:", err);
      return false;
    }
  }

  // ==========================================
  // GESTION DE ALUMNAS Y MATRICULAS
  // ==========================================
  async function getAlumnas() {
    try {
      const res = await fetch(getUrl(PATHS.alumnas), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          localStorage.setItem(LOCAL_CACHE.alumnas, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("Conexion a Firebase no disponible para alumnas. Usando cache local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.alumnas);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer cache local de alumnas:", e);
    }

    localStorage.setItem(LOCAL_CACHE.alumnas, JSON.stringify(DEFAULT_ALUMNAS));
    return DEFAULT_ALUMNAS;
  }

  async function getAlumna(matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return null;

    try {
      const res = await fetch(getUrl(`${PATHS.alumnas}/${encodeURIComponent(cleanMatricula)}`), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (err) {
      console.warn("Error consultando alumna en Firebase:", err);
    }

    const alumnas = await getAlumnas();
    return alumnas[cleanMatricula] || null;
  }

  async function saveAlumna(matricula, alumnaData) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return false;

    const payload = {
      matricula: cleanMatricula,
      nombre: alumnaData.nombre || "Alumna Registrada",
      curso: alumnaData.curso || "Cursos Practicos Total Beauty",
      password: alumnaData.password || "TB2026",
      isDefault: typeof alumnaData.isDefault === 'boolean' ? alumnaData.isDefault : true,
      telefono: alumnaData.telefono || "5650560824",
      updatedAt: Date.now()
    };

    // Actualiza cache local
    try {
      const current = await getAlumnas();
      current[cleanMatricula] = payload;
      localStorage.setItem(LOCAL_CACHE.alumnas, JSON.stringify(current));
    } catch (e) {
      console.error("Error actualizando cache local de alumna:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.alumnas}/${encodeURIComponent(cleanMatricula)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Error guardando alumna en Firebase:", err);
      return false;
    }
  }

  async function resetAlumnaPassword(matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return false;

    const alumna = await getAlumna(cleanMatricula);
    if (!alumna) return false;

    alumna.password = "TB2026";
    alumna.isDefault = true;
    alumna.updatedAt = Date.now();

    return await saveAlumna(cleanMatricula, alumna);
  }

  async function updateAlumnaPassword(matricula, newPassword) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return false;

    const alumna = await getAlumna(cleanMatricula);
    if (!alumna) return false;

    alumna.password = newPassword;
    alumna.isDefault = false;
    alumna.updatedAt = Date.now();

    return await saveAlumna(cleanMatricula, alumna);
  }

  async function deleteAlumna(matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return false;

    try {
      const current = await getAlumnas();
      if (current[cleanMatricula]) {
        delete current[cleanMatricula];
        localStorage.setItem(LOCAL_CACHE.alumnas, JSON.stringify(current));
      }
    } catch (e) {
      console.error("Error eliminando en cache local:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.alumnas}/${encodeURIComponent(cleanMatricula)}`), {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error("Error eliminando alumna en Firebase:", err);
      return false;
    }
  }

  async function checkConnection() {
    try {
      const res = await fetch(getUrl('portal_web'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  return {
    config: CONFIG,
    getAnnouncement,
    saveAnnouncement,
    getAlumnas,
    getAlumna,
    saveAlumna,
    resetAlumnaPassword,
    updateAlumnaPassword,
    deleteAlumna,
    checkConnection
  };
})();
