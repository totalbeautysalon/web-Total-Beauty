/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Script de Navegación y Modal Exclusivo
 * Cero Emojis - Estética Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de Enlaces Directos (El usuario puede sustituirlos por sus URLs finales)
  const config = {
    // Si se definen URLs aquí, el botón navegará directamente.
    // Si se dejan vacías (""), se abrirá el modal interactivo con sub-opciones.
    salonUrl: "",     // Ejemplo: "https://midominio.com/salon" o "TotalBeauty_Web"
    academiaUrl: "",  // Ejemplo: "https://midominio.com/academia"
    whatsappNumber: "5210000000000", // Número de contacto oficial para citas/informes
  };

  // Datos para los Modales de Salón y Academia
  const modalData = {
    salon: {
      tag: "Total Beauty Salón",
      title: "Servicios de Alta Gama",
      description: "Experimente la excelencia en cuidado y estilismo personal. Seleccione la opción de su preferencia para ser atendido por nuestros especialistas.",
      options: [
        {
          label: "Reservar Cita Personalizada",
          action: () => openBookingModal("salon_reserva"),
          detail: "Atención prioritaria"
        },
        {
          label: "Catálogo de Servicios y Precios",
          action: () => alertUser("Catálogo de servicios disponible en recepción y vía digital."),
          detail: "Corte, colorimetría, spa"
        },
        {
          label: "Contactar Recepción por WhatsApp",
          action: () => openWhatsApp("Hola, deseo solicitar informes y agendar una cita en Total Beauty Salón."),
          detail: "Respuesta inmediata"
        }
      ]
    },
    academia: {
      tag: "Total Beauty Academia",
      title: "Formación y Certificación",
      description: "Desarrolle su potencial artístico con nuestros programas profesionales. Domine las técnicas más solicitadas en la industria estética.",
      options: [
        {
          label: "Plan de Estudios y Cursos Activos",
          action: () => alertUser("Consulta el calendario de inscripciones y diplomados vigentes."),
          detail: "Técnicas de vanguardia"
        },
        {
          label: "Requisitos de Inscripción y Matrícula",
          action: () => alertUser("Inscripciones abiertas con cupo limitado para atención personalizada."),
          detail: "Certificaciones oficiales"
        },
        {
          label: "Asesoría Académica por WhatsApp",
          action: () => openWhatsApp("Hola, deseo solicitar informes sobre los cursos y diplomados de Total Beauty Academia."),
          detail: "Atención a postulantes"
        }
      ]
    }
  };

  // Elementos DOM del Modal
  const modalOverlay = document.getElementById('optionsModal');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalLinksContainer = document.getElementById('modalLinksContainer');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Función para Abrir Modal
  window.openModal = function(type) {
    if (type === 'salon' && config.salonUrl) {
      window.location.href = config.salonUrl;
      return;
    }
    if (type === 'academia' && config.academiaUrl) {
      window.location.href = config.academiaUrl;
      return;
    }

    const data = modalData[type];
    if (!data) return;

    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;

    // Limpiar y generar opciones
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

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Función para Cerrar Modal
  window.closeModal = function() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', window.closeModal);
  }

  // Cerrar al hacer clic en el fondo oscuro
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        window.closeModal();
      }
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      window.closeModal();
    }
  });

  // Funciones de utilidad
  function openWhatsApp(message) {
    const text = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  function alertUser(msg) {
    // Diálogo minimalista de notificación sin alert nativo invasivo
    const notice = document.createElement('div');
    notice.style.position = 'fixed';
    notice.style.bottom = '2rem';
    notice.style.left = '50%';
    notice.style.transform = 'translateX(-50%)';
    notice.style.background = '#101015';
    notice.style.border = '1px solid #d4af37';
    notice.style.color = '#f8f8f8';
    notice.style.padding = '0.9rem 1.6rem';
    notice.style.borderRadius = '6px';
    notice.style.fontSize = '0.85rem';
    notice.style.letterSpacing = '0.04em';
    notice.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.2)';
    notice.style.zIndex = '9999';
    notice.style.transition = 'opacity 0.4s ease';
    notice.textContent = msg;

    document.body.appendChild(notice);
    setTimeout(() => {
      notice.style.opacity = '0';
      setTimeout(() => notice.remove(), 400);
    }, 3200);
  }

  function openBookingModal(type) {
    window.closeModal();
    openWhatsApp("Hola, solicito agendar una cita para servicios en Total Beauty Salón.");
  }
});
