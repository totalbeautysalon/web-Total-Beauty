/**
 * TOTAL BEAUTY SALÓN & ACADEMIA
 * Módulo de Configuración y Servicios Firebase Realtime Database
 * Proyecto: totalbregis (https://totalbregis-default-rtdb.firebaseio.com)
 * Compatible con total-beauty-crm y respaldo offline completo
 * Cero Emojis - Arquitectura Segura y Confiable
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
    cursos: "portal_web/cursos",
    encuestas: "encuestas",
    cupones: "cupones",
    configCupones: "configuracion_cupones",
    mantenimiento: "portal_web/mantenimiento"
  };

  const LOCAL_CACHE = {
    announcement: "totalbeauty_announcement_data",
    alumnas: "totalbeauty_alumnas_db",
    cursos: "totalbeauty_cursos_db",
    encuestas: "totalbeauty_encuestas_db",
    cupones: "totalbeauty_cupones_db",
    configCupones: "totalbeauty_config_cupones",
    mantenimiento: "totalbeauty_mantenimiento_data"
  };

  const DEFAULT_CONFIG_CUPONES = {
    vigenciaDias: 30,
    descuentos: [
      { max: 300, porcentaje: 5, etiqueta: "Menos de $300" },
      { min: 300, max: 500, porcentaje: 10, etiqueta: "De $301 a $500" },
      { min: 500, max: 700, porcentaje: 15, etiqueta: "De $501 a $700" },
      { min: 700, porcentaje: 20, etiqueta: "Más de $701" }
    ]
  };

  const DEFAULT_MANTENIMIENTO = {
    activo: false,
    titulo: "Renovando Nuestra Experiencia para Ti",
    mensaje: "Estamos realizando mejoras exclusivas en nuestras plataformas digitales para brindarte un servicio más ágil y sofisticado. Nuestro salón físico y academia continúan operando con normalidad.",
    fechaFinEstimada: "",
    permitirWhatsapp: true,
    whatsappNumero: "525650560824",
    ultimaModificacion: new Date().toISOString()
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

  // ==========================================
  // GESTIÓN DE ENCUESTAS DE SATISFACCIÓN
  // ==========================================
  async function getEncuestas() {
    try {
      const res = await fetch(getUrl(PATHS.encuestas), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          localStorage.setItem(LOCAL_CACHE.encuestas, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("Conexión a Firebase no disponible para encuestas. Usando caché local.", err);
    }

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.encuestas);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error("Error al leer caché local de encuestas:", e);
    }
    return {};
  }

  async function saveEncuesta(data) {
    const id = data.id || `enc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const payload = {
      ...data,
      id,
      timestamp: data.timestamp || Date.now(),
      fechaRegistro: data.fechaRegistro || new Date().toISOString()
    };

    try {
      const current = await getEncuestas();
      current[id] = payload;
      localStorage.setItem(LOCAL_CACHE.encuestas, JSON.stringify(current));
    } catch (e) {
      console.error("Error al actualizar caché local de encuestas:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.encuestas}/${encodeURIComponent(id)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return { ok: res.ok, id, data: payload };
    } catch (err) {
      console.error("Error al guardar encuesta en Firebase:", err);
      return { ok: false, id, data: payload };
    }
  }

  // ==========================================
  // LÓGICA DE DESCUENTOS Y CUPONES DE SATISFACCIÓN
  // ==========================================
  function calculateDiscount(precio) {
    const p = parseFloat(precio);
    if (isNaN(p) || p <= 0) {
      return { porcentaje: 0, montoDescuento: 0, totalPagar: 0, rango: "Sin importe válido" };
    }
    let porcentaje = 5;
    let rango = "Menos de $300 (5%)";

    if (p <= 300) {
      porcentaje = 5;
      rango = "Menos de $300 (5%)";
    } else if (p <= 500) {
      porcentaje = 10;
      rango = "De $301 a $500 (10%)";
    } else if (p <= 700) {
      porcentaje = 15;
      rango = "De $501 a $700 (15%)";
    } else {
      porcentaje = 20;
      rango = "Más de $701 (20%)";
    }

    const montoDescuento = Math.round((p * porcentaje) / 100);
    const totalPagar = Math.max(0, p - montoDescuento);

    return {
      porcentaje,
      montoDescuento,
      totalPagar,
      rango
    };
  }

  function generateCouponCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TB-${code}`;
  }

  async function getCupones() {
    let cupones = {};
    try {
      const res = await fetch(getUrl(PATHS.cupones), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          cupones = data;
          localStorage.setItem(LOCAL_CACHE.cupones, JSON.stringify(cupones));
        }
      }
    } catch (err) {
      console.warn("Conexión a Firebase no disponible para cupones. Usando caché local.", err);
    }

    if (Object.keys(cupones).length === 0) {
      try {
        const cached = localStorage.getItem(LOCAL_CACHE.cupones);
        if (cached) cupones = JSON.parse(cached);
      } catch (e) {
        console.error("Error al leer caché local de cupones:", e);
      }
    }

    // Comprobar vencimiento automático de cupones disponibles
    const now = Date.now();
    let hasChanges = false;
    Object.keys(cupones).forEach(codigo => {
      const item = cupones[codigo];
      if (item && item.estado === 'disponible' && item.fechaVencimiento) {
        const expTime = new Date(item.fechaVencimiento).getTime();
        if (!isNaN(expTime) && now > expTime) {
          item.estado = 'vencido';
          item.updatedAt = now;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      try {
        localStorage.setItem(LOCAL_CACHE.cupones, JSON.stringify(cupones));
      } catch (e) {}
    }

    return cupones;
  }

  async function getCupon(codigo) {
    const cleanCode = (codigo || '').trim().toUpperCase();
    if (!cleanCode) return null;

    try {
      const res = await fetch(getUrl(`${PATHS.cupones}/${encodeURIComponent(cleanCode)}`), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.estado === 'disponible' && data.fechaVencimiento) {
            const expTime = new Date(data.fechaVencimiento).getTime();
            if (!isNaN(expTime) && Date.now() > expTime) {
              data.estado = 'vencido';
              saveCupon(cleanCode, data);
            }
          }
          return data;
        }
      }
    } catch (err) {
      console.warn("Error consultando cupón en Firebase:", err);
    }

    const all = await getCupones();
    return all[cleanCode] || null;
  }

  async function saveCupon(codigo, data) {
    const cleanCode = (codigo || '').trim().toUpperCase();
    if (!cleanCode) return false;

    const payload = {
      ...data,
      codigo: cleanCode,
      updatedAt: Date.now()
    };

    try {
      const current = await getCupones();
      current[cleanCode] = payload;
      localStorage.setItem(LOCAL_CACHE.cupones, JSON.stringify(current));
    } catch (e) {
      console.error("Error al actualizar caché local de cupón:", e);
    }

    try {
      const res = await fetch(getUrl(`${PATHS.cupones}/${encodeURIComponent(cleanCode)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Error guardando cupón en Firebase:", err);
      return false;
    }
  }

  async function canjearCupon(codigo, canjeData) {
    const cleanCode = (codigo || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "El código de cupón no es válido." };
    }

    // Consulta fresca
    const cupon = await getCupon(cleanCode);
    if (!cupon) {
      return { success: false, message: `El cupón ${cleanCode} no existe en el sistema.` };
    }

    if (cupon.estado === 'utilizado') {
      const fechaUso = cupon.fechaUtilizacion ? new Date(cupon.fechaUtilizacion).toLocaleString('es-MX') : 'previamente';
      return {
        success: false,
        message: `Este cupón ya fue utilizado el ${fechaUso}. No es posible volver a canjearlo.`,
        cupon
      };
    }

    const now = Date.now();
    const expTime = cupon.fechaVencimiento ? new Date(cupon.fechaVencimiento).getTime() : Infinity;
    if (cupon.estado === 'vencido' || now > expTime) {
      const fechaVenc = cupon.fechaVencimiento ? new Date(cupon.fechaVencimiento).toLocaleDateString('es-MX') : '';
      return {
        success: false,
        message: `El cupón venció el ${fechaVenc}. No está disponible para canje.`,
        cupon
      };
    }

    const precio = parseFloat(canjeData.precioOriginal);
    if (isNaN(precio) || precio <= 0) {
      return { success: false, message: "Debe ingresar un precio de servicio válido y mayor a $0." };
    }

    const calc = calculateDiscount(precio);

    const payload = {
      ...cupon,
      estado: 'utilizado',
      fechaUtilizacion: new Date().toISOString(),
      timestampUtilizacion: now,
      servicioCanje: (canjeData.servicio || 'Servicio General').trim(),
      precioOriginal: precio,
      descuentoPorcentaje: calc.porcentaje,
      descuentoImporte: calc.montoDescuento,
      totalPagado: calc.totalPagar,
      canjeadoPor: (canjeData.responsable || 'Recepción Total Beauty').trim(),
      notasCanje: (canjeData.notas || '').trim(),
      updatedAt: now
    };

    const saved = await saveCupon(cleanCode, payload);
    return {
      success: true,
      message: `¡Cupón ${cleanCode} canjeado con éxito! Se aplicó un ${calc.porcentaje}% de descuento (-$${calc.montoDescuento}).`,
      cupon: payload,
      calculo: calc,
      savedInFirebase: saved
    };
  }

  async function checkClientRecentSurvey(whatsapp, servicio) {
    const cleanTel = (whatsapp || '').replace(/\D/g, '');
    if (!cleanTel || cleanTel.length < 10) return { hasRecent: false };

    const encuestas = await getEncuestas();
    const cupones = await getCupones();
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const list = Object.values(encuestas).filter(e => {
      const tel = (e.whatsapp || '').replace(/\D/g, '');
      return tel === cleanTel;
    });

    if (list.length === 0) return { hasRecent: false };

    // Buscar encuesta reciente (últimas 24 horas o mismo servicio dentro de 48h)
    const recent = list.find(e => {
      const elapsed = now - (e.timestamp || 0);
      const sameService = servicio && e.servicio && e.servicio.toLowerCase() === servicio.toLowerCase();
      return elapsed < ONE_DAY_MS || (sameService && elapsed < (48 * 60 * 60 * 1000));
    });

    if (!recent) return { hasRecent: false };

    // Buscar si tiene cupón activo
    let activeCupon = null;
    if (recent.cuponCodigo && cupones[recent.cuponCodigo]) {
      activeCupon = cupones[recent.cuponCodigo];
    } else {
      activeCupon = Object.values(cupones).find(c => {
        const cTel = (c.whatsapp || '').replace(/\D/g, '');
        return cTel === cleanTel && c.estado === 'disponible';
      });
    }

    return {
      hasRecent: true,
      survey: recent,
      cupon: activeCupon
    };
  }

  async function getConfigCupones() {
    try {
      const res = await fetch(getUrl(PATHS.configCupones), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          localStorage.setItem(LOCAL_CACHE.configCupones, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {}

    try {
      const cached = localStorage.getItem(LOCAL_CACHE.configCupones);
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return DEFAULT_CONFIG_CUPONES;
  }

  async function saveConfigCupones(data) {
    const payload = {
      ...DEFAULT_CONFIG_CUPONES,
      ...data,
      updatedAt: Date.now()
    };
    localStorage.setItem(LOCAL_CACHE.configCupones, JSON.stringify(payload));
    try {
      const res = await fetch(getUrl(PATHS.configCupones), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // COMPROBACIÓN DE CONEXIÓN
  // ==========================================
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

  // ==========================================
  // SERVICIOS DE MODO MANTENIMIENTO TEMPORAL
  // ==========================================
  async function getMaintenanceMode() {
    try {
      const res = await fetch(getUrl(PATHS.mantenimiento), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = Object.assign({}, DEFAULT_MANTENIMIENTO, data);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(LOCAL_CACHE.mantenimiento, JSON.stringify(merged));
              localStorage.setItem('totalbeauty_maintenance_active', merged.activo ? 'true' : 'false');
            }
          } catch (e) {}
          return merged;
        }
      }
    } catch (err) {
      console.warn("Fallo lectura Firebase mantenimiento, usando respaldo local:", err);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(LOCAL_CACHE.mantenimiento);
        if (cached) return Object.assign({}, DEFAULT_MANTENIMIENTO, JSON.parse(cached));
      }
    } catch (e) {}

    return DEFAULT_MANTENIMIENTO;
  }

  async function saveMaintenanceMode(data) {
    const payload = Object.assign({}, DEFAULT_MANTENIMIENTO, data, {
      ultimaModificacion: new Date().toISOString()
    });

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_CACHE.mantenimiento, JSON.stringify(payload));
        localStorage.setItem('totalbeauty_maintenance_active', payload.activo ? 'true' : 'false');
      }
    } catch (e) {}

    try {
      await fetch(getUrl(PATHS.mantenimiento), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return payload;
    } catch (err) {
      console.error("Error al guardar mantenimiento en Firebase:", err);
      return payload;
    }
  }

  function initMaintenanceRedirect() {
    if (typeof window === 'undefined') return;
    try {
      const pathname = (window.location.pathname || '').toLowerCase();
      const isMantenimientoPage = pathname.endsWith('mantenimiento.html') || pathname.includes('mantenimiento.html');
      const isExempt = isMantenimientoPage ||
                       pathname.endsWith('admin.html') || pathname.includes('admin.html') ||
                       pathname.endsWith('validar-cupon.html') || pathname.includes('validar-cupon.html');

      const urlParams = new URLSearchParams(window.location.search);
      const isBypass = urlParams.get('bypass') === '1' ||
                       urlParams.get('preview') === '1' ||
                       sessionStorage.getItem('totalbeauty_admin_bypass') === 'true';

      if (isBypass && !isMantenimientoPage) return;

      // 1. Verificación instantánea vía localStorage para evitar parpadeos
      const isCachedActive = localStorage.getItem('totalbeauty_maintenance_active') === 'true';
      if (!isExempt && isCachedActive && !isBypass) {
        window.location.replace('mantenimiento.html');
        return;
      }

      // 2. Consulta asíncrona a Firebase RTDB
      getMaintenanceMode().then(mnt => {
        if (!isExempt) {
          if (mnt.activo && !isBypass) {
            window.location.replace('mantenimiento.html');
          }
        } else if (isMantenimientoPage) {
          if (!mnt.activo && urlParams.get('preview') !== '1') {
            window.location.replace('index.html');
          }
        }
      }).catch(() => {});
    } catch (e) {
      // Ignorar errores
    }
  }

  return {
    config: CONFIG,
    DEFAULT_CURSOS,
    DEFAULT_CONFIG_CUPONES,
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
    getEncuestas,
    saveEncuesta,
    calculateDiscount,
    generateCouponCode,
    getCupones,
    getCupon,
    saveCupon,
    canjearCupon,
    checkClientRecentSurvey,
    getConfigCupones,
    saveConfigCupones,
    getMaintenanceMode,
    saveMaintenanceMode,
    initMaintenanceRedirect,
    DEFAULT_MANTENIMIENTO,
    checkConnection
  };
})();

if (typeof window !== 'undefined') {
  window.TB_FIREBASE = TB_FIREBASE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TB_FIREBASE;
}
if (typeof window !== 'undefined') {
  try {
    TB_FIREBASE.initMaintenanceRedirect();
  } catch (e) {}
}
