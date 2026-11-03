/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Script de Navegacion, Anuncio Intersticial (5s), Acceso de Alumnas e Integracion Firebase
 * Cero Emojis - Estetica Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const config = {
    salonUrl: "",
    defaultPassword: "TB2026",
    whatsappPhone: "525650560824",
    whatsappDisplay: "5650560824"
  };

  let interstitialTimerInterval = null;
  let interstitialCanClose = false;
  let currentActiveStudent = null;
  let pendingChangeMatricula = null;

  init();

  async function init() {
    await initInterstitial();
  }

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
        title: "Inscripciones Abiertas a Cursos Practicos",
        image: "assets/images/academia.jpg",
        text: "Inicia tu formacion profesional con metodologia 90% practica en modelos reales.",
        link: `https://api.whatsapp.com/send?phone=${config.whatsappPhone}`,
        btnText: "Solicitar Informes por WhatsApp"
      };
    }

    if (!data || !data.enabled) return;

    renderInterstitialContent(data);

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
      alertNotice("Por favor ingrese su matricula y contrasena.");
      return;
    }

    let student = null;
    if (typeof TB_FIREBASE !== 'undefined') {
      student = await TB_FIREBASE.getAlumna(matricula);
    }

    if (!student) {
      alertNotice("Matricula no encontrada en el sistema academico. Solicite su alta al WhatsApp 5650560824.");
      return;
    }

    if (student.password !== password) {
      alertNotice("Contrasena incorrecta. Si la olvido, contacte a Total Beauty al WhatsApp 5650560824.");
      return;
    }

    pendingChangeMatricula = matricula;

    // Si la contrasena es la clave inicial TB2026, exige cambiarla
    if (password === config.defaultPassword || student.isDefault === true) {
      const noticeMatEl = document.getElementById('changePassNoticeMatricula');
      if (noticeMatEl) noticeMatEl.textContent = matricula;

      const targetMatEl = document.getElementById('changePassTargetMatricula');
      if (targetMatEl) targetMatEl.value = matricula;

      showStudentView('change');
      alertNotice("Seguridad: Clave inicial detectada. Por favor elija una contrasena personal.");
      const newPassInput = document.getElementById('newStudentPass');
      if (newPassInput) newPassInput.focus();
      return;
    }

    // Acceso correcto al aula
    currentActiveStudent = student;
    renderStudentDashboard(student);
    showStudentView('dashboard');
    alertNotice(`Bienvenida, ${student.nombre || student.matricula}. Acceso academico activo.`);
  };

  window.handlePasswordChange = window.handleStudentChangePassword = async function (e) {
    e.preventDefault();
    const newPassInput = document.getElementById('newStudentPass');
    const confirmPassInput = document.getElementById('confirmStudentPass');

    const matricula = pendingChangeMatricula;
    const newPass = (newPassInput ? newPassInput.value : '').trim();
    const confirmPass = (confirmPassInput ? confirmPassInput.value : '').trim();

    if (!matricula) {
      alertNotice("Error de sesion. Ingrese nuevamente.");
      showStudentView('login');
      return;
    }

    if (!newPass || !confirmPass) {
      alertNotice("Por favor complete los campos de contrasena.");
      return;
    }

    if (newPass !== confirmPass) {
      alertNotice("Las contrasenas no coinciden. Verifique nuevamente.");
      return;
    }

    if (newPass === config.defaultPassword) {
      alertNotice("La nueva contrasena no puede ser la clave por defecto TB2026. Elija una clave personal.");
      return;
    }

    if (newPass.length < 5) {
      alertNotice("Por seguridad, su nueva contrasena debe tener al menos 5 caracteres.");
      return;
    }

    if (typeof TB_FIREBASE !== 'undefined') {
      await TB_FIREBASE.updateAlumnaPassword(matricula, newPass);
      currentActiveStudent = await TB_FIREBASE.getAlumna(matricula);
    }

    alertNotice("Contrasena actualizada correctamente en Firebase. Bienvenida al aula.");
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
    alertNotice("Sesion academica finalizada.");
  };

  if (studentModal) {
    studentModal.addEventListener('click', (e) => {
      if (e.target === studentModal) {
        window.closeStudentModal();
      }
    });
  }

  // ==========================================
  // 3. MODAL DE SERVICIOS EN INDEX.HTML (SALON)
  // ==========================================
  const modalData = {
    salon: {
      tag: "Total Beauty Salon",
      title: "Servicios de Salon",
      description: "Seleccione una opcion para comunicarse con recepcion o agendar su cita:",
      options: [
        {
          label: "Reservar Cita Personalizada",
          action: () => openBookingModal(),
          detail: "Atencion prioritaria"
        },
        {
          label: "Catalogo de Servicios y Precios",
          action: () => alertNotice("Catalogo de servicios disponible en recepcion y via digital."),
          detail: "Corte, colorimetria, spa"
        },
        {
          label: "Contactar Recepcion por WhatsApp",
          action: () => openWhatsApp("Hola, deseo solicitar informes y agendar una cita en Total Beauty Salon."),
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

  // Cierre global con tecla Escape (si el temporizador de 5s ya concluyo)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (interstitialCanClose) window.closeInterstitial();
      if (modalOverlay && modalOverlay.classList.contains('active')) window.closeModal();
      if (studentModal && studentModal.classList.contains('active')) window.closeStudentModal();
    }
  });

  // ==========================================
  // 4. FILTRO DE CURSOS EN ACADEMIA.HTML
  // ==========================================
  const filterButtons = document.querySelectorAll('.category-filter-bar .filter-btn');
  const courseCards = document.querySelectorAll('#coursesGrid .course-card');

  if (filterButtons.length > 0 && courseCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
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
      });
    });
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
    openWhatsApp("Hola, solicito agendar una cita para servicios en Total Beauty Salon.");
  }
});
