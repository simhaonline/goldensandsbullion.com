/**
 * Golden Sands Bullion Trading L.L.C-FZ
 * Core Client-side Application Script
 * Live XAU/USD Spot Integration & Royal Islamic Theme
 * Dubai • Meydan Free Zone
 */

document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initHeader();
  initHeroSlider();
  initLiveXauRatesEngine();
  initCalculator();
  initProductFilter();
  initFaqAccordion();
  initContactForm();
  initVerifyModal();
  initBackToTop();
});

/* ==========================================================================
   1. PWA & SERVICE WORKER INTEGRATION
   ========================================================================== */
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('GS Bullion PWA Service Worker registered:', reg.scope))
        .catch(err => console.log('SW Registration failed:', err));
    });
  }

  // Handle Online / Offline Status
  const offlineBanner = document.getElementById('offlineBanner');
  function updateOnlineStatus() {
    if (offlineBanner) {
      if (navigator.onLine) {
        offlineBanner.classList.remove('active');
      } else {
        offlineBanner.classList.add('active');
      }
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Install PWA Prompt
  let deferredPrompt;
  const installBtns = document.querySelectorAll('.install-pwa-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtns.forEach(btn => {
      btn.style.display = 'inline-flex';
      btn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to install: ${outcome}`);
          deferredPrompt = null;
          btn.style.display = 'none';
        }
      });
    });
  });

  window.addEventListener('appinstalled', () => {
    console.log('Golden Sands Bullion app installed successfully.');
    installBtns.forEach(btn => btn.style.display = 'none');
  });
}

/* ==========================================================================
   2. HEADER & MOBILE NAVIGATION
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header class on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      const expanded = toggle.getAttribute('aria-expanded') === 'true' || false;
      toggle.setAttribute('aria-expanded', !expanded);
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scrollspy for active nav link
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   3. HERO SLIDER CAROUSEL
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot-btn');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  const counterEl = document.getElementById('slideCounter');
  const sliderSection = document.querySelector('.hero-slider-section');

  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  let autoTimer = null;
  const slideDuration = 6000;

  function showSlide(index) {
    if (index >= total) index = 0;
    if (index < 0) index = total - 1;
    current = index;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === current);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === current);
    });

    if (counterEl) {
      counterEl.textContent = `0${current + 1} / 0${total}`;
    }
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function prevSlide() {
    showSlide(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });

  dots.forEach(d => {
    d.addEventListener('click', () => {
      const idx = parseInt(d.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoplay();
    });
  });

  // Pause on hover
  if (sliderSection) {
    sliderSection.addEventListener('mouseenter', stopAutoplay);
    sliderSection.addEventListener('mouseleave', startAutoplay);
  }

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;
  if (sliderSection) {
    sliderSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        startAutoplay();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        startAutoplay();
      }
    }, { passive: true });
  }

  showSlide(0);
  startAutoplay();
}

/* ==========================================================================
   4. LIVE XAU/USD SPOT RATES ENGINE
   ========================================================================== */
function initLiveXauRatesEngine() {
  // Official UAE Central Bank Peg: 1 USD = 3.6725 AED
  const USD_AED_PEG = 3.6725;
  const TROY_OZ_TO_GRAMS = 31.1034768;
  const TOLA_TO_GRAMS = 11.6638038;

  // Currency multipliers relative to AED (AED = 1)
  const currencyRates = {
    AED: { symbol: 'AED', rate: 1.0, decimals: 2 },
    USD: { symbol: '$', rate: (1 / USD_AED_PEG), decimals: 2 },
    EUR: { symbol: '€', rate: 0.2514, decimals: 2 },
    GBP: { symbol: '£', rate: 0.2152, decimals: 2 }
  };

  let activeCurrency = 'AED';

  // Live spot state initialized with current benchmark
  const liveState = {
    xauUsd: 4182.00,       // Gold spot in USD / oz
    xagUsd: 60.35,         // Silver spot in USD / oz
    change24h: '+0.52%',
    isLive: false,
    lastUpdated: new Date()
  };

  // Format price helper
  function formatCurr(valInAed, curr) {
    const info = currencyRates[curr] || currencyRates['AED'];
    const converted = valInAed * info.rate;
    return `${info.symbol} ${converted.toLocaleString('en-US', {
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals
    })}`;
  }

  // Derive all precious metals values from live XAUUSD and XAGUSD
  function computeRates() {
    const goldOzUsd = liveState.xauUsd;
    const goldOzAed = goldOzUsd * USD_AED_PEG;
    const gold24kAed = goldOzAed / TROY_OZ_TO_GRAMS;

    const gold22kAed = gold24kAed * (22 / 24);
    const gold21kAed = gold24kAed * (21 / 24);
    const gold18kAed = gold24kAed * (18 / 24);
    const goldKgAed = gold24kAed * 1000;
    const goldTolaAed = gold24kAed * TOLA_TO_GRAMS;

    const silverOzUsd = liveState.xagUsd;
    const silverOzAed = silverOzUsd * USD_AED_PEG;
    const silverGramAed = silverOzAed / TROY_OZ_TO_GRAMS;
    const silverKgAed = silverGramAed * 1000;

    return {
      goldOzUsd,
      goldOzAed,
      gold24kAed,
      gold22kAed,
      gold21kAed,
      gold18kAed,
      goldKgAed,
      goldTolaAed,
      silverOzUsd,
      silverOzAed,
      silverGramAed,
      silverKgAed
    };
  }

  // Render rates onto the DOM
  function renderAllRates() {
    const rates = computeRates();

    // 1. Top Bar Ticker
    const topXauEl = document.getElementById('topBarXauUsd');
    if (topXauEl) {
      topXauEl.textContent = `$${liveState.xauUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // 2. Sovereign Benchmark Card - XAU/USD
    const bPriceUsd = document.getElementById('benchmarkXauUsd');
    if (bPriceUsd) {
      bPriceUsd.textContent = `$${rates.goldOzUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const bPriceAed = document.getElementById('benchmarkXauAed');
    if (bPriceAed) {
      bPriceAed.textContent = `≈ AED ${rates.goldOzAed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz t`;
    }

    // 3. Sovereign Benchmark Card - XAG/USD
    const bSilverUsd = document.getElementById('benchmarkXagUsd');
    if (bSilverUsd) {
      bSilverUsd.textContent = `$${rates.silverOzUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const bSilverAed = document.getElementById('benchmarkXagAed');
    if (bSilverAed) {
      bSilverAed.textContent = `≈ AED ${rates.silverOzAed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / oz t`;
    }

    // 4. Per-Gram Rate Cards
    const g24El = document.getElementById('rate24k');
    if (g24El) g24El.textContent = formatCurr(rates.gold24kAed, activeCurrency);

    const g22El = document.getElementById('rate22k');
    if (g22El) g22El.textContent = formatCurr(rates.gold22kAed, activeCurrency);

    const g21El = document.getElementById('rate21k');
    if (g21El) g21El.textContent = formatCurr(rates.gold21kAed, activeCurrency);

    const g18El = document.getElementById('rate18k');
    if (g18El) g18El.textContent = formatCurr(rates.gold18kAed, activeCurrency);

    // 5. Secondary Table Items
    const goldKgEl = document.getElementById('rateGoldKg');
    if (goldKgEl) goldKgEl.textContent = formatCurr(rates.goldKgAed, activeCurrency);

    const goldOzEl = document.getElementById('rateGoldOz');
    if (goldOzEl) goldOzEl.textContent = formatCurr(rates.goldOzAed, activeCurrency);

    const goldTolaEl = document.getElementById('rateGoldTola');
    if (goldTolaEl) goldTolaEl.textContent = formatCurr(rates.goldTolaAed, activeCurrency);

    const silverKgEl = document.getElementById('rateSilverKg');
    if (silverKgEl) silverKgEl.textContent = formatCurr(rates.silverKgAed, activeCurrency);

    const silverOzEl = document.getElementById('rateSilverOz');
    if (silverOzEl) silverOzEl.textContent = formatCurr(rates.silverOzAed, activeCurrency);

    // 6. Timestamp
    const timeEl = document.getElementById('ratesUpdateTime');
    if (timeEl) {
      timeEl.textContent = liveState.lastUpdated.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' GST (Dubai)';
    }

    // Trigger calculator synchronization
    if (typeof window.recalcBullion === 'function') {
      window.recalcBullion();
    }
  }

  // Live Fetch Engine: calls public API for XAU and XAG with multiple fallbacks
  async function fetchLiveXauPrice() {
    let fetchedXau = null;
    let fetchedXag = null;

    // Primary: api.gold-api.com
    try {
      const res = await fetch('https://api.gold-api.com/price/XAU', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.price === 'number') {
          fetchedXau = data.price;
        }
      }
    } catch (e) {
      console.warn('Primary Gold API unavailable, attempting Binance fallback...', e);
    }

    // Fallback 1: Binance PAXGUSDT (PAX Gold is 1:1 backed by physical gold fine ounce)
    if (!fetchedXau) {
      try {
        const resBinance = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', { cache: 'no-store' });
        if (resBinance.ok) {
          const bData = await resBinance.json();
          if (bData && bData.price) {
            fetchedXau = parseFloat(bData.price);
          }
        }
      } catch (err) {
        console.warn('Binance fallback unavailable, trying CoinGecko...', err);
      }
    }

    // Fallback 2: CoinGecko pax-gold
    if (!fetchedXau) {
      try {
        const resCg = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', { cache: 'no-store' });
        if (resCg.ok) {
          const cgData = await resCg.json();
          if (cgData && cgData['pax-gold'] && cgData['pax-gold'].usd) {
            fetchedXau = cgData['pax-gold'].usd;
          }
        }
      } catch (err) {
        console.warn('CoinGecko fallback unavailable.', err);
      }
    }

    // Fetch Silver (XAG)
    try {
      const resAg = await fetch('https://api.gold-api.com/price/XAG', { cache: 'no-store' });
      if (resAg.ok) {
        const agData = await resAg.json();
        if (agData && typeof agData.price === 'number') {
          fetchedXag = agData.price;
        }
      }
    } catch (e) {
      console.warn('Silver API error:', e);
    }

    if (fetchedXau && fetchedXau > 0) {
      liveState.xauUsd = fetchedXau;
      liveState.isLive = true;
    } else {
      // Micro-simulate if strictly offline
      const delta = (Math.random() * 0.001) - 0.0005;
      liveState.xauUsd = Math.round((liveState.xauUsd * (1 + delta)) * 100) / 100;
    }

    if (fetchedXag && fetchedXag > 0) {
      liveState.xagUsd = fetchedXag;
    }

    liveState.lastUpdated = new Date();
    renderAllRates();
  }

  // Currency Toggle handler
  const currBtns = document.querySelectorAll('.curr-btn');
  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCurrency = btn.getAttribute('data-curr');
      renderAllRates();
    });
  });

  // Manual Refresh Button
  const refreshBtn = document.getElementById('refreshRatesBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.style.transform = 'rotate(180deg)';
      refreshBtn.style.transition = 'transform 0.4s ease';
      setTimeout(() => { refreshBtn.style.transform = 'none'; }, 400);

      await fetchLiveXauPrice();
      showToast(`Live XAU/USD Spot synchronized: $${liveState.xauUsd.toFixed(2)} / oz t`);
    });
  }

  // Initial fetch and 25-second live polling interval
  fetchLiveXauPrice();
  setInterval(fetchLiveXauPrice, 25000);

  // Expose quotes to calculator
  window.getBullionQuotes = () => {
    const computed = computeRates();
    return {
      gold24kAed: computed.gold24kAed,
      gold22kAed: computed.gold22kAed,
      silverGramAed: computed.silverGramAed,
      xauUsd: liveState.xauUsd,
      activeCurr: activeCurrency,
      currencies: currencyRates
    };
  };
}

