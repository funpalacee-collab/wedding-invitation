/* ==========================================================================
   LUXURY WEDDING APPLICATION CONTROLLER
   Manages Envelope Opening, Countdown, RSVPs, Guestbook, Calendar & Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Particle Canvas
  window.weddingParticles = new ParticleEngine('particles-canvas');

  // Initialize Customizer Engine
  window.weddingCustomizer = new WeddingCustomizer();

  // Initialize Core Features
  initEnvelopeCeremony();
  initCountdownTimer();
  initAudioPlayerControls();
  initRSVPForm();
  initGuestbookWall();
  initCalendarIntegrations();
  initGalleryLightbox();
  initShareModal();
  initNavbarScroll();
  initCopyRegistry();
  initVenueSlider();
});

/* ==========================================================================
   1. DIRECT OPEN CARD & AMBIENT AUDIO INITIALIZATION
   ========================================================================== */
function initEnvelopeCeremony() {
  // Ensure page is immediately scrollable with direct open view
  document.body.style.overflow = 'auto';

  // Ensure continuous ambient audio plays smoothly on first user touch/click/scroll anywhere
  const ensureContinuousAudio = () => {
    if (window.weddingAudio && !window.weddingAudio.isPlaying) {
      window.weddingAudio.play();
    }
  };
  document.addEventListener('pointerdown', ensureContinuousAudio, { once: true });
  document.addEventListener('touchstart', ensureContinuousAudio, { once: true });
  document.addEventListener('scroll', ensureContinuousAudio, { once: true });
}

/* ==========================================================================
   2. COUNTDOWN TIMER
   ========================================================================== */
let countdownInterval = null;

function initCountdownTimer() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  window.updateCountdownTarget = (targetDate) => {
    if (countdownInterval) clearInterval(countdownInterval);

    const update = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        const msg = document.getElementById('countdown-message');
        if (msg) msg.textContent = "Today is the Magical Day! 🎉 Just Married!";
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    };

    update();
    countdownInterval = setInterval(update, 1000);
  };

  const initialDate = new Date(`${window.weddingCustomizer.config.weddingDate}T${window.weddingCustomizer.config.weddingTime}`);
  window.updateCountdownTarget(initialDate);
}

/* ==========================================================================
   3. AUDIO PLAYER CONTROLS
   ========================================================================== */
function initAudioPlayerControls() {
  const audioToggleBtn = document.getElementById('audio-toggle-btn');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (window.weddingAudio) {
        window.weddingAudio.toggle();
      }
    });
  }
}

/* ==========================================================================
   4. RSVP SYSTEM & MANAGER (LocalStorage + CSV Export)
   ========================================================================== */
const DEFAULT_RSVPS = [
  {
    name: "Uncle Tariq & Family",
    email: "tariq.mansoor@example.com",
    status: "attending",
    guests: "4",
    meal: "Traditional Royal Mutton Biryani",
    dietary: "Halal / None",
    song: "Maher Zain - For the Rest of My Life",
    message: "Barakallahu lakuma! May Allah fill your new home with endless barakah and happiness.",
    date: "2026-10-12"
  },
  {
    name: "Hamza & Ayesha",
    email: "hamza.malik@example.com",
    status: "attending",
    guests: "2",
    meal: "Royal Chicken Qorma & Roghani Naan",
    dietary: "None",
    song: "Sami Yusuf - You Came to Me",
    message: "Heartiest congratulations to Salaar and Noor! So thrilled for you both.",
    date: "2026-10-15"
  }
];

