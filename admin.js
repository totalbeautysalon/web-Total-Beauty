/**
 * TOTAL BEAUTY SALÓN & ACADEMIA
 * Script de Gestión Administrativa Integral en Firebase Realtime Database
 * Módulos: Dashboard KPIs, Validación de Cupones, Encuestas, Cupones, Estadísticas, Anuncio, Cursos y Alumnas
 * Cero Emojis - Arquitectura Segura con Respaldo Offline
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const ADMIN_PINS = ["ADMIN2026", "04012021"];
  const SESSION_KEY = "tb_admin_auth_token";

  // Cachés en memoria
  let cachedStudents = {};
  let cachedCourses = {};
  let cachedSurveys = {};
  let cachedCoupons = {};
  let currentValidatorCoupon = null;

  let interstitialTimerInterval = null;
  let interstitialCanClose = false;

  // Elementos DOM Principales
  const authSection = document.getElementById('adminAuthSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const firebaseStatusPill = document.getElementById('firebaseStatusPill');
  const firebaseStatusText = document.getElementById('firebaseStatusText');

  // Inicialización
  init();

  async function init() {
    checkFirebaseStatus();
    checkExistingSession();
  }

  // ==========================================
  // PROTECCIÓN: DESHABILITAR COPIA Y SELECCIÓN DE TEXTO (EXCEPTO CAMPOS)
  // ==========================================
  ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
    });
  });

  // ==========================================
  // 1. ESTADO DE CONEXIÓN A FIREBASE
  // ==========================================
  async function checkFirebaseStatus() {
    if (!firebaseStatusPill || !firebaseStatusText) return;
    try {
      const isConnected = await TB_FIREBASE.checkConnection();
      if (isConnected) {
        firebaseStatusPill.className = 'admin-status-pill online';
        firebaseStatusText.textContent = 'En línea con Firebase';
      } else {
        firebaseStatusPill.className = 'admin-status-pill offline';
        firebaseStatusText.textContent = 'Modo Local (Sin conexión Firebase)';
      }
    } catch (e) {
      firebaseStatusPill.className = 'admin-status-pill offline';
      firebaseStatusText.textContent = 'Modo Local';
    }
  }

  // ==========================================
  // 2. AUTENTICACIÓN Y SESIÓN DE ADMINISTRADOR
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

    loadSurveysAndCouponsData();
    loadAnnouncementData();
    loadCoursesData();
    loadStudentsData();
    loadMaintenanceAdminData();
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
      showToast("PIN incorrecto. Verifique con recepción al WhatsApp 5650560824.");
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  };

  window.logoutAdmin = function () {
    sessionStorage.removeItem(SESSION_KEY);
    showToast("Sesión administrativa finalizada");
    showAuthGate();
  };

  // ==========================================
  // NAVEGACIÓN ENTRE PESTAÑAS ADMINISTRATIVAS
  // ==========================================
  window.switchAdminTab = function (paneId) {
    const buttons = document.querySelectorAll('.admin-tab-btn');
    const panes = document.querySelectorAll('.admin-module-pane');

    buttons.forEach(btn => {
      if (btn.getAttribute('data-tab') === paneId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    panes.forEach(pane => {
      if (pane.id === paneId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // ==========================================
  // 3. MÓDULO DE ENCUESTAS & CUPONES: CARGA Y KPIS
  // ==========================================
  window.loadSurveysAndCouponsData = async function (showToastNotice = false) {
    try {
      cachedSurveys = await TB_FIREBASE.getEncuestas();
      cachedCoupons = await TB_FIREBASE.getCupones();

      updateSurveyAndCouponKpis();
      renderSurveysTable();
      renderCouponsTable();
      renderAnalyticsCharts();

      if (showToastNotice) {
        showToast("Datos de encuestas y cupones sincronizados con Firebase");
      }
    } catch (err) {
      console.error("Error al sincronizar encuestas y cupones:", err);
      if (showToastNotice) {
        showToast("Error al conectar con Firebase. Mostrando datos locales.");
      }
    }
  };

  function updateSurveyAndCouponKpis() {
    const surveysList = Object.values(cachedSurveys || {});
    const couponsList = Object.values(cachedCoupons || {});

    const totalSurveys = surveysList.length;

    // Calificaciones
    const ratingValues = {
      'Excelente': 5,
      'Muy bueno': 4,
      'Muy buena': 4,
      'Bueno': 3,
      'Buena': 3,
      'Regular': 2,
      'Malo': 1,
      'Mala': 1
    };

    let totalScore = 0;
    let scoreCount = 0;
    let excelenteCount = 0;
    let recomiendanCount = 0;

    surveysList.forEach(s => {
      const r = s.calificacionResultado;
      if (ratingValues[r]) {
        totalScore += ratingValues[r];
        scoreCount++;
      }
      if (r === 'Excelente') excelenteCount++;
      if (s.recomendacion === 'Sí') recomiendanCount++;
    });

    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "5.0";
    const percentExcelente = totalSurveys > 0 ? Math.round((excelenteCount / totalSurveys) * 100) : 0;
    const percentRecomiendan = totalSurveys > 0 ? Math.round((recomiendanCount / totalSurveys) * 100) : 0;

    // Cupones
    const totalCoupons = couponsList.length;
    let usedCoupons = 0;
    let availableCoupons = 0;

    couponsList.forEach(c => {
      if (c.estado === 'utilizado') usedCoupons++;
      else if (c.estado === 'disponible') availableCoupons++;
    });

    // Elementos DOM
    const kpiSurveys = document.getElementById('kpiTotalEncuestas');
    const kpiAvg = document.getElementById('kpiPromedioCalif');
    const kpiExc = document.getElementById('kpiTotalExcelente');
    const kpiRec = document.getElementById('kpiTotalRecomiendan');
    const kpiGen = document.getElementById('kpiCuponesGenerados');
    const kpiUsed = document.getElementById('kpiCuponesUtilizados');
    const kpiPend = document.getElementById('kpiCuponesPendientes');

    if (kpiSurveys) kpiSurveys.textContent = totalSurveys;
    if (kpiAvg) kpiAvg.textContent = `${avgScore} / 5`;
    if (kpiExc) kpiExc.textContent = `${excelenteCount} (${percentExcelente}%)`;
    if (kpiRec) kpiRec.textContent = `${recomiendanCount} (${percentRecomiendan}%)`;
    if (kpiGen) kpiGen.textContent = totalCoupons;
    if (kpiUsed) kpiUsed.textContent = usedCoupons;
    if (kpiPend) kpiPend.textContent = availableCoupons;
  }

  // ==========================================
  // 4. HERRAMIENTA DE VALIDACIÓN Y CANJE DE CUPONES
  // ==========================================
  window.handleQuickSearchCoupon = function () {
    const input = document.getElementById('quickCouponInput');
    const code = (input ? input.value : '').trim().toUpperCase();
    if (!code) {
      showToast("Ingresa el código del cupón.");
      return;
    }
    const valInput = document.getElementById('validatorCodeInput');
    if (valInput) valInput.value = code;
    window.switchAdminTab('pane-validador');
    window.handleSearchCoupon(code);
  };

  window.handleSearchCoupon = async function (explicitCode = null) {
    const input = document.getElementById('validatorCodeInput');
    const code = (explicitCode || (input ? input.value : '')).trim().toUpperCase();
    const resultArea = document.getElementById('validatorResultArea');
    if (!resultArea) return;

    if (!code || code.length < 5) {
      showToast("Ingresa un código de cupón válido (ej. TB-XXXXXX).");
      return;
    }

    resultArea.style.display = 'block';
    resultArea.innerHTML = '<div class="table-loading-cell">Consultando cupón en Firebase...</div>';

    const coupon = await TB_FIREBASE.getCupon(code);
    currentValidatorCoupon = coupon;

    if (!coupon) {
      resultArea.innerHTML = `
        <div class="validator-status-alert used">
          <strong>El cupón ${escapeHtml(code)} no existe en el sistema</strong>. Verifica que el código esté escrito correctamente.
        </div>
      `;
      return;
    }

    renderValidatorResult(coupon);
  };

  function renderValidatorResult(c) {
    const resultArea = document.getElementById('validatorResultArea');
    if (!resultArea) return;

    const isAvailable = c.estado === 'disponible';
    const isUsed = c.estado === 'utilizado';
    const isExpired = c.estado === 'vencido';

    let alertClass = 'available';
    let alertText = 'CUPÓN VÁLIDO Y DISPONIBLE PARA CANJE';
    if (isUsed) {
      alertClass = 'used';
      alertText = 'ESTE CUPÓN YA FUE UTILIZADO ANTERIORMENTE';
    } else if (isExpired) {
      alertClass = 'expired';
      alertText = 'ESTE CUPÓN ESTÁ VENCIDO';
    }

    const issuedStr = c.fechaGeneracion ? new Date(c.fechaGeneracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';
    const expiryStr = c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';

    let html = `
      <div class="validator-status-alert ${alertClass}">
        <strong>${alertText} &bull; CÓDIGO: ${escapeHtml(c.codigo)}</strong>
      </div>

      <div class="coupon-meta-grid">
        <div class="coupon-meta-item">
          <span class="meta-label">Clienta</span>
          <span class="meta-val">${escapeHtml(c.nombre || 'Clienta')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">WhatsApp</span>
          <span class="meta-val">${escapeHtml(c.whatsapp || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Fecha de Emisión</span>
          <span class="meta-val">${issuedStr}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Fecha de Vencimiento</span>
          <span class="meta-val gold-bold">${expiryStr}</span>
        </div>
      </div>
    `;

    if (isUsed) {
      const usedDate = c.fechaUtilizacion ? new Date(c.fechaUtilizacion).toLocaleString('es-MX') : '--';
      html += `
        <div style="background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.3); border-radius: 8px; padding: 1.15rem; margin-top: 1rem;">
          <h4 style="color: #e74c3c; font-size: 0.9rem; margin-bottom: 0.45rem;">Detalles del Canje Registrado</h4>
          <p style="font-size: 0.82rem; color: #dedede;">Fecha y hora de utilización: <strong>${usedDate}</strong></p>
          <p style="font-size: 0.82rem; color: #dedede;">Servicio contratado: <strong>${escapeHtml(c.servicioCanje || 'Servicio')}</strong></p>
          <p style="font-size: 0.82rem; color: #dedede;">Precio original: $${c.precioOriginal || 0} MXN &bull; Descuento: ${c.descuentoPorcentaje || 0}% (-$${c.descuentoImporte || 0})</p>
          <p style="font-size: 0.95rem; color: var(--gold-light); font-weight: 700; margin-top: 0.35rem;">Total Pagado: $${c.totalPagado || 0} MXN</p>
          <p style="font-size: 0.74rem; color: var(--text-dim); margin-top: 0.35rem;">Registrado por: ${escapeHtml(c.canjeadoPor || 'Recepción')}</p>
        </div>
      `;
    } else if (isExpired) {
      html += `
        <div style="background: rgba(243,156,18,0.08); border: 1px solid rgba(243,156,18,0.3); border-radius: 8px; padding: 1.15rem; margin-top: 1rem;">
          <h4 style="color: #f39c12; font-size: 0.9rem; margin-bottom: 0.35rem;">Cupón Fuera de Vigencia</h4>
          <p style="font-size: 0.82rem; color: #dedede;">Este cupón venció el ${expiryStr}. Las políticas de Total Beauty establecen 30 días naturales de vigencia.</p>
        </div>
      `;
    } else {
      // Cupón disponible: Mostrar formulario para registrar servicio y cobrar
      html += `
        <form id="adminRedemptionForm" onsubmit="handleConfirmRedemption(event)" style="background: rgba(10,10,14,0.75); border: 1px solid rgba(212,175,55,0.25); border-radius: 10px; padding: 1.35rem; margin-top: 1rem;">
          <h4 style="color: var(--gold-light); font-size: 0.95rem; margin-bottom: 1rem;">Registrar Servicio y Aplicar Descuento</h4>

          <div class="admin-form-row">
            <div class="student-form-group">
              <label class="student-form-label">Servicio Contratado</label>
              <select id="adminRedeemService" class="student-form-input" required>
                <option value="Uñas Acrílicas">Uñas Acrílicas / Gel</option>
                <option value="Extensiones de Pestañas">Extensiones de Pestañas</option>
                <option value="Laminado y Diseño de Cejas">Laminado y Diseño de Cejas</option>
                <option value="Pedicure Spa">Pedicure Spa</option>
                <option value="Corte de Cabello">Corte de Cabello</option>
                <option value="Maquillaje">Maquillaje</option>
                <option value="Tratamiento Capilar">Tratamiento Capilar</option>
                <option value="Otro Servicio">Otro Servicio</option>
              </select>
            </div>

            <div class="student-form-group">
              <label class="student-form-label">Precio Regular del Servicio ($ MXN)</label>
              <input 
                type="number" 
                id="adminRedeemPrice" 
                class="student-form-input" 
                placeholder="ej. 500" 
                min="1" 
                required 
                oninput="updateAdminRedeemCalc(this.value)"
              >
            </div>
          </div>

          <!-- Cuadro de Cálculo de Descuento en Tiempo Real -->
          <div id="adminLiveCalcBox" style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 1.15rem; display: none;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-muted);">Porcentaje según rango de precio:</span>
              <span id="adminLiveTier" style="color: var(--gold-light); font-weight: 600;">20%</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-muted);">Monto a descontar:</span>
              <span id="adminLiveDiscount" style="color: var(--gold-primary); font-weight: 700;">-$100 MXN</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 700; color: #ffffff; border-top: 1px solid rgba(212,175,55,0.22); padding-top: 0.45rem;">
              <span>Total a Cobrar a la Clienta:</span>
              <span id="adminLiveTotal" style="color: var(--gold-light); font-family: var(--font-serif); font-size: 1.25rem;">$400 MXN</span>
            </div>
          </div>

          <div class="admin-form-row">
            <div class="student-form-group">
              <label class="student-form-label">Personal Responsable en Recepción</label>
              <input type="text" id="adminRedeemCashier" class="student-form-input" value="Recepción Total Beauty" required>
            </div>
            <div class="student-form-group">
              <label class="student-form-label">Notas Adicionales (Opcional)</label>
              <input type="text" id="adminRedeemNotes" class="student-form-input" placeholder="ej. Cita 16:00, clienta conforme">
            </div>
          </div>

          <button type="submit" id="btnAdminConfirmRedeem" class="btn-student-submit" style="margin-top: 0.5rem;">
            <span>Confirmar Canje y Actualizar en Firebase</span>
          </button>
        </form>
      `;
    }

    resultArea.innerHTML = html;
  }

  window.updateAdminRedeemCalc = function (val) {
    const box = document.getElementById('adminLiveCalcBox');
    const tier = document.getElementById('adminLiveTier');
    const disc = document.getElementById('adminLiveDiscount');
    const tot = document.getElementById('adminLiveTotal');

    const p = parseFloat(val);
    if (isNaN(p) || p <= 0) {
      if (box) box.style.display = 'none';
      return;
    }

    const calc = TB_FIREBASE.calculateDiscount(p);
    if (box) box.style.display = 'block';
    if (tier) tier.textContent = `${calc.porcentaje}% (${calc.rango})`;
    if (disc) disc.textContent = `-$${calc.montoDescuento.toLocaleString('es-MX')} MXN`;
    if (tot) tot.textContent = `$${calc.totalPagar.toLocaleString('es-MX')} MXN`;
  };

  window.handleConfirmRedemption = async function (e) {
    e.preventDefault();
    if (!currentValidatorCoupon || !currentValidatorCoupon.codigo) return;

    const btn = document.getElementById('btnAdminConfirmRedeem');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Procesando canje en Firebase...</span>';
    }

    const service = document.getElementById('adminRedeemService').value;
    const price = parseFloat(document.getElementById('adminRedeemPrice').value);
    const cashier = document.getElementById('adminRedeemCashier').value;
    const notes = document.getElementById('adminRedeemNotes').value;

    const res = await TB_FIREBASE.canjearCupon(currentValidatorCoupon.codigo, {
      servicio: service,
      precioOriginal: price,
      responsable: cashier,
      notas: notes
    });

    if (res.success) {
      showToast(res.message);
      currentValidatorCoupon = res.cupon;
      cachedCoupons[res.cupon.codigo] = res.cupon;
      renderValidatorResult(res.cupon);
      updateSurveyAndCouponKpis();
      renderCouponsTable();
      renderAnalyticsCharts();
    } else {
      showToast(res.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Confirmar Canje y Actualizar en Firebase</span>';
      }
    }
  };

  // ==========================================
  // 5. TABLA DE ENCUESTAS & FILTROS
  // ==========================================
  function renderSurveysTable(filteredList = null) {
    const tbody = document.getElementById('surveysTableBody');
    if (!tbody) return;

    const list = filteredList !== null ? filteredList : Object.values(cachedSurveys || {});
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="table-loading-cell">No se encontraron encuestas registradas.</td></tr>';
      return;
    }

    // Ordenar de más reciente a más antigua
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    tbody.innerHTML = list.map(s => {
      const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : (s.fechaRegistro ? s.fechaRegistro.split('T')[0] : '--');
      const telClean = (s.whatsapp || '').replace(/\D/g, '');
      const ratingBadge = `<span class="coupon-status-pill" style="background: rgba(212,175,55,0.15); color: var(--gold-light); border-color: rgba(212,175,55,0.4);">${escapeHtml(s.calificacionResultado || 'N/A')}</span>`;

      return `
        <tr>
          <td>${dateStr}</td>
          <td><strong>${escapeHtml(s.nombre || 'Clienta')}</strong></td>
          <td>
            <a href="https://api.whatsapp.com/send?phone=52${telClean}" target="_blank" rel="noopener noreferrer" style="color: var(--gold-light); text-decoration: underline;">
              ${escapeHtml(s.whatsapp || '--')}
            </a>
          </td>
          <td><span class="table-curso-tag">${escapeHtml(s.servicio || 'General')}</span></td>
          <td>${escapeHtml(s.fechaServicio || '--')}</td>
          <td>${ratingBadge}</td>
          <td>${escapeHtml(s.calificacionAtencion || '--')}</td>
          <td>${escapeHtml(s.recomendacion || '--')}</td>
          <td><code>${escapeHtml(s.cuponCodigo || '--')}</code></td>
          <td style="text-align: right;">
            <button type="button" class="btn-table-reset" onclick="openSurveyDetail('${s.id}')">
              <span>Ver Detalle</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.filterSurveysTable = function () {
    const query = (document.getElementById('surveySearchInput') ? document.getElementById('surveySearchInput').value : '').toLowerCase().trim();
    const serviceFilter = document.getElementById('surveyFilterService') ? document.getElementById('surveyFilterService').value : 'all';
    const ratingFilter = document.getElementById('surveyFilterRating') ? document.getElementById('surveyFilterRating').value : 'all';
    const dateFrom = document.getElementById('surveyFilterDateFrom') ? document.getElementById('surveyFilterDateFrom').value : '';
    const dateTo = document.getElementById('surveyFilterDateTo') ? document.getElementById('surveyFilterDateTo').value : '';

    const all = Object.values(cachedSurveys || {});
    const filtered = all.filter(s => {
      // Búsqueda texto
      const name = (s.nombre || '').toLowerCase();
      const phone = (s.whatsapp || '').toLowerCase();
      if (query && !name.includes(query) && !phone.includes(query)) {
        return false;
      }

      // Filtro Servicio
      if (serviceFilter !== 'all') {
        const srv = (s.servicio || '').toLowerCase();
        if (serviceFilter === 'Otro') {
          const defaults = ['uñas', 'pestañas', 'cejas', 'maquillaje', 'corte de cabello', 'tratamiento capilar'];
          if (defaults.includes(srv)) return false;
        } else if (!srv.includes(serviceFilter.toLowerCase())) {
          return false;
        }
      }

      // Filtro Calificación
      if (ratingFilter !== 'all' && s.calificacionResultado !== ratingFilter) {
        return false;
      }

      // Filtro Fechas
      const sDate = s.fechaServicio || (s.fechaRegistro ? s.fechaRegistro.split('T')[0] : '');
      if (dateFrom && sDate && sDate < dateFrom) return false;
      if (dateTo && sDate && sDate > dateTo) return false;

      return true;
    });

    renderSurveysTable(filtered);
  };

  window.openSurveyDetail = function (surveyId) {
    const survey = cachedSurveys[surveyId];
    if (!survey) return;

    const modal = document.getElementById('surveyDetailModal');
    const content = document.getElementById('surveyDetailContent');
    if (!modal || !content) return;

    const registered = survey.timestamp ? new Date(survey.timestamp).toLocaleString('es-MX') : '--';
    const associatedCoupon = cachedCoupons[survey.cuponCodigo] || null;

    content.innerHTML = `
      <div class="coupon-meta-grid" style="margin-bottom: 1rem;">
        <div class="coupon-meta-item">
          <span class="meta-label">Clienta</span>
          <span class="meta-val">${escapeHtml(survey.nombre || 'Clienta')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">WhatsApp</span>
          <span class="meta-val">${escapeHtml(survey.whatsapp || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Servicio Realizado</span>
          <span class="meta-val gold-bold">${escapeHtml(survey.servicio || 'General')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Fecha del Servicio</span>
          <span class="meta-val">${escapeHtml(survey.fechaServicio || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Calificación del Resultado</span>
          <span class="meta-val gold-bold">${escapeHtml(survey.calificacionResultado || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Atención Recibida</span>
          <span class="meta-val">${escapeHtml(survey.calificacionAtencion || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">¿Recomendaría?</span>
          <span class="meta-val">${escapeHtml(survey.recomendacion || '--')}</span>
        </div>
        <div class="coupon-meta-item">
          <span class="meta-label">Fecha y Hora de Registro</span>
          <span class="meta-val">${registered}</span>
        </div>
      </div>

      <div style="background: rgba(10,10,14,0.7); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
        <span class="meta-label" style="margin-bottom: 0.35rem; display: block;">Comentarios o Sugerencias:</span>
        <p style="font-size: 0.85rem; color: #ffffff; line-height: 1.5; font-style: italic;">
          ${survey.comentarios ? `&ldquo;${escapeHtml(survey.comentarios)}&rdquo;` : 'Sin comentarios adicionales proporcionados.'}
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); border-radius: 8px;">
        <span style="font-size: 0.8rem; color: #dedede;">Cupón asignado: <strong>${escapeHtml(survey.cuponCodigo || '--')}</strong></span>
        ${associatedCoupon ? `<span class="badge-status-${associatedCoupon.estado}">${associatedCoupon.estado}</span>` : ''}
      </div>
    `;

    modal.style.display = 'flex';
  };

  window.closeSurveyDetailModal = function () {
    const modal = document.getElementById('surveyDetailModal');
    if (modal) modal.style.display = 'none';
  };

  // ==========================================
  // 6. TABLA DE CUPONES & FILTROS
  // ==========================================
  function renderCouponsTable(filteredList = null) {
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    const list = filteredList !== null ? filteredList : Object.values(cachedCoupons || {});
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="table-loading-cell">No se han generado cupones aún.</td></tr>';
      return;
    }

    list.sort((a, b) => (b.timestampGeneracion || 0) - (a.timestampGeneracion || 0));

    tbody.innerHTML = list.map(c => {
      const issued = c.fechaGeneracion ? new Date(c.fechaGeneracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '--';
      const expiry = c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '--';
      const statusBadge = `<span class="badge-status-${c.estado}">${c.estado}</span>`;

      let detailCanje = '--';
      let totalPagadoStr = '--';
      if (c.estado === 'utilizado') {
        detailCanje = `${escapeHtml(c.servicioCanje || 'Servicio')} (-${c.descuentoPorcentaje || 0}%)`;
        totalPagadoStr = `$${c.totalPagado || 0} MXN`;
      }

      const actionBtn = c.estado === 'disponible'
        ? `<button type="button" class="btn-table-reset" onclick="triggerRedemption('${c.codigo}')">Canjear</button>`
        : `<span style="font-size: 0.72rem; color: var(--text-dim);">${c.estado === 'utilizado' ? 'Canjeado' : 'Vencido'}</span>`;

      return `
        <tr>
          <td><strong><code>${escapeHtml(c.codigo)}</code></strong></td>
          <td>${escapeHtml(c.nombre || 'Clienta')}</td>
          <td>${escapeHtml(c.whatsapp || '--')}</td>
          <td>${statusBadge}</td>
          <td>${issued}</td>
          <td class="gold-bold">${expiry}</td>
          <td>${detailCanje}</td>
          <td>${totalPagadoStr}</td>
          <td style="text-align: right;">${actionBtn}</td>
        </tr>
      `;
    }).join('');
  }

  window.filterCouponsTable = function () {
    const query = (document.getElementById('couponSearchInput') ? document.getElementById('couponSearchInput').value : '').toLowerCase().trim();
    const statusFilter = document.getElementById('couponFilterStatus') ? document.getElementById('couponFilterStatus').value : 'all';

    const all = Object.values(cachedCoupons || {});
    const filtered = all.filter(c => {
      const code = (c.codigo || '').toLowerCase();
      const name = (c.nombre || '').toLowerCase();
      const phone = (c.whatsapp || '').toLowerCase();

      if (query && !code.includes(query) && !name.includes(query) && !phone.includes(query)) {
        return false;
      }

      if (statusFilter !== 'all' && c.estado !== statusFilter) {
        return false;
      }

      return true;
    });

    renderCouponsTable(filtered);
  };

  window.triggerRedemption = function (code) {
    const valInput = document.getElementById('validatorCodeInput');
    if (valInput) valInput.value = code;
    window.switchAdminTab('pane-validador');
    window.handleSearchCoupon(code);
  };

  // ==========================================
  // 7. GRÁFICAS ESTADÍSTICAS Y RENDIMIENTO
  // ==========================================
  function renderAnalyticsCharts() {
    const surveys = Object.values(cachedSurveys || {});
    const coupons = Object.values(cachedCoupons || {});

    renderBestServicesChart(surveys);
    renderFeedbackChart(surveys);
    renderAvgByServiceChart(surveys);
    renderRecommendationChart(surveys);
    renderCouponUsageChart(coupons);
    renderMonthlyTrendChart(surveys);
  }

  function renderBestServicesChart(surveys) {
    const container = document.getElementById('chartBestServices');
    if (!container) return;

    const ratingWeights = { 'Excelente': 5, 'Muy bueno': 4, 'Bueno': 3, 'Regular': 2, 'Malo': 1 };
    const serviceScores = {};
    const serviceCounts = {};

    surveys.forEach(s => {
      const srv = s.servicio || 'General';
      const score = ratingWeights[s.calificacionResultado] || 0;
      if (score > 0) {
        serviceScores[srv] = (serviceScores[srv] || 0) + score;
        serviceCounts[srv] = (serviceCounts[srv] || 0) + 1;
      }
    });

    const list = Object.keys(serviceScores).map(srv => {
      const avg = serviceScores[srv] / serviceCounts[srv];
      return { service: srv, avg: parseFloat(avg.toFixed(1)), count: serviceCounts[srv] };
    });

    list.sort((a, b) => b.avg - a.avg);

    if (list.length === 0) {
      container.innerHTML = '<p class="admin-card-desc">Sin respuestas suficientes para graficar.</p>';
      return;
    }

    container.innerHTML = list.slice(0, 5).map(item => {
      const percent = Math.round((item.avg / 5) * 100);
      return `
        <div class="chart-bar-item">
          <div class="chart-bar-header">
            <span>${escapeHtml(item.service)}</span>
            <span class="gold-bold">${item.avg} / 5 (${item.count} reseñas)</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderFeedbackChart(surveys) {
    const container = document.getElementById('chartNegativeServices');
    if (!container) return;

    const counts = {};
    surveys.forEach(s => {
      if (s.comentarios && s.comentarios.trim().length > 0) {
        const srv = s.servicio || 'General';
        counts[srv] = (counts[srv] || 0) + 1;
      }
    });

    const list = Object.keys(counts).map(k => ({ service: k, count: counts[k] }));
    list.sort((a, b) => b.count - a.count);

    if (list.length === 0) {
      container.innerHTML = '<p class="admin-card-desc">No se han registrado sugerencias de mejora aún.</p>';
      return;
    }

    const max = Math.max(...list.map(l => l.count), 1);
    container.innerHTML = list.slice(0, 5).map(item => {
      const percent = Math.round((item.count / max) * 100);
      return `
        <div class="chart-bar-item">
          <div class="chart-bar-header">
            <span>${escapeHtml(item.service)}</span>
            <span>${item.count} comentarios</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${percent}%; background: linear-gradient(90deg, #d4af37, #f39c12);"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAvgByServiceChart(surveys) {
    const container = document.getElementById('chartAvgByService');
    if (!container) return;

    const map = {};
    const ratingWeights = { 'Excelente': 5, 'Muy bueno': 4, 'Bueno': 3, 'Regular': 2, 'Malo': 1 };

    surveys.forEach(s => {
      const srv = s.servicio || 'General';
      const r = ratingWeights[s.calificacionResultado] || 0;
      if (r > 0) {
        if (!map[srv]) map[srv] = { total: 0, count: 0 };
        map[srv].total += r;
        map[srv].count++;
      }
    });

    const list = Object.keys(map).map(srv => ({
      service: srv,
      avg: parseFloat((map[srv].total / map[srv].count).toFixed(1))
    }));

    if (list.length === 0) {
      container.innerHTML = '<p class="admin-card-desc">Sin datos disponibles.</p>';
      return;
    }

    container.innerHTML = list.map(item => {
      const percent = Math.round((item.avg / 5) * 100);
      return `
        <div class="chart-bar-item">
          <div class="chart-bar-header">
            <span>${escapeHtml(item.service)}</span>
            <span class="gold-bold">${item.avg} / 5</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderRecommendationChart(surveys) {
    const container = document.getElementById('chartRecommendation');
    if (!container) return;

    const total = surveys.length;
    if (total === 0) {
      container.innerHTML = '<p class="admin-card-desc">Sin datos registrados.</p>';
      return;
    }

    let si = 0, no = 0, talVez = 0;
    surveys.forEach(s => {
      if (s.recomendacion === 'Sí') si++;
      else if (s.recomendacion === 'No') no++;
      else talVez++;
    });

    const pSi = Math.round((si / total) * 100);
    const pTalVez = Math.round((talVez / total) * 100);
    const pNo = Math.round((no / total) * 100);

    container.innerHTML = `
      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>Definitivamente Sí</span>
          <span class="gold-bold">${pSi}% (${si})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pSi}%; background: #2ecc71;"></div>
        </div>
      </div>

      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>Tal vez</span>
          <span>${pTalVez}% (${talVez})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pTalVez}%; background: #f39c12;"></div>
        </div>
      </div>

      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>No recomendaría</span>
          <span>${pNo}% (${no})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pNo}%; background: #e74c3c;"></div>
        </div>
      </div>
    `;
  }

  function renderCouponUsageChart(coupons) {
    const container = document.getElementById('chartCouponUsage');
    if (!container) return;

    const total = coupons.length;
    if (total === 0) {
      container.innerHTML = '<p class="admin-card-desc">No hay cupones generados todavía.</p>';
      return;
    }

    let utilizados = 0, disponibles = 0, vencidos = 0;
    coupons.forEach(c => {
      if (c.estado === 'utilizado') utilizados++;
      else if (c.estado === 'disponible') disponibles++;
      else if (c.estado === 'vencido') vencidos++;
    });

    const pUtil = Math.round((utilizados / total) * 100);
    const pDisp = Math.round((disponibles / total) * 100);
    const pVenc = Math.round((vencidos / total) * 100);

    container.innerHTML = `
      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>Cupones Canjeados (Éxito)</span>
          <span class="gold-bold">${pUtil}% (${utilizados})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pUtil}%; background: #2ecc71;"></div>
        </div>
      </div>

      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>Cupones Pendientes (Activos)</span>
          <span>${pDisp}% (${disponibles})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pDisp}%; background: var(--gold-primary);"></div>
        </div>
      </div>

      <div class="chart-bar-item">
        <div class="chart-bar-header">
          <span>Cupones Vencidos</span>
          <span>${pVenc}% (${vencidos})</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pVenc}%; background: #e74c3c;"></div>
        </div>
      </div>
    `;
  }

  function renderMonthlyTrendChart(surveys) {
    const container = document.getElementById('chartMonthlyEvolution');
    if (!container) return;

    const ratingWeights = { 'Excelente': 5, 'Muy bueno': 4, 'Bueno': 3, 'Regular': 2, 'Malo': 1 };
    const monthScores = {};
    const monthCounts = {};

    surveys.forEach(s => {
      let key = '2026-11';
      if (s.fechaServicio && s.fechaServicio.length >= 7) {
        key = s.fechaServicio.substring(0, 7);
      } else if (s.fechaRegistro && s.fechaRegistro.length >= 7) {
        key = s.fechaRegistro.substring(0, 7);
      }

      const score = ratingWeights[s.calificacionResultado] || 0;
      if (score > 0) {
        monthScores[key] = (monthScores[key] || 0) + score;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    });

    const months = Object.keys(monthScores).sort();
    if (months.length === 0) {
      container.innerHTML = '<p class="admin-card-desc">Sin datos mensuales registrados.</p>';
      return;
    }

    container.innerHTML = months.map(m => {
      const avg = (monthScores[m] / monthCounts[m]).toFixed(1);
      const percent = Math.round((avg / 5) * 100);
      return `
        <div class="chart-bar-item">
          <div class="chart-bar-header">
            <span>Mes: ${m}</span>
            <span class="gold-bold">${avg} / 5 (${monthCounts[m]} encuestas)</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 8. GESTIÓN DEL ANUNCIO INTERSTICIAL (EXISTENTE)
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
    } catch (e) {
      console.error("Error al cargar anuncio:", e);
    }
  }

  window.updateImagePreview = function (src) {
    const preview = document.getElementById('adminImgPreview');
    if (preview) {
      preview.src = src || "assets/images/academia.jpg";
    }
  };

  window.setQuickImg = function (src) {
    const input = document.getElementById('adminAnnImg');
    if (input) {
      input.value = src;
      updateImagePreview(src);
    }
  };

  window.updateAnnouncementStatusBadge = function () {
    const toggle = document.getElementById('adminAnnToggle');
    const badge = document.getElementById('announcementBadgeStatus');
    const kpi = document.getElementById('kpiAnnStatus');

    if (!toggle || !badge) return;

    if (toggle.checked) {
      badge.className = "badge-status-active";
      badge.textContent = "Activo en la Página";
      if (kpi) kpi.textContent = "Activo";
    } else {
      badge.className = "badge-status-paused";
      badge.textContent = "Pausado / Oculto";
      if (kpi) kpi.textContent = "Pausado";
    }
  };

  window.handleSaveAnnouncement = async function (e) {
    e.preventDefault();

    const payload = {
      enabled: document.getElementById('adminAnnToggle').checked,
      title: document.getElementById('adminAnnTitle').value.trim(),
      image: document.getElementById('adminAnnImg').value.trim() || "assets/images/academia.jpg",
      text: document.getElementById('adminAnnText').value.trim(),
      link: document.getElementById('adminAnnLink').value.trim() || "https://api.whatsapp.com/send?phone=525650560824",
      btnText: document.getElementById('adminAnnBtnText').value.trim() || "Solicitar Informes por WhatsApp"
    };

    const saved = await TB_FIREBASE.saveAnnouncement(payload);
    if (saved) {
      showToast("Anuncio intersticial guardado exitosamente en Firebase");
    } else {
      showToast("Guardado en respaldo local (sin respuesta de Firebase)");
    }
  };

  window.previewInterstitialModal = function () {
    const modal = document.getElementById('interstitialOverlay');
    const countdown = document.getElementById('interstitialCountdownText');
    const closeBtn = document.getElementById('interstitialCloseBtn');
    if (!modal) return;

    const title = document.getElementById('adminAnnTitle').value || "Inscripciones Abiertas a Cursos Prácticos";
    const img = document.getElementById('adminAnnImg').value || "assets/images/academia.jpg";
    const text = document.getElementById('adminAnnText').value || "Inicia tu formación profesional con metodología 90% práctica en modelos reales.";
    const link = document.getElementById('adminAnnLink').value || "#";
    const btnText = document.getElementById('adminAnnBtnText').value || "Solicitar Informes por WhatsApp";

    document.getElementById('interstitialTitle').textContent = title;
    document.getElementById('interstitialImg').src = img;
    document.getElementById('interstitialText').textContent = text;
    document.getElementById('interstitialBtn').href = link;
    document.getElementById('interstitialBtnText').textContent = btnText;

    let seconds = 5;
    interstitialCanClose = false;
    if (closeBtn) closeBtn.style.display = 'none';
    if (countdown) {
      countdown.style.display = 'inline-block';
      countdown.textContent = `Cerrar en ${seconds}s`;
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));

    clearInterval(interstitialTimerInterval);
    interstitialTimerInterval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        if (countdown) countdown.textContent = `Cerrar en ${seconds}s`;
      } else {
        clearInterval(interstitialTimerInterval);
        interstitialCanClose = true;
        if (countdown) countdown.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'inline-flex';
      }
    }, 1000);
  };

  window.closeInterstitialPreview = function () {
    if (!interstitialCanClose) return;
    const modal = document.getElementById('interstitialOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  };

  // ==========================================
  // 9. GESTIÓN DE CURSOS DE CAPACITACIÓN (EXISTENTE)
  // ==========================================
  async function loadCoursesData() {
    const container = document.getElementById('coursesCardsContainer');
    try {
      cachedCourses = await TB_FIREBASE.getCursos();
      renderCoursesCards(cachedCourses);
    } catch (e) {
      console.error("Error al cargar cursos:", e);
      if (container) {
        container.innerHTML = '<div class="table-loading-cell">Error al conectar con cursos en Firebase.</div>';
      }
    }
  }

  function renderCoursesCards(coursesObj) {
    const container = document.getElementById('coursesCardsContainer');
    if (!container) return;

    const list = Object.values(coursesObj || {});
    if (list.length === 0) {
      container.innerHTML = '<div class="table-loading-cell">No hay cursos registrados. Use el botón "Agregar Nuevo Curso".</div>';
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="admin-course-item-card" data-course-id="${escapeHtml(c.id)}">
        <div class="course-card-top">
          <span class="course-cat-tag">${escapeHtml(c.categoria || "Especialidad")}</span>
          <span class="course-active-tag ${c.activo !== false ? 'active' : 'paused'}">
            ${c.activo !== false ? 'Activo en Portal' : 'Oculto'}
          </span>
        </div>
        <h4 class="course-card-title">${escapeHtml(c.titulo)}</h4>
        <p class="course-card-meta">${escapeHtml(c.modalidad)} &bull; ${escapeHtml(c.duracion)}</p>
        <p class="course-card-desc">${escapeHtml(c.descripcion || "Capacitación práctica personalizada.")}</p>
        <div class="course-card-actions">
          <button type="button" class="btn-course-action edit" onclick="handleEditCourse('${c.id}')">Editar</button>
          <button type="button" class="btn-course-action delete" onclick="handleDeleteCourse('${c.id}')">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  window.toggleNewCourseForm = function () {
    const formBox = document.getElementById('courseCollapseForm');
    const btnText = document.getElementById('btnToggleCourseFormText');
    const form = document.getElementById('adminCourseForm');
    if (!formBox) return;

    if (formBox.style.display === 'none' || !formBox.style.display) {
      formBox.style.display = 'block';
      if (btnText) btnText.textContent = 'Ocultar Formulario';
      if (form) form.reset();
      document.getElementById('courseEditId').value = '';
      document.getElementById('courseFormTitle').textContent = 'Registrar Nuevo Curso de Capacitación';
      document.getElementById('courseTitleInput').focus();
    } else {
      formBox.style.display = 'none';
      if (btnText) btnText.textContent = 'Agregar Nuevo Curso';
    }
  };

  window.handleEditCourse = function (courseId) {
    const c = cachedCourses[courseId];
    if (!c) return;

    const formBox = document.getElementById('courseCollapseForm');
    if (formBox) formBox.style.display = 'block';

    document.getElementById('courseEditId').value = c.id;
    document.getElementById('courseFormTitle').textContent = 'Editar Curso: ' + c.titulo;
    document.getElementById('courseTitleInput').value = c.titulo || '';
    document.getElementById('courseCategoryInput').value = c.categoria || '';
    document.getElementById('courseModalidadInput').value = c.modalidad || '90% Práctico';
    document.getElementById('courseDuracionInput').value = c.duracion || 'Presencial • Modelos Reales';
    document.getElementById('courseDescInput').value = c.descripcion || '';
    document.getElementById('courseTema1').value = c.tema1 || '';
    document.getElementById('courseTema2').value = c.tema2 || '';
    document.getElementById('courseTema3').value = c.tema3 || '';
    document.getElementById('courseWhatsappInput').value = c.whatsappMsg || '';
    document.getElementById('courseActivoInput').value = c.activo !== false ? 'true' : 'false';

    window.scrollTo({ top: formBox.offsetTop - 80, behavior: 'smooth' });
  };

  window.handleSaveCourse = async function (e) {
    e.preventDefault();

    const editId = document.getElementById('courseEditId').value.trim();
    const titulo = document.getElementById('courseTitleInput').value.trim();
    const categoria = document.getElementById('courseCategoryInput').value.trim();
    const modalidad = document.getElementById('courseModalidadInput').value.trim();
    const duracion = document.getElementById('courseDuracionInput').value.trim();
    const descripcion = document.getElementById('courseDescInput').value.trim();
    const tema1 = document.getElementById('courseTema1').value.trim();
    const tema2 = document.getElementById('courseTema2').value.trim();
    const tema3 = document.getElementById('courseTema3').value.trim();
    const whatsappMsg = document.getElementById('courseWhatsappInput').value.trim();
    const activo = document.getElementById('courseActivoInput').value === 'true';

    const id = editId || `curso_${Date.now()}`;
    const payload = {
      id,
      titulo,
      categoria,
      categoriaKey: categoria.toLowerCase().replace(/[^a-z0-9]/g, ''),
      modalidad,
      duracion,
      descripcion,
      tema1,
      tema2,
      tema3,
      whatsappMsg,
      activo,
      updatedAt: Date.now()
    };

    const ok = await TB_FIREBASE.saveCurso(id, payload);
    if (ok) {
      showToast('Curso guardado exitosamente en Firebase');
      toggleNewCourseForm();
      loadCoursesData();
    } else {
      showToast('Error al guardar el curso en Firebase');
    }
  };

  window.handleDeleteCourse = async function (courseId) {
    const confirmed = window.confirm('¿Está seguro de eliminar este curso del portal de la academia?');
    if (!confirmed) return;

    const ok = await TB_FIREBASE.deleteCurso(courseId);
    if (ok) {
      showToast('Curso eliminado de Firebase');
      loadCoursesData();
    } else {
      showToast('Error al eliminar curso en Firebase');
    }
  };

  // ==========================================
  // 10. GESTIÓN DE ALUMNAS (EXISTENTE)
  // ==========================================
  window.loadStudentsData = async function (showToastNotice = false) {
    const tbody = document.getElementById('studentsTableBody');
    if (tbody && !showToastNotice) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading-cell">Cargando registros desde Firebase...</td></tr>';
    }

    try {
      cachedStudents = await TB_FIREBASE.getAlumnas();
      renderStudentsTable(cachedStudents);
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
      tbody.innerHTML = '<tr><td colspan="6" class="table-loading-cell">No hay alumnas registradas aún. Use el botón "Registrar Nueva Alumna".</td></tr>';
      return;
    }

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
          <td class="cell-curso"><span class="table-curso-tag">${escapeHtml(student.curso || "Cursos Prácticos")}</span></td>
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
    const btnText = document.getElementById('btnToggleStudentFormText');
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

    const confirmed = window.confirm(`¿Desea restablecer la contraseña de la matrícula ${cleanMatricula} a la clave por defecto TB2026?`);
    if (!confirmed) return;

    const ok = await TB_FIREBASE.resetAlumnaPassword(cleanMatricula);
    if (ok) {
      showToast(`Contraseña de ${cleanMatricula} restablecida a TB2026 en Firebase`);
      loadStudentsData();
    } else {
      showToast("No se pudo restablecer la contraseña en Firebase");
    }
  };

  window.handleDeleteStudent = async function (matricula) {
    const cleanMatricula = (matricula || '').trim().toUpperCase();
    if (!cleanMatricula) return;

    const confirmed = window.confirm(`¿Está seguro de eliminar el registro de la matrícula ${cleanMatricula}?`);
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
  // 11. UTILIDADES (TOAST Y ESCAPE HTML)
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


  // ==========================================
  // 11. MODO MANTENIMIENTO TEMPORAL
  // ==========================================
  let currentMaintenanceConfig = null;

  async function loadMaintenanceAdminData() {
    try {
      if (!window.TB_FIREBASE || !TB_FIREBASE.getMaintenanceMode) return;
      const mnt = await TB_FIREBASE.getMaintenanceMode();
      currentMaintenanceConfig = mnt;

      updateMaintenanceUI(mnt);
    } catch (e) {
      console.warn("Error cargando configuración de mantenimiento:", e);
    }
  }

  function updateMaintenanceUI(mnt) {
    if (!mnt) return;
    const isActive = mnt.activo === true;

    // 1. Banner en el Dashboard Principal
    const dashBanner = document.getElementById('dashboardMntBanner');
    const dashBadge = document.getElementById('dashMntBadge');
    const dashTitle = document.getElementById('dashMntTitle');
    const dashSub = document.getElementById('dashMntSub');

    if (dashBanner) {
      dashBanner.className = isActive ? 'admin-mnt-status-card maintenance' : 'admin-mnt-status-card live';
    }
    if (dashBadge) {
      dashBadge.textContent = isActive ? 'Mantenimiento Activo' : 'Sitio En Vivo';
    }
    if (dashTitle) {
      dashTitle.textContent = isActive 
        ? 'El portal web está cerrado al público en general'
        : 'El portal web está disponible para todas las clientas';
    }
    if (dashSub) {
      dashSub.textContent = isActive
        ? 'Las visitantes son dirigidas automáticamente a la pantalla de mantenimiento con opción de WhatsApp.'
        : 'Acceso público activo en salón, cursos, buen fin y cupones.';
    }

    // 2. Tarjeta en el Módulo pane-mantenimiento
    const adminMntCard = document.getElementById('adminMntCard');
    const adminMntBadge = document.getElementById('adminMntBadge');
    const adminMntHeading = document.getElementById('adminMntHeading');
    const adminMntDesc = document.getElementById('adminMntDesc');
    const chkToggle = document.getElementById('chkToggleMantenimiento');
    const switchLabel = document.getElementById('adminMntSwitchLabel');

    if (adminMntCard) {
      adminMntCard.className = isActive ? 'admin-mnt-status-card maintenance' : 'admin-mnt-status-card live';
    }
    if (adminMntBadge) {
      adminMntBadge.textContent = isActive ? 'Mantenimiento Activo' : 'Sitio En Vivo';
    }
    if (adminMntHeading) {
      adminMntHeading.textContent = isActive 
        ? 'Portal Web en Mantenimiento Temporal'
        : 'Página Web Abierta al Público';
    }
    if (adminMntDesc) {
      adminMntDesc.textContent = isActive
        ? 'Los visitantes son dirigidos automáticamente a la pantalla de mantenimiento.'
        : 'Las clientas pueden navegar libremente por el portal.';
    }
    if (chkToggle) {
      chkToggle.checked = isActive;
    }
    if (switchLabel) {
      switchLabel.textContent = isActive ? 'Mantenimiento ACTIVADO' : 'Mantenimiento Desactivado';
      switchLabel.style.color = isActive ? 'var(--gold-light)' : '#dedede';
    }

    // 3. Formulario
    const inputTitulo = document.getElementById('inputMntTitulo');
    const inputMensaje = document.getElementById('inputMntMensaje');
    const inputFechaFin = document.getElementById('inputMntFechaFin');
    const inputWhatsapp = document.getElementById('inputMntWhatsappNum');
    const chkWhatsapp = document.getElementById('chkMntPermitirWhatsapp');

    if (inputTitulo && mnt.titulo) inputTitulo.value = mnt.titulo;
    if (inputMensaje && mnt.mensaje) inputMensaje.value = mnt.mensaje;
    if (inputWhatsapp && mnt.whatsappNumero) inputWhatsapp.value = mnt.whatsappNumero;
    if (chkWhatsapp) chkWhatsapp.checked = mnt.permitirWhatsapp !== false;

    if (inputFechaFin && mnt.fechaFinEstimada) {
      try {
        const d = new Date(mnt.fechaFinEstimada);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          inputFechaFin.value = localIso;
        }
      } catch (e) {}
    }
  }

  window.handleMntToggleChange = async function (checked) {
    try {
      if (!window.TB_FIREBASE || !TB_FIREBASE.saveMaintenanceMode) return;
      const current = currentMaintenanceConfig || {};
      const updated = Object.assign({}, current, {
        activo: checked
      });
      currentMaintenanceConfig = updated;
      updateMaintenanceUI(updated);

      await TB_FIREBASE.saveMaintenanceMode(updated);

      if (checked) {
        showToast("Modo Mantenimiento ACTIVADO. Las clientas verán la pantalla de mantenimiento.");
      } else {
        showToast("Modo Mantenimiento DESACTIVADO. El portal web está nuevamente en vivo.");
      }
    } catch (e) {
      console.error("Error al alternar modo mantenimiento:", e);
      showToast("Error al guardar en Firebase");
    }
  };

  window.handleSaveMaintenanceSettings = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      if (!window.TB_FIREBASE || !TB_FIREBASE.saveMaintenanceMode) return;

      const btn = document.getElementById('btnSaveMntSettings');
      if (btn) btn.disabled = true;

      const chkToggle = document.getElementById('chkToggleMantenimiento');
      const inputTitulo = document.getElementById('inputMntTitulo');
      const inputMensaje = document.getElementById('inputMntMensaje');
      const inputFechaFin = document.getElementById('inputMntFechaFin');
      const inputWhatsapp = document.getElementById('inputMntWhatsappNum');
      const chkWhatsapp = document.getElementById('chkMntPermitirWhatsapp');

      let fechaFinIso = "";
      if (inputFechaFin && inputFechaFin.value) {
        try {
          fechaFinIso = new Date(inputFechaFin.value).toISOString();
        } catch (err) {}
      }

      const payload = {
        activo: chkToggle ? chkToggle.checked : false,
        titulo: (inputTitulo ? inputTitulo.value : '').trim() || "Renovando Nuestra Experiencia para Ti",
        mensaje: (inputMensaje ? inputMensaje.value : '').trim() || "Estamos realizando mejoras exclusivas...",
        fechaFinEstimada: fechaFinIso,
        permitirWhatsapp: chkWhatsapp ? chkWhatsapp.checked : true,
        whatsappNumero: (inputWhatsapp ? inputWhatsapp.value : '').trim() || "525650560824"
      };

      currentMaintenanceConfig = payload;
      updateMaintenanceUI(payload);

      await TB_FIREBASE.saveMaintenanceMode(payload);
      showToast("Configuración de mantenimiento guardada exitosamente");

      if (btn) btn.disabled = false;
    } catch (err) {
      console.error("Error al guardar mantenimiento:", err);
      showToast("No se pudo guardar la configuración.");
      const btn = document.getElementById('btnSaveMntSettings');
      if (btn) btn.disabled = false;
    }
  };

  window.loadMaintenanceAdminData = loadMaintenanceAdminData;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (interstitialCanClose) window.closeInterstitialPreview();
      window.closeSurveyDetailModal();
    }
  });
});