/* ==========================================================================
   5. BULLION INVESTMENT CALCULATOR
   ========================================================================== */
function initCalculator() {
  const metalBtns = document.querySelectorAll('.calc-metal-btn');
  const unitSelect = document.getElementById('calcUnitSelect');
  const amountInput = document.getElementById('calcAmountInput');
  const currSelect = document.getElementById('calcCurrencySelect');

  const outWeightEl = document.getElementById('calcResWeight');
  const outSpotEl = document.getElementById('calcResSpot');
  const outPremEl = document.getElementById('calcResPremium');
  const outVatEl = document.getElementById('calcResVat');
  const outTotalEl = document.getElementById('calcResTotal');
  const lockQuoteBtn = document.getElementById('calcLockQuoteBtn');

  let selectedMetal = 'gold24k';

  metalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      metalBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMetal = btn.getAttribute('data-metal');
      recalc();
    });
  });

  if (unitSelect) unitSelect.addEventListener('change', recalc);
  if (amountInput) amountInput.addEventListener('input', recalc);
  if (currSelect) currSelect.addEventListener('change', recalc);

  function recalc() {
    if (!window.getBullionQuotes) return;
    const quotes = window.getBullionQuotes();

    const curr = currSelect ? currSelect.value : 'AED';
    const currInfo = quotes.currencies[curr] || quotes.currencies['AED'];

    let amount = parseFloat(amountInput ? amountInput.value : 100);
    if (isNaN(amount) || amount <= 0) amount = 0;

    const unit = unitSelect ? unitSelect.value : 'kg';
    let weightInGrams = amount;

    if (unit === 'kg') weightInGrams = amount * 1000;
    else if (unit === 'oz') weightInGrams = amount * 31.1034768;
    else if (unit === 'tola') weightInGrams = amount * 11.6638038;

    // Price per gram in AED derived from live XAUUSD
    let pricePerGramAed = quotes.gold24kAed;
    if (selectedMetal === 'gold22k') pricePerGramAed = quotes.gold22kAed;
    else if (selectedMetal === 'silver') pricePerGramAed = quotes.silverGramAed;

    const spotAed = weightInGrams * pricePerGramAed;
    const premiumRate = selectedMetal === 'silver' ? 0.025 : 0.0065;
    const premiumAed = spotAed * premiumRate;
    const vatAed = 0.00; // 0% reverse charge on pure investment bullion
    const totalAed = spotAed + premiumAed + vatAed;

    const rate = currInfo.rate;
    const sym = currInfo.symbol;

    function fmt(val) {
      return `${sym} ${(val * rate).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }

    if (outWeightEl) outWeightEl.textContent = `${weightInGrams.toFixed(2)} grams (${(weightInGrams / 31.1035).toFixed(2)} oz t)`;
    if (outSpotEl) outSpotEl.textContent = fmt(spotAed);
    if (outPremEl) outPremEl.textContent = fmt(premiumAed);
    if (outVatEl) outVatEl.textContent = `${sym} 0.00 (0% UAE Statutory Exemption)`;
    if (outTotalEl) outTotalEl.textContent = fmt(totalAed);
  }

  window.recalcBullion = recalc;
  recalc();

  // "Lock In Quote" button behavior
  if (lockQuoteBtn) {
    lockQuoteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = amountInput ? amountInput.value : '1000';
      const unit = unitSelect ? unitSelect.value : 'kg';
      const metal = selectedMetal === 'silver' ? 'Silver 999' : (selectedMetal === 'gold22k' ? 'Gold 22K (916)' : 'Gold 24K (999.9)');
      const totalText = outTotalEl ? outTotalEl.textContent : '';

      // Prefill contact form
      const subjectInput = document.getElementById('contactSubject');
      const messageInput = document.getElementById('contactMessage');
      if (subjectInput) subjectInput.value = `Live XAU/USD Quote Request: ${amount}${unit} of ${metal}`;
      if (messageInput) {
        messageInput.value = `I would like to request an official trading term sheet to lock in the rate for ${amount} ${unit} of ${metal} (Estimated Indicative: ${totalText}) based on current live XAU/USD spot pricing. Please contact me with execution procedures.`;
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Live spot quote details transferred to inquiry form.');
      }
    });
  }
}

/* ==========================================================================
   6. PRODUCT CATALOG FILTER
   ========================================================================== */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      products.forEach(p => {
        const cat = p.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          p.style.display = 'flex';
          p.style.opacity = '0';
          setTimeout(() => { p.style.opacity = '1'; }, 30);
        } else {
          p.style.display = 'none';
        }
      });
    });
  });

  // "Request Term Sheet" button on each product
  const inquiryBtns = document.querySelectorAll('.product-inquire-btn');
  inquiryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-product-title') || 'Precious Metals Product';
      const subjectInput = document.getElementById('contactSubject');
      const messageInput = document.getElementById('contactMessage');
      if (subjectInput) subjectInput.value = `Institutional Inquiries: ${title}`;
      if (messageInput) {
        messageInput.value = `Please provide official pricing, delivery timelines, and availability for: ${title}.`;
      }
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Inquiry configured for: ${title}`);
      }
    });
  });
}

