// ==========================================================================
// CRÉDITO TOTAL B - PORTAL EXCLUSIVO DE CLIENTAS
// TOTAL BEAUTY SALÓN & ACADEMIA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const SESSION_USER_KEY = 'tb_credito_user_phone';

  // Elementos principales
  const tabsNav = document.getElementById('creditoTabsNav');
  const tabBtnRegistro = document.getElementById('tabBtnRegistro');
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const viewRegistro = document.getElementById('viewRegistro');
  const viewLogin = document.getElementById('viewLogin');
  const viewDashboard = document.getElementById('viewDashboard');

  // Elementos de la Tarjeta Virtual 3D
  const virtualCardWrapper = document.getElementById('virtualCardWrapper');
  const virtualCard = document.getElementById('virtualCard');
  const cardHolderDisplay = document.getElementById('cardHolderDisplay');
  const cardNumberDisplay = document.getElementById('cardNumberDisplay');
  const cardStatusPill = document.getElementById('cardStatusPill');
  const cardStatusText = document.getElementById('cardStatusText');
  const cardTierLabel = document.getElementById('cardTierLabel');

  // Elementos de Dashboard
  const dashClientName = document.getElementById('dashClientName');
  const dashClientPhone = document.getElementById('dashClientPhone');
  const blockEnProgreso = document.getElementById('blockEnProgreso');
  const blockPendienteActivacion = document.getElementById('blockPendienteActivacion');
  const blockActiva = document.getElementById('blockActiva');

  // Elementos de Métricas del Dashboard
  const dashPercentNumber = document.getElementById('dashPercentNumber');
  const dashPercentLegend = document.getElementById('dashPercentLegend');
  const dashLinearProgress = document.getElementById('dashLinearProgress');
  const gaugeProgressCircle = document.getElementById('gaugeProgressCircle');
  const dashCreditoDisponible = document.getElementById('dashCreditoDisponible');
  const dashLineaCredito = document.getElementById('dashLineaCredito');

  // Inicialización de Efecto 3D Tilt en Tarjeta
  initCard3DTilt();

  // Verificar si ya existe una sesión activa en el navegador
  checkActiveSession();

  // ==========================================
  // NAVEGACIÓN ENTRE VISTAS
  // ==========================================
  window.switchCreditoView = function (viewName) {
    if (viewName === 'registro') {
      if (tabsNav) tabsNav.style.display = 'flex';
      if (tabBtnRegistro) tabBtnRegistro.classList.add('active');
      if (tabBtnLogin) tabBtnLogin.classList.remove('active');
      if (viewRegistro) viewRegistro.style.display = 'block';
      if (viewLogin) viewLogin.style.display = 'none';
      if (viewDashboard) viewDashboard.style.display = 'none';
    } else if (viewName === 'login') {
      if (tabsNav) tabsNav.style.display = 'flex';
      if (tabBtnRegistro) tabBtnRegistro.classList.remove('active');
      if (tabBtnLogin) tabBtnLogin.classList.add('active');
      if (viewRegistro) viewRegistro.style.display = 'none';
      if (viewLogin) viewLogin.style.display = 'block';
      if (viewDashboard) viewDashboard.style.display = 'none';
    } else if (viewName === 'dashboard') {
      if (tabsNav) tabsNav.style.display = 'none';
      if (viewRegistro) viewRegistro.style.display = 'none';
      if (viewLogin) viewLogin.style.display = 'none';
      if (viewDashboard) viewDashboard.style.display = 'block';
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // ==========================================
  // REGISTRO DE NUEVA CLIENTA
  // ==========================================
  window.handleRegistroCredito = async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitRegistro');

    const nombre = (document.getElementById('regNombre')?.value || '').trim();
    const whatsapp = (document.getElementById('regWhatsapp')?.value || '').trim();
    const pin = (document.getElementById('regPin')?.value || '').trim();
    const pinConfirm = (document.getElementById('regPinConfirm')?.value || '').trim();

    if (nombre.length < 3) {
      showCreditoToast('Por favor ingrese su nombre completo.');
      return;
    }

    const cleanTel = whatsapp.replace(/\D/g, '');
    if (cleanTel.length < 10) {
      showCreditoToast('Por favor ingrese un número de WhatsApp a 10 dígitos.');
      return;
    }

    if (pin.length < 4) {
      showCreditoToast('El PIN debe contener al menos 4 dígitos.');
      return;
    }

    if (pin !== pinConfirm) {
      showCreditoToast('Los dígitos de confirmación del PIN no coinciden.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.add('loading');
    }

    try {
      const resp = await TB_FIREBASE.registrarCreditoCliente({
        nombre: nombre,
        whatsapp: cleanTel,
        pin: pin
      });

      if (!resp.success) {
        showCreditoToast(resp.message || 'No fue posible completar el registro.');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('loading');
        }
        return;
      }

      sessionStorage.setItem(SESSION_USER_KEY, cleanTel);
      showCreditoToast('Registro completado. Bienvenido al programa Crédito Total B.');
      renderClientDashboard(resp.cliente);
      window.switchCreditoView('dashboard');
    } catch (err) {
      console.error('Error en registro:', err);
      showCreditoToast('Ocurrió un error al procesar su solicitud. Intente nuevamente.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('loading');
      }
    }
  };

  // ==========================================
  // INICIO DE SESIÓN / CONSULTA DE ESTADO
  // ==========================================
  window.handleLoginCredito = async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitLogin');

    const whatsapp = (document.getElementById('loginWhatsapp')?.value || '').trim();
    const pin = (document.getElementById('loginPin')?.value || '').trim();

    const cleanTel = whatsapp.replace(/\D/g, '');
    if (cleanTel.length < 10) {
      showCreditoToast('Por favor ingrese un número de WhatsApp a 10 dígitos.');
      return;
    }

    if (!pin) {
      showCreditoToast('Por favor ingrese su PIN de seguridad.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.add('loading');
    }

    try {
      const resp = await TB_FIREBASE.loginCreditoCliente(cleanTel, pin);

      if (!resp.success) {
        showCreditoToast(resp.message || 'Credenciales incorrectas.');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('loading');
        }
        return;
      }

      sessionStorage.setItem(SESSION_USER_KEY, cleanTel);
      showCreditoToast('Sesión iniciada exitosamente.');
      renderClientDashboard(resp.cliente);
      window.switchCreditoView('dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      showCreditoToast('No fue posible consultar su información. Verifique su conexión.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('loading');
      }
    }
  };

  // ==========================================
  // RENDERIZADO DEL DASHBOARD DE CLIENTA
  // ==========================================
  function renderClientDashboard(cliente) {
    if (!cliente) return;

    // 1. Calcular porcentaje según especificación estricta:
    // La fórmula interna considera $10,000 y 20 servicios, pero NO se muestran cantidades al cliente.
    const porcentaje = TB_FIREBASE.calcularPorcentajeCredito(
      cliente.totalGastado,
      cliente.totalServicios,
      cliente.porcentajeManual
    );

    // Determinar estado efectivo
    let estado = cliente.estado || 'en_progreso';
    if (porcentaje >= 100 && estado === 'en_progreso') {
      estado = 'pendiente_activacion';
    }

    // 2. Actualizar Tarjeta Virtual 3D
    if (cardHolderDisplay) {
      cardHolderDisplay.textContent = (cliente.nombre || 'CLIENTA PRIVILEGE').toUpperCase();
    }
    if (cardNumberDisplay) {
      cardNumberDisplay.textContent = cliente.numeroTarjeta || 'TB •••• VIP';
    }

    if (cardStatusPill && cardStatusText) {
      cardStatusPill.className = 'credito-card-status-pill';
      if (estado === 'activa') {
        cardStatusPill.classList.add('status-activa');
        cardStatusText.textContent = 'TARJETA ACTIVA';
        if (cardTierLabel) cardTierLabel.textContent = 'BLACK VIP PLATINUM';
      } else if (estado === 'pendiente_activacion' || porcentaje >= 100) {
        cardStatusPill.classList.add('status-aprobada');
        cardStatusText.textContent = 'TARJETA APROBADA';
        if (cardTierLabel) cardTierLabel.textContent = 'LISTA PARA ACTIVAR';
      } else {
        cardStatusPill.classList.add('status-progreso');
        cardStatusText.textContent = `${porcentaje}% AVANCE`;
        if (cardTierLabel) cardTierLabel.textContent = 'BLACK VIP CARD';
      }
    }

    // 3. Encabezado de Clienta
    if (dashClientName) {
      dashClientName.textContent = cliente.nombre || 'Clienta Privilege';
    }
    if (dashClientPhone) {
      const tel = String(cliente.whatsapp || '');
      const masked = tel.length === 10
        ? `${tel.slice(0, 3)} ••• ••${tel.slice(-2)}`
        : tel;
      dashClientPhone.textContent = `WhatsApp: ${masked}`;
    }

    // 4. Conmutar Bloques según Estado
    if (estado === 'activa') {
      // Estado Activa: Muestra saldo disponible configurado en admin
      if (blockActiva) blockActiva.style.display = 'block';
      if (blockPendienteActivacion) blockPendienteActivacion.style.display = 'none';
      if (blockEnProgreso) blockEnProgreso.style.display = 'none';

      const disp = Number(cliente.creditoDisponible) || 0;
      const linea = Number(cliente.lineaCredito) || 0;

      if (dashCreditoDisponible) {
        dashCreditoDisponible.textContent = `$${disp.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
      }
      if (dashLineaCredito) {
        dashLineaCredito.textContent = `$${linea.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
      }

    } else if (estado === 'pendiente_activacion' || porcentaje >= 100) {
      // Estado 100% alcanzado: Aprobada, presentarse al salón para activarla
      if (blockPendienteActivacion) blockPendienteActivacion.style.display = 'block';
      if (blockActiva) blockActiva.style.display = 'none';
      if (blockEnProgreso) blockEnProgreso.style.display = 'none';

    } else {
      // Estado En Progreso: Muestra porcentaje de 0 a 100
      // NUNCA mostrar montos ni conteo de servicios al cliente
      if (blockEnProgreso) blockEnProgreso.style.display = 'block';
      if (blockPendienteActivacion) blockPendienteActivacion.style.display = 'none';
      if (blockActiva) blockActiva.style.display = 'none';

      if (dashPercentNumber) {
        dashPercentNumber.textContent = `${porcentaje}%`;
      }
      if (dashPercentLegend) {
        dashPercentLegend.textContent = `${porcentaje}% Actual`;
      }
      if (dashLinearProgress) {
        dashLinearProgress.style.width = `${porcentaje}%`;
      }

      // Animación de medidor circular (circunferencia aprox 326.72 px)
      if (gaugeProgressCircle) {
        const circumference = 2 * Math.PI * 52; // 326.72
        const offset = circumference - (circumference * (porcentaje / 100));
        gaugeProgressCircle.style.strokeDasharray = `${circumference}`;
        gaugeProgressCircle.style.strokeDashoffset = `${offset}`;
      }
    }
  }

  // ==========================================
  // CIERRE DE SESIÓN
  // ==========================================
  window.handleLogoutCredito = function () {
    sessionStorage.removeItem(SESSION_USER_KEY);
    showCreditoToast('Sesión finalizada.');

    // Resetear tarjeta a estado base
    if (cardHolderDisplay) cardHolderDisplay.textContent = 'CLIENTA PRIVILEGE';
    if (cardNumberDisplay) cardNumberDisplay.textContent = 'TB •••• •••• VIP';
    if (cardStatusPill && cardStatusText) {
      cardStatusPill.className = 'credito-card-status-pill';
      cardStatusText.textContent = 'EN ACUMULACIÓN';
    }
    if (cardTierLabel) cardTierLabel.textContent = 'BLACK VIP CARD';

    window.switchCreditoView('login');
  };

  // ==========================================
  // SESIÓN ACTIVA AL RECARGAR
  // ==========================================
  async function checkActiveSession() {
    const savedPhone = sessionStorage.getItem(SESSION_USER_KEY);
    if (!savedPhone) return;

    try {
      const cliente = await TB_FIREBASE.getCreditoCliente(savedPhone);
      if (cliente) {
        renderClientDashboard(cliente);
        window.switchCreditoView('dashboard');
      }
    } catch (err) {
      console.warn('No fue posible restaurar la sesión:', err);
    }
  }

  // ==========================================
  // INTERACCIÓN 3D DE LA TARJETA VIRTUAL (TILT)
  // ==========================================
  function initCard3DTilt() {
    if (!virtualCardWrapper || !virtualCard) return;

    let isHovered = false;

    virtualCardWrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      virtualCard.style.transition = 'transform 0.1s ease-out';
    });

    virtualCardWrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      virtualCard.style.transition = 'transform 0.5s ease';
      virtualCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    virtualCardWrapper.addEventListener('mousemove', (e) => {
      if (!isHovered) return;
      const rect = virtualCardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      virtualCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    // Soporte táctil sutil en móviles
    virtualCardWrapper.addEventListener('touchstart', () => {
      virtualCard.style.transform = 'perspective(1000px) scale3d(1.02, 1.02, 1.02)';
    }, { passive: true });

    virtualCardWrapper.addEventListener('touchend', () => {
      virtualCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }, { passive: true });
  }

  // ==========================================
  // SISTEMA DE TOASTS
  // ==========================================
  let toastTimer = null;
  function showCreditoToast(message) {
    const toast = document.getElementById('creditoToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4000);
  }
});
