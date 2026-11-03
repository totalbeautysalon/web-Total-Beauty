/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Script de Gestion Administrativa en Firebase Realtime Database
 * Control de Anuncio Intersticial y Administracion de Alumnas
 * Cero Emojis - Estetica Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const ADMIN_PINS = ["ADMIN2026", "04012021"];
  const SESSION_KEY = "tb_admin_auth_token";

  let cachedStudents = {};
  let interstitialTimerInterval = null;
  let interstitialCanClose = false;

  // Elementos DOM
  const authSection = document.getElementById('adminAuthSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const firebaseStatusPill = document.getElementById('firebaseStatusPill');
  const firebaseStatusText = document.getElementById('firebaseStatusText');

  // Inicializacion
  init();

  async function init() {
    checkFirebaseStatus();
    checkExistingSession();
  }

  // ==========================================
  // 1. ESTADO DE CONEXION A FIREBASE
  // ==========================================
  async function checkFirebaseStatus() {
    if (!firebaseStatusPill || !firebaseStatusText) return;
    try {
      const isConnected = await TB_FIREBASE.checkConnection();
      if (isConnected) {
        firebaseStatusPill.className = 'admin-status-pill online';
        firebaseStatusText.textContent = 'En linea con Firebase (totalbregis)';
      } else {
        firebaseStatusPill.className = 'admin-status-pill offline';
        firebaseStatusText.textContent = 'Modo Local (Sin conexion Firebase)';
      }
    } catch (e) {
      firebaseStatusPill.className = 'admin-status-pill offline';
      firebaseStatusText.textContent = 'Modo Local';
    }
  }

  // ==========================================
  // 2. AUTENTICACION Y SESION DE ADMINISTRADOR
  // ==========================================
  function checkExistingSession() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "granted") {
      showDashboard();
    } else {
      showAuthGate();
    }
  }

  function showAuthGate() {
    if (authSection) authSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';

    loadAnnouncementData();
    loadStudentsData();
  }

  window.handleAdminLogin = function (e) {
    e.preventDefault();
    const pinInput = document.getElementById('adminPinInput');
    const enteredPin = (pinInput ? pinInput.value : '').trim();

    if (ADMIN_PINS.includes(enteredPin)) {
      sessionStorage.setItem(SESSION_KEY, "granted");
      showToast("Acceso administrativo concedido");
      showDashboard();
    } else {
      showToast("PIN incorrecto. Verifique con recepcion al WhatsApp 5650560824.");
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  };

  window.logoutAdmin = function () {
    sessionStorage.removeItem(SESSION_KEY);
    showToast("Sesion administrativa finalizada");
    showAuthGate();
  };

  // ==========================================
  // 3. GESTION DEL ANUNCIO INTERSTICIAL
  // ==========================================
  async function loadAnnouncementData() {
    try {
      const data = await TB_FIREBASE.getAnnouncement();
      
      const toggle = document.getElementById('adminAnnToggle');
      const title = document.getElementById('adminAnnTitle');
      const img = document.getElementById('adminAnnImg');
      const text = document.getElementById('adminAnnText');
      const link = document.getElementById('adminAnnLink');
      const btnText = document.getElementById('adminAnnBtnText');

      if (toggle) toggle.checked = !!data.enabled;
      if (title) title.value = data.title || "";
      if (img) img.value = data.image || "";
      if (text) text.value = data.text || "";
      if (link) link.value = data.link || "";
      if (btnText) btnText.value = data.btnText || "";

      updateImagePreview(data.image || "assets/images/academia.jpg");
      updateAnnouncementStatusBadge();
      updateKpis();
    } catch (e) {
      console.error("Error cargando anuncio:", e);
    }
  }

  window.updateAnnouncementStatusBadge = function () {
    const toggle = document.getElementById('adminAnnToggle');
    const badge = document.getElementById('announcementBadgeStatus');
    const kpiAnn = document.getElementById('kpiAnnStatus');

    const isEnabled = toggle ? toggle.checked : false;

    if (badge) {
      if (isEnabled) {
        badge.className = 'badge-status-active';
        badge.textContent = 'Activo en la Pagina';
      } else {
        badge.className = 'badge-status-inactive';
        badge.textContent = 'Pausado / Oculto';
      }
    }

    if (kpiAnn) {
      kpiAnn.textContent = isEnabled ? 'Activo' : 'Pausado';
      kpiAnn.className = isEnabled ? 'kpi-value success' : 'kpi-value warning';
    }
  };

  window.updateImagePreview = function (url) {
    const previewImg = document.getElementById('adminImgPreview');
    if (previewImg && url) {
      previewImg.src = url.trim();
    }
  };

  window.setQuickImg = function (path) {
    const imgInput = document.getElementById('adminAnnImg');
    if (imgInput) {
      imgInput.value = path;
      updateImagePreview(path);
    }
  };

  window.handleSaveAnnouncement = async function (e) {
    e.preventDefault();

    const toggle = document.getElementById('adminAnnToggle');
    const title = document.getElementById('adminAnnTitle');
    const img = document.getElementById('adminAnnImg');
    const text = document.getElementById('adminAnnText');
    const link = document.getElementById('adminAnnLink');
    const btnText = document.getElementById('adminAnnBtnText');

    const payload = {
      enabled: toggle ? toggle.checked : true,
      title: (title ? title.value : "").trim() || "Aviso Oficial",
      image: (img ? img.value : "").trim() || "assets/images/academia.jpg",
      text: (text ? text.value : "").trim(),
      link: (link ? link.value : "").trim() || "https://api.whatsapp.com/send?phone=525650560824",
      btnText: (btnText ? btnText.value : "").trim() || "Solicitar Informes"
    };

    const saved = await TB_FIREBASE.saveAnnouncement(payload);
    if (saved) {
      showToast("Anuncio intersticial guardado exitosamente en Firebase");
      updateAnnouncementStatusBadge();
    } else {
      showToast("Guardado en respaldo local (sin respuesta de Firebase)");
    }
  };

  // Previsualizacion con temporizador real de 5s
  window.previewInterstitialModal = function () {
    const toggle = document.getElementById('adminAnnToggle');
    const title = document.getElementById('adminAnnTitle');
    const img = document.getElementById('adminAnnImg');
    const text = document.getElementById('adminAnnText');
    const link = document.getElementById('adminAnnLink');
    const btnText = document.getElementById('adminAnnBtnText');

    const overlay = document.getElementById('interstitialOverlay');
    const titleEl = document.getElementById('interstitialTitle');
    const imgEl = document.getElementById('interstitialImg');
    const textEl = document.getElementById('interstitialText');
    const btnEl = document.getElementById('interstitialBtn');
    const btnTextEl = document.getElementById('interstitialBtnText');

    if (titleEl) titleEl.textContent = (title ? title.value : "") || "Aviso Oficial";
    if (imgEl) imgEl.src = (img ? img.value : "") || "assets/images/academia.jpg";
    if (textEl) textEl.textContent = (text ? text.value : "");
    if (btnEl) {
      btnEl.href = (link ? link.value : "") || "#";
      if (btnTextEl) btnTextEl.textContent = (btnText ? btnText.value : "") || "Solicitar Informes";
    }

    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      startInterstitialCountdown();
    }
  };

  function startInterstitialCountdown() {
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

  window.closeInterstitialPreview = function () {
    if (!interstitialCanClose) return;

    const overlay = document.getElementById('interstitialOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
    }
    if (interstitialTimerInterval) clearInterval(interstitialTimerInterval);
  };

  // ==========================================
  // 4. GESTION DE ALUMNAS Y RESETEO DE CLAVES
  // ==========================================
  window.loadStudentsData = async function (showToastNotice = false) {
    const tbody = document.getElementById('studentsTableBody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading-cell">Cargando registros desde Firebase...</td></tr>';
    }

    try {
      cachedStudents = await TB_FIREBASE.getAlumnas();
      renderStudentsTable(cachedStudents);
      updateKpis();
      if (showToastNotice) {
        showToast("Lista de alumnas sincronizada con Firebase");
      }
    } catch (e) {
      console.error("Error al cargar alumnas:", e);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-loading-cell">Error al conectar con Firebase.</td></tr>';
      }
    }
  };

  function renderStudentsTable(studentsObj) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    const list = Object.values(studentsObj || {});
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading-cell">No hay alumnas registradas aun. Use el boton "Registrar Nueva Alumna".</td></tr>';
      return;
    }

    // Ordenar por matricula
    list.sort((a, b) => (a.matricula || '').localeCompare(b.matricula || ''));

    tbody.innerHTML = list.map(student => {
      const isDefault = student.isDefault !== false && student.password === "TB2026";
      const statusBadge = isDefault
        ? '<span class="student-status-chip warning">Clave por Defecto (TB2026)</span>'
        : '<span class="student-status-chip success">Clave Personalizada Activa</span>';

      const formattedDate = student.updatedAt
        ? new Date(student.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Registro inicial';

      return `
        <tr data-matricula="${student.matricula}">
          <td class="cell-matricula"><strong>${escapeHtml(student.matricula)}</strong></td>
          <td class="cell-nombre">${escapeHtml(student.nombre || "Alumna")}</td>
          <td class="cell-curso"><span class="table-curso-tag">${escapeHtml(student.curso || "Cursos Practicos")}</span></td>
          <td class="cell-estado">${statusBadge}</td>
          <td class="cell-fecha">${formattedDate}</td>
          <td class="cell-acciones">
            <div class="table-action-buttons">
              <button 
                type="button" 
                class="btn-table-reset" 
                onclick="handleResetStudentPassword('${student.matricula}')"
                title="Restablecer clave a TB2026"
              >
                <span>Resetear a TB2026</span>
              </button>
              <button 
                type="button" 
                class="btn-table-delete" 
                onclick="handleDeleteStudent('${student.matricula}')"
                title="Eliminar alumna"
                aria-label="Eliminar alumna"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateKpis() {
    const list = Object.values(cachedStudents || {});
    const total = list.length;
    let defaultCount = 0;
    let customCount = 0;

    list.forEach(s => {
      if (s.isDefault !== false && s.password === "TB2026") {
        defaultCount++;
      } else {
        customCount++;
      }
    });

    const kpiTotal = document.getElementById('kpiTotalAlumnas');
    const kpiDefault = document.getElementById('kpiDefaultPass');
    const kpiCustom = document.getElementById('kpiCustomPass');

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiDefault) kpiDefault.textContent = defaultCount;
    if (kpiCustom) kpiCustom.textContent = customCount;
  }

  window.filterStudentsTable = function (keyword) {
    const query = (keyword || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#studentsTableBody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  window.toggleNewStudentForm = function () {
    const box = document.getElementById('newStudentCollapseForm');
    const btnText = document.getElementById('btnToggleFormText');
    if (!box) return;

    if (box.style.display === 'none' || !box.style.display) {
      box.style.display = 'block';
      if (btnText) btnText.textContent = 'Ocultar Formulario';
      const input = document.getElementById('newStudentMatricula');
      if (input) input.focus();
    } else {
      box.style.display = 'none';
      if (btnText) btnText.textContent = 'Registrar Nueva Alumna';
    }
  };

  window.handleCreateStudent = async function (e) {
    e.preventDefault();

    const matInput = document.getElementById('newStudentMatricula');
    const nomInput = document.getElementById('newStudentNombre');
    const curInput = document.getElementById('newStudentCurso');
    const telInput = document.getElementById('newStudentTelefono');

    const matricula = (matInput ? matInput.value : '').trim().toUpperCase();
    const nombre = (nomInput ? nomInput.value : '').trim();
    const curso = (curInput ? curInput.value : '').trim();
    const telefono = (telInput ? telInput.value : '').trim() || "5650560824";

    if (!matricula || !nombre) {
      showToast("Por favor complete los campos obligatorios");
      return;
    }

    const newStudent = {
      matricula,
      nombre,
      curso,
      telefono,
      password: "TB2026",
      isDefault: true,
      updatedAt: Date.now()
    };

    const ok = await TB_FIREBASE.saveAlumna(matricula, newStudent);
    if (ok) {
      showToast(`Alumna ${matricula} registrada con clave inicial TB2026`);
      if (matInput) matInput.value = '';
      if (nomInput) nomInput.value = '';
      toggleNewStudentForm();
      loadStudentsData();
    } else {
      showToast("Error al guardar alumna en Firebase");
    }
  };

  window.handleResetStudentPassword = async function (matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return;

    const confirmed = window.confirm(`Desea restablecer la contrasena de la matricula ${cleanMatricula} a la clave por defecto TB2026?`);
    if (!confirmed) return;

    const ok = await TB_FIREBASE.resetAlumnaPassword(cleanMatricula);
    if (ok) {
      showToast(`Contrasena de ${cleanMatricula} restablecida a TB2026 en Firebase`);
      loadStudentsData();
    } else {
      showToast("No se pudo restablecer la contrasena en Firebase");
    }
  };

  window.handleDeleteStudent = async function (matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return;

    const confirmed = window.confirm(`Esta seguro de eliminar el registro de la matricula ${cleanMatricula}?`);
    if (!confirmed) return;

    const ok = await TB_FIREBASE.deleteAlumna(cleanMatricula);
    if (ok) {
      showToast(`Alumna ${cleanMatricula} eliminada de Firebase`);
      loadStudentsData();
    } else {
      showToast("Error al eliminar alumna de Firebase");
    }
  };

  // ==========================================
  // 5. UTILIDADES (TOAST Y ESCAPE HTML)
  // ==========================================
  function showToast(msg) {
    const existing = document.getElementById('tbAdminToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tbAdminToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '1.75rem';
    toast.style.right = '1.75rem';
    toast.style.background = '#121218';
    toast.style.border = '1px solid #d4af37';
    toast.style.color = '#ffffff';
    toast.style.padding = '0.9rem 1.45rem';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '0.84rem';
    toast.style.letterSpacing = '0.03em';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(212,175,55,0.2)';
    toast.style.zIndex = '999999';
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.maxWidth = '92%';
    toast.textContent = msg;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
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

  // Tecla Escape para cerrar previsualizacion si el temporizador concluyo
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (interstitialCanClose) window.closeInterstitialPreview();
    }
  });
});