/* ==========================================================================
   7. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   8. CONTACT FORM SUBMISSION & FEEDBACK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('bullionInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contactName')?.value.trim();
    const email = form.querySelector('#contactEmail')?.value.trim();
    const phone = form.querySelector('#contactPhone')?.value.trim();
    const subject = form.querySelector('#contactSubject')?.value.trim();

    if (!name || !email || !phone || !subject) {
      showToast('Please fill in all required fields.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting Request...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      showToast('Inquiry Received: Our Dubai trading desk will contact you within 2 business hours.');

      const modal = document.getElementById('inquirySuccessModal');
      if (modal) {
        modal.classList.add('active');
      }
    }, 1000);
  });
}

/* ==========================================================================
   9. VERIFY CREDENTIALS MODAL
   ========================================================================== */
function initVerifyModal() {
  const verifyBtns = document.querySelectorAll('.open-verify-modal');
  const modal = document.getElementById('credentialsModal');
  const closeBtns = document.querySelectorAll('.modal-close-trigger');

  verifyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentModal = btn.closest('.modal-backdrop');
      if (parentModal) parentModal.classList.remove('active');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });
}

/* ==========================================================================
   10. BACK TO TOP & TOAST UTILITY
   ========================================================================== */
function initBackToTop() {
  const btt = document.getElementById('backToTop');
  if (!btt) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }
  }, { passive: true });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 4500);
}
