/**
 * TOTAL BEAUTY SALÓN & ACADEMIA
 * Módulo de Configuración y Servicios Firebase Realtime Database
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
    alumnas: "portal_web/alumnas",
    cursos: "portal_web/cursos"
  };

  const LOCAL_CACHE = {
    announcement: "totalbeauty_announcement_data",
    alumnas: "totalbeauty_alumnas_db",
    cursos: "totalbeauty_cursos_db"
  };

  const DEFAULT_CURSOS = {
    "curso-01": {
      id: "curso-01",
      titulo: "Curso de Colorimetría Avanzada & Balayage Profesional",
      categoria: "Colorimetría & Estilismo",
      categoriaKey: "colorimetria",
      modalidad: "90% Práctico",
      duracion: "Presencial • Modelos Reales",
      descripcion: "Capacitación intensiva y personalizada en formulación de tintes, técnicas de difuminado balayage, neutralización de reflejos y trabajo directo sobre modelos reales en cabina.",
      tema1: "Práctica continua en estaciones con modelos reales",
      tema2: "10% teoría sobre visagismo capilar y fondos de aclaración",
      tema3: "Entrega de Constancia de Finalización oficial",
      whatsappMsg: "Hola Total Beauty Academia, solicito informes detallados sobre el Curso de Colorimetría Avanzada y Balayage.",
      activo: true
    }
  };

  const DEFAULT_ANNOUNCEMENT = {
    enabled: true,
    title: "Inscripciones Abiertas a Cursos Prácticos",
    image: "assets/images/academia.jpg",
    text: "Inicia tu formación profesional con metodología 90% práctica en modelos reales. Cupo limitado para atención personalizada en cabina.",
    link: "https://api.whatsapp.com/send?phone=525650560824&text=Hola%20Total%20Beauty%20Academia,%20deseo%20solicitar%20informes%20sobre%20las%20inscripciones%20a%20los%20cursos.",
    btnText: "Solicitar Informes por WhatsApp"
  };

  const DEFAULT_ALUMNAS = {
    "TB-01": {
      matricula: "TB-01",
      nombre: "Valeria Soto",
      curso: "Colorimetría y Balayage",
      password: "TB2026",
      isDefault: true,
      telefono: "5650560824"
    },
    "TB-02": {
      matricula: "TB-02",
      nombre: "Mariana Gómez",
      curso: "Estilismo y Corte Profesional",
      password: "TB2026",
      isDefault: true,
      telefono: "5650560824"
    },
    "TB-03": {
      matricula: "TB-03",
      nombre: "Camila Hernández",
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
  // GESTIÓN DE ANUNCIO INTERSTICIAL
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
      console.warn("Conexión a Firebase no disponible para anuncio. Usando caché local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.announcement);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer caché local de anuncio:", e);
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
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Error al guardar anuncio en Firebase Realtime Database:", err);
      return false;
    }
  }

  // ==========================================
  // GESTIÓN DE ALUMNAS Y MATRÍCULAS
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
      console.warn("Conexión a Firebase no disponible para alumnas. Usando caché local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.alumnas);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer caché local de alumnas:", e);
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
      curso: alumnaData.curso || "Cursos Prácticos Total Beauty",
      password: alumnaData.password || "TB2026",
      isDefault: typeof alumnaData.isDefault === 'boolean' ? alumnaData.isDefault : true,
      telefono: alumnaData.telefono || "5650560824",
      updatedAt: Date.now()
    };

    try {
      const current = await getAlumnas();
      current[cleanMatricula] = payload;
      localStorage.setItem(LOCAL_CACHE.alumnas, JSON.stringify(current));
    } catch (e) {
      console.error("Error actualizando caché local de alumna:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.alumnas}/${encodeURIComponent(cleanMatricula)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
      console.error("Error eliminando en caché local:", e);
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

  // ==========================================
  // GESTIÓN DE CURSOS DE CAPACITACIÓN
  // ==========================================
  async function getCursos() {
    try {
      const res = await fetch(getUrl(PATHS.cursos), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          localStorage.setItem(LOCAL_CACHE.cursos, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("Conexión a Firebase no disponible para cursos. Usando caché local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.cursos);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer caché local de cursos:", e);
    }

    localStorage.setItem(LOCAL_CACHE.cursos, JSON.stringify(DEFAULT_CURSOS));
    return DEFAULT_CURSOS;
  }

  async function getCurso(id) {
    const cleanId = (id || '').trim();
    if (!cleanId) return null;

    try {
      const res = await fetch(getUrl(`${PATHS.cursos}/${encodeURIComponent(cleanId)}`), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (err) {
      console.warn("Error consultando curso en Firebase:", err);
    }

    const cursos = await getCursos();
    return cursos[cleanId] || null;
  }

  async function saveCurso(id, cursoData) {
    const cleanId = (id || '').trim();
    if (!cleanId) return false;

    const payload = {
      id: cleanId,
      titulo: cursoData.titulo || "Curso de Capacitación",
      categoria: cursoData.categoria || "Especialidad Práctica",
      categoriaKey: cursoData.categoriaKey || "general",
      modalidad: cursoData.modalidad || "90% Práctico",
      duracion: cursoData.duracion || "Presencial • Modelos Reales",
      descripcion: cursoData.descripcion || "",
      tema1: cursoData.tema1 || "Práctica guiada continua en modelos reales",
      tema2: cursoData.tema2 || "10% teoría sobre visagismo capilar y fundamentos",
      tema3: cursoData.tema3 || "Entrega de Constancia de Finalización oficial",
      whatsappMsg: cursoData.whatsappMsg || "Hola Total Beauty Academia, solicito informes detallados sobre este curso.",
      activo: typeof cursoData.activo === 'boolean' ? cursoData.activo : true,
      updatedAt: Date.now()
    };

    try {
      const current = await getCursos();
      current[cleanId] = payload;
      localStorage.setItem(LOCAL_CACHE.cursos, JSON.stringify(current));
    } catch (e) {
      console.error("Error actualizando caché local de curso:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.cursos}/${encodeURIComponent(cleanId)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Error guardando curso en Firebase:", err);
      return false;
    }
  }

  async function deleteCurso(id) {
    const cleanId = (id || '').trim();
    if (!cleanId) return false;

    try {
      const current = await getCursos();
      if (current[cleanId]) {
        delete current[cleanId];
        localStorage.setItem(LOCAL_CACHE.cursos, JSON.stringify(current));
      }
    } catch (e) {
      console.error("Error eliminando curso en caché local:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.cursos}/${encodeURIComponent(cleanId)}`), {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error("Error eliminando curso en Firebase:", err);
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
    DEFAULT_CURSOS,
    getAnnouncement,
    saveAnnouncement,
    getAlumnas,
    getAlumna,
    saveAlumna,
    resetAlumnaPassword,
    updateAlumnaPassword,
    deleteAlumna,
    getCursos,
    getCurso,
    saveCurso,
    deleteCurso,
    checkConnection
  };
})();
