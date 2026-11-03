/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Script de Navegación, Sistema de Anuncios, Panel de Administración y Alumnas
 * Cero Emojis - Estética Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de la Academia y Administrador
  const config = {
    salonUrl: "",
    adminPin: "ADMIN2026",
    adminPinAlt: "04012021",
    defaultPassword: "TB2026",
    whatsappPhone: "525650560824",
    whatsappDisplay: "5650560824"
  };

  const STORAGE_KEY_STUDENTS = "totalbeauty_alumnas_db";
  const STORAGE_KEY_ANNOUNCEMENT = "totalbeauty_announcement_data";

  let isAdminUnlocked = false;

  // ==========================================
  // 1. SISTEMA DE ANUNCIOS DE LA PÁGINA
  // ==========================================
  function getAnnouncementData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Error al leer datos de anuncios:", e);
    }
    // Configuración inicial por defecto
    const initialData = {
      enabled: true,
      text: "Inscripciones abiertas a cursos prácticos. Cupo limitado para atención personalizada.",
      link: `https://api.whatsapp.com/send?phone=${config.whatsappPhone}&text=Hola%20Total%20Beauty%20Academia,%20deseo%20solicitar%20informes%20sobre%20las%20inscripciones%20a%20los%20cursos.`,
      btnText: "Informes por WhatsApp"
    };
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(initialData));
    return initialData;
  }

  function saveAnnouncementData(data) {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(data));
    } catch (e) {
      console.error("Error al guardar datos de anuncios:", e);
    }
  }

  function renderAnnouncementBar() {
    const bar = document.getElementById('announcementBar');
    if (!bar) return;

    const data = getAnnouncementData();
    if (!data.enabled || !data.text.trim()) {
      bar.style.display = 'none';
      return;
    }

    const textEl = document.getElementById('announcementText');
    const linkEl = document.getElementById('announcementLink');
    const btnTextEl = document.getElementById('announcementBtnText');

    if (textEl) textEl.textContent = data.text;

    if (linkEl) {
      if (data.link && data.link.trim()) {
        linkEl.href = data.link.trim();
        linkEl.style.display = 'inline-flex';
        if (btnTextEl) btnTextEl.textContent = data.btnText || 'Ver Detalles';
      } else {
        linkEl.style.display = 'none';
      }
    }

    bar.style.display = 'block';
  }

  window.closeAnnouncementBar = function() {
    const bar = document.getElementById('announcementBar');
    if (bar) {
      bar.style.display = 'none';
    }
  };

  renderAnnouncementBar();

  // ==========================================
  // 2. PANEL DE ADMINISTRACIÓN
  // ==========================================
  const adminModal = document.getElementById('adminModal');
  const adminAuthView = document.getElementById('adminAuthView');
  const adminDashboardView = document.getElementById('adminDashboardView');

  window.openAdminPanel = function() {
    if (!adminModal) return;

    adminModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (isAdminUnlocked) {
      loadAdminDashboard();
    } else {
      if (adminAuthView) adminAuthView.style.display = 'block';
      if (adminDashboardView) adminDashboardView.style.display = 'none';
      const pinInput = document.getElementById('adminLoginPin');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  };

  window.closeAdminModal = function() {
    if (adminModal) {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.handleAdminAuthSubmit = function(e) {
    e.preventDefault();
    const pinInput = document.getElementById('adminLoginPin');
    const enteredPin = pinInput ? pinInput.value.trim() : '';

    if (enteredPin === config.adminPin || enteredPin === config.adminPinAlt) {
      isAdminUnlocked = true;
      loadAdminDashboard();
      alertNotice("Acceso administrativo concedido.");
    } else {
      alertNotice("PIN de Administrador incorrecto.");
      if (pinInput) pinInput.select();
    }
  };

  function loadAdminDashboard() {
    if (adminAuthView) adminAuthView.style.display = 'none';
    if (adminDashboardView) adminDashboardView.style.display = 'block';

    const annData = getAnnouncementData();
    const toggle = document.getElementById('adminAnnToggle');
    const textInput = document.getElementById('adminAnnText');
    const linkInput = document.getElementById('adminAnnLink');
    const btnTextInput = document.getElementById('adminAnnBtnText');

    if (toggle) toggle.checked = annData.enabled;
    if (textInput) textInput.value = annData.text || '';
    if (linkInput) linkInput.value = annData.link || '';
    if (btnTextInput) btnTextInput.value = annData.btnText || '';

    const resetMatInput = document.getElementById('adminResetTargetMatricula');
    if (resetMatInput) resetMatInput.value = '';
  }

  window.handleSaveAnnouncement = function(e) {
    e.preventDefault();
    const toggle = document.getElementById('adminAnnToggle');
    const textInput = document.getElementById('adminAnnText');
    const linkInput = document.getElementById('adminAnnLink');
    const btnTextInput = document.getElementById('adminAnnBtnText');

    const updated = {
      enabled: toggle ? toggle.checked : false,
      text: textInput ? textInput.value.trim() : '',
      link: linkInput ? linkInput.value.trim() : '',
      btnText: btnTextInput ? btnTextInput.value.trim() : 'Ver Detalles'
    };

    saveAnnouncementData(updated);
    renderAnnouncementBar();
    alertNotice("Anuncio guardado y actualizado en la página.");
  };

  window.handleAdminDirectReset = function(e) {
    e.preventDefault();
    const targetInput = document.getElementById('adminResetTargetMatricula');
    const matricula = targetInput ? targetInput.value.trim().toUpperCase() : '';

    if (!matricula) {
      alertNotice("Ingrese la matrícula a restablecer.");
      return;
    }

    const db = getStudentsDb();
    if (!db[matricula]) {
      db[matricula] = {
        password: config.defaultPassword,
        isDefault: true,
        name: "Alumna " + matricula
      };
    } else {
      db[matricula].password = config.defaultPassword;
      db[matricula].isDefault = true;
    }

    saveStudentsDb(db);
    alertNotice(`Matrícula ${matricula} restablecida a la contraseña por defecto (${config.defaultPassword}).`);
    if (targetInput) targetInput.value = '';
  };

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        window.closeAdminModal();
      }
    });
  }

  // ==========================================
  // 3. BASE DE DATOS Y PORTAL DE ALUMNAS
  // ==========================================
  function getStudentsDb() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Error al leer base de datos de alumnas:", e);
    }
    const initialDb = {
      "TB-01": { password: config.defaultPassword, isDefault: true, name: "Alumna Total Beauty" },
      "TB-102": { password: config.defaultPassword, isDefault: true, name: "Estudiante de Estilismo" }
    };
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialDb));
    return initialDb;
  }

  function saveStudentsDb(db) {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(db));
    } catch (e) {
      console.error("Error al guardar base de datos de alumnas:", e);
    }
  }

  let currentStudentSession = {
    matricula: "",
    isDefault: false
  };

  const studentModal = document.getElementById('studentModal');
  const viewLogin = document.getElementById('studentViewLogin');
  const viewChangePass = document.getElementById('studentViewChangePass');
  const viewDashboard = document.getElementById('studentViewDashboard');

  function showStudentView(viewName) {
    if (viewLogin) viewLogin.classList.remove('active');
    if (viewChangePass) viewChangePass.classList.remove('active');
    if (viewDashboard) viewDashboard.classList.remove('active');

    if (viewName === 'login' && viewLogin) viewLogin.classList.add('active');
    if (viewName === 'changePass' && viewChangePass) viewChangePass.classList.add('active');
    if (viewName === 'dashboard' && viewDashboard) viewDashboard.classList.add('active');
  }

  window.openStudentModal = function() {
    if (studentModal) {
      showStudentView('login');
      studentModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const userInput = document.getElementById('studentMatricula');
      if (userInput) {
        userInput.value = "";
        userInput.focus();
      }
      const passInput = document.getElementById('studentPassword');
      if (passInput) passInput.value = "";
    }
  };

  window.closeStudentModal = function() {
    if (studentModal) {
      studentModal.classList.remove('active');
      document.body.style.overflow = '';
      currentStudentSession = { matricula: "", isDefault: false };
    }
  };

  window.handleStudentLogin = function(e) {
    e.preventDefault();
    const matriculaInput = document.getElementById('studentMatricula');
    const passInput = document.getElementById('studentPassword');

    const matricula = matriculaInput ? matriculaInput.value.trim().toUpperCase() : "";
    const password = passInput ? passInput.value.trim() : "";

    if (!matricula || !password) {
      alertNotice("Por favor, ingrese su matrícula y contraseña.");
      return;
    }

    const db = getStudentsDb();
    let student = db[matricula];

    if (!student) {
      if (password === config.defaultPassword) {
        student = {
          password: config.defaultPassword,
          isDefault: true,
          name: "Alumna " + matricula
        };
        db[matricula] = student;
        saveStudentsDb(db);
      } else {
        alertNotice("Matrícula no registrada o contraseña incorrecta. La clave inicial por defecto es TB2026.");
        return;
      }
    }

    if (student.password !== password) {
      if (password === config.defaultPassword && !student.isDefault) {
        alertNotice("Esta matrícula ya cuenta con una contraseña personalizada. Si la olvidó, contacte a soporte vía WhatsApp al 5650560824.");
      } else {
        alertNotice("Contraseña incorrecta para la matrícula " + matricula + ". Si la olvidó, contacte a soporte por WhatsApp al 5650560824.");
      }
      return;
    }

    currentStudentSession.matricula = matricula;

    if (student.isDefault || password === config.defaultPassword) {
      currentStudentSession.isDefault = true;
      const changeNotice = document.getElementById('changePassNoticeMatricula');
      if (changeNotice) changeNotice.textContent = matricula;

      const newPassInput = document.getElementById('newStudentPass');
      if (newPassInput) newPassInput.value = "";
      const confirmPassInput = document.getElementById('confirmStudentPass');
      if (confirmPassInput) confirmPassInput.value = "";

      showStudentView('changePass');
      if (newPassInput) newPassInput.focus();
      return;
    }

    cargarDashboard(matricula, student);
  };

  window.handlePasswordChange = function(e) {
    e.preventDefault();
    const newPass = document.getElementById('newStudentPass')?.value.trim();
    const confirmPass = document.getElementById('confirmStudentPass')?.value.trim();

    if (!newPass || !confirmPass) {
      alertNotice("Complete ambos campos de contraseña.");
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

    if (newPass !== confirmPass) {
      alertNotice("Las contraseñas no coinciden. Verifíquelas nuevamente.");
      return;
    }

    const db = getStudentsDb();
    const matricula = currentStudentSession.matricula;

    if (!matricula || !db[matricula]) {
      alertNotice("Error de sesión. Vuelva a ingresar su matrícula.");
      showStudentView('login');
      return;
    }

    db[matricula].password = newPass;
    db[matricula].isDefault = false;
    saveStudentsDb(db);

    alertNotice("Contraseña actualizada exitosamente. Bienvenida a su portal de alumna.");
    cargarDashboard(matricula, db[matricula]);
  };

  function cargarDashboard(matricula, student) {
    const dashMatricula = document.getElementById('dashMatricula');
    if (dashMatricula) dashMatricula.textContent = matricula;
    showStudentView('dashboard');
  }

  window.logoutStudent = function() {
    currentStudentSession = { matricula: "", isDefault: false };
    showStudentView('login');
    alertNotice("Sesión cerrada correctamente.");
  };

  if (studentModal) {
    studentModal.addEventListener('click', (e) => {
      if (e.target === studentModal) {
        window.closeStudentModal();
      }
    });
  }

  // ==========================================
  // 4. MODAL DE SERVICIOS EN INDEX.HTML (SALÓN)
  // ==========================================
  const modalData = {
    salon: {
      tag: "Total Beauty Salón",
      title: "Servicios de Salón",
      description: "Seleccione una opción para comunicarse con recepción o agendar su cita:",
      options: [
        {
          label: "Reservar Cita Personalizada",
          action: () => openBookingModal("salon_reserva"),
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

  window.openModal = function(type) {
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

  window.closeModal = function() {
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

  // Cierre global con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalOverlay && modalOverlay.classList.contains('active')) window.closeModal();
      if (studentModal && studentModal.classList.contains('active')) window.closeStudentModal();
      if (adminModal && adminModal.classList.contains('active')) window.closeAdminModal();
    }
  });

  // ==========================================
  // 5. FILTRO DE CURSOS EN ACADEMIA.HTML
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
  // 6. FUNCIONES DE CONTACTO Y TOAST
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
    notice.style.zIndex = '99999';
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

  function openBookingModal(type) {
    window.closeModal();
    openWhatsApp("Hola, solicito agendar una cita para servicios en Total Beauty Salón.");
  }
});