function getStoredRSVPs() {
  try {
    const data = localStorage.getItem('luxury_wedding_rsvps');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [...DEFAULT_RSVPS];
}

function saveStoredRSVPs(list) {
  try {
    localStorage.setItem('luxury_wedding_rsvps', JSON.stringify(list));
  } catch (e) {}
}

function initRSVPForm() {
  const form = document.getElementById('rsvp-form');
  const passModal = document.getElementById('rsvp-pass-modal');
  const closePassBtn = document.getElementById('close-pass-modal');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rsvp-name').value.trim();
      const email = document.getElementById('rsvp-email').value.trim();
      const guests = document.getElementById('rsvp-guests').value;
      const status = document.querySelector('input[name="attendance"]:checked')?.value || 'attending';
      const meal = document.getElementById('rsvp-meal').value;
      const dietary = document.getElementById('rsvp-dietary').value.trim() || 'None';
      const song = document.getElementById('rsvp-song').value.trim();
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name || !email) {
        alert("Please provide your name and email.");
        return;
      }

      const newEntry = {
        name,
        email,
        status,
        guests: status === 'attending' ? guests : '0',
        meal: status === 'attending' ? meal : 'N/A',
        dietary,
        song,
        message,
        date: new Date().toISOString().split('T')[0]
      };

      const rsvps = getStoredRSVPs();
      rsvps.unshift(newEntry);
      saveStoredRSVPs(rsvps);

      // Trigger Confetti
      if (window.weddingParticles) {
        window.weddingParticles.triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);
      }

      // Populate & Show Pass Modal
      if (passModal) {
        document.getElementById('pass-guest-name').textContent = name;
        document.getElementById('pass-status').textContent = status === 'attending' ? 'Joyfully Attending' : 'Regretfully Declined';
        document.getElementById('pass-guest-count').textContent = status === 'attending' ? `${guests} Guest(s)` : '0 Guests';
        document.getElementById('pass-meal-choice').textContent = status === 'attending' ? meal : 'N/A';
        passModal.classList.remove('hidden');
        passModal.classList.add('flex');
      }

      form.reset();
      updateRSVPAdminTable();
    });
  }

  if (closePassBtn && passModal) {
    closePassBtn.addEventListener('click', () => {
      passModal.classList.add('hidden');
      passModal.classList.remove('flex');
    });
  }

  // Setup Admin RSVP Table & Export
  initRSVPAdmin();
}

function initRSVPAdmin() {
  const adminBtn = document.getElementById('open-rsvp-admin-btn');
  const adminModal = document.getElementById('rsvp-admin-modal');
  const closeAdminBtn = document.getElementById('close-rsvp-admin-btn');
  const exportBtn = document.getElementById('export-rsvp-csv-btn');
  const clearBtn = document.getElementById('clear-rsvp-data-btn');

  if (adminBtn && adminModal) {
    adminBtn.addEventListener('click', () => {
      updateRSVPAdminTable();
      adminModal.classList.remove('hidden');
      adminModal.classList.add('flex');
    });
  }

  if (closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener('click', () => {
      adminModal.classList.add('hidden');
      adminModal.classList.remove('flex');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportRSVPsToCSV();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all RSVPs?")) {
        localStorage.removeItem('luxury_wedding_rsvps');
        updateRSVPAdminTable();
      }
    });
  }
}

function updateRSVPAdminTable() {
  const rsvps = getStoredRSVPs();
  const tbody = document.getElementById('rsvp-table-body');
  const totalAttendingEl = document.getElementById('admin-total-attending');
  const totalDeclinedEl = document.getElementById('admin-total-declined');
  const totalGuestsEl = document.getElementById('admin-total-headcount');

  let attendingCount = 0;
  let declinedCount = 0;
  let totalHeadcount = 0;

  if (tbody) tbody.innerHTML = '';

  rsvps.forEach((r, idx) => {
    if (r.status === 'attending') {
      attendingCount++;
      totalHeadcount += parseInt(r.guests, 10) || 1;
    } else {
      declinedCount++;
    }

    if (tbody) {
      const row = document.createElement('tr');
      row.className = 'border-b border-stone-200 text-sm hover:bg-stone-50';
      row.innerHTML = `
        <td class="py-3 px-4 font-medium text-stone-900">${r.name}</td>
        <td class="py-3 px-4 text-stone-600">${r.email}</td>
        <td class="py-3 px-4">
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status === 'attending' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${r.status === 'attending' ? 'Attending' : 'Declined'}
          </span>
        </td>
        <td class="py-3 px-4 text-stone-700 font-semibold">${r.guests}</td>
        <td class="py-3 px-4 text-stone-600 text-xs">${r.meal}</td>
        <td class="py-3 px-4 text-stone-500 text-xs">${r.dietary || '-'}</td>
        <td class="py-3 px-4 text-stone-500 text-xs italic">${r.song || '-'}</td>
      `;
      tbody.appendChild(row);
    }
  });

  if (totalAttendingEl) totalAttendingEl.textContent = attendingCount;
  if (totalDeclinedEl) totalDeclinedEl.textContent = declinedCount;
  if (totalGuestsEl) totalGuestsEl.textContent = totalHeadcount;
}

