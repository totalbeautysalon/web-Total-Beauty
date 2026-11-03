/**
 * TOTAL BEAUTY SALON & ACADEMIA
 * Script de Navegación, Modal y Filtros
 * Cero Emojis - Estética Minimalista y de Lujo
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de Enlaces Directos
  const config = {
    salonUrl: "",      // Si se asigna una URL, el salón redirigirá en vez de abrir modal
    whatsappNumber: "5210000000000",
  };

  // ==========================================
  // 1. MANEJO DEL MODAL EN INDEX.HTML (SALÓN)
  // ==========================================
  const modalData = {
    salon: {
      tag: "Total Beauty Salón",
      title: "Servicios de Salón",
      description: "Seleccione una opción para recibir atención directa por parte de nuestro equipo de recepción y estilistas.",
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
          detail: "Respuesta directa"
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      window.closeModal();
    }
  });

  // ==========================================
  // 2. FILTRO DE CURSOS EN ACADEMIA.HTML
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
  // 3. FUNCIONES DE UTILIDAD Y CONTACTO
  // ==========================================
  function openWhatsApp(message) {
    const text = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  function alertUser(msg) {
    const notice = document.createElement('div');
    notice.style.position = 'fixed';
    notice.style.bottom = '2rem';
    notice.style.left = '50%';
    notice.style.transform = 'translateX(-50%)';
    notice.style.background = '#101015';
    notice.style.border = '1px solid #d4af37';
    notice.style.color = '#f8f8f8';
    notice.style.padding = '0.85rem 1.5rem';
    notice.style.borderRadius = '6px';
    notice.style.fontSize = '0.82rem';
    notice.style.letterSpacing = '0.04em';
    notice.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.2)';
    notice.style.zIndex = '9999';
    notice.style.transition = 'opacity 0.4s ease';
    notice.textContent = msg;

    document.body.appendChild(notice);
    setTimeout(() => {
      notice.style.opacity = '0';
      setTimeout(() => notice.remove(), 400);
    }, 3000);
  }

  function openBookingModal(type) {
    window.closeModal();
    openWhatsApp("Hola, solicito agendar una cita para servicios en Total Beauty Salón.");
  }
});
