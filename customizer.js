/* ==========================================================================
   ISLAMIC WEDDING INVITATION CUSTOMIZER ENGINE & STATE MANAGER
   Supports real-time live preview, state persistence, theme switching, 
   JSON export/import, and dynamic DOM binding.
   ========================================================================== */

const DEFAULT_WEDDING_CONFIG = {
  groomName: "Salaar",
  brideName: "Noor",
  monogram: "S & N",
  tagline: "Together with our families, we warmly invite you to celebrate our blessed Nikkah and Walima. Your presence and duas would mean so much to us.",
  weddingDate: "2026-11-06",
  weddingTime: "19:00",
  venueName: "Family Residence (Own House)",
  venueAddress: "House No. 42, Green Avenue, Main Boulevard (Our Residence)",
  venueGoogleMapsQuery: "House No. 42, Green Avenue, Main Boulevard",
  hashtag: "#SalaarWedsNoor",
  theme: "emerald", // emerald, champagne, midnight, sage, burgundy, monochrome
  fontStyle: "script", // script, modern, editorial
  particlesMode: "petals",
  particlesDensity: 36,
  musicMode: "synth",
  customMusicUrl: "",
  autoplayOnOpen: true,
  registryAccount: "E-Transfer / Bank Details: 0300-1234567 | Bank Alfalah / Meezan Bank / Zelle",
  rsvpDeadline: "November 01, 2026",
  story: [
    {
      year: "2023",
      title: "Families Come Together (Baat Pakki)",
      desc: "With the blessing and heartfelt consent of both families, two noble families united in prayer and mutual respect, formalizing the blessed promise of marriage."
    },
    {
      year: "2025",
      title: "The Engagement & Dua",
      desc: "Surrounded by loved ones, rings and warm gifts were exchanged accompanied by recitations from the Holy Quran and earnest Duas for a prosperous future."
    },
    {
      year: "2026",
      title: "The Blessed Nikkah",
      desc: "Under the shade of the Holy Quran, Salaar and Noor accept each other in the sacred bond of Nikkah according to the Sunnah of Prophet Muhammad ﷺ."
    },
    {
      year: "Forever",
      title: "A Home Filled with Mawaddah & Rahmah",
      desc: "Beginning a lifelong journey built on faith, patience, tranquility, and unconditional devotion under the grace of Allah SWT."
    }
  ]
};

class WeddingCustomizer {
  constructor() {
    this.config = this.loadConfig();
    this.initUI();
    this.applyConfigToDOM();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('luxury_wedding_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force update if the old dummy names are present
        if (parsed.groomName === "Alexander Vance" || parsed.brideName === "Sophia Montgomery") {
          localStorage.removeItem('luxury_wedding_config');
          return { ...DEFAULT_WEDDING_CONFIG };
        }
        if (parsed.weddingDate === "2026-11-08" || parsed.weddingDate === "2026-11-28") {
          parsed.weddingDate = "2026-11-06";
          parsed.weddingTime = "19:00";
        }
        if (parsed.tagline === "Together with their families, request the honor of your gracious presence and prayers to celebrate the blessed Nikkah & Walima union of their beloved children") {
          parsed.tagline = DEFAULT_WEDDING_CONFIG.tagline;
        }
        return { ...DEFAULT_WEDDING_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read saved config:', e);
    }
    return { ...DEFAULT_WEDDING_CONFIG };
  }

  saveConfig() {
    try {
      localStorage.setItem('luxury_wedding_config', JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save wedding config:', e);
    }
  }

  resetConfig() {
    if (confirm("Reset all invitation customizations back to default Islamic elegance?")) {
      this.config = { ...DEFAULT_WEDDING_CONFIG };
      this.saveConfig();
      this.populateCustomizerInputs();
      this.applyConfigToDOM();
      this.showToast("Invitation restored to default!");
    }
  }

  exportConfigJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wedding_invitation_${this.config.groomName}_and_${this.config.brideName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importConfigJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        this.config = { ...DEFAULT_WEDDING_CONFIG, ...imported };
        this.saveConfig();
        this.populateCustomizerInputs();
        this.applyConfigToDOM();
        this.showToast("Customization settings imported successfully!");
      } catch (err) {
        alert("Invalid JSON configuration file.");
      }
    };
    reader.readAsText(file);
  }