function exportRSVPsToCSV() {
  const rsvps = getStoredRSVPs();
  if (!rsvps.length) {
    alert("No RSVPs found to export.");
    return;
  }

  const headers = ["Name", "Email", "Status", "Guest Count", "Meal Choice", "Dietary Restrictions", "Song Request", "Message", "Submission Date"];
  const rows = rsvps.map(r => [
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.email.replace(/"/g, '""')}"`,
    `"${r.status}"`,
    `"${r.guests}"`,
    `"${r.meal.replace(/"/g, '""')}"`,
    `"${r.dietary.replace(/"/g, '""')}"`,
    `"${(r.song || '').replace(/"/g, '""')}"`,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    `"${r.date}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `wedding_rsvp_guestlist_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/* ==========================================================================
   5. DIGITAL GUESTBOOK & WISHES WALL
   ========================================================================== */
const INITIAL_WISHES = [
  {
    id: 1,
    author: "Dada Jaan & Dadi Jaan",
    relation: "Grandparents",
    emoji: "🕊️",
    likes: 42,
    text: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ. May Allah SWT always protect and illuminate Salaar & Noor with love and peace.",
    time: "Yesterday"
  },
  {
    id: 2,
    author: "Zainab & Bilal",
    relation: "Cousins",
    emoji: "✨",
    likes: 29,
    text: "MashAllah, the most graceful couple! May your journey together be as luminous as the name Noor and as noble as Salaar. Mubarak!",
    time: "2 days ago"
  },
  {
    id: 3,
    author: "Dr. Usman & Family",
    relation: "Family Friends",
    emoji: "🤍",
    likes: 23,
    text: "Wishing dear Salaar and Noor a blessed Nikkah and lifelong companionship filled with Iman, Mawaddah, and Barakah.",
    time: "3 days ago"
  }
];

function initGuestbookWall() {
  const container = document.getElementById('wishes-wall-grid');
  const form = document.getElementById('new-wish-form');

  const getWishes = () => {
    try {
      const data = localStorage.getItem('wedding_wishes');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return INITIAL_WISHES;
  };

  const renderWishes = () => {
    if (!container) return;
    const wishes = getWishes();
    container.innerHTML = '';

    wishes.forEach(w => {
      const card = document.createElement('div');
      card.className = 'glass-card p-6 flex flex-col justify-between transition-transform duration-300';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-100/60 border border-amber-300/60 flex items-center justify-center text-lg shadow-sm">
                ${w.emoji}
              </div>
              <div>
                <h4 class="font-semibold text-stone-900 text-sm">${w.author}</h4>
                <p class="text-xs text-stone-500">${w.relation || 'Cherished Guest'} • ${w.time || 'Just now'}</p>
              </div>
            </div>
            <button class="wish-like-btn flex items-center gap-1.5 text-xs text-rose-500 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full transition-colors" data-id="${w.id}">
              <span>❤️</span>
              <span class="like-count font-medium">${w.likes}</span>
            </button>
          </div>
          <p class="text-stone-700 text-sm leading-relaxed italic font-serif">"${w.text}"</p>
        </div>
      `;
      container.appendChild(card);
    });

    // Like buttons
    container.querySelectorAll('.wish-like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const wishes = getWishes();
        const found = wishes.find(item => item.id === id);
        if (found) {
          found.likes = (found.likes || 0) + 1;
          localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
          btn.querySelector('.like-count').textContent = found.likes;
          btn.classList.add('scale-110');
          setTimeout(() => btn.classList.remove('scale-110'), 200);
        }
      });
    });
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('wish-name').value.trim();
      const relation = document.getElementById('wish-relation').value.trim() || 'Guest';
      const text = document.getElementById('wish-text').value.trim();
      const emoji = document.querySelector('input[name="wish-emoji"]:checked')?.value || '❤️';

      if (!author || !text) return;

      const wishes = getWishes();
      wishes.unshift({
        id: Date.now(),
        author,
        relation,
        emoji,
        likes: 1,
        text,
        time: "Just now"
      });

      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
      form.reset();
      renderWishes();

      if (window.weddingParticles) {
        window.weddingParticles.triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.7);
      }
    });
  }

  renderWishes();
}

/* ==========================================================================
   6. CALENDAR INTEGRATION (.ICS & GOOGLE CALENDAR)
   ========================================================================== */
function initCalendarIntegrations() {
  const gcalBtn = document.getElementById('add-to-gcal-btn');
  const icsBtn = document.getElementById('download-ics-btn');

  const getCalendarDetails = () => {
    const c = window.weddingCustomizer.config;
    const dateStr = c.weddingDate.replace(/-/g, '');
    const timeParts = c.weddingTime.split(':');
    const startHour = timeParts[0] || '16';
    const startMin = timeParts[1] || '00';
    
    // ISO format for calendar YYYYMMDDTHHMMSS
    const startDateTime = `${dateStr}T${startHour}${startMin}00`;
    // End 6 hours later
    const endHour = String((parseInt(startHour, 10) + 6) % 24).padStart(2, '0');
    const endDateTime = `${dateStr}T${endHour}${startMin}00`;

    const title = `Wedding Celebration: ${c.groomName} & ${c.brideName}`;
    const desc = `${c.tagline}\n\nVenue: ${c.venueName}\nAddress: ${c.venueAddress}\nHashtag: ${c.hashtag}`;
    const location = `${c.venueName}, ${c.venueAddress}`;

    return { title, desc, location, startDateTime, endDateTime };
  };

  if (gcalBtn) {
    gcalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const details = getCalendarDetails();
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(details.title)}&dates=${details.startDateTime}/${details.endDateTime}&details=${encodeURIComponent(details.desc)}&location=${encodeURIComponent(details.location)}`;
      window.open(gcalUrl, '_blank');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const details = getCalendarDetails();
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Luxury Wedding Suite//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:${details.title}`,
        `DESCRIPTION:${details.desc.replace(/\n/g, '\\n')}`,
        `LOCATION:${details.location}`,
        `DTSTART:${details.startDateTime}`,
        `DTEND:${details.endDateTime}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `Wedding_${window.weddingCustomizer.config.monogram.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
}

/* ==========================================================================
   7. PHOTO GALLERY & LIGHTBOX MODAL
   ========================================================================== */
function initGalleryLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  const galleryItems = document.querySelectorAll('.gallery-card');
  let currentIndex = 0;

  if (!modal || !imgEl) return;

  const showImage = (index) => {
    if (index < 0) index = galleryItems.length - 1;
    if (index >= galleryItems.length) index = 0;
    currentIndex = index;

    const item = galleryItems[currentIndex];
    const img = item.querySelector('img');
    const caption = item.getAttribute('data-caption') || img.getAttribute('alt') || 'Wedding Memory';

    imgEl.src = img.src;
    if (captionEl) captionEl.textContent = caption;
    modal.classList.add('active');
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => showImage(index));
  });

  const closeModal = () => modal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* ==========================================================================
   8. SHARE MODAL & QR CODE
   ========================================================================== */
function initShareModal() {
  const openBtn = document.getElementById('open-share-modal-btn');
  const modal = document.getElementById('share-modal');
  const closeBtn = document.getElementById('close-share-modal-btn');
  const copyBtn = document.getElementById('copy-invitation-link-btn');
  const shareWhatsApp = document.getElementById('share-whatsapp-btn');
  const qrImage = document.getElementById('share-qr-code-img');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2b2523&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`;
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const closeModal = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        copyBtn.textContent = "Link Copied! ✨";
        setTimeout(() => copyBtn.textContent = "Copy Invitation Link", 2500);
      });
    });
  }

  if (shareWhatsApp) {
    shareWhatsApp.addEventListener('click', (e) => {
      e.preventDefault();
      const c = window.weddingCustomizer.config;
      const text = `You're cordially invited to celebrate the wedding of ${c.groomName} & ${c.brideName}! 💍✨\n\nView the digital invitation and RSVP here:\n${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
  }
}

/* ==========================================================================
   9. NAVBAR SCROLL GLASSMORPHISM
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile navigation menu toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }
}

/* ==========================================================================
   10. COPY REGISTRY DETAILS
   ========================================================================== */
function initCopyRegistry() {
  const copyBtn = document.getElementById('copy-registry-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = document.getElementById('registry-bank-info')?.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = `<span>Copied!</span> <span>✓</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<span>Copy Account Info</span> <span>📋</span>`;
        }, 2500);
      });
    });
  }

  const copyAddressBtn = document.getElementById('copy-venue-address-btn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const addr = window.weddingCustomizer?.config?.venueAddress || document.querySelector('.data-venue-address')?.textContent || '';
      navigator.clipboard.writeText(addr).then(() => {
        copyAddressBtn.innerHTML = `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Address Copied!</span>`;
        setTimeout(() => {
          copyAddressBtn.innerHTML = `<svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span>Copy Complete House Address</span>`;
        }, 2500);
      });
    });
  }
}

