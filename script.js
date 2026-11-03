/**
 * TOTAL BEAUTY SALÓN & ACADEMIA
 * Script de Navegación, Anuncio Intersticial (5s), Acceso de Alumnas e Integración Firebase
 * Cero Emojis - Estética Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Configuración general
  const config = {
    salonUrl: "",
    defaultPassword: "TB2026",
    whatsappPhone: "525650560824",
    whatsappDisplay: "5650560824"
  };

  let interstitialTimerInterval = null;
  let interstitialCanClose = false;
  let videoTimerInterval = null;
  let videoCanClose = false;
  let currentActiveStudent = null;
  let pendingChangeMatricula = null;
  let currentGalleryPhotos = [];
  let currentLightboxIndex = 0;

  // Inicialización
  init();

  async function init() {
    await initAcademyVideoModal();
    await initInterstitial();
    await loadAcademyCourses();
    await initAcademyGallery();
  }

  // ==========================================
  // 1. ANUNCIO DE VIDEO EXCLUSIVO DE ACADEMIA (PRESENTACIÓN.MP4)
  // ==========================================
  async function initAcademyVideoModal() {
    const videoModal = document.getElementById('academyVideoModal');
    const videoEl = document.getElementById('academyPresentationVideo');
    if (!videoModal || !videoEl) return;

    // Cierre automático al finalizar la reproducción completa del video
    videoEl.onended = () => {
      window.closeAcademyVideoModal(true);
    };

    // Permitir cierre al hacer clic en el fondo oscuro tras transcurrir 5 segundos
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal && videoCanClose) {
        window.closeAcademyVideoModal();
      }
    });

    // Muestra el video como anuncio al ingresar a la academia tras 400ms
    setTimeout(() => {
      openAcademyVideoModal();
    }, 400);
  }

  function openAcademyVideoModal() {
    const videoModal = document.getElementById('academyVideoModal');
    const videoEl = document.getElementById('academyPresentationVideo');
    if (!videoModal) return;

    videoModal.style.display = 'flex';
    void videoModal.offsetWidth;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    startVideoCountdown();

    if (videoEl) {
      // Iniciar reproducción; si las políticas del navegador bloquean el sonido automático, continuar silenciado
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        });
      }
    }
  }

  function startVideoCountdown() {
    const countdownEl = document.getElementById('videoCountdownText');
    const closeBtn = document.getElementById('videoCloseBtn');
    let secondsLeft = 5;
    videoCanClose = false;

    if (countdownEl) {
      countdownEl.style.display = 'inline-flex';
      countdownEl.textContent = `Cerrar en ${secondsLeft}s`;
    }
    if (closeBtn) {
      closeBtn.style.display = 'none';
    }

    if (videoTimerInterval) clearInterval(videoTimerInterval);

    videoTimerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        if (countdownEl) countdownEl.textContent = `Cerrar en ${secondsLeft}s`;
      } else {
        clearInterval(videoTimerInterval);
        videoCanClose = true;
        if (countdownEl) countdownEl.style.display = 'none';
        if (closeBtn) {
          closeBtn.style.display = 'inline-flex';
          closeBtn.style.animation = 'fadeIn 0.35s ease forwards';
        }
      }
    }, 1000);
  }

  window.closeAcademyVideoModal = function (force = false) {
    if (!videoCanClose && !force) return;

    const videoModal = document.getElementById('academyVideoModal');
    const videoEl = document.getElementById('academyPresentationVideo');

    // Pausar inmediatamente el video para que el audio no continúe sonando
    if (videoEl) {
      videoEl.pause();
    }

    if (videoTimerInterval) {
      clearInterval(videoTimerInterval);
    }

    if (videoModal) {
      videoModal.classList.remove('active');
      setTimeout(() => {
        videoModal.style.display = 'none';
      }, 350);
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // 1. SISTEMA DE ANUNCIO INTERSTICIAL (AL ENTRAR)
  // ==========================================
  async function initInterstitial() {
    const overlay = document.getElementById('interstitialOverlay');
    if (!overlay) return;

    let data;
    if (typeof TB_FIREBASE !== 'undefined') {
      data = await TB_FIREBASE.getAnnouncement();
    } else {
      data = {
        enabled: true,
        title: "Inscripciones Abiertas a Cursos Prácticos",
        image: "assets/images/academia.jpg",
        text: "Inicia tu formación profesional con metodología 90% práctica en modelos reales.",
        link: `https://api.whatsapp.com/send?phone=${config.whatsappPhone}`,
        btnText: "Solicitar Informes por WhatsApp"
      };
    }

    if (!data || !data.enabled) return;

    renderInterstitialContent(data);

    // Muestra el anuncio tras 500ms al entrar a la página
    setTimeout(() => {
      openInterstitialModal();
    }, 500);
  }

  function renderInterstitialContent(data) {
    const titleEl = document.getElementById('interstitialTitle');
    const imgEl = document.getElementById('interstitialImg');
    const textEl = document.getElementById('interstitialText');
    const btnEl = document.getElementById('interstitialBtn');
    const btnTextEl = document.getElementById('interstitialBtnText');

    if (titleEl) titleEl.textContent = data.title || "Aviso Oficial";
    if (imgEl && data.image) imgEl.src = data.image;
    if (textEl) textEl.textContent = data.text || "";

    if (btnEl) {
      btnEl.href = data.link || `https://api.whatsapp.com/send?phone=${config.whatsappPhone}`;
      if (btnTextEl) btnTextEl.textContent = data.btnText || "Solicitar Informes";
    }
  }

  function openInterstitialModal() {
    const overlay = document.getElementById('interstitialOverlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    startInterstitialTimer();
  }

  function startInterstitialTimer() {
    const countdownEl = document.getElementById('interstitialCountdownText');
    const closeBtn = document.getElementById('interstitialCloseBtn');
    let secondsLeft = 5;
    interstitialCanClose = false;

    if (countdownEl) {
      countdownEl.style.display = 'inline-flex';
      countdownEl.textContent = `Cerrar en ${secondsLeft}s`;
    }
    if (closeBtn) {
      closeBtn.style.display = 'none';
    }

    if (interstitialTimerInterval) clearInterval(interstitialTimerInterval);

    interstitialTimerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        if (countdownEl) countdownEl.textContent = `Cerrar en ${secondsLeft}s`;
      } else {
        clearInterval(interstitialTimerInterval);
        interstitialCanClose = true;
        if (countdownEl) countdownEl.style.display = 'none';
        if (closeBtn) {
          closeBtn.style.display = 'inline-flex';
          closeBtn.style.animation = 'fadeIn 0.35s ease forwards';
        }
      }
    }, 1000);
  }

  window.closeInterstitial = function () {
    if (!interstitialCanClose) return;

    const overlay = document.getElementById('interstitialOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 350);
      document.body.style.overflow = '';
    }
    if (interstitialTimerInterval) clearInterval(interstitialTimerInterval);
  };

  // ==========================================
  // 2. PORTAL DE ALUMNAS EN ACADEMIA.HTML (FIREBASE)
  // ==========================================
  const studentModal = document.getElementById('studentModal') || document.getElementById('studentPortalModal');

  window.openStudentPortal = window.openStudentModal = function () {
    if (!studentModal) return;

    studentModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (currentActiveStudent) {
      showStudentView('dashboard');
    } else {
      showStudentView('login');
      const matInput = document.getElementById('studentMatricula') || document.getElementById('studentLoginMatricula');
      if (matInput) matInput.focus();
    }
  };

  window.closeStudentModal = function () {
    if (studentModal) {
      studentModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  function showStudentView(viewName) {
    const vLogin = document.getElementById('studentViewLogin') || document.getElementById('studentLoginView');
    const vChange = document.getElementById('studentViewChangePass') || document.getElementById('studentChangePassView');
    const vDash = document.getElementById('studentViewDashboard');

    if (vLogin) vLogin.style.display = (viewName === 'login') ? 'block' : 'none';
    if (vChange) vChange.style.display = (viewName === 'change') ? 'block' : 'none';
    if (vDash) vDash.style.display = (viewName === 'dashboard') ? 'block' : 'none';
  }

  window.handleStudentLogin = async function (e) {
    e.preventDefault();
    const matInput = document.getElementById('studentMatricula') || document.getElementById('studentLoginMatricula');
    const passInput = document.getElementById('studentPassword') || document.getElementById('studentLoginPassword');

    const matricula = (matInput ? matInput.value : '').trim().toUpperCase();
    const password = (passInput ? passInput.value : '').trim();

    if (!matricula || !password) {
      alertNotice("Por favor ingrese su matrícula y contraseña.");
      return;
    }

    let student = null;
    if (typeof TB_FIREBASE !== 'undefined') {
      student = await TB_FIREBASE.getAlumna(matricula);
    }

    if (!student) {
      alertNotice("Matrícula no encontrada en el sistema académico. Solicite su alta al WhatsApp 5650560824.");
      return;
    }

    if (student.password !== password) {
      alertNotice("Contraseña incorrecta. Si la olvidó, contacte a Total Beauty al WhatsApp 5650560824.");
      return;
    }

    pendingChangeMatricula = matricula;

    // Si la contraseña es la clave inicial TB2026, exige cambiarla obligatoriamente
    if (password === config.defaultPassword || student.isDefault === true) {
      const noticeMatEl = document.getElementById('changePassNoticeMatricula');
      if (noticeMatEl) noticeMatEl.textContent = matricula;

      const targetMatEl = document.getElementById('changePassTargetMatricula');
      if (targetMatEl) targetMatEl.value = matricula;

      showStudentView('change');
      alertNotice("Seguridad: Clave inicial detectada. Por favor elija una contraseña personal.");
      const newPassInput = document.getElementById('newStudentPass');
      if (newPassInput) newPassInput.focus();
      return;
    }

    // Acceso correcto al aula
    currentActiveStudent = student;
    renderStudentDashboard(student);
    showStudentView('dashboard');
    alertNotice(`Bienvenida, ${student.nombre || student.matricula}. Acceso académico activo.`);
  };

  window.handlePasswordChange = window.handleStudentChangePassword = async function (e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newStudentPass');
    const confirmPassInput = document.getElementById('confirmStudentPass');

    const matricula = pendingChangeMatricula;
    const newPass = (newPassInput ? newPassInput.value : '').trim();
    const confirmPass = (confirmPassInput ? confirmPassInput.value : '').trim();

    if (!matricula) {
      alertNotice("Error de sesión. Ingrese nuevamente.");
      showStudentView('login');
      return;
    }

    if (!newPass || !confirmPass) {
      alertNotice("Por favor complete los campos de contraseña.");
      return;
    }

    if (newPass !== confirmPass) {
      alertNotice("Las contraseñas no coinciden. Verifique nuevamente.");
      return;
    }

    if (newPass === config.defaultPassword) {
      alertNotice("La nueva contraseña no puede ser la clave por defecto TB2026. Elija una clave personal.");
      return;
    }

    if (newPass.length < 5) {
      alertNotice("Por seguridad, su nueva contraseña debe tener al menos 5 caracteres.");
      return;
    }

    if (typeof TB_FIREBASE !== 'undefined') {
      await TB_FIREBASE.updateAlumnaPassword(matricula, newPass);
      currentActiveStudent = await TB_FIREBASE.getAlumna(matricula);
    }

    alertNotice("Contraseña actualizada correctamente en Firebase. Bienvenida al aula.");
    renderStudentDashboard(currentActiveStudent || { matricula });
    showStudentView('dashboard');
  };

  function renderStudentDashboard(student) {
    const dashMat = document.getElementById('dashMatricula');
    if (dashMat) dashMat.textContent = student.matricula || "TB-01";
  }

  window.logoutStudent = function () {
    currentActiveStudent = null;
    pendingChangeMatricula = null;
    showStudentView('login');
    const passInput = document.getElementById('studentPassword') || document.getElementById('studentLoginPassword');
    if (passInput) passInput.value = '';
    window.closeStudentModal();
    alertNotice("Sesión académica finalizada.");
  };

  if (studentModal) {
    studentModal.addEventListener('click', (e) => {
      if (e.target === studentModal) {
        window.closeStudentModal();
      }
    });
  }

  // ==========================================
  // 3. MODAL DE SERVICIOS EN INDEX.HTML (SALÓN)
  // ==========================================
  const modalData = {
    salon: {
      tag: "Total Beauty Salón",
      title: "Servicios de Salón",
      description: "Seleccione una opción para comunicarse con recepción o agendar su cita:",
      options: [
        {
          label: "Reservar Cita Personalizada",
          action: () => openBookingModal(),
          detail: "Atención prioritaria"
        },
        {
          label: "Catálogo de Servicios y Precios",
          action: () => alertNotice("Catálogo de servicios disponible en recepción y vía digital."),
          detail: "Corte, colorimetría, spa"
        },
        {
          label: "Contactar Recepción por WhatsApp",
          action: () => openWhatsApp("Hola, deseo solicitar informes y agendar una cita en Total Beauty Salón."),
          detail: "Respuesta directa (5650560824)"
        }
      ]
    }
  };

  const modalOverlay = document.getElementById('optionsModal');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalLinksContainer = document.getElementById('modalLinksContainer');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  window.openModal = function (type) {
    if (type === 'salon' && config.salonUrl) {
      window.location.href = config.salonUrl;
      return;
    }

    const data = modalData[type];
    if (!data || !modalOverlay) return;

    if (modalTag) modalTag.textContent = data.tag;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.description;

    if (modalLinksContainer) {
      modalLinksContainer.innerHTML = '';
      data.options.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'modal-link-btn';
        btn.innerHTML = `
          <div style="text-align: left;">
            <div>${item.label}</div>
            <small style="font-size: 0.72rem; color: #a6a6b0; letter-spacing: 0.05em;">${item.detail}</small>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #d4af37; flex-shrink: 0;">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        btn.addEventListener('click', item.action);
        modalLinksContainer.appendChild(btn);
      });
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', window.closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        window.closeModal();
      }
    });
  }

  // Cierre global con tecla Escape y navegación de fotos en Lightbox
  document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('photoLightboxModal');
    const isLightboxActive = lightbox && lightbox.style.display !== 'none';

    if (e.key === 'Escape') {
      if (isLightboxActive) {
        window.closePhotoLightbox();
        return;
      }
      if (videoCanClose) window.closeAcademyVideoModal();
      if (interstitialCanClose) window.closeInterstitial();
      if (modalOverlay && modalOverlay.classList.contains('active')) window.closeModal();
      if (studentModal && studentModal.classList.contains('active')) window.closeStudentModal();
    } else if (isLightboxActive) {
      if (e.key === 'ArrowLeft') {
        window.navigatePhotoLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        window.navigatePhotoLightbox(1);
      }
    }
  });

  // ==========================================
  // PROTECCIÓN: DESHABILITAR COPIA Y SELECCIÓN DE TEXTO
  // ==========================================
  ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return; // Permitir edición y selección únicamente dentro de campos de formulario
      }
      e.preventDefault();
    });
  });

  // ==========================================
  // 4. CARGA DINÁMICA Y FILTRO DE CURSOS EN ACADEMIA.HTML
  // ==========================================
  function slugifyCategory(str) {
    if (!str) return 'capacitacion';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'capacitacion';
  }

  async function loadAcademyCourses() {
    const grid = document.getElementById('coursesGrid');
    const filterBar = document.getElementById('categoryFilterBar');
    if (!grid) return;

    let activeCursos = [];

    if (typeof TB_FIREBASE !== 'undefined') {
      try {
        const cursosObj = await TB_FIREBASE.getCursos();
        const cursos = Object.values(cursosObj || {});
        activeCursos = cursos.filter(c => c.activo !== false);
      } catch (e) {
        console.error("Error cargando cursos en academia:", e);
      }
    }

    // Respaldo en caso de modo local o conexión inicial
    if (activeCursos.length === 0 && typeof TB_FIREBASE !== 'undefined' && TB_FIREBASE.DEFAULT_CURSOS) {
      activeCursos = Object.values(TB_FIREBASE.DEFAULT_CURSOS).filter(c => c.activo !== false);
    }

    if (activeCursos.length === 0) {
      if (filterBar) {
        filterBar.innerHTML = '';
        filterBar.style.display = 'none';
      }
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #a6a6b0; font-size: 0.9rem;">Próximamente se publicarán nuevas fechas de capacitación.</div>';
      return;
    }

    // Extraer categorías únicas disponibles en los cursos activos
    const uniqueCategories = [];
    const seenKeys = new Set();

    activeCursos.forEach(c => {
      const rawKey = c.categoriaKey || slugifyCategory(c.categoria || 'capacitacion');
      const catKey = String(rawKey).trim().toLowerCase();
      const catLabel = (c.categoria || c.categoriaKey || 'Capacitación').trim();
      if (catKey && !seenKeys.has(catKey)) {
        seenKeys.add(catKey);
        uniqueCategories.push({ key: catKey, label: catLabel });
      }
    });

    // Renderizar dinámicamente la barra de filtros según categorías existentes
    if (filterBar) {
      if (uniqueCategories.length <= 1) {
        // Solo 1 categoría disponible: se muestra únicamente dicha opción activa
        filterBar.style.display = 'flex';
        filterBar.innerHTML = `
          <button type="button" class="filter-btn active" data-filter="${escapeHtml(uniqueCategories[0].key)}">${escapeHtml(uniqueCategories[0].label)}</button>
        `;
      } else {
        // Múltiples categorías disponibles: opción 'Todos' y cada categoría activa
        filterBar.style.display = 'flex';
        filterBar.innerHTML = `
          <button type="button" class="filter-btn active" data-filter="all">Todos</button>
          ${uniqueCategories.map(cat => `
            <button type="button" class="filter-btn" data-filter="${escapeHtml(cat.key)}">${escapeHtml(cat.label)}</button>
          `).join('')}
        `;
      }
    }

    // Renderizar tarjetas de cursos activos
    grid.innerHTML = activeCursos.map(c => {
      const catKey = (c.categoriaKey || slugifyCategory(c.categoria || 'capacitacion')).trim().toLowerCase();
      const waMsg = encodeURIComponent(c.whatsappMsg || `Hola Total Beauty Academia, solicito informes del ${c.titulo}.`);
      return `
        <article class="course-card" data-category="${escapeHtml(catKey)}">
          <div class="course-card-header">
            <span class="course-mode-badge">${escapeHtml(c.modalidad || '90% Práctico')}</span>
            <span class="course-duration">${escapeHtml(c.duracion || 'Presencial • Modelos Reales')}</span>
          </div>
          <div class="course-card-body">
            <span class="course-category-tag">${escapeHtml(c.categoria || 'Capacitación')}</span>
            <h3 class="course-title">${escapeHtml(c.titulo)}</h3>
            <p class="course-desc">${escapeHtml(c.descripcion || '')}</p>
            <ul class="course-topics-list">
              ${c.tema1 ? `<li class="course-topic-item"><span class="dot"></span><span>${escapeHtml(c.tema1)}</span></li>` : ''}
              ${c.tema2 ? `<li class="course-topic-item"><span class="dot"></span><span>${escapeHtml(c.tema2)}</span></li>` : ''}
              ${c.tema3 ? `<li class="course-topic-item"><span class="dot"></span><span>${escapeHtml(c.tema3)}</span></li>` : ''}
            </ul>
            <a href="https://api.whatsapp.com/send?phone=525650560824&text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn-inquire">
              <span>Solicitar Plan del Curso</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    attachCourseFilters();
  }

  function attachCourseFilters() {
    const filterButtons = document.querySelectorAll('.category-filter-bar .filter-btn');
    const courseCards = document.querySelectorAll('#coursesGrid .course-card');

    if (filterButtons.length > 0 && courseCards.length > 0) {
      filterButtons.forEach(btn => {
        btn.onclick = () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filterValue = btn.getAttribute('data-filter');

          courseCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (filterValue === 'all' || cardCategory === filterValue) {
              card.style.display = 'flex';
              card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
              card.style.display = 'none';
            }
          });
        };
      });
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 5. FUNCIONES DE CONTACTO Y TOAST
  // ==========================================
  function openWhatsApp(message) {
    const text = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${config.whatsappPhone}&text=${text}`, '_blank');
  }

  function alertNotice(msg) {
    const existing = document.getElementById('tbNoticeToast');
    if (existing) existing.remove();

    const notice = document.createElement('div');
    notice.id = 'tbNoticeToast';
    notice.style.position = 'fixed';
    notice.style.bottom = '1.75rem';
    notice.style.left = '50%';
    notice.style.transform = 'translateX(-50%)';
    notice.style.background = '#101015';
    notice.style.border = '1px solid #d4af37';
    notice.style.color = '#f8f8f8';
    notice.style.padding = '0.85rem 1.4rem';
    notice.style.borderRadius = '8px';
    notice.style.fontSize = '0.82rem';
    notice.style.letterSpacing = '0.03em';
    notice.style.boxShadow = '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(212,175,55,0.25)';
    notice.style.zIndex = '999999';
    notice.style.transition = 'opacity 0.4s ease';
    notice.style.maxWidth = '92%';
    notice.style.textAlign = 'center';
    notice.textContent = msg;

    document.body.appendChild(notice);
    setTimeout(() => {
      notice.style.opacity = '0';
      setTimeout(() => notice.remove(), 400);
    }, 3800);
  }

  function openBookingModal() {
    window.closeModal();
    openWhatsApp("Hola, solicito agendar una cita para servicios en Total Beauty Salón.");
  }

  // ==========================================
  // 6. GALERÍA DE LA ACADEMIA (DETECCIÓN DINÁMICA DE FOTOS Y LIGHTBOX)
  // ==========================================
  async function initAcademyGallery() {
    const grid = document.getElementById('phoneGalleryGrid');
    if (!grid) return;

    let photos = [];

    // Prioridad 1: Catálogo precargado de fotosacademia/galeria.js (funciona tanto en web como en apertura local)
    if (window.TOTAL_BEAUTY_GALERIA && Array.isArray(window.TOTAL_BEAUTY_GALERIA) && window.TOTAL_BEAUTY_GALERIA.length > 0) {
      photos = window.TOTAL_BEAUTY_GALERIA
        .filter(item => typeof item === 'string' && /\.(jpe?g|png|webp|gif)$/i.test(item))
        .map(name => name.startsWith('fotosacademia/') ? name : `fotosacademia/${name}`);
    }

    // Prioridad 2: Cargar catálogo manifest.json en fotosacademia (con limpieza de BOM \uFEFF)
    if (photos.length === 0) {
      try {
        const res = await fetch('fotosacademia/manifest.json?_cb=' + Date.now());
        if (res.ok) {
          const text = await res.text();
          const cleanText = text.replace(/^\uFEFF/, '').trim();
          const raw = JSON.parse(cleanText);
          const list = Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
          const valid = list.filter(item => typeof item === 'string' && /\.(jpe?g|png|webp|gif)$/i.test(item));
          if (valid.length > 0) {
            photos = valid.map(name => name.startsWith('fotosacademia/') ? name : `fotosacademia/${name}`);
          }
        }
      } catch (e) {
        // Continuar al siguiente método si la lectura directa falla
      }
    }

    // Prioridad 3: Consulta en tiempo real a la API de GitHub
    if (photos.length === 0) {
      try {
        const ghRes = await fetch('https://api.github.com/repos/totalbeautysalon/web-Total-Beauty/contents/fotosacademia?_cb=' + Date.now(), {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (ghRes.ok) {
          const ghList = await ghRes.json();
          if (Array.isArray(ghList)) {
            photos = ghList
              .filter(f => f.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
              .map(f => f.path || `fotosacademia/${f.name}`);
          }
        }
      } catch (e) {
        // Continuar si hay restricción de red
      }
    }

    // Prioridad 4: Detección activa de archivos reales existentes (solo fotos que realmente carguen)
    if (photos.length === 0) {
      photos = await probeExistingPhotos();
    }

    currentGalleryPhotos = photos;
    renderPhoneGallery(photos);
    setupLightboxEvents();
  }

  async function probeExistingPhotos() {
    const candidates = [];
    for (let i = 1; i <= 50; i++) {
      const pad = String(i).padStart(2, '0');
      candidates.push(`fotosacademia/foto${pad}.jpg`);
      candidates.push(`fotosacademia/foto${pad}.png`);
      candidates.push(`fotosacademia/foto${pad}.webp`);
      candidates.push(`fotosacademia/foto${i}.jpg`);
      candidates.push(`fotosacademia/foto${i}.png`);
      candidates.push(`fotosacademia/foto${i}.webp`);
      candidates.push(`fotosacademia/${i}.jpg`);
      candidates.push(`fotosacademia/${i}.png`);
    }

    const testImg = (src) => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    const results = await Promise.all(candidates.map(testImg));
    return [...new Set(results.filter(Boolean))];
  }

  function renderPhoneGallery(photos) {
    const grid = document.getElementById('phoneGalleryGrid');
    const actionWrap = document.getElementById('galleryActionWrap');
    if (!grid) return;

    if (photos.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #a6a6b0; font-size: 0.85rem; padding: 2.5rem 1rem;">Próximamente se publicarán fotos de la academia.</div>';
      if (actionWrap) actionWrap.style.display = 'none';
      return;
    }

    // Renderizar puras imágenes: las primeras 10 visibles, las restantes ocultas
    grid.innerHTML = photos.map((src, index) => {
      const isHidden = index >= 10;
      const hiddenClass = isHidden ? ' gallery-hidden' : '';
      return `
        <div class="phone-gallery-item${hiddenClass}" onclick="openPhotoLightbox(${index})" role="button" tabindex="0" aria-label="Ver fotografía ${index + 1} en grande">
          <img src="${escapeHtml(src)}" alt="Total Beauty Academia" class="phone-gallery-img" loading="lazy">
        </div>
      `;
    }).join('');

    // Mostrar botón 'Ver Más' únicamente si hay más de 10 imágenes
    if (actionWrap) {
      actionWrap.style.display = photos.length > 10 ? 'flex' : 'none';
    }
  }

  window.showAllGalleryPhotos = function () {
    const hiddenItems = document.querySelectorAll('.phone-gallery-item.gallery-hidden');
    hiddenItems.forEach(item => {
      item.classList.remove('gallery-hidden');
      item.style.animation = 'fadeIn 0.35s ease forwards';
    });

    const actionWrap = document.getElementById('galleryActionWrap');
    if (actionWrap) actionWrap.style.display = 'none';
  };

  window.openPhotoLightbox = function (index) {
    if (!currentGalleryPhotos || currentGalleryPhotos.length === 0) return;
    if (index < 0) index = 0;
    if (index >= currentGalleryPhotos.length) index = currentGalleryPhotos.length - 1;

    currentLightboxIndex = index;
    const modal = document.getElementById('photoLightboxModal');
    const img = document.getElementById('lightboxLargeImg');
    const counter = document.getElementById('lightboxCounter');

    if (img) {
      img.src = currentGalleryPhotos[index];
    }
    if (counter) {
      counter.textContent = `Foto ${index + 1} de ${currentGalleryPhotos.length}`;
    }
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closePhotoLightbox = function () {
    const modal = document.getElementById('photoLightboxModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  window.navigatePhotoLightbox = function (direction) {
    if (!currentGalleryPhotos || currentGalleryPhotos.length <= 1) return;
    const total = currentGalleryPhotos.length;
    const nextIndex = (currentLightboxIndex + direction + total) % total;
    window.openPhotoLightbox(nextIndex);
  };

  function setupLightboxEvents() {
    const modal = document.getElementById('photoLightboxModal');
    const container = document.getElementById('lightboxImageContainer');

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === container) {
          window.closePhotoLightbox();
        }
      });

      // Gestos de deslizamiento táctil (swipe en teléfonos)
      let touchStartX = 0;
      let touchEndX = 0;

      modal.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchStartX = e.changedTouches[0].screenX;
        }
      }, { passive: true });

      modal.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          if (Math.abs(diff) > 45) {
            if (diff < 0) {
              window.navigatePhotoLightbox(1);
            } else {
              window.navigatePhotoLightbox(-1);
            }
          }
        }
      }, { passive: true });
    }
  }
});