  applyConfigToDOM() {
    const c = this.config;

    // Couple Names & Details
    document.querySelectorAll('.data-groom-name').forEach(el => el.textContent = c.groomName);
    document.querySelectorAll('.data-bride-name').forEach(el => el.textContent = c.brideName);
    document.querySelectorAll('.data-couple-names').forEach(el => el.textContent = `${c.groomName} & ${c.brideName}`);
    document.querySelectorAll('.data-monogram').forEach(el => el.textContent = c.monogram);
    document.querySelectorAll('.data-tagline').forEach(el => el.textContent = c.tagline);
    document.querySelectorAll('.data-hashtag').forEach(el => el.textContent = c.hashtag);
    document.querySelectorAll('.data-venue-name').forEach(el => el.textContent = c.venueName);
    document.querySelectorAll('.data-venue-address').forEach(el => el.textContent = c.venueAddress);
    document.querySelectorAll('.data-rsvp-deadline').forEach(el => el.textContent = c.rsvpDeadline);

    // Registry details
    const regEl = document.getElementById('registry-bank-info');
    if (regEl) regEl.textContent = c.registryAccount;

    // Date formatting (8 November)
    const eventDate = new Date(`${c.weddingDate}T${c.weddingTime}`);
    const dateFormatted = isNaN(eventDate.getTime()) ? "Sunday, November 8, 2026" : eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeFormatted = isNaN(eventDate.getTime()) ? "5:00 PM" : eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    document.querySelectorAll('.data-wedding-date').forEach(el => el.textContent = dateFormatted);
    document.querySelectorAll('.data-wedding-time').forEach(el => el.textContent = timeFormatted);

    // Dynamic Google Maps Link & Apple Maps Link
    const query = encodeURIComponent(c.venueGoogleMapsQuery || c.venueAddress || "Family Residence");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const appleMapUrl = `https://maps.apple.com/?q=${query}`;
    
    document.querySelectorAll('.data-map-link').forEach(el => el.setAttribute('href', mapUrl));
    document.querySelectorAll('.data-apple-map-link').forEach(el => el.setAttribute('href', appleMapUrl));

    // Update Interactive Embedded Map iframe (only if venue slider is not active)
    const mapIframe = document.getElementById('venue-map-iframe');
    if (mapIframe && !window.weddingVenueSlider) {
      mapIframe.src = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // Theme Application
    document.body.setAttribute('data-theme', c.theme || 'emerald');

    // Font Style
    if (c.fontStyle === 'modern') {
      document.body.style.setProperty('--font-heading', "'Playfair Display', serif");
    } else if (c.fontStyle === 'editorial') {
      document.body.style.setProperty('--font-heading', "'Cormorant Garamond', serif");
    } else {
      document.body.style.setProperty('--font-heading', "'Cinzel', serif");
    }

    // Particles Mode & Density
    if (window.weddingParticles) {
      window.weddingParticles.setMode(c.particlesMode);
      window.weddingParticles.setDensity(c.particlesDensity);
    }

    // Update Countdown Target
    if (window.updateCountdownTarget && !isNaN(eventDate.getTime())) {
      window.updateCountdownTarget(eventDate);
    }
  }

  initUI() {
    const drawer = document.getElementById('customizer-drawer');
    const backdrop = document.getElementById('customizer-backdrop');
    const openBtn = document.getElementById('customizer-toggle-btn');
    const closeBtn = document.getElementById('customizer-close-btn');

    if (!drawer || !backdrop || !openBtn) return;

    openBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      backdrop.classList.add('active');
    });

    const closeCustomizer = () => {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeCustomizer);
    if (backdrop) backdrop.addEventListener('click', closeCustomizer);