/* ==========================================================================
   11. VENUE CAROUSEL / SLIDER (Mehndi, Baraat & Walima Multi-Venue + Map)
   ========================================================================== */
function initVenueSlider() {
  const venues = [
    {
      id: 'mehndi',
      badge: '🌸 Day 1 • Rasm-e-Mehndi',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300/70',
      dayDate: 'Friday, November 6, 2026 (جمعہ)',
      time: '7:00 PM – 10:00 PM (شام 7 تا 10)',
      name: 'Family Residence Garden (Own House)',
      address: 'House No. 42, Green Avenue, Main Boulevard (Our Residence)',
      shortAddress: 'House Address',
      desc: 'The joyous celebrations of Rasm-e-Mehndi & Mayun will take place in the beautifully decorated open lawn of our family residence, illuminated by fairy lights, traditional marigolds, and warm floral setups.',
      amenities: [
        { icon: '🌸', text: 'Traditional floor diwan & cozy family seating' },
        { icon: '🚗', text: 'Dedicated valet parking assistance available at the residence gate' },
        { icon: '🕌', text: 'Designated prayer area (Musalla) prepared for Maghrib and Isha prayers' }
      ],
      mapQuery: 'House No. 42, Green Avenue, Main Boulevard',
      mapEmbedUrl: 'https://maps.google.com/maps?q=House%20No.%2042,%20Green%20Avenue,%20Main%20Boulevard&t=&z=15&ie=UTF8&iwloc=&output=embed',
      directMapUrl: 'https://www.google.com/maps/search/?api=1&query=House+No.+42,+Green+Avenue,+Main+Boulevard',
      navStatus: 'GPS Navigation Ready (House Residence)'
    },
    {
      id: 'baraat',
      badge: '🌹 Day 2 • Baraat (Main Day)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300/70',
      dayDate: 'Sunday, November 8, 2026 (اتوار)',
      time: '7:00 PM – 10:00 PM (شام 7 تا 10)',
      name: 'The Royal Grand Marquee',
      address: 'The Royal Grand Marquee, Hall A, Main Boulevard, Gulberg, Lahore',
      shortAddress: 'Marquee Address',
      desc: 'The sacred Nikkah solemnization and royal Baraat reception will take place at The Royal Grand Marquee in an elegant ambiance of crystal chandeliers and royal floral decor.',
      amenities: [
        { icon: '🌹', text: 'Grand reception entrance & VIP family seating' },
        { icon: '🚗', text: 'Dedicated multi-bay parking & complimentary valet service' },
        { icon: '🕌', text: 'Air-conditioned, peaceful prayer hall (Musalla) on-site' }
      ],
      mapQuery: 'The Royal Grand Marquee, Main Boulevard, Gulberg, Lahore',
      mapEmbedUrl: 'https://maps.google.com/maps?q=The%20Royal%20Grand%20Marquee%2C%20Main%20Boulevard%2C%20Gulberg%2C%20Lahore&t=&z=15&ie=UTF8&iwloc=&output=embed',
      directMapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Royal+Grand+Marquee,+Main+Boulevard,+Gulberg,+Lahore',
      navStatus: 'GPS Navigation Ready (The Royal Grand Marquee)'
    },
    {
      id: 'walima',
      badge: '✨ Day 3 • Dawat-e-Walima',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300/70',
      dayDate: 'Monday, November 9, 2026 (پیر)',
      time: '7:00 PM – 10:00 PM (شام 7 تا 10)',
      name: 'The Crystal Ballroom & Banquets',
      address: 'The Crystal Ballroom, Luxury Banquets, Club Road, G.O.R., Lahore',
      shortAddress: 'Ballroom Address',
      desc: 'To honor the Sunnah and celebrate the blessed union of Salaar & Noor, the gracious Dawat-e-Walima dinner will be hosted at The Crystal Ballroom in a serene, regal dining atmosphere.',
      amenities: [
        { icon: '✨', text: 'Exquisite ballroom setup & traditional royal feast' },
        { icon: '🚗', text: 'Spacious reserved parking with security and valet' },
        { icon: '🕌', text: 'Dedicated executive prayer area on-site' }
      ],
      mapQuery: 'The Crystal Ballroom, Club Road, Lahore',
      mapEmbedUrl: 'https://maps.google.com/maps?q=The%20Crystal%20Ballroom%2C%20Club%20Road%2C%20Lahore&t=&z=15&ie=UTF8&iwloc=&output=embed',
      directMapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Crystal+Ballroom,+Club+Road,+Lahore',
      navStatus: 'GPS Navigation Ready (The Crystal Ballroom)'
    }
  ];

  let currentIndex = 0;
  let autoplayTimer = null;
  let isAutoplayRunning = true;
  const AUTOPLAY_INTERVAL = 5500; // 5.5 seconds per slide

  const prevBtn = document.getElementById('venue-prev-btn');
  const nextBtn = document.getElementById('venue-next-btn');
  const tabs = document.querySelectorAll('.venue-tab-btn');
  const dots = document.querySelectorAll('.venue-dot');
  const badgeEl = document.getElementById('venue-event-badge');
  const dateEl = document.getElementById('venue-event-date');
  const timeEl = document.getElementById('venue-event-time');
  const nameEl = document.getElementById('venue-name-display');
  const addressEl = document.getElementById('venue-address-display');
  const descEl = document.getElementById('venue-desc-display');
  const amenitiesEl = document.getElementById('venue-amenities-display');
  const mapLinkEl = document.getElementById('venue-map-link-btn');
  const copyBtn = document.getElementById('venue-copy-address-btn');
  const copyBtnText = document.getElementById('venue-copy-btn-text');
  const mapIframe = document.getElementById('venue-map-iframe');
  const slideCounter = document.getElementById('venue-slide-counter');
  const autoplayToggle = document.getElementById('venue-autoplay-toggle');
  const autoplayIcon = document.getElementById('venue-autoplay-icon');
  const autoplayText = document.getElementById('venue-autoplay-text');
  const displayContainer = document.getElementById('venue-slide-display');
  const navStatusHeading = document.getElementById('venue-nav-status-heading');

  if (!prevBtn || !nextBtn || !displayContainer) return;

  function renderVenue(index, animate = true) {
    currentIndex = (index + venues.length) % venues.length;
    const v = venues[currentIndex];

    // Smooth subtle fade transition
    if (animate && displayContainer) {
      displayContainer.style.opacity = '0.35';
      setTimeout(() => {
        displayContainer.style.opacity = '1';
      }, 200);
    }

    // Update text
    if (badgeEl) {
      badgeEl.className = `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-heading border shadow-sm ${v.badgeClass}`;
      badgeEl.textContent = v.badge;
    }
    if (dateEl) dateEl.textContent = v.dayDate;
    if (timeEl) timeEl.textContent = v.time;
    if (nameEl) nameEl.textContent = v.name;
    if (addressEl) addressEl.textContent = v.address;
    if (descEl) descEl.textContent = v.desc;

    // Update amenities
    if (amenitiesEl) {
      amenitiesEl.innerHTML = v.amenities.map(a => `
        <div class="flex items-center gap-3 text-xs text-stone-700">
          <span class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 text-sm">${a.icon}</span>
          <span>${a.text}</span>
        </div>
      `).join('');
    }

    // Direct Google Maps Link
    if (mapLinkEl) {
      mapLinkEl.setAttribute('href', v.directMapUrl);
    }

    // Embedded Map Iframe
    if (mapIframe && mapIframe.getAttribute('src') !== v.mapEmbedUrl) {
      mapIframe.style.opacity = '0.4';
      mapIframe.setAttribute('src', v.mapEmbedUrl);
      mapIframe.onload = () => { mapIframe.style.opacity = '1'; };
    }

    // Update GPS Navigation Header
    if (navStatusHeading) {
      navStatusHeading.textContent = v.navStatus;
    }

    // Update Active Tab Pill
    tabs.forEach((tab, i) => {
      if (i === currentIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update Active Dots
    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Slide Counter
    if (slideCounter) {
      slideCounter.textContent = `Venue ${currentIndex + 1} of ${venues.length}: ${v.name}`;
    }

    // Copy Button label
    if (copyBtnText) {
      copyBtnText.textContent = `Copy ${v.shortAddress}`;
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    isAutoplayRunning = false;
    if (autoplayIcon) {
      autoplayIcon.className = 'inline-block w-2 h-2 rounded-full bg-stone-400';
    }
    if (autoplayText) {
      autoplayText.textContent = '❚❚ Slide ruk gai (Paused)';
    }
  }

  function startAutoplay() {
    stopAutoplay();
    isAutoplayRunning = true;
    if (autoplayIcon) {
      autoplayIcon.className = 'inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
    }
    if (autoplayText) {
      autoplayText.textContent = 'Auto-sliding (Click arrow/tab to pause)';
    }
    autoplayTimer = setInterval(() => {
      renderVenue(currentIndex + 1);
    }, AUTOPLAY_INTERVAL);
  }

  // Previous button (Left Arrow) -> Stops autoplay & moves back
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    stopAutoplay();
    renderVenue(currentIndex - 1);
  });

  // Next button (Right Arrow) -> Stops autoplay & moves next
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    stopAutoplay();
    renderVenue(currentIndex + 1);
  });

  // Event Switcher Tabs -> Stops autoplay & jumps to selected
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(tab.getAttribute('data-venue-index'), 10);
      stopAutoplay();
      renderVenue(idx);
    });
  });

  // Dots -> Stops autoplay & jumps to selected
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(dot.getAttribute('data-venue-index'), 10);
      stopAutoplay();
      renderVenue(idx);
    });
  });

  // Autoplay Pause/Play button
  if (autoplayToggle) {
    autoplayToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAutoplayRunning) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // Copy Address Button
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoplay(); // pause on user copy
      const v = venues[currentIndex];
      navigator.clipboard.writeText(v.address).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Address Copied! ✓';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = `Copy ${venues[currentIndex].shortAddress}`;
        }, 2500);
      });
    });
  }

  // Initial render & begin auto-advance
  renderVenue(0, false);
  startAutoplay();

  // Expose global controller
  window.weddingVenueSlider = {
    goTo: (idx) => {
      stopAutoplay();
      renderVenue(idx);
    },
    next: () => {
      stopAutoplay();
      renderVenue(currentIndex + 1);
    },
    prev: () => {
      stopAutoplay();
      renderVenue(currentIndex - 1);
    },
    stop: stopAutoplay,
    start: startAutoplay,
    getCurrentVenue: () => venues[currentIndex]
  };
}
