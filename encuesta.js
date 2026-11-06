/**
 * TOTAL BEAUTY SALÓN & ACADEMIA
 * Script de Encuesta de Satisfacción y Generación Automática de Cupones
 * Almacenamiento en Firebase Realtime Database con Respaldo Offline
 * Cero Emojis - Estética Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Configuración predeterminada
  const DEFAULT_VALIDITY_DAYS = 30;
  const WHATSAPP_BUSINESS_PHONE = "525650560824";

  // Variables de Estado
  let currentStep = 1;
  let activeCouponData = null;

  // Elementos DOM Principales
  const surveyForm = document.getElementById('surveyForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const stepSuccess = document.getElementById('stepSuccess');
  const surveyProgressBar = document.getElementById('surveyProgressBar');
  const surveyStepText = document.getElementById('surveyStepText');
  const surveyPercentText = document.getElementById('surveyPercentText');
  const surveyProgressBarWrap = document.getElementById('surveyProgressBarWrap');
  const submitSurveyBtn = document.getElementById('submitSurveyBtn');
  const serviceDateInput = document.getElementById('serviceDateInput');
  const otherServiceWrap = document.getElementById('otherServiceWrap');
  const otherServiceInput = document.getElementById('otherServiceInput');
  const surveyToast = document.getElementById('surveyToast');

  // Inicializar Fecha Predeterminada a Hoy
  if (serviceDateInput) {
    const today = new Date().toISOString().split('T')[0];
    serviceDateInput.value = today;
    serviceDateInput.max = today;
  }

  // ==========================================
  // NAVEGACIÓN ENTRE PASOS
  // ==========================================
  window.goToStep = function (targetStep) {
    if (targetStep === 2) {
      if (!validateStep1()) return;
      
      step1.style.display = 'none';
      step2.style.display = 'block';
      currentStep = 2;

      if (surveyProgressBar) surveyProgressBar.style.width = '100%';
      if (surveyStepText) surveyStepText.textContent = 'Paso 2 de 2: Calificación de tu Experiencia';
      if (surveyPercentText) surveyPercentText.textContent = '100%';

      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (targetStep === 1) {
      step2.style.display = 'none';
      step1.style.display = 'block';
      currentStep = 1;

      if (surveyProgressBar) surveyProgressBar.style.width = '50%';
      if (surveyStepText) surveyStepText.textContent = 'Paso 1 de 2: Tus Datos & Servicio';
      if (surveyPercentText) surveyPercentText.textContent = '50%';

      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Manejo de opción "Otro" en servicios
  window.handleServiceSelection = function (serviceValue) {
    hideFieldError('errorService');
    if (serviceValue === 'Otro') {
      if (otherServiceWrap) {
        otherServiceWrap.style.display = 'block';
        if (otherServiceInput) otherServiceInput.focus();
      }
    } else {
      if (otherServiceWrap) otherServiceWrap.style.display = 'none';
    }
  };

  // ==========================================
  // VALIDACIONES EN TIEMPO REAL
  // ==========================================
  function validateStep1() {
    let isValid = true;

    // 1. Nombre
    const nameInput = document.getElementById('clientNameInput');
    const nameVal = (nameInput ? nameInput.value : '').trim();
    if (!nameVal || nameVal.length < 3) {
      showFieldError('errorName', 'Por favor, ingresa tu nombre completo (mínimo 3 letras).');
      if (isValid && nameInput) nameInput.focus();
      isValid = false;
    } else {
      hideFieldError('errorName');
    }

    // 2. WhatsApp (exactamente 10 dígitos)
    const phoneInput = document.getElementById('clientWhatsappInput');
    const phoneRaw = (phoneInput ? phoneInput.value : '').replace(/\D/g, '');
    if (!phoneRaw || phoneRaw.length !== 10) {
      showFieldError('errorWhatsapp', 'Ingresa un número de WhatsApp válido de 10 dígitos numéricos.');
      if (isValid && phoneInput) phoneInput.focus();
      isValid = false;
    } else {
      hideFieldError('errorWhatsapp');
    }

    // 3. Servicio
    const selectedService = document.querySelector('input[name="servicio"]:checked');
    if (!selectedService) {
      showFieldError('errorService', 'Selecciona el servicio que te realizaste.');
      isValid = false;
    } else if (selectedService.value === 'Otro') {
      const otherVal = (otherServiceInput ? otherServiceInput.value : '').trim();
      if (!otherVal || otherVal.length < 3) {
        showFieldError('errorService', 'Especifica el nombre del servicio en el campo de texto.');
        if (isValid && otherServiceInput) otherServiceInput.focus();
        isValid = false;
      } else {
        hideFieldError('errorService');
      }
    } else {
      hideFieldError('errorService');
    }

    // 4. Fecha de servicio
    if (serviceDateInput && !serviceDateInput.value) {
      showFieldError('errorDate', 'Por favor, selecciona la fecha de tu servicio.');
      isValid = false;
    } else {
      hideFieldError('errorDate');
    }

    return isValid;
  }

  function validateStep2() {
    let isValid = true;

    const ratingResult = document.querySelector('input[name="calificacionResultado"]:checked');
    if (!ratingResult) {
      showFieldError('errorRatingResult', 'Califica el resultado de tu servicio.');
      isValid = false;
    } else {
      hideFieldError('errorRatingResult');
    }

    const ratingCare = document.querySelector('input[name="calificacionAtencion"]:checked');
    if (!ratingCare) {
      showFieldError('errorRatingCare', 'Califica la atención recibida en el salón.');
      isValid = false;
    } else {
      hideFieldError('errorRatingCare');
    }

    const recommend = document.querySelector('input[name="recomendacion"]:checked');
    if (!recommend) {
      showFieldError('errorRecommend', 'Por favor, selecciona si nos recomendarías.');
      isValid = false;
    } else {
      hideFieldError('errorRecommend');
    }

    return isValid;
  }

  function showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
    }
  }

  function hideFieldError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
  }

  // ==========================================
  // ENVÍO DE LA ENCUESTA & GENERACIÓN DE CUPÓN
  // ==========================================
  window.handleSurveySubmit = async function (e) {
    e.preventDefault();

    if (!validateStep1()) {
      window.goToStep(1);
      return;
    }

    if (!validateStep2()) {
      return;
    }

    // Bloquear botón de envío y mostrar carga
    if (submitSurveyBtn) {
      submitSurveyBtn.disabled = true;
      submitSurveyBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Guardando tu encuesta...</span>
      `;
    }

    const name = document.getElementById('clientNameInput').value.trim();
    const whatsapp = document.getElementById('clientWhatsappInput').value.replace(/\D/g, '');
    const serviceRadio = document.querySelector('input[name="servicio"]:checked');
    let service = serviceRadio ? serviceRadio.value : 'General';
    if (service === 'Otro' && otherServiceInput) {
      service = otherServiceInput.value.trim() || 'Otro Servicio';
    }
    const fechaServicio = serviceDateInput ? serviceDateInput.value : new Date().toISOString().split('T')[0];
    const califResultado = document.querySelector('input[name="calificacionResultado"]:checked').value;
    const califAtencion = document.querySelector('input[name="calificacionAtencion"]:checked').value;
    const comentarios = (document.getElementById('commentsInput') ? document.getElementById('commentsInput').value : '').trim();
    const recomendacion = document.querySelector('input[name="recomendacion"]:checked').value;

    try {
      // 1. Control de duplicados: Comprobar si ya existe encuesta reciente de esta clienta
      const recentCheck = await TB_FIREBASE.checkClientRecentSurvey(whatsapp, service);
      
      if (recentCheck.hasRecent && recentCheck.cupon && recentCheck.cupon.estado === 'disponible') {
        // La clienta ya tiene un cupón activo generado recientemente
        activeCouponData = recentCheck.cupon;
        showToast('Identificamos tu encuesta reciente. Aquí tienes tu cupón de descuento activo:');
        renderSuccessScreen(activeCouponData, name, whatsapp);
        return;
      }

      // 2. Generar nuevo cupón único
      const couponCode = TB_FIREBASE.generateCouponCode();
      const now = Date.now();
      const expiryTimestamp = now + (DEFAULT_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
      const fechaVencimiento = new Date(expiryTimestamp).toISOString();

      const newCoupon = {
        codigo: couponCode,
        idEncuesta: null,
        nombre: name,
        whatsapp: whatsapp,
        estado: 'disponible',
        fechaGeneracion: new Date(now).toISOString(),
        fechaVencimiento: fechaVencimiento,
        fechaUtilizacion: null,
        servicioCanje: null,
        precioOriginal: null,
        descuentoPorcentaje: null,
        descuentoImporte: null,
        totalPagado: null,
        canjeadoPor: null,
        timestampGeneracion: now
      };

      // 3. Guardar encuesta en Firebase Realtime Database
      const surveyPayload = {
        nombre: name,
        whatsapp: whatsapp,
        servicio: service,
        fechaServicio: fechaServicio,
        calificacionResultado: califResultado,
        calificacionAtencion: califAtencion,
        comentarios: comentarios,
        recomendacion: recomendacion,
        cuponCodigo: couponCode,
        timestamp: now,
        fechaRegistro: new Date(now).toISOString()
      };

      const surveyRes = await TB_FIREBASE.saveEncuesta(surveyPayload);
      newCoupon.idEncuesta = surveyRes.id || null;

      // 4. Guardar cupón en Firebase Realtime Database
      await TB_FIREBASE.saveCupon(couponCode, newCoupon);

      activeCouponData = newCoupon;
      renderSuccessScreen(newCoupon, name, whatsapp);

    } catch (err) {
      console.error('Error al procesar la encuesta:', err);
      // Respaldo de emergencia en modo local
      const emergencyCode = TB_FIREBASE.generateCouponCode();
      const emergencyCoupon = {
        codigo: emergencyCode,
        idEncuesta: `local_${Date.now()}`,
        nombre: name,
        whatsapp: whatsapp,
        estado: 'disponible',
        fechaGeneracion: new Date().toISOString(),
        fechaVencimiento: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
      };
      activeCouponData = emergencyCoupon;
      renderSuccessScreen(emergencyCoupon, name, whatsapp);
    } finally {
      if (submitSurveyBtn) {
        submitSurveyBtn.disabled = false;
        submitSurveyBtn.innerHTML = `
          <span>Enviar Encuesta &amp; Obtener Cupón</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }
    }
  };

  // ==========================================
  // PANTALLA DE ÉXITO Y CUPÓN
  // ==========================================
  function renderSuccessScreen(coupon, clientName, clientPhone) {
    if (surveyForm) surveyForm.style.display = 'none';
    if (surveyProgressBarWrap) surveyProgressBarWrap.style.display = 'none';
    if (stepSuccess) stepSuccess.style.display = 'block';

    const codeEl = document.getElementById('displayCouponCode');
    const nameEl = document.getElementById('displayClientName');
    const phoneEl = document.getElementById('displayClientPhone');
    const issuedEl = document.getElementById('displayIssuedDate');
    const expiryEl = document.getElementById('displayExpiryDate');
    const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');

    if (codeEl) codeEl.textContent = coupon.codigo || 'TB-2026';
    if (nameEl) nameEl.textContent = clientName || coupon.nombre || 'Clienta Estimada';
    if (phoneEl) phoneEl.textContent = clientPhone || coupon.whatsapp || '';

    const issuedDate = coupon.fechaGeneracion ? new Date(coupon.fechaGeneracion) : new Date();
    const expiryDate = coupon.fechaVencimiento ? new Date(coupon.fechaVencimiento) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (issuedEl) issuedEl.textContent = issuedDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    if (expiryEl) expiryEl.textContent = expiryDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    // Enlace de WhatsApp para compartir su cupón o agendar
    if (btnShareWhatsapp) {
      const msg = encodeURIComponent(
        `¡Hola Total Beauty! Completé la encuesta de satisfacción y recibí mi cupón oficial de descuento para mi próxima visita.\n\n` +
        `Código de Cupón: ${coupon.codigo}\n` +
        `Clienta: ${clientName || coupon.nombre}\n` +
        `WhatsApp: ${clientPhone || coupon.whatsapp}\n` +
        `Vigencia hasta: ${expiryDate.toLocaleDateString('es-MX')}\n\n` +
        `Deseo agendar mi próxima cita y hacer válido mi descuento. ¡Muchas gracias!`
      );
      btnShareWhatsapp.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_BUSINESS_PHONE}&text=${msg}`;
    }

    // Inicializar simulador con valor sugerido $500
    const calcInput = document.getElementById('calcServicePriceInput');
    if (calcInput) {
      calcInput.value = "500";
      window.updateSavingsSimulator(500);
    }

    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  // ==========================================
  // SIMULADOR DE AHORRO INTERACTIVO
  // ==========================================
  window.updateSavingsSimulator = function (val) {
    const calcResultBox = document.getElementById('calcResultBox');
    const calcPercentDisplay = document.getElementById('calcPercentDisplay');
    const calcDiscountDisplay = document.getElementById('calcDiscountDisplay');
    const calcTotalDisplay = document.getElementById('calcTotalDisplay');

    const price = parseFloat(val);
    if (isNaN(price) || price <= 0) {
      if (calcResultBox) calcResultBox.style.display = 'none';
      return;
    }

    const calc = TB_FIREBASE.calculateDiscount(price);
    if (calcResultBox) calcResultBox.style.display = 'block';
    if (calcPercentDisplay) calcPercentDisplay.textContent = `${calc.porcentaje}% (${calc.rango})`;
    if (calcDiscountDisplay) calcDiscountDisplay.textContent = `-$${calc.montoDescuento.toLocaleString('es-MX')} MXN`;
    if (calcTotalDisplay) calcTotalDisplay.textContent = `$${calc.totalPagar.toLocaleString('es-MX')} MXN`;
  };

  // ==========================================
  // COPIAR CUPÓN AL PORTAPAPELES
  // ==========================================
  window.copyCouponToClipboard = function () {
    if (!activeCouponData || !activeCouponData.codigo) return;

    const copyText = `TOTAL BEAUTY SALÓN & ACADEMIA\nCupón Oficial de Descuento: ${activeCouponData.codigo}\nClienta: ${activeCouponData.nombre || ''}\nDescuentos aplicables:\n- Menos de $300: 5%\n- De $301 a $500: 10%\n- De $501 a $700: 15%\n- Más de $701: 20%\nVálido para una sola utilización. Vence: ${activeCouponData.fechaVencimiento ? new Date(activeCouponData.fechaVencimiento).toLocaleDateString('es-MX') : '30 días'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText).then(() => {
        showCopySuccess();
      }).catch(() => {
        fallbackCopyText(copyText);
      });
    } else {
      fallbackCopyText(copyText);
    }
  };

  function showCopySuccess() {
    const btnText = document.getElementById('btnCopyText');
    if (btnText) btnText.textContent = '¡Cupón Copiado!';
    showToast('Código y detalles del cupón copiados al portapapeles exitosamente.');
    setTimeout(() => {
      if (btnText) btnText.textContent = 'Copiar Mi Cupón';
    }, 3500);
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showCopySuccess();
    } catch (err) {
      showToast(`Código de cupón: ${activeCouponData.codigo}`);
    }
    document.body.removeChild(ta);
  }

  // ==========================================
  // MENSAJES TOAST ELEGANTE
  // ==========================================
  function showToast(msg) {
    if (!surveyToast) return;
    surveyToast.textContent = msg;
    surveyToast.style.display = 'block';
    surveyToast.classList.add('visible');

    setTimeout(() => {
      surveyToast.classList.remove('visible');
      setTimeout(() => {
        surveyToast.style.display = 'none';
      }, 300);
    }, 4500);
  }

});