    // Setup Tabs inside Customizer
    const tabs = document.querySelectorAll('.customizer-tab-btn');
    const tabContents = document.querySelectorAll('.customizer-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.add('hidden'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const targetEl = document.getElementById(`tab-${targetId}`);
        if (targetEl) targetEl.classList.remove('hidden');
      });
    });

    this.bindInputEvents();
    this.populateCustomizerInputs();
  }

  bindInputEvents() {
    const bind = (id, prop) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        this.config[prop] = e.target.value;
        this.applyConfigToDOM();
        this.saveConfig();
      });
    };

    bind('cust-groom-name', 'groomName');
    bind('cust-bride-name', 'brideName');
    bind('cust-monogram', 'monogram');
    bind('cust-tagline', 'tagline');
    bind('cust-wedding-date', 'weddingDate');
    bind('cust-wedding-time', 'weddingTime');
    bind('cust-venue-name', 'venueName');
    bind('cust-venue-address', 'venueAddress');
    bind('cust-venue-query', 'venueGoogleMapsQuery');
    bind('cust-hashtag', 'hashtag');
    bind('cust-registry', 'registryAccount');
    bind('cust-rsvp-deadline', 'rsvpDeadline');

    // Theme Picker
    document.querySelectorAll('.cust-theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme-choice');
        this.config.theme = theme;
        document.querySelectorAll('.cust-theme-option').forEach(b => b.classList.remove('ring-4', 'ring-amber-500'));
        btn.classList.add('ring-4', 'ring-amber-500');
        this.applyConfigToDOM();
        this.saveConfig();
      });
    });

    // Font selection
    const fontSelect = document.getElementById('cust-font-style');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.config.fontStyle = e.target.value;
        this.applyConfigToDOM();
        this.saveConfig();
      });
    }

    // Particles selection
    const particlesSelect = document.getElementById('cust-particles');
    if (particlesSelect) {
      particlesSelect.addEventListener('change', (e) => {
        this.config.particlesMode = e.target.value;
        this.applyConfigToDOM();
        this.saveConfig();
      });
    }

    // Particles density
    const densitySlider = document.getElementById('cust-particles-density');
    if (densitySlider) {
      densitySlider.addEventListener('input', (e) => {
        this.config.particlesDensity = e.target.value;
        this.applyConfigToDOM();
        this.saveConfig();
      });
    }

    // Audio Custom URL
    const audioUrlInput = document.getElementById('cust-audio-url');
    if (audioUrlInput) {
      audioUrlInput.addEventListener('change', (e) => {
        const url = e.target.value.trim();
        this.config.customMusicUrl = url;
        if (window.weddingAudio) {
          window.weddingAudio.setCustomAudio(url);
        }
        this.saveConfig();
      });
    }

    // Reset & Export & Import
    const resetBtn = document.getElementById('cust-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetConfig());

    const exportBtn = document.getElementById('cust-export-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportConfigJSON());

    const importInput = document.getElementById('cust-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importConfigJSON(e.target.files[0]);
        }
      });
    }

    // Print button
    const printBtn = document.getElementById('cust-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  }

  populateCustomizerInputs() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('cust-groom-name', this.config.groomName);
    setVal('cust-bride-name', this.config.brideName);
    setVal('cust-monogram', this.config.monogram);
    setVal('cust-tagline', this.config.tagline);
    setVal('cust-wedding-date', this.config.weddingDate);
    setVal('cust-wedding-time', this.config.weddingTime);
    setVal('cust-venue-name', this.config.venueName);
    setVal('cust-venue-address', this.config.venueAddress);
    setVal('cust-venue-query', this.config.venueGoogleMapsQuery);
    setVal('cust-hashtag', this.config.hashtag);
    setVal('cust-registry', this.config.registryAccount);
    setVal('cust-rsvp-deadline', this.config.rsvpDeadline);
    setVal('cust-font-style', this.config.fontStyle);
    setVal('cust-particles', this.config.particlesMode);
    setVal('cust-particles-density', this.config.particlesDensity);
    setVal('cust-audio-url', this.config.customMusicUrl);

    // Active theme ring
    document.querySelectorAll('.cust-theme-option').forEach(btn => {
      if (btn.getAttribute('data-theme-choice') === this.config.theme) {
        btn.classList.add('ring-4', 'ring-amber-500');
      } else {
        btn.classList.remove('ring-4', 'ring-amber-500');
      }
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-300 border border-amber-500/40 px-6 py-3 rounded-full shadow-2xl z-50 text-sm font-medium tracking-wide flex items-center gap-2 animate-bounce';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 2800);
  }
}

window.weddingCustomizer = null;
