/* ============================================================
   CALLER — runtime
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let goToSlide = (idx) => {};

  // iOS Safari doesn't engage the CSS :active pseudo-class on a tap
  // unless SOME element has a touchstart listener bound — without
  // this, every :active-driven state (the TV buttons' "pressed down"
  // frame swap, .tv-btn:active) silently never triggers on iOS. A
  // single no-op listener on body is the standard fix, site-wide.
  document.body.addEventListener('touchstart', () => {}, { passive: true });

  // "Modo teléfono": mismo criterio que el swap del marco del TV a
  // phone.webp (@media (orientation: portrait)) más las ventanas
  // apaisadas muy angostas. Cualquier tablet/monitor en vertical usa
  // TODO el comportamiento móvil (layout + carrusel de System + nudges).
  const isPhoneLayout = () =>
    window.matchMedia('(max-width: 800px), (orientation: portrait)').matches;

  /* ============================================================
     REAJUSTE POR ROTACIÓN / CAMBIO DE MODO
     El motor (secuencias de frames, carrusel de System, tamaño de
     canvas) decide vertical vs. apaisado UNA sola vez al iniciar cada
     pieza. Al girar el dispositivo el CSS reacciona pero ese estado de
     JS queda congelado -> media pantalla vieja. Reconstruir todo en
     vivo es frágil; lo estándar en sitios "experiencia" es recargar,
     pero solo cuando el modo teléfono/escritorio REALMENTE cambió
     (no en cada resize, no al mover una ventana sin cruzar el umbral).
     El celular en apaisado no recarga: el overlay "girá el teléfono"
     ya tapa todo y la vista vertical queda intacta debajo.
     ============================================================ */
  (() => {
    let layoutMode = isPhoneLayout();
    let timer = null;
    const isOrientationLocked = () =>
      window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
    const check = () => {
      if (isOrientationLocked()) return;
      const next = isPhoneLayout();
      if (next !== layoutMode) {
        layoutMode = next;
        window.location.reload();
      }
    };
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(check, 250);
    });
  })();

  /* ============================================================
     0. CRT TUBE PRELOADER (Warm-up Ignition & Gradual Reveal)
     ============================================================ */
  const initCrtPreloader = () => {
    const preloader = document.getElementById('crt-preloader');
    if (!preloader) return;

    const startIgnition = () => {
      // Stage 1: Ignite white beam and flash
      setTimeout(() => {
        preloader.classList.add('is-igniting');

        // Stage 2: Smooth, relaxed analog dissolve after assets settle
        setTimeout(() => {
          preloader.classList.add('is-fading');

          // Cleanup from DOM after dissolve is 100% complete
          setTimeout(() => {
            preloader.classList.add('is-done');
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
          }, 1500);
        }, 1100);
      }, 500);
    };

    if (document.readyState === 'complete') {
      startIgnition();
    } else {
      window.addEventListener('load', startIgnition, { once: true });
      setTimeout(startIgnition, 2500);
    }
  };
  initCrtPreloader();

  /* ============================================================
     0. LENIS — SMOOTH SCROLL
     Drives its raf loop off GSAP's ticker and keeps ScrollTrigger
     in sync, so pinned sections stay accurate.
     ============================================================ */
  let lenis = null;

  const initLenis = () => {
    if (lenis) return; // ya inicializado — se llama desde dos sitios (readyState y setupEverything)
    if (reduceMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  };

  if (document.readyState !== 'loading') initLenis();
  else document.addEventListener('DOMContentLoaded', initLenis);

  /* ============================================================
     1. I18N — BILINGUAL TOGGLE
     ============================================================ */
  const I18N = {
    en: {
      'hero.signal': 'YOUR SIGNAL',
      'hero.signalLine': 'SCROLL ↓',
      'projects.title': 'Calls answered.',
      'projects.hint': 'PINNED TO THE BOARD',
      'projects.prev': 'Prev',
      'projects.next': 'Next',
      'projects.visit': 'Visit live site',
      'projects.challengeTitle': 'The Challenge',
      'projects.solutionTitle': 'The Solution',
      'projects.paletteTitle': 'Color System & Identity',
      'projects.copyHint': 'Click any swatch to copy HEX',
      'projects.typographyTitle': 'Typography & Art Direction',
      'projects.stackTitle': 'Tech Stack & Architecture',
      'projects.deliverablesTitle': 'Key Deliverables & Scope',
      'system.n1t': 'Listen',
      'system.n1d': 'Understand the problem before building the solution.',
      'system.n2t': 'Build',
      'system.n2d': 'Design, code, test, repeat.',
      'system.n3t': 'Connect',
      'system.n3d': 'Websites, tools, forms and automation.',
      'system.n4t': 'Evolve',
      'system.n4d': 'Launch is not the finish line.',
      'system.tap': 'Tap for next →',

      'about.title': 'Not a bot.',
      'about.intro': "I've spent five years building websites, online stores and digital products.",
      'about.body': "I make the design decisions and I write the code that ships — one person, start to finish.",
      'about.line1': 'Sometimes they come out just like you pictured.',
      'about.line2': 'Other times, not at all.',
      'about.closing': "That's when it gets interesting.",
      'cta.title': 'Empty desk.<br/><span class="cta__accent">Open line.</span>',
      'cta.subtitle': "I'm probably somewhere building something.",
      'cta.btn': 'Start the call.',
      'cta.name': 'NAME',
      'cta.email': 'EMAIL',
      'cta.message': "WHAT'S ON YOUR MIND?",
      'cta.send': 'SEND MESSAGE',
      'cta.statusReady': 'STATUS: READY',
      'cta.statusSending': 'STATUS: SENDING…',
      'cta.statusSent': 'STATUS: MESSAGE SENT',
      'cta.statusError': 'STATUS: FAILED — TRY AGAIN',
      'cta.statusInvalid': 'STATUS: FILL IN NAME, EMAIL & MESSAGE',

      'footer.caller': 'caller',
      'footer.by': '© 2026 Pablo Chávez',
      'footer.leave': 'Leave a message.',
      'footer.email': 'Email',
      'footer.wa': 'WhatsApp',
      'footer.ig': 'Instagram',
      'footer.li': 'LinkedIn',

      'channel.vet': 'MORE PATIENTS',
      'channel.restaurant': 'FULL TABLES',
      'channel.barber': 'MORE BOOKINGS',
      'channel.realestate': 'MORE INQUIRIES',
      'channel.lawyer': 'MORE CLIENTS',
      'channel.phone': '0-800-CALLER',
      'rotate.title': 'TURN YOUR PHONE',
      'rotate.body': 'This broadcast is tuned for portrait.'
    },

    es: {
      'hero.signal': 'TU SEÑAL',
      'hero.signalLine': 'SCROLL ↓',
      'projects.title': 'Llamadas atendidas.',
      'projects.hint': 'CLAVADO EN EL CORCHO',
      'projects.prev': 'Ant.',
      'projects.next': 'Sig.',
      'projects.visit': 'Visitar web en vivo',
      'projects.challengeTitle': 'El Reto',
      'projects.solutionTitle': 'La Solución',
      'projects.paletteTitle': 'Sistema Cromático e Identidad',
      'projects.copyHint': 'Haz clic en una muestra para copiar HEX',
      'projects.typographyTitle': 'Tipografía y Dirección de Arte',
      'projects.stackTitle': 'Stack Técnico y Arquitectura',
      'projects.deliverablesTitle': 'Entregables Clave y Alcance',
      'system.n1t': 'Escuchar',
      'system.n1d': 'Entender el problema antes de construir la solución.',
      'system.n2t': 'Construir',
      'system.n2d': 'Diseñar, programar, probar, repetir.',
      'system.n3t': 'Conectar',
      'system.n3d': 'Sitios web, herramientas, formularios y automatización.',
      'system.n4t': 'Evolucionar',
      'system.n4d': 'El lanzamiento no es la meta.',
      'system.tap': 'Toca para seguir →',

      'about.title': 'No soy un bot.',
      'about.intro': 'Llevo cinco años haciendo sitios web, tiendas online y productos digitales.',
      'about.body': 'Tomo las decisiones de diseño y escribo el código que sale a producción. Una persona, de principio a fin.',
      'about.line1': 'A veces salen tal como los imaginabas.',
      'about.line2': 'Otras veces, no.',
      'about.closing': 'Ahí es cuando la cosa se pone interesante.',
      'cta.title': 'Escritorio vacío.<br/><span class="cta__accent">Línea abierta.</span>',
      'cta.subtitle': 'Seguro estoy en algún lado construyendo algo.',
      'cta.btn': 'Empieza la llamada.',
      'cta.name': 'NOMBRE',
      'cta.email': 'EMAIL',
      'cta.message': '¿QUÉ TENÉS EN MENTE?',
      'cta.send': 'ENVIAR MENSAJE',
      'cta.statusReady': 'ESTADO: LISTO',
      'cta.statusSending': 'ESTADO: ENVIANDO…',
      'cta.statusSent': 'ESTADO: MENSAJE ENVIADO',
      'cta.statusError': 'ESTADO: FALLÓ — INTENTÁ DE NUEVO',
      'cta.statusInvalid': 'ESTADO: COMPLETÁ NOMBRE, EMAIL Y MENSAJE',

      'footer.caller': 'caller',
      'footer.by': '© 2026 Pablo Chávez',
      'footer.leave': 'Deja tu mensaje.',
      'footer.email': 'Email',
      'footer.wa': 'WhatsApp',
      'footer.ig': 'Instagram',
      'footer.li': 'LinkedIn',

      'channel.vet': 'MÁS PACIENTES',
      'channel.restaurant': 'MESAS LLENAS',
      'channel.barber': 'MÁS TURNOS',
      'channel.realestate': 'MÁS CONSULTAS',
      'channel.lawyer': 'MÁS CLIENTES',
      'channel.phone': '0-800-CALLER',
      'rotate.title': 'GIRÁ EL TELÉFONO',
      'rotate.body': 'Esta transmisión está sintonizada en vertical.'
    }
  };

  let currentLang = 'en';

  const applyLang = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const value = I18N[lang][key];
      if (value !== undefined) {
        if (el.classList.contains('typewriter')) {
          el.innerHTML = '';
          value.split('').forEach((char, i) => {
            if (char === ' ') {
              el.appendChild(document.createTextNode(' '));
            } else {
              const span = document.createElement('span');
              span.textContent = char;
              span.style.setProperty('--delay', `${i * 0.03}s`);
              span.className = 'type-char';
              el.appendChild(span);
            }
          });
        } else {
          el.innerHTML = value;
        }
      }
    });

    document.querySelectorAll('.lang__opt').forEach((opt) => {
      opt.classList.toggle('is-active', opt.dataset.lang === lang);
    });

    document.dispatchEvent(new CustomEvent('caller:langchange', { detail: { lang } }));
  };

  const toggleLang = () => applyLang(currentLang === 'en' ? 'es' : 'en');
  document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
  applyLang(currentLang);

  /* ============================================================
     4. WORK — note pinned to the corkboard, cycles through projects
     ============================================================ */
  const initWork = () => {
    const projects = [
      /* ============ ROW 1 ============ */
      {
        name: 'JORGE DURANT',
        x: 8, y: 10, rot: -4,
        category: { es: 'Creador UGC y Estratega de Contenido', en: 'UGC Creator & Content Strategist' },
        year: '2024',
        video: 'projects/jorge.mp4',
        link: 'https://jorgedurant.com/',
        frameUrl: 'jorgedurant.com',
        desc: {
          es: 'Portfolio interactivo y vitrina cinematográfica para Jorge Durant, creador de contenido UGC especializado en cuidado personal masculino, fitness y bienestar.',
          en: 'Interactive showcase portfolio and cinematic reel for Jorge Durant, male UGC creator specialized in men’s grooming, fitness and wellness.'
        },
        challenge: {
          es: 'Necesitaba una presencia digital de alto nivel que mostrara a marcas internacionales su trabajo en video al instante, sin intermediarios ni PDFs estáticos que frenaran el cierre de acuerdos.',
          en: 'Needed a tier-one digital presence to pitch global brands with instant video showcases, eliminating friction and replacing static PDF media kits.'
        },
        solution: {
          es: 'Construcción de un portfolio inmersivo con preloader cinematográfico, reproductor de video sin latencia, selector de idioma instantáneo (ES/EN) y cursor dinámico temático REC.',
          en: 'Built an immersive portfolio with a cinematic preloader, zero-latency video streaming, seamless bilingual toggle (ES/EN), and a custom REC recording cursor.'
        },
        stats: [
          { val: '100/100', label: { es: 'Lighthouse (rendimiento)', en: 'Lighthouse (performance)' } },
          { val: 'ES / EN', label: { es: 'Sitio bilingüe', en: 'Bilingual site' } },
          { val: '50+', label: { es: 'Campañas en el reel', en: 'Campaigns in the reel' } }
        ],
        palette: [
          { name: { es: 'Azul Eléctrico', en: 'Electric Blue' }, hex: '#2068B6', role: { es: 'Acento Principal', en: 'Primary Accent' } },
          { name: { es: 'Ciruela Oscuro', en: 'Dark Plum' }, hex: '#35242B', role: { es: 'Texto y Superficie', en: 'Dark Surface / Ink' } },
          { name: { es: 'Crema Suave', en: 'Warm Cream' }, hex: '#F5EFE7', role: { es: 'Fondo Base', en: 'Cream Base' } },
          { name: { es: 'Arena Cálido', en: 'Warm Sand' }, hex: '#E8DFD3', role: { es: 'Contenedores y Bordes', en: 'Warm Container' } }
        ],
        typography: [
          { label: { es: 'Titulares Display', en: 'Display Headings' }, name: 'League Spartan', sample: 'AUTHENTIC CONTENT THAT CONVERTS' },
          { label: { es: 'Cuerpo y Lectura', en: 'Body UI' }, name: 'Geist Sans', sample: 'Male UGC creator specializing in skincare, grooming and fitness' }
        ],
        stack: [
          { category: { es: 'Frontend / UI', en: 'Frontend / UI' }, tags: ['HTML5 / CSS3', 'JavaScript ES6+ Modules', 'GSAP Animation'] },
          { category: { es: 'Efectos & Video', en: 'VFX & Media' }, tags: ['SVG Mask Reveal', 'Cloudflare Video Stream', 'Custom REC Cursor'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Vercel Edge', 'Google Analytics 4'] }
        ],
        deliverables: {
          es: [
            'Diseño UX/UI responsive de alto impacto visual',
            'Preloader cinematográfico con animación de firma SVG',
            'Integración bilingüe instantánea (ES / EN)',
            'Galería de videos optimizada para carga ultra rápida'
          ],
          en: [
            'High-res responsive UX/UI art direction',
            'Cinematic SVG signature preloader animation',
            'Seamless instant bilingual system (ES / EN)',
            'Zero-buffering optimized video reel gallery'
          ]
        }
      },
      {
        name: 'PISOFLOW',
        x: 30, y: 5, rot: 3,
        category: { es: 'Landing Inmobiliaria & Software CRM', en: 'Real Estate Platform & CRM Suite' },
        year: '2024',
        video: 'projects/pisoflow.mp4',
        link: 'https://pisoflow.com/demo/',
        frameUrl: 'pisoflow.com/demo',
        desc: {
          es: 'Ecosistema inmobiliario completo: web vitrina de lujo (pisoflow.com/demo) combinada con el software CRM Pisoflow para gestión de inmuebles, contratos y automatización de clientes.',
          en: 'Complete real estate ecosystem: luxury property showcase (pisoflow.com/demo) paired with the Pisoflow CRM software for property listings, contracts, and workflow automation.'
        },
        challenge: {
          es: 'Las agencias e inversores necesitaban una web de captación elegante conectada directamente a un software CRM que eliminara el trabajo manual y filtrara solicitudes 24/7.',
          en: 'Real estate agencies needed a luxury conversion portal connected to an automated CRM that eliminates manual tasks and qualifies leads 24/7.'
        },
        solution: {
          es: 'Desarrollo de landing editorial con buscador y filtros de propiedades, preloader de marca y software CRM con portal de propietarios, contratos y automatizaciones.',
          en: 'Engineered a luxury property portal with dynamic filters and brand preloader, fully integrated with the Pisoflow CRM engine for contracts and tenant management.'
        },
        stats: [
          { val: 'Web + CRM', label: { es: 'Un solo sistema conectado', en: 'One connected system' } },
          { val: '24/7', label: { es: 'Captación automática de leads', en: 'Automated lead capture' } },
          { val: 'WhatsApp', label: { es: 'Contratos y agenda de visitas', en: 'Contracts & tour booking' } }
        ],
        palette: [
          { name: { es: 'Verde Salvia Esmeralda', en: 'Emerald Sage Green' }, hex: '#1EB08B', role: { es: 'Acento Marca y Éxito', en: 'Brand Accent & Growth' } },
          { name: { es: 'Suelo Carbón Oscuro', en: 'Dark Soil Charcoal' }, hex: '#1C1C1E', role: { es: 'Superficie y Títulos', en: 'Dark Surface / Soil' } },
          { name: { es: 'Arena Suave', en: 'Soft Sand Canvas' }, hex: '#F8F9FA', role: { es: 'Fondo Limpio', en: 'Clean Light Canvas' } },
          { name: { es: 'Piedra Gris', en: 'Stone Grey' }, hex: '#E5E7EB', role: { es: 'Bordes y Tarjetas', en: 'Borders & Cards' } }
        ],
        typography: [
          { label: { es: 'Titulares y Marca', en: 'Brand & Display' }, name: 'Plus Jakarta Sans 800', sample: 'ENCUENTRA TU HOGAR PERFECTO' },
          { label: { es: 'Elegancia Editorial', en: 'Editorial Serif' }, name: 'Playfair Display', sample: 'Propiedades exclusivas y gestión integral' }
        ],
        stack: [
          { category: { es: 'Frontend & UI', en: 'Frontend & UI' }, tags: ['HTML5 / CSS3', 'JavaScript Modules', 'Lenis Smooth Scroll'] },
          { category: { es: 'Software & CRM', en: 'CRM Platform' }, tags: ['PisoFlow Real Estate Engine', 'Contract Automation', 'WhatsApp API'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Vercel Edge Network', 'Cloudflare CDN', 'Google Tag Manager'] }
        ],
        deliverables: {
          es: [
            'Diseño y desarrollo de la web inmobiliaria de lujo (demo)',
            'Desarrollo del software CRM de gestión y seguimiento',
            'Sistema de búsqueda, filtrado y fichas interactivas de propiedades',
            'Automatización de agenda de visitas y contactos'
          ],
          en: [
            'Design and development of luxury real estate portal (demo)',
            'Full Pisoflow CRM software engine development',
            'Interactive property search, filtering, and detail modal system',
            'Automated tour booking and lead qualification workflows'
          ]
        }
      },
      {
        name: 'SIGNATURE AGENCY',
        x: 55, y: 10, rot: -2,
        category: { es: 'Agencia de Marketing & Automatización IA', en: 'AI Marketing & Automation Agency' },
        year: '2024',
        video: 'projects/signatureagency.mp4',
        link: 'https://signatureagency.studio/',
        frameUrl: 'signatureagency.studio',
        desc: {
          es: 'Sitio web oficial para Signature Agency: estudio de marketing y automatización con IA para marcas de alto rendimiento con túnel 3D, cursor interactivo y sistema bilingüe.',
          en: 'Official agency platform for Signature Agency: high-performance marketing and AI automation studio featuring a 3D tunnel, custom cursor, and bilingual architecture.'
        },
        challenge: {
          es: 'Requerían una presencia digital de autoridad implacable que reflejara su capacidad para desplegar sistemas de automatización con IA y campañas para marcas de alto nivel.',
          en: 'Needed an authoritative, cutting-edge digital presence reflecting their capability to deploy complex AI automation systems and high-ticket marketing campaigns.'
        },
        solution: {
          es: 'Desarrollo de un sitio inmersivo en modo oscuro con túnel 3D interactivo por scroll, marquesinas cinéticas, preloader con monograma animado y arquitectura ultra ligera.',
          en: 'Crafted a dark-mode immersive site featuring a 3D scroll tunnel, kinetic marquees, animated monogram preloader, and high-contrast typography.'
        },
        stats: [
          { val: '3D', label: { es: 'Túnel interactivo por scroll', en: 'Interactive scroll tunnel' } },
          { val: 'ES / EN', label: { es: 'Sitio bilingüe', en: 'Bilingual site' } },
          { val: '1-page', label: { es: 'Experiencia inmersiva de una página', en: 'Single-page immersive build' } }
        ],
        palette: [
          { name: { es: 'Cian Neón Signature', en: 'Signature Neon Cyan' }, hex: '#15C2DF', role: { es: 'Acento Principal y Enlaces', en: 'Primary Neon Accent' } },
          { name: { es: 'Negro Carbón', en: 'Carbon Black' }, hex: '#0F0F0F', role: { es: 'Lienzo Base Oscuro', en: 'Dark Carbon Canvas' } },
          { name: { es: 'Hueso Contraste', en: 'Contrast Bone' }, hex: '#E7E4DB', role: { es: 'Titulares y Monograma', en: 'High Contrast Ink' } },
          { name: { es: 'Grafito Superficie', en: 'Surface Graphite' }, hex: '#1C1C1C', role: { es: 'Tarjetas y Contenedores', en: 'Surface & Cards' } }
        ],
        typography: [
          { label: { es: 'Titulares Display', en: 'Display Headings' }, name: 'Syne 800', sample: 'AI MARKETING & AUTOMATION' },
          { label: { es: 'Cuerpo y UI', en: 'Body UI' }, name: 'DM Sans', sample: 'Building scalable growth systems for high-performance brands' }
        ],
        stack: [
          { category: { es: 'Frontend & 3D', en: 'Frontend & 3D' }, tags: ['HTML5 / CSS3', 'JavaScript ES6+ Modules', '3D Canvas Tunnel'] },
          { category: { es: 'Animación & VFX', en: 'Animation & VFX' }, tags: ['GSAP ScrollTrigger', 'Custom SVG Monogram Mask', 'Kinetic Marquee'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Vercel Edge CDN', 'Google Tag Manager'] }
        ],
        deliverables: {
          es: [
            'Dirección de arte premium e identidad digital completa',
            'Túnel 3D interactivo y motor de partículas para el cursor',
            'Arquitectura modular bilingüe instantánea (ES / EN)',
            'Formularios y flujos de captación conectados a CRM'
          ],
          en: [
            'Premium art direction & complete digital brand identity',
            'Interactive 3D scroll tunnel and cursor particle engine',
            'Seamless instant bilingual framework (ES / EN)',
            'Automated CRM lead capture integration'
          ]
        }
      },
      {
        name: 'SIGNATURE AI',
        x: 75, y: 2, rot: 5,
        category: { es: 'Biblioteca de Prompts IA & Portal con Login', en: 'AI Prompt Vault & Member Portal' },
        year: '2024',
        video: 'projects/signatureai.mp4',
        link: 'https://prompts.signatureagency.studio/',
        frameUrl: 'prompts.signatureagency.studio',
        desc: {
          es: 'Plataforma de producto digital y biblioteca privada de más de 700 prompts cinematográficos para IA con sistema de autenticación, portal con login y automatización de accesos.',
          en: 'Digital product platform and private vault of 700+ cinematic AI prompts featuring member authentication, login portal, and automated delivery workflows.'
        },
        challenge: {
          es: 'Construir un portal protegido con pasarela de pago, entrega automática de credenciales de acceso por correo y biblioteca categorizada para cientos de creadores y marcas.',
          en: 'Build a secure member portal with payment processing, automated instant credential delivery via email, and an indexed prompt database for creators and brands.'
        },
        solution: {
          es: 'Landing de conversión con showreel visual, sistema de login y membresía, categorización en 10 sectores creativos y automatización end-to-end de pagos y accesos con Make.',
          en: 'Engineered a high-converting showcase landing, authenticated member library across 10 creative categories, and end-to-end payment and onboarding automation with Make.'
        },
        stats: [
          { val: '700+', label: { es: 'Prompts en la biblioteca', en: 'Prompts in the library' } },
          { val: '10', label: { es: 'Categorías', en: 'Categories' } },
          { val: 'Auto', label: { es: 'Pago → acceso por email', en: 'Payment → email access' } }
        ],
        palette: [
          { name: { es: 'Cian Neón IA', en: 'AI Neon Cyan' }, hex: '#15C2DF', role: { es: 'Acento y Precios', en: 'Interactive Accent' } },
          { name: { es: 'Negro Carbón', en: 'Carbon Black' }, hex: '#0F0F0F', role: { es: 'Fondo Principal', en: 'Main Canvas' } },
          { name: { es: 'Hueso Bloque Claro', en: 'Light Contrast Bone' }, hex: '#E7E4DB', role: { es: 'Tarjetas Contraste', en: 'Contrast Card Fill' } },
          { name: { es: 'Grafito Superficie', en: 'Surface Graphite' }, hex: '#161616', role: { es: 'Bóveda de Prompts', en: 'Vault Surface' } }
        ],
        typography: [
          { label: { es: 'Titulares Display', en: 'Display Headings' }, name: 'Syne 800', sample: '700+ CINEMATIC AI PROMPTS' },
          { label: { es: 'Categorías y UI', en: 'UI & Category Tags' }, name: 'DM Sans', sample: 'Optimized for Nano Banana Pro, Soul 2.0 & Midjourney' }
        ],
        stack: [
          { category: { es: 'Frontend & UI', en: 'Frontend & UI' }, tags: ['HTML5 / CSS3 Grid', 'JavaScript ES6+', 'Bilingual UI Engine'] },
          { category: { es: 'Portal & Auth', en: 'Portal & Auth' }, tags: ['Member Login Portal', 'Stan Store / Stripe API', 'Gated Vault'] },
          { category: { es: 'Automatización', en: 'Automation' }, tags: ['Make.com / Webhooks', 'Automated Email Credential Delivery', 'Google Tag Manager'] }
        ],
        deliverables: {
          es: [
            'Diseño y desarrollo de la plataforma web de venta y acceso',
            'Bóveda de más de 700 prompts clasificados por temática e IA',
            'Sistema de autenticación y login para compradores',
            'Automatización de altas, credenciales y facturación instantánea'
          ],
          en: [
            'Full design & engineering of the digital product portal',
            'Vault of 700+ cinematic prompts indexed across 10 categories',
            'Authenticated member login and library dashboard',
            'Instant automated onboarding, credentials delivery, and billing'
          ]
        }
      },

      /* ============ ROW 2 ============ */
      {
        name: 'GIUSEPPE',
        x: 10, y: 45, rot: 2,
        category: { es: 'Restaurante Italiano & Trattoria Romana', en: 'Authentic Italian Trattoria & Editorial Dining' },
        year: '2024',
        video: 'projects/giussepe.mp4',
        link: 'https://giuseppe.callersignal.com/',
        frameUrl: 'giuseppe.callersignal.com',
        desc: {
          es: 'Plataforma editorial y experiencia gastronómica digital para Giuseppe’s: trattoria romana clásica con sistema de reservas interactivas, panel lateral, tienda de productos y menú bilingüe.',
          en: 'Editorial digital platform and culinary showcase for Giuseppe’s: heritage Roman trattoria featuring interactive table reservations, drawer navigation, pantry shop, and multilingual support.'
        },
        challenge: {
          es: 'Trasladar la calidez, tradición e historia de una trattoria romana de 1962 a una web de alta costura que facilitara reservas online directas y venta de productos artesanales.',
          en: 'Translate the warmth, tradition, and legacy of a 1962 Roman trattoria into a high-end editorial website driving table reservations and artisan pantry orders.'
        },
        solution: {
          es: 'Diseño editorial con tipografías clásicas Bodoni y Lora, paneles laterales interactivos (drawer de navegación y módulo de reservas con selector de franjas horarias), marquesinas cinéticas y tienda online.',
          en: 'Crafted an editorial layout pairing Bodoni Moda with Lora typography, interactive sliding drawer navigation, live time-slot reservation booking modal, and pantry store.'
        },
        stats: [
          { val: 'Live', label: { es: 'Reservas de mesa en el sitio', en: 'Table booking on-site' } },
          { val: 'IT·ES·EN', label: { es: 'Tres idiomas', en: 'Three languages' } },
          { val: '1962', label: { es: 'Año de fundación de la trattoria', en: 'Trattoria founded' } }
        ],
        palette: [
          { name: { es: 'Verde Salvia Botánico', en: 'Botanical Sage Green' }, hex: '#3D5C42', role: { es: 'Acento y Bordes Editoriales', en: 'Primary Botanical Accent' } },
          { name: { es: 'Lino Papel Antiguo', en: 'Aged Linen Canvas' }, hex: '#F3F2ED', role: { es: 'Lienzo Textura Papel', en: 'Textured Paper Canvas' } },
          { name: { es: 'Tinta Carbón Romana', en: 'Roman Charcoal Ink' }, hex: '#1A1A1A', role: { es: 'Textos y Botones', en: 'Display Ink & Buttons' } },
          { name: { es: 'Verde Oliva Suave', en: 'Soft Olive Tint' }, hex: '#C4D0BC', role: { es: 'Acento Secundario', en: 'Secondary Muted Tone' } }
        ],
        typography: [
          { label: { es: 'Display Clásico', en: 'Editorial Display' }, name: 'Bodoni Moda', sample: 'TRATTORIA ROMANA DAL 1962' },
          { label: { es: 'Cuerpo y Lectura', en: 'Body Typography' }, name: 'Lora Serif', sample: 'Fresh handmade pasta, natural wines and slow-simmered sauces' }
        ],
        stack: [
          { category: { es: 'Frontend & UI', en: 'Frontend & UI' }, tags: ['HTML5 / CSS3 Grid', 'Vanilla JavaScript ES6+', 'Interactive Drawer & Sheet Transforms'] },
          { category: { es: 'Reservas & Módulos', en: 'Modules & Features' }, tags: ['Live Time-Slot Reservation Engine', 'Multilingual Switcher (IT / ES / EN)', 'Pantry E-Commerce Shop'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Vercel Edge Network', 'Optimized WebP Assets', 'Google Analytics'] }
        ],
        deliverables: {
          es: [
            'Diseño y dirección de arte editorial inspirado en papel y prensas italianas',
            'Motor de reservas de mesas en tiempo real con selector de fecha y comensales',
            'Panel de navegación lateral y tienda digital de conservas y aceites',
            'Sistema de traducción instantáneo a 3 idiomas (Italiano, Español, Inglés)'
          ],
          en: [
            'Bespoke editorial art direction inspired by vintage Italian print',
            'Real-time interactive table booking drawer with date & party selector',
            'Sliding navigation drawer and curated artisan pantry e-commerce shop',
            'Instant multilingual architecture (Italian, Spanish, English)'
          ]
        }
      },
      {
        name: 'GIE LABS',
        x: 33, y: 48, rot: -6,
        category: { es: 'Estudio Web3 y Plataforma de Lanzamientos', en: 'Web3 Venture Studio & Launchpad' },
        year: '2024',
        video: 'projects/gie.mp4',
        link: 'https://gie3labs.com/',
        frameUrl: 'gie3labs.com',
        desc: {
          es: 'Plataforma Web3 y escaparate de lanzamientos estratégicos para GIE3 Labs: túnel 3D interactivo por scroll, tipografía variable reactiva y panel de seguimiento de tokens.',
          en: 'Web3 launchpad and venture studio showcase for GIE3 Labs: interactive 3D scroll tunnel, motion-reactive variable typography, and live launch performance tracker.'
        },
        challenge: {
          es: 'Requerían una identidad digital disruptiva que rompiera los moldes estándar del ecosistema cripto y demostrara capacidad de ejecución y tracción real ante inversores y comunidades globales.',
          en: 'Needed a disruptive, non-traditional Web3 showcase to establish immediate credibility, speed, and launch track record with international funds and communities.'
        },
        solution: {
          es: 'Diseño Cyber Terminal con túnel 3D acelerado por WebGL, tipografía variable reactiva al cursor, escaparate Hall of Mooners con filtros multiplicadores y HUD interactivo.',
          en: 'Engineered a Cyber Terminal with a WebGL-accelerated 3D tunnel, motion-reactive variable typography, the Hall of Mooners launch grid, and a live statistics HUD.'
        },
        stats: [
          { val: 'WebGL', label: { es: 'Motor 3D en el navegador', en: 'In-browser 3D engine' } },
          { val: '60 fps', label: { es: 'Animación fluida', en: 'Smooth animation' } },
          { val: 'On-chain', label: { es: 'Datos en vivo en el HUD', en: 'Live data in the HUD' } }
        ],
        palette: [
          { name: { es: 'Verde Cyber Terminal', en: 'Cyber Terminal Green' }, hex: '#00FF66', role: { es: 'Acento HUD y Éxito', en: 'Primary Accent / HUD' } },
          { name: { es: 'Negro Vacío Profundo', en: 'Deep Void Black' }, hex: '#000000', role: { es: 'Fondo Base 3D', en: 'Deep Canvas' } },
          { name: { es: 'Amarillo Señal Alerta', en: 'Alert Signal Yellow' }, hex: '#FFD600', role: { es: 'Insignias y Borde', en: 'Alert / Badges' } },
          { name: { es: 'Gris Monolito Wireframe', en: 'Wireframe Monolith Grey' }, hex: '#262626', role: { es: 'Líneas y Retícula', en: 'Grid & Borders' } }
        ],
        typography: [
          { label: { es: 'Tipografía Variable', en: 'Variable Typography' }, name: 'GT Planar VF', sample: 'WE BUILD. WE PUMP. WE LAST.' },
          { label: { es: 'Datos Técnicos / HUD', en: 'HUD & Technical Data' }, name: 'Space Mono', sample: 'STATUS: LAUNCH_CONFIRMED · ATH: 13833X' }
        ],
        stack: [
          { category: { es: 'Frontend / 3D', en: 'Frontend & 3D' }, tags: ['HTML5 Canvas', 'WebGL 3D Tunnel Engine', 'Variable Fonts'] },
          { category: { es: 'Arquitectura & Estilos', en: 'Layout & Styling' }, tags: ['TailwindCSS', 'Motion HUD System', 'Canvas Shaders'] },
          { category: { es: 'Comunicaciones', en: 'Integrations' }, tags: ['OneSignal Push SDK', 'Telegram Alphas API', 'Google Tag Manager'] }
        ],
        deliverables: {
          es: [
            'Navegación inmersiva en túnel 3D mediante scroll en WebGL',
            'Motor de tipografía variable reactiva con inclinaciones dinámicas',
            'Escaparate interactivo Hall of Mooners con filtrado por multiplicador',
            'Integración de canal Telegram para alertas Alpha y notificaciones push'
          ],
          en: [
            'Immersive scroll-driven 3D tunnel navigation built with WebGL',
            'Motion-reactive variable typography engine with dynamic slant shifts',
            'Interactive Hall of Mooners launch grid with multiplier filters',
            'Telegram Alpha alerts integration and OneSignal push notification system'
          ]
        }
      },
      {
        name: 'LUXOR',
        x: 57, y: 42, rot: 4,
        category: { es: 'App de Fitness · Landing de Pre-Lanzamiento', en: 'Fitness App · Pre-Launch Landing' },
        year: '2024',
        video: 'projects/luxor.mp4',
        link: 'https://luxorfitnessapp.com/',
        frameUrl: 'luxorfitnessapp.com',
        desc: {
          es: 'Página de presentación para Luxor, una app de entrenamiento en pre-lanzamiento: introduce el producto, su método y su tono atlético antes de llegar a las tiendas.',
          en: 'Pre-launch presentation page for Luxor, a training app ahead of release — it introduces the product, its method, and its athletic tone before it reaches the stores.'
        },
        challenge: {
          es: 'La app todavía no existía públicamente. Necesitaba una presencia web sólida y de impacto que la presentara con claridad y credibilidad, y transmitiera método y disciplina desde el primer scroll.',
          en: 'The app did not exist publicly yet. It needed a solid, high-impact web presence to introduce it with clarity and credibility, conveying method and discipline from the first scroll.'
        },
        solution: {
          es: 'Diseño atlético de alto contraste en modo oscuro, preview de la app en video popup, desglose de la metodología de entrenamiento y una estructura lista para sumar la descarga cuando la app se lance.',
          en: 'A high-contrast athletic dark interface, an in-page video preview of the app, a breakdown of the training methodology, and a structure ready to add the download once the app launches.'
        },
        stats: [
          { val: '< 1.1s', label: { es: 'Velocidad de carga', en: 'Load speed' } },
          { val: 'ES / EN', label: { es: 'Landing bilingüe', en: 'Bilingual landing' } },
          { val: 'Preview', label: { es: 'Video de la app en la página', en: 'In-page app preview video' } }
        ],
        palette: [
          { name: { es: 'Verde Lima Neón', en: 'Neon Lime Green' }, hex: '#CCFF00', role: { es: 'Acento Atlético y Botones', en: 'Athletic Kinetic Accent' } },
          { name: { es: 'Negro Obsidiana', en: 'Obsidian Black' }, hex: '#0A0A0A', role: { es: 'Fondo Oscuro Base', en: 'Obsidian Canvas' } },
          { name: { es: 'Blanco Titanio', en: 'Titanium White' }, hex: '#FFFFFF', role: { es: 'Titulares de Impacto', en: 'Headline Contrast' } },
          { name: { es: 'Gris Carbón Módulos', en: 'Carbon Grey Modules' }, hex: '#1C1C1C', role: { es: 'Tarjetas de Entrenamiento', en: 'Module Containers' } }
        ],
        typography: [
          { label: { es: 'Titular Atlético', en: 'Athletic Display' }, name: 'Bebas Neue / Oswald', sample: 'ROUTINES. PROGRESS. MOTIVATION.' },
          { label: { es: 'Cuerpo y Datos', en: 'Body UI' }, name: 'Roboto / Montserrat', sample: 'Help people and gyms train better with less friction' }
        ],
        stack: [
          { category: { es: 'Frontend & UI', en: 'Frontend & UI' }, tags: ['HTML5 / CSS3 Grid', 'JavaScript Modules', 'ThePlus & JKit Engine'] },
          { category: { es: 'Media & Video', en: 'Media & Interactive' }, tags: ['Interactive Video Popup Modal', 'Responsive App Mockups'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Hostinger Hosting', 'Responsive / Mobile-First'] }
        ],
        deliverables: {
          es: [
            'Diseño y desarrollo de la web de presentación pre-lanzamiento',
            'Estructura visual de módulos de entrenamiento y nutrición',
            'Reproductor de video interactivo integrado',
            'Optimización de rendimiento mobile-first'
          ],
          en: [
            'Design and development of the pre-launch presentation site',
            'Visual architecture for workout and nutrition modules',
            'Integrated interactive video preview modal',
            'Mobile-first performance optimization'
          ]
        }
      },
      {
        name: 'CLUB 54',
        x: 78, y: 46, rot: -3,
        category: { es: 'Token Cripto · Landing de Presentación', en: 'Crypto Token · Presentation Landing' },
        year: '2024',
        video: 'projects/club54.mp4',
        link: 'https://club54.callersignal.com/',
        frameUrl: 'club54.callersignal.com',
        desc: {
          es: 'Landing de presentación para CLUB 54, un token cripto cuya identidad de marca es un club privado ficticio de los 70: estética disco neón, tipografía vintage y una puesta en escena que hace sentir el proyecto como un lugar real.',
          en: 'Presentation landing for CLUB 54, a crypto token whose brand identity is a fictional 1970s private club — neon disco aesthetic, vintage typography, and staging that makes the project feel like a real place.'
        },
        challenge: {
          es: 'El proyecto necesitaba una primera impresión fuerte: una web que vendiera el concepto y la atmósfera del "club" y le diera identidad y credibilidad de cara al lanzamiento.',
          en: 'The project needed a strong first impression — a site that sold the concept and atmosphere of the "club" and gave it identity and credibility heading into launch.'
        },
        solution: {
          es: 'Interfaz envolvente en modo oscuro con estética retro-neón, efectos de destello, tipografía disco y preloader animado de entrada que monta la escena antes de entrar.',
          en: 'An immersive dark-mode interface with retro-neon glow effects, disco typography, and an animated entrance preloader that sets the scene before you step in.'
        },
        stats: [
          { val: '1-page', label: { es: 'Landing inmersiva de una página', en: 'Single-page immersive landing' } },
          { val: 'ES / EN', label: { es: 'Sitio bilingüe', en: 'Bilingual site' } },
          { val: '< 1.2s', label: { es: 'Tiempo de carga', en: 'Load speed' } }
        ],
        palette: [
          { name: { es: 'Rojo Neón Eléctrico', en: 'Electric Neon Red' }, hex: '#FF4006', role: { es: 'Acento Neón y Botones', en: 'Electric Neon Accent' } },
          { name: { es: 'Negro Terciopelo', en: 'Midnight Velvet Black' }, hex: '#0A0000', role: { es: 'Fondo Nocturno', en: 'Midnight Canvas' } },
          { name: { es: 'Blanco Destello', en: 'Strobe White' }, hex: '#FFFFFF', role: { es: 'Titulares y Trazos', en: 'Neon White Stroke' } },
          { name: { es: 'Magenta Disco Glow', en: 'Magenta Disco Glow' }, hex: '#DD38CB', role: { es: 'Bordes y Resplandor', en: 'Disco Rim Glow' } }
        ],
        typography: [
          { label: { es: 'Titular Display 70s', en: '70s Display Title' }, name: 'Syne 800', sample: 'CLUB 54 — MEMBERS ONLY' },
          { label: { es: 'Manuscrita Cursiva', en: 'Retro Script' }, name: 'Waiting for the Sunrise', sample: 'The club that never closed' }
        ],
        stack: [
          { category: { es: 'Frontend & UI', en: 'Frontend & UI' }, tags: ['HTML5 / CSS3 Grid', 'Custom Kinetic Glow', 'JavaScript Modules'] },
          { category: { es: 'Efectos & Media', en: 'VFX & Preloader' }, tags: ['LoftLoader Engine', 'Neon Stroke Rendering', 'Gif/Video Optimization'] },
          { category: { es: 'Infraestructura', en: 'Infrastructure' }, tags: ['Static Hosting', 'Responsive / Mobile-First', 'Asset Optimization'] }
        ],
        deliverables: {
          es: [
            'Dirección de arte vintage 70s e identidad web inmersiva',
            'Landing conceptual que pone en escena el token como un lugar real',
            'Preloader personalizado con animación de entrada',
            'Optimización multimedia y visual de alto rendimiento'
          ],
          en: [
            'Vintage 1970s art direction and immersive web identity',
            'Concept-driven landing that stages the token as a real place',
            'Custom high-energy entrance preloader animation',
            'High-performance media and visual optimization'
          ]
        }
      }
    ];

    const gridEl = document.getElementById('work-cards-grid');
    if (!gridEl) return;

    const boardEl = document.getElementById('work-board');
    const detailEl = document.getElementById('work-detail');
    const detailClose = document.getElementById('work-detail-close');
    const detailScroll = document.getElementById('work-detail-scroll');
    const detailIndex = document.getElementById('work-detail-index');
    const detailPrev = document.getElementById('work-detail-prev');
    const detailNext = document.getElementById('work-detail-next');
    const detailFrameUrl = document.getElementById('work-detail-frame-url');
    const detailVideo = document.getElementById('work-detail-video');
    const detailPlaceholder = document.getElementById('work-detail-media-placeholder');
    const detailCategory = document.getElementById('work-detail-category');
    const detailYear = document.getElementById('work-detail-year');
    const detailName = document.getElementById('work-detail-name');
    const detailDesc = document.getElementById('work-detail-desc');
    const detailStats = document.getElementById('work-detail-stats');
    const detailLink = document.getElementById('work-detail-link');
    const detailChallenge = document.getElementById('work-detail-challenge');
    const detailSolution = document.getElementById('work-detail-solution');
    const detailPalette = document.getElementById('work-detail-palette');
    const detailTypography = document.getElementById('work-detail-typography');
    const detailStack = document.getElementById('work-detail-stack');
    const detailDeliverables = document.getElementById('work-detail-deliverables');
    const detailFooterPrev = document.getElementById('work-detail-footer-prev');
    const detailFooterNext = document.getElementById('work-detail-footer-next');
    const detailFooterPrevName = document.getElementById('work-detail-footer-prev-name');
    const detailFooterNextName = document.getElementById('work-detail-footer-next-name');

    let currentIndex = 0;
    let currentOpenNote = null;

    const t = (val) => {
      if (typeof val === 'object' && val !== null) {
        return val[currentLang] || val.es || val.en || '';
      }
      return val || '';
    };

    // Select 3 random indices for "big wobble"
    const bigWobbleIndices = [];
    while (bigWobbleIndices.length < 3) {
      const r = Math.floor(Math.random() * projects.length);
      if (!bigWobbleIndices.includes(r)) bigWobbleIndices.push(r);
    }

    // Per-card random wobble so each one settles differently
    const wobbles = projects.map((_, i) => {
      const isBig = bigWobbleIndices.includes(i);
      return {
        intensity: isBig ? 2.5 + Math.random() * 1.5 : 0.4 + Math.random() * 0.6,
        dir:       Math.random() > 0.5 ? 1 : -1,
        dur:       1.1 + Math.random() * 0.8
      };
    });

    const fillDetail = (project, index) => {
      const idxNum = index !== undefined ? index : currentIndex;
      const p = project || projects[idxNum];
      if (!p) return;

      const caseNum = String(idxNum + 1).padStart(2, '0');
      const totalNum = String(projects.length).padStart(2, '0');
      if (detailIndex) detailIndex.textContent = `EXP. ${caseNum} / ${totalNum}`;
      if (detailFrameUrl) detailFrameUrl.textContent = p.frameUrl || `caller://work/${p.name.toLowerCase().replace(/\s+/g, '-')}`;

      if (detailCategory) detailCategory.textContent = t(p.category);
      if (detailYear) detailYear.textContent = p.year || '2024';
      if (detailName) detailName.textContent = p.name;
      if (detailDesc) detailDesc.textContent = t(p.desc);
      if (detailLink) detailLink.href = p.link || '#';

      if (detailChallenge) detailChallenge.textContent = t(p.challenge);
      if (detailSolution) detailSolution.textContent = t(p.solution);

      // Stats
      if (detailStats) {
        detailStats.innerHTML = (p.stats || []).map((s) => `
          <div class="work__detail-stat-pill">
            <span class="work__detail-stat-val">${s.val}</span>
            <span class="work__detail-stat-lbl">${t(s.label)}</span>
          </div>
        `).join('');
      }

      // Color Palette Cards with HEX & Copy
      if (detailPalette) {
        detailPalette.innerHTML = (p.palette || []).map((c) => {
          const roleLabel = t(c.role);
          const nameLabel = t(c.name);
          return `
            <div class="work__palette-card" data-hex="${c.hex}" title="${currentLang === 'es' ? 'Haz clic para copiar' : 'Click to copy'}">
              <div class="work__palette-swatch" style="background-color: ${c.hex};"></div>
              <div class="work__palette-info">
                <span class="work__palette-role">${roleLabel}</span>
                <span class="work__palette-name">${nameLabel}</span>
                <div class="work__palette-hex-wrap">
                  <span class="work__palette-hex">${c.hex}</span>
                  <svg class="work__palette-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </div>
              </div>
              <div class="work__palette-toast">${currentLang === 'es' ? '¡COPIADO!' : 'COPIED!'}</div>
            </div>
          `;
        }).join('');

        // Wire copy listeners
        detailPalette.querySelectorAll('.work__palette-card').forEach((card) => {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            const hex = card.dataset.hex;
            if (!hex) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(hex).catch(() => {});
            }
            card.classList.add('is-copied');
            setTimeout(() => card.classList.remove('is-copied'), 1400);
          });
        });
      }

      // Typography Specs
      if (detailTypography) {
        detailTypography.innerHTML = (p.typography || []).map((ty) => `
          <div class="work__type-card">
            <div class="work__type-label">${t(ty.label)}</div>
            <div class="work__type-name">${ty.name}</div>
            <div class="work__type-sample">${ty.sample}</div>
          </div>
        `).join('');
      }

      // Tech Stack
      if (detailStack) {
        detailStack.innerHTML = (p.stack || []).map((group) => `
          <div class="work__stack-row">
            <span class="work__stack-category">${t(group.category)}</span>
            <div class="work__stack-tags">
              ${(group.tags || []).map((tag) => `<span class="work__stack-tag">${tag}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      // Deliverables
      if (detailDeliverables) {
        const list = p.deliverables ? (p.deliverables[currentLang] || p.deliverables.es || p.deliverables.en || []) : [];
        detailDeliverables.innerHTML = list.map((item) => `
          <li class="work__deliverable-item">
            <span class="work__deliverable-icon">✓</span>
            <span>${item}</span>
          </li>
        `).join('');
      }

      // Video Source Handling
      if (detailVideo && detailPlaceholder) {
        if (p.video) {
          detailVideo.poster = p.video.replace(/^projects\/(.+)\.mp4$/, 'projects/posters/$1.webp');
          detailVideo.src = p.video;
          detailVideo.classList.remove('is-hidden');
          detailPlaceholder.classList.add('is-hidden');
          detailVideo.play().catch(() => {});
        } else {
          detailVideo.pause();
          detailVideo.src = '';
          detailVideo.classList.add('is-hidden');
          detailPlaceholder.classList.remove('is-hidden');
        }
      }

      // Prev/Next Footer Labels
      const prevIdx = (idxNum - 1 + projects.length) % projects.length;
      const nextIdx = (idxNum + 1) % projects.length;
      if (detailFooterPrevName) detailFooterPrevName.textContent = projects[prevIdx].name;
      if (detailFooterNextName) detailFooterNextName.textContent = projects[nextIdx].name;
    };

    const goToProject = (newIndex) => {
      currentIndex = (newIndex + projects.length) % projects.length;
      if (detailScroll) {
        detailScroll.style.opacity = '0.35';
        detailScroll.style.transform = 'translateY(4px)';
        detailScroll.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
        setTimeout(() => {
          fillDetail(projects[currentIndex], currentIndex);
          detailScroll.scrollTop = 0;
          detailScroll.style.opacity = '1';
          detailScroll.style.transform = 'none';
        }, 160);
      } else {
        fillDetail(projects[currentIndex], currentIndex);
      }
    };

    const openDetail = (index, noteEl) => {
      currentIndex = index;
      fillDetail(projects[index], index);
      if (detailScroll) detailScroll.scrollTop = 0;

      const startRect = noteEl.getBoundingClientRect();

      gridEl.style.opacity = '0';
      gridEl.style.pointerEvents = 'none';
      detailEl.classList.add('is-open');
      detailEl.setAttribute('aria-hidden', 'false');

      const endRect = detailEl.getBoundingClientRect();
      const scaleX = startRect.width / endRect.width;
      const scaleY = startRect.height / endRect.height;
      const dx = (startRect.left + startRect.width / 2) - (endRect.left + endRect.width / 2);
      const dy = (startRect.top + startRect.height / 2) - (endRect.top + endRect.height / 2);

      detailEl.style.transition = 'none';
      detailEl.style.opacity = '0';
      detailEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          detailEl.style.transition = 'transform 0.5s var(--ease-out), opacity 0.25s ease';
          detailEl.style.transform = 'none';
          detailEl.style.opacity = '1';
        });
      });

      currentOpenNote = noteEl;
    };

    const closeDetail = () => {
      if (detailVideo) detailVideo.pause();
      const endRect = currentOpenNote ? currentOpenNote.getBoundingClientRect() : null;
      const startRect = detailEl.getBoundingClientRect();

      const finish = () => {
        detailEl.classList.remove('is-open');
        detailEl.style.transition = 'none';
        detailEl.style.transform = 'none';
        detailEl.style.opacity = '';
        gridEl.style.opacity = '';
        gridEl.style.pointerEvents = '';
        document.dispatchEvent(new CustomEvent('caller:detailclose'));
      };

      if (!endRect) { finish(); return; }

      const scaleX = endRect.width / startRect.width;
      const scaleY = endRect.height / startRect.height;
      const dx = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
      const dy = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);

      detailEl.setAttribute('aria-hidden', 'true');
      detailEl.style.transition = 'transform 0.4s var(--ease-out), opacity 0.3s ease';
      detailEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
      detailEl.style.opacity = '0';

      detailEl.addEventListener('transitionend', finish, { once: true });
    };

    detailClose?.addEventListener('click', closeDetail);
    // Any navigation away (TV buttons, dots, keyboard, or a fresh
    // scroll hop) used to leave an open project card floating on top
    // of whatever room you landed on — nothing ever told it to close.
    // caller:slidestart fires at the start of every one of those, so
    // this is the one place that catches them all.
    document.addEventListener('caller:slidestart', () => {
      if (detailEl.classList.contains('is-open')) closeDetail();
    });
    detailPrev?.addEventListener('click', () => goToProject(currentIndex - 1));
    detailNext?.addEventListener('click', () => goToProject(currentIndex + 1));
    detailFooterPrev?.addEventListener('click', () => goToProject(currentIndex - 1));
    detailFooterNext?.addEventListener('click', () => goToProject(currentIndex + 1));

    // Let the dossier scroll natively (momentum, easing, sub-pixel) —
    // just stop the wheel from bubbling to the deck's room-scrub engine.
    // Manually driving scrollTop here used to replace native scrolling
    // with one discrete jump per wheel event, which felt stuttery.
    detailScroll?.addEventListener('wheel', (e) => { e.stopPropagation(); }, { passive: true });
    detailEl?.addEventListener('wheel', (e) => { e.stopPropagation(); }, { passive: true });

    // Allow native momentum touch scrolling inside detail scroll without interference
    detailScroll?.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
    detailScroll?.addEventListener('touchmove', (e) => { e.stopPropagation(); }, { passive: true });
    detailScroll?.addEventListener('touchend', (e) => { e.stopPropagation(); }, { passive: true });

    const render = () => {
      gridEl.innerHTML = projects.map((p, i) => `
        <div class="work__note" data-index="${i}" style="left: ${p.x}%; top: ${p.y}%; --rot: ${p.rot}deg; --i: ${i}; --wobble: ${wobbles[i].intensity}; --dir: ${wobbles[i].dir}; --dur: ${wobbles[i].dur}s;">
          <h3 class="work__note-name">${p.name}</h3>
        </div>
      `).join('');
      gridEl.querySelectorAll('.work__note').forEach((el) => {
        el.addEventListener('click', () => openDetail(parseInt(el.dataset.index, 10), el));
      });

      if (detailEl.classList.contains('is-open')) {
        fillDetail(projects[currentIndex], currentIndex);
      }
    };

    document.addEventListener('caller:langchange', render);
    render();
  };

  /* ============================================================
     Init sections that don't depend on GSAP
     ============================================================ */
  initWork();

  /* System carousel — on mobile, show one step at a time, tap to advance until step 4 */
  const initSystemCarousel = () => {
    const board = document.querySelector('.system__board');
    const slots = board ? Array.from(board.querySelectorAll('.system__slot')) : [];
    if (!slots.length) return;

    const dots = Array.from(document.querySelectorAll('.system__mobile-dot'));
    const hint = document.querySelector('.system__mobile-hint');

    let step = 0;

    const update = () => {
      const mobile = isPhoneLayout();
      slots.forEach((s, i) => {
        if (mobile) {
          s.style.display = i === step ? 'flex' : 'none';
        } else {
          s.style.display = '';
        }
      });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === step));

      if (hint) {
        if (mobile && step >= slots.length - 1) {
          hint.style.display = 'none';
          document.dispatchEvent(new CustomEvent('caller:systemstep4'));
        } else if (mobile) {
          hint.style.display = '';
          const targetNudge = document.querySelector('.room__scroll-nudge[data-slide="2"]');
          targetNudge?.classList.remove('is-visible');
        } else {
          hint.style.display = '';
        }
      }
    };

    board.addEventListener('click', () => {
      if (isPhoneLayout()) {
        if (step < slots.length - 1) {
          step++;
          update();
        }
      }
    });

    dots.forEach((dot, idx) => {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPhoneLayout()) {
          step = idx;
          update();
        }
      });
    });

    document.addEventListener('caller:slidechange', (e) => {
      if (e.detail && e.detail.index !== 2) {
        step = 0;
        update();
      }
    });

    window.addEventListener('resize', update);
    update();
  };
  initSystemCarousel();

  /* ============================================================
     4b. CTA FORM — "Leave a message." swaps the room's own content
     for a message slip instead of opening a modal. Wired for
     Web3Forms (https://web3forms.com) — drop a real access key into
     the hidden #cta-form input named "access_key" once you have one;
     until then submits will just come back as a Web3Forms error.
     ============================================================ */
  const initCtaForm = () => {
    const introView = document.getElementById('cta-view-intro');
    const formView = document.getElementById('cta-form');
    const openBtn = document.getElementById('cta-open-form');
    const closeBtn = document.getElementById('cta-close-form');
    const statusEl = document.getElementById('cta-form-status');
    if (!introView || !formView || !openBtn) return;

    const showForm = () => {
      introView.classList.remove('is-active');
      formView.classList.add('is-active');
      document.dispatchEvent(new CustomEvent('caller:ctaformopen'));
    };
    const showIntro = () => {
      formView.classList.remove('is-active');
      introView.classList.add('is-active');
    };

    openBtn.addEventListener('click', showForm);
    closeBtn?.addEventListener('click', () => {
      showIntro();
      document.dispatchEvent(new CustomEvent('caller:ctaformclose'));
    });
    // Land back on the intro every time this room is (re)entered,
    // rather than stranding a visitor mid-form from a previous visit.
    document.addEventListener('caller:slidestart', showIntro);

    formView.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formView.querySelector('.cta__form-submit');
      const setStatus = (key) => {
        if (statusEl) statusEl.textContent = I18N[currentLang][key];
      };

      const fd = new FormData(formView);
      // Honeypot: un bot marca el checkbox oculto -> se descarta en silencio.
      if ((fd.get('botcheck') || '') !== '') return;
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message) {
        setStatus('cta.statusInvalid');
        return;
      }

      setStatus('cta.statusSending');
      submitBtn.disabled = true;
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(fd)),
        });
        const data = await res.json();
        if (data.success) {
          setStatus('cta.statusSent');
          formView.reset();
        } else {
          setStatus('cta.statusError');
        }
      } catch {
        setStatus('cta.statusError');
      } finally {
        submitBtn.disabled = false;
      }
    });
  };
  initCtaForm();

  /* 4c. TV WARP — a small lens of the scanline texture that follows
     the mouse, run through an SVG feDisplacementMap so the lines
     wobble locally like a magnet held near an old CRT. Desktop mouse
     only (gated on hover+fine pointer) and skipped for reduced
     motion. The base scanline animation is paused for the duration
     so the lens's background-position can be pinned to match it
     without drifting out of alignment mid-hover. */
  const initTvWarp = () => {
    const screen = document.querySelector('.tv-screen');
    const lens = document.getElementById('tv-warp-lens');
    if (!screen || !lens) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) return;

    let active = false;
    let bgYAtEnter = 0;

    const onEnter = () => {
      active = true;
      bgYAtEnter = parseFloat(getComputedStyle(screen, '::before').backgroundPositionY) || 0;
      screen.classList.add('is-warping');
      lens.classList.add('is-active');
    };

    const onMove = (e) => {
      if (!active) onEnter();
      const rect = screen.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lens.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      lens.style.backgroundPositionY = `${bgYAtEnter - y}px`;
      screen.style.setProperty('--warp-x', `${x}px`);
      screen.style.setProperty('--warp-y', `${y}px`);
    };

    const onLeave = () => {
      active = false;
      screen.classList.remove('is-warping');
      lens.classList.remove('is-active');
    };

    screen.addEventListener('mouseenter', onEnter);
    screen.addEventListener('mousemove', onMove);
    screen.addEventListener('mouseleave', onLeave);
  };
  initTvWarp();

  /* ============================================================
     5. DECK — a full-screen slide deck with snap navigation.
     Desktop: wheel/keyboard/dot-clicks advance one slide at a
     time, each change a hand-built crossfade (no continuous
     scroll at all — the page itself never moves). The hero slide
     gets a richer transition: it flashes through the hallway
     frames before crossfading into Work, so entering the building
     reads as a walk, not a jump cut.
     Mobile / reduced-motion / no-GSAP: slides stay in normal
     document flow and just stack — plain scroll, no pagination.
     ============================================================ */
  const initDeck = () => {
    const deckEl = document.getElementById('deck');
    if (!deckEl) return;

    const slides = Array.from(deckEl.querySelectorAll('.deck__slide'));
    const dotsWrap = document.getElementById('deck-dots');
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.deck-dots__item')) : [];
    const navLinks = Array.from(document.querySelectorAll('.nav__links a'));

    // No longer gated on isDesktop — mobile has its own video set and
    // touchmove-based scrubbing now, so it gets the real walk too,
    // not the old plain-scroll fallback. Only reduced-motion / no
    // GSAP still fall back to normal stacked scrolling.
    const paginate = !reduceMotion && typeof gsap !== 'undefined';

    // Always wire nav links — behavior branches on whether we end up paginated.
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (deckEl.classList.contains('is-paginated')) {
          e.preventDefault();
          goToSlide(parseInt(link.dataset.slide, 10));
        } else {
          const href = link.getAttribute('href');
          const target = href && document.querySelector(href);
          if (target) {
            e.preventDefault();
            if (lenis) lenis.scrollTo(target, { offset: -70 });
            else target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    if (!paginate) return;

    deckEl.classList.add('is-paginated');
    document.body.classList.add('is-paginated');

    let current = 0;
    let animating = false;

    gsap.set(slides, { opacity: 0 });
    gsap.set(slides[0], { opacity: 1 });
    slides[0].classList.add('is-active');

    const setDots = (i) => dots.forEach((d, di) => d.classList.toggle('is-active', di === i));

    // Each slide (besides the hero) carries either a [data-room-video]
    // (the old <video>-scrubbed walk) or a [data-frame-canvas] — a
    // pre-extracted JPG sequence drawn frame-by-frame, no decoding,
    // no seek lag. Both expose the same tiny interface below so the
    // rest of the scroll-scrub logic doesn't care which one it's
    // talking to. Frame sequences are the smoother of the two and
    // are being rolled out hop by hop — see roomMediaCache.
    const roomMediaCache = new WeakMap();

    // Bump this any time frame JPGs are regenerated under the same
    // filenames (e.g. re-extracting a room at a different fps) — see
    // srcFor() below for why.
    const FRAMES_VERSION = 31;

    // Elige el set de footage (vertical vs apaisado) y todo el modo
    // móvil. Mismo criterio que el swap del marco a phone.webp y que
    // el resto del sitio — ver isPhoneLayout arriba. Decidido una vez
    // por canvas, al crearlo.
    const isMobileMode = isPhoneLayout;

    const createFrameSeq = (canvasEl, forcedMobile) => {
      const useMobile = forcedMobile !== undefined ? forcedMobile : Boolean(isMobileMode() && canvasEl.dataset.framesBaseMobile);
      const isMob = useMobile;
      const base = useMobile ? canvasEl.dataset.framesBaseMobile : canvasEl.dataset.framesBase;
      const count = parseInt(useMobile ? canvasEl.dataset.framesCountMobile : canvasEl.dataset.framesCount, 10);
      const ctx = canvasEl.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMob ? 'medium' : 'high';
      const images = new Array(count).fill(null); // null | 'loading' | HTMLImageElement
      let lastDrawn = -1;
      let targetFrame = -1;
      let isPreloading = false;
      const CONCURRENCY = isMob ? 4 : 8;

      const srcFor = (i) => `${base}/f${String(i + 1).padStart(4, '0')}.webp?v=${FRAMES_VERSION}`;

      const draw = (i) => {
        if (i === lastDrawn) return;
        const img = images[i];
        if (!img || img === 'loading' || !img.complete || img.naturalWidth === 0) return;
        if (canvasEl.width !== img.naturalWidth) canvasEl.width = img.naturalWidth;
        if (canvasEl.height !== img.naturalHeight) canvasEl.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        lastDrawn = i;
      };

      const decodeOne = (i, onDone) => {
        if (i < 0 || i >= count || images[i]) {
          if (onDone) onDone();
          return;
        }
        images[i] = 'loading';
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = srcFor(i);

        const finish = (ok) => {
          if (images[i] === 'loading') {
            if (ok) {
              images[i] = img;
              if (targetFrame === i) {
                draw(i);
              } else if (targetFrame !== -1 && lastDrawn !== -1) {
                const sameHalf = (targetFrame >= count / 2 && i >= count / 2) || (targetFrame < count / 2 && i < count / 2);
                if (sameHalf && Math.abs(i - targetFrame) < Math.abs(lastDrawn - targetFrame)) {
                  draw(i);
                }
              }
            } else {
              images[i] = null;
            }
          }
          if (onDone) onDone();
        };

        if (typeof img.decode === 'function') {
          img.decode().then(() => finish(true)).catch(() => {
            if (img.complete && img.naturalWidth > 0) finish(true);
            else finish(false);
          });
        } else {
          img.onload = () => finish(true);
          img.onerror = () => finish(false);
        }
      };

      // Always decode boundary frames immediately so start/end never flashes
      decodeOne(0);
      decodeOne(count - 1);

      // Burst Worker Queue
      let nextQueueIdx = 1;
      let activeWorkers = 0;

      const pumpQueue = () => {
        if (!isPreloading) return;
        while (activeWorkers < CONCURRENCY && nextQueueIdx < count - 1) {
          const idx = nextQueueIdx++;
          activeWorkers++;
          decodeOne(idx, () => {
            activeWorkers--;
            pumpQueue();
          });
        }
        if (nextQueueIdx >= count - 1 && activeWorkers === 0) {
          isPreloading = false;
        }
      };

      const startPreload = () => {
        if (isPreloading) return;
        isPreloading = true;
        nextQueueIdx = 1;
        pumpQueue();
      };

      const stopPreload = () => {
        isPreloading = false;
      };

      // Pre-warm liviano: solo mete los frames en la caché HTTP del
      // navegador (fetch, sin decodificar ni retener bitmaps), de a
      // chunks y con pausas. Cuando después se scrollea esta sala, los
      // frames ya están en caché y decodeOne() no espera red.
      let cacheWarmed = false;
      const warmCache = () => {
        if (cacheWarmed) return;
        cacheWarmed = true;
        const CHUNK = isMob ? 3 : 6;
        let i = 1;
        const tick = () => {
          let n = 0;
          while (i < count - 1 && n < CHUNK) {
            fetch(srcFor(i++)).catch(() => {});
            n++;
          }
          if (i < count - 1) setTimeout(tick, 250);
        };
        tick();
      };

      const release = () => {
        stopPreload();
        for (let idx = 1; idx < count - 1; idx++) {
          const img = images[idx];
          if (img && img !== 'loading') {
            img.src = '';
            images[idx] = null;
          }
        }
      };

      return {
        kind: 'frames',
        count,
        base,
        isMobile: useMobile,
        startPreload,
        stopPreload,
        warmCache,
        get duration() {
          const hopAttr = (useMobile && canvasEl.dataset.hopDurationMobile) || canvasEl.dataset.hopDuration;
          return hopAttr ? parseFloat(hopAttr) : null;
        },
        get ease() {
          return (useMobile && canvasEl.dataset.hopEaseMobile) || canvasEl.dataset.hopEase || null;
        },
        get ready() { return true; },
        setProgress(t) {
          const i = Math.max(0, Math.min(count - 1, Math.round(t * (count - 1))));
          targetFrame = i;
          if (images[i] && images[i] !== 'loading' && images[i].complete) { draw(i); return; }
          decodeOne(i);

          // If resting at the destination end (t === 1), never draw frame 0.
          // Stand-in while the exact last frame finishes decoding — kept
          // tight (last 10%, was 30%) so if one gets used it barely
          // differs from the real resting shot instead of visibly
          // popping once the correct frame lands.
          if (t === 1) {
            const minAllowed = Math.floor(count * 0.9);
            for (let k = count - 1; k >= minAllowed; k--) {
              if (images[k] && images[k] !== 'loading' && images[k].complete) { draw(k); return; }
            }
            return;
          }

          // If resting at the start (t === 0), only draw from beginning
          // — same tightened window, mirrored.
          if (t === 0) {
            const maxAllowed = Math.ceil(count * 0.1);
            for (let k = 0; k <= maxAllowed; k++) {
              if (images[k] && images[k] !== 'loading' && images[k].complete) { draw(k); return; }
            }
            return;
          }

          for (let radius = 1; radius < count; radius++) {
            const lo = i - radius, hi = i + radius;
            if (t >= 0.5) {
              if (hi < count && images[hi] && images[hi] !== 'loading' && images[hi].complete) { draw(hi); return; }
              if (lo >= 0 && images[lo] && images[lo] !== 'loading' && images[lo].complete) { draw(lo); return; }
            } else {
              if (lo >= 0 && images[lo] && images[lo] !== 'loading' && images[lo].complete) { draw(lo); return; }
              if (hi < count && images[hi] && images[hi] !== 'loading' && images[hi].complete) { draw(hi); return; }
            }
          }
        },
        pause() {},
        release
      };
    };

    const getRoomMedia = (slideEl) => {
      if (!slideEl) return null;
      const canvasEl = slideEl.querySelector('[data-frame-canvas]');
      if (canvasEl) {
        const isMob = Boolean(isMobileMode() && canvasEl.dataset.framesBaseMobile);
        const modeKey = isMob ? 'mob' : 'desk';
        if (!canvasEl._seqCache) canvasEl._seqCache = {};
        if (!canvasEl._seqCache[modeKey]) {
          canvasEl._seqCache[modeKey] = createFrameSeq(canvasEl, isMob);
        }
        return canvasEl._seqCache[modeKey];
      }
      const videoEl = slideEl.querySelector('[data-room-video]');
      if (!videoEl) return null;
      return {
        kind: 'video',
        ready: !!videoEl.duration,
        setProgress(t) { videoEl.currentTime = t * videoEl.duration; },
        pause() { videoEl.pause(); },
      };
    };

    // Defensive cleanup: force every slide that ISN'T the active one
    // back to hidden, paused.
    const settleAllSlidesExcept = (keepEl) => {
      slides.forEach((s) => {
        if (s === keepEl) return;
        s.classList.remove('is-active');
        s.style.opacity = '0';
        getRoomMedia(s)?.pause();
      });
    };

    // Prime active slide + next adjacent slide ONLY (never load all 6 slides simultaneously)
    const primeSlide = (idx) => {
      if (idx >= 0 && idx < slides.length) {
        const media = getRoomMedia(slides[idx]);
        media?.startPreload?.();
      }
    };

    primeSlide(0);
    primeSlide(1);

    // Pre-warm en segundo plano: cuando el arranque se calmó, mete en la
    // caché HTTP las secuencias de todas las salas (de a una, sin
    // decodificar) y decodifica el primer/último frame de cada una. Así
    // tocar un botón del TV muestra el frame de descanso real al toque, y
    // scrollear después no espera red. El salto en sí ya es instantáneo:
    // la foto fija de cada sala se precarga en el <head>.
    const preWarmAll = () => {
      const seqs = slides
        .map((s) => getRoomMedia(s))
        .filter((m) => m && typeof m.warmCache === 'function');
      let idx = 0;
      const next = () => {
        if (idx >= seqs.length) return;
        seqs[idx++].warmCache();
        setTimeout(next, isMobileMode() ? 1200 : 600);
      };
      next();
    };
    const schedulePreWarm = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(preWarmAll, { timeout: 5000 });
      else setTimeout(preWarmAll, 3000);
    };
    if (document.readyState === 'complete') schedulePreWarm();
    else window.addEventListener('load', schedulePreWarm, { once: true });

    const finishTransition = (fromEl, toEl, index) => {
      toEl.classList.add('is-active');
      toEl.style.opacity = '';
      settleAllSlidesExcept(toEl);
      current = index;
      setDots(current);
      animating = false;

      // Sliding window: prime current and next slide
      primeSlide(index);
      primeSlide(index + 1);

      // On mobile, free GPU RAM from distant slides (2+ steps away)
      if (isMobileMode()) {
        slides.forEach((s, idx) => {
          if (Math.abs(idx - index) > 1) {
            getRoomMedia(s)?.release?.();
          }
        });
      }
      document.dispatchEvent(new CustomEvent('caller:slidechange', { detail: { index } }));
    };

    // Instant jump — used by dots, keyboard, and nav links (not the
    // scroll path below). A hard cut always has to land on the
    // target's own resting frame, no matter what frame its canvas
    // happens to be sitting on — it might never have been visited
    // (still frame 0), or might be mid-scrub from a hop that just got
    // interrupted (see goToSlide's hopTween.kill() above). Relying on
    // "it was probably left correct from a previous visit" is what
    // showed the wrong room's frame after a non-adjacent jump (e.g.
    // About -> Work, skipping System) or a jump that cut off a scroll
    // in progress.
    const simpleCrossfade = (fromEl, toEl, index, onDone) => {
      const toMedia = getRoomMedia(toEl);
      if (toMedia?.ready) toMedia.setProgress(1);
      // fromEl is deliberately left untouched: it's still fully
      // visible right up until this crossfade starts fading it out,
      // so redrawing its canvas here (this used to snap it to frame 0
      // on backward jumps) flashed a third, wrong frame on top of the
      // room the user could still see. Its next scroll-hop always
      // recomputes its frame fresh from that hop's own progress
      // anyway, so there's nothing to pre-reset for later.
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(fromEl, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
        .to(toEl, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 0);
    };

    goToSlide = (index) => {
      index = Math.max(0, Math.min(slides.length - 1, index));
      if (index === current || animating) return;
      // A scroll-driven hop can still be mid-flight here — `animating`
      // only flips true right at its very end (startHop's onComplete,
      // below), so a click/dot/keyboard jump during that ~2s window
      // used to sail through this guard, land on top of it, and then
      // get silently overwritten when the scroll hop's own onComplete
      // fired later and reasserted its own target. Kill it first so
      // only this jump lands.
      if (hopTween) {
        hopTween.kill();
        // Forward hop mid-flight: its destination (scrubTo) finished
        // fading in within the first 0.35s and has been the only
        // thing actually on screen since (its OWN frames keep
        // advancing on top of it) — but `current` doesn't catch up to
        // it until the hop's onComplete, which is never going to fire
        // now. Left as-is, the crossfade below reads `current` as
        // still the room the user already scrolled past, and fades
        // FROM there — flashing a room they'd already left behind
        // (e.g. Hero's title card) before landing on the clicked
        // target. Adopt the hop's destination as current so this
        // jump starts from what's actually visible right now.
        // Backward hops don't need this: the room being rewound IS
        // slides[current] already, so it's already correct.
        if (scrubDir === 1) current += 1;
        resetScrubState();
        // The interrupted hop may have been fading in a THIRD room —
        // neither this jump's fromEl nor its toEl (e.g. scrolling
        // About -> System, then clicking Work mid-walk) — left
        // sitting at partial opacity with whatever frame it was
        // mid-scrub. Settle everything back to hidden except the
        // room still actually on screen right now, immediately,
        // instead of waiting for this jump's own crossfade to finish
        // — otherwise that third room ghosts through for up to 0.6s.
        settleAllSlidesExcept(slides[current]);
        // slides[current]'s own canvas is deliberately left exactly
        // where the interrupted hop had it (mid-walk, mid-rewind,
        // whatever) — snapping it to its resting frame here was tried
        // and it was wrong: it's still fully visible at this point, so
        // that snap itself painted as a visible extra frame (old
        // frame -> resting frame -> Work's frame, three steps) before
        // the crossfade below even starts fading it out. Left alone,
        // it just fades out from wherever it was — one less step.
      }
      animating = true;
      document.dispatchEvent(new CustomEvent('caller:slidestart'));
      const fromEl = slides[current];
      const toEl = slides[index];
      simpleCrossfade(fromEl, toEl, index, () => finishTransition(fromEl, toEl, index));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

    // ============================================================
    // SCROLL-TRIGGERED WALK — a scroll gesture presses "play": it
    // launches a single smooth, fixed-duration, eased pass through
    // the hop. This was the version that read as best-connected —
    // the room-swap dissolve always has its full CUT_FADE window to
    // run in, so there's no arbitrary moment mid-scroll where a
    // half-loaded frame sequence gets revealed. The only real
    // complaint it had was pace, fixed by simply slowing it down —
    // far simpler than chasing loading-race bugs in a scroll-
    // proportional model. Still interruptible: reverse direction
    // mid-hop and it eases smoothly back the way it came.
    // ============================================================
    let scrubDir = 0;      // 0 = resting, 1 = toward current+1, -1 = toward current-1
    let scrubMedia = null;
    let scrubFrom = null;
    let scrubTo = null;
    let hopTween = null;
    // Default pace/curve for every hop except the ones overridden via
    // data-hop-duration / data-hop-ease on the canvas itself (see
    // "about", whose footage read as sped-up at the old 1.7s and
    // needed its own real-paced, linear treatment — but applying
    // that to every room made all of them feel slow, so it's opt-in
    // per room now instead of global).
    const HOP_DURATION = 2;
    const HOP_EASE = 'sine.inOut';
    // Filters out sub-pixel wheel/trackpad noise so it doesn't fire
    // (or reverse) a hop by accident.
    const SCRUB_INPUT_FLOOR = 5;
    // The room-swap dissolve, positioned at whichever end of the hop
    // the swap belongs on (see startHop) — short, but always given
    // its full window since the hop's total duration is fixed.
    const CUT_FADE = 0.35;

    const beginScrub = (dir) => {
      const targetIndex = current + dir;
      if (targetIndex < 0 || targetIndex >= slides.length) return false;
      const fromEl = slides[current];
      const toEl = slides[targetIndex];
      // Forward: the video lives in toEl (the room being arrived at),
      // so we dissolve into toEl right away and play its own footage
      // forward from frame 0. Backward: the video lives in fromEl
      // (the current room's OWN arrival clip, played in reverse), so
      // fromEl stays put and visible — toEl only dissolves in once
      // the rewind is fully complete.
      const media = dir === 1 ? getRoomMedia(toEl) : getRoomMedia(fromEl);
      if (!media?.ready) return false; // no media for this hop — nothing to scrub
      scrubDir = dir;
      scrubMedia = media;
      scrubFrom = fromEl;
      scrubTo = toEl;
      media.pause();
      settleAllSlidesExcept(fromEl); // belt-and-suspenders: nothing else lingers visible before this hop starts
      toEl.classList.add('is-scrubbing');
      // Start loading the room AFTER this one's destination right now,
      // not just once we've arrived — gives it the whole HOP_DURATION
      // as a head start instead of none, so a fast run through several
      // rooms in a row doesn't keep hitting a cold cache.
      if (dir === 1 && slides[targetIndex + 1]) getRoomMedia(slides[targetIndex + 1]);
      return true;
    };

    // Just clears the bookkeeping — used both when a hop completes
    // (finishTransition already set the right final opacities) and
    // when it's cancelled (cancelScrub below sets them back first).
    const resetScrubState = () => {
      if (scrubTo) scrubTo.classList.remove('is-scrubbing');
      scrubDir = 0;
      scrubMedia = null;
      scrubFrom = null;
      scrubTo = null;
      hopTween = null;
    };

    // Backing all the way out of a hop: the crossfade tween inside
    // the timeline already scrubbed opacity back to its resting state
    // as the playhead returned to 0, so there's nothing left to swap
    // by hand here — just clear the bookkeeping.
    const cancelScrub = () => {
      resetScrubState();
      document.dispatchEvent(new CustomEvent('caller:slidechange', { detail: { index: current } }));
    };

    // Presses play on a hop: one timeline owns the whole walk end to
    // end — the frame-scrub for its full duration, plus the opacity
    // dissolve at the room boundary — so speed, easing and the
    // crossfade are always exactly as designed. Being one timeline
    // also means reversing (see applyScrub) scrubs the crossfade back
    // smoothly too, for free.
    const startHop = (dir) => {
      if (!beginScrub(dir)) return false;
      document.dispatchEvent(new CustomEvent('caller:slidestart'));
      const duration = scrubMedia.duration || HOP_DURATION;
      const ease = scrubMedia.ease || HOP_EASE;
      const proxy = { p: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          const targetIndex = current + scrubDir;
          const fromEl = scrubFrom, toEl = scrubTo;
          animating = true;
          resetScrubState();
          finishTransition(fromEl, toEl, targetIndex);
        },
        onReverseComplete: cancelScrub,
      });
      tl.to(proxy, {
        p: 1,
        duration,
        ease,
        onUpdate: () => {
          const t = scrubDir === 1 ? proxy.p : 1 - proxy.p;
          scrubMedia.setProgress(t);
        },
      }, 0);
      // Only the INCOMING layer animates. scrubFrom just stays put at
      // full opacity underneath — it's on a lower z-index (see
      // .is-scrubbing in CSS) so scrubTo naturally covers it as it
      // fades in. Fading both simultaneously (the old approach) meant
      // that at the midpoint neither layer was fully opaque, letting
      // a sliver of the dark screen background behind both bleed
      // through — the residual flash. This way there's always at
      // least one fully opaque layer, so nothing behind either can
      // ever show.
      const fadeAt = dir === 1 ? 0 : Math.max(0, duration - CUT_FADE);
      tl.to(scrubTo, { opacity: 1, duration: CUT_FADE, ease: 'power1.inOut' }, fadeAt);
      hopTween = tl;
      return true;
    };

    const applyScrub = (deltaUnits) => {
      if (animating) return;
      if (Math.abs(deltaUnits) < SCRUB_INPUT_FLOOR) return;
      const wantsForward = deltaUnits > 0;
      if (scrubDir === 0) {
        startHop(wantsForward ? 1 : -1);
        return;
      }
      if (!hopTween) return;
      // Extra scrolling in the direction the hop is already playing
      // is ignored — one gesture, one clean walk at a fixed pace.
      // Scrolling the OTHER way reverses it smoothly.
      const inputMatchesHopDir = wantsForward === (scrubDir === 1);
      const isReversed = hopTween.reversed();
      if (inputMatchesHopDir && isReversed) hopTween.play();
      else if (!inputMatchesHopDir && !isReversed) hopTween.reverse();
    };

    // Watching a channel hides the deck visually but never touched
    // its scroll state — meaning a scroll here used to keep driving
    // the hidden deck in the background, so exiting could silently
    // land you on a different room than the one you left. Scroll now
    // just exits instead, which also fixes that for free.
    const isWatchingChannel = () => document.body.classList.contains('is-watching-channel');

    window.addEventListener('wheel', (e) => {
      // Detail open: let its panel scroll natively, don't drive the deck.
      if (document.querySelector('.work__detail.is-open')) return;
      e.preventDefault();
      if (isWatchingChannel()) { document.dispatchEvent(new CustomEvent('caller:exitchannel')); return; }
      applyScrub(e.deltaY);
    }, { passive: false });

    // Keyboard / dots still teleport instantly — scrubbing is a
    // scroll-specific gesture, an arrow key has no "how far".
    document.addEventListener('keydown', (e) => {
      const openDetail = document.querySelector('.work__detail.is-open');
      if (openDetail) {
        if (e.key === 'Escape') {
          const closeBtn = document.getElementById('work-detail-close');
          closeBtn?.click();
          return;
        }
        const scrollEl = openDetail.querySelector('#work-detail-scroll');
        if (scrollEl) {
          if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
            e.preventDefault();
            scrollEl.scrollTop += (e.key === ' ' ? 220 : 90);
            return;
          }
          if (['ArrowUp', 'PageUp'].includes(e.key)) {
            e.preventDefault();
            scrollEl.scrollTop -= 90;
            return;
          }
        }
        return;
      }

      if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); goToSlide(current + 1); }
      else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goToSlide(current - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
      else if (e.key === 'End') { e.preventDefault(); goToSlide(slides.length - 1); }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastY = null;
    let touchAccumY = 0;

    window.addEventListener('touchstart', (e) => { 
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchLastY = touchStartY; 
        touchAccumY = 0;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (document.querySelector('.work__detail.is-open')) return;
      if (touchLastY === null || !e.touches || !e.touches[0]) return;
      if (e.target && e.target.closest('#tv-controls, .tv-btn, .tv-knob, .tv-music, .deck-dots, .work__note, button, a, input, textarea, .system__slot, .system__mobile-nav, .work__detail')) return;

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dy = touchLastY - y;
      touchLastY = y;

      // Prevent native browser pull-to-refresh while swiping across rooms
      if (e.cancelable && Math.abs(y - touchStartY) > Math.abs(x - touchStartX)) {
        e.preventDefault();
      }

      if (isWatchingChannel()) { document.dispatchEvent(new CustomEvent('caller:exitchannel')); return; }
      
      touchAccumY += dy;
      if (Math.abs(touchAccumY) >= 12) {
        applyScrub(touchAccumY);
        touchAccumY = 0;
      }
    }, { passive: false });

    window.addEventListener('touchend', () => { touchLastY = null; });

    // Jump straight to a hash-linked slide on load, no animation.
    if (window.location && window.location.hash) {
      const target = document.querySelector(window.location.hash);
      const idx = target ? slides.indexOf(target) : -1;
      if (idx > 0) {
        slides[0].classList.remove('is-active');
        gsap.set(slides[0], { opacity: 0 });
        slides[idx].classList.add('is-active');
        gsap.set(slides[idx], { opacity: 1 });
        current = idx;
        setDots(current);
        const media = getRoomMedia(slides[idx]);
        if (media?.ready) media.setProgress(1);
        document.dispatchEvent(new CustomEvent('caller:slidechange', { detail: { index: idx } }));
      }
    }

    /* ============================================================
       SCROLL NUDGES — Idle hint timer for each room
       ============================================================ */
    const initScrollNudges = () => {
      const nudges = document.querySelectorAll('.room__scroll-nudge');
      let nudgeTimer = null;

      const hideAllNudges = () => {
        if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
        nudges.forEach(n => n.classList.remove('is-visible'));
      };

      const scheduleNudge = (slideIndex) => {
        hideAllNudges();
        if (slideIndex <= 0 || slideIndex >= 5) return; // 0 has hero signal; 5 is footer end

        const targetNudge = document.querySelector(`.room__scroll-nudge[data-slide="${slideIndex}"]`);
        if (!targetNudge) return;

        const isMobile = isPhoneLayout();

        // System room on mobile: wait until step 4 is reached
        if (slideIndex === 2 && isMobile) {
          const board = document.querySelector('.system__board');
          const slots = board ? board.querySelectorAll('.system__slot') : [];
          const dots = Array.from(document.querySelectorAll('.system__mobile-dot'));
          const activeDot = document.querySelector('.system__mobile-dot.is-active');
          const activeIdx = activeDot ? dots.indexOf(activeDot) : 0;
          if (activeIdx < slots.length - 1) return;
        }

        nudgeTimer = setTimeout(() => {
          const openDetail = document.querySelector('.work__detail.is-open');
          if (openDetail) return;
          // CTA: no asomar el nudge mientras el formulario está abierto.
          if (document.querySelector('#cta-form.is-active')) return;
          targetNudge.classList.add('is-visible');
        }, 3000);
      };

      // Click / tap on nudge advances to next slide
      nudges.forEach(n => {
        n.addEventListener('click', (e) => {
          e.stopPropagation();
          const slideIdx = parseInt(n.dataset.slide, 10);
          if (!isNaN(slideIdx)) {
            hideAllNudges();
            goToSlide(slideIdx + 1);
          }
        });
      });

      document.addEventListener('caller:slidechange', (e) => {
        if (e.detail && typeof e.detail.index === 'number') {
          scheduleNudge(e.detail.index);
        }
      });

      document.addEventListener('caller:detailclose', () => {
        scheduleNudge(current);
      });

      // CTA: ocultar al abrir el form; al cerrarlo, re-agendar a los 3s.
      document.addEventListener('caller:ctaformopen', hideAllNudges);
      document.addEventListener('caller:ctaformclose', () => {
        if (current === 4) scheduleNudge(4);
      });

      document.addEventListener('caller:slidestart', hideAllNudges);

      // Hide if work detail modal opens
      document.addEventListener('click', (e) => {
        if (e.target.closest('.work__note')) {
          hideAllNudges();
        }
      });

      // System mobile step 4 event
      document.addEventListener('caller:systemstep4', () => {
        if (current === 2 && isPhoneLayout()) {
          const targetNudge = document.querySelector('.room__scroll-nudge[data-slide="2"]');
          if (targetNudge) {
            hideAllNudges();
            targetNudge.classList.add('is-visible');
          }
        }
      });
    };
    initScrollNudges();
  };

  /* ============================================================
     6. TV CONTROLS — buttons living in the television panel.
     Pushbuttons re-dispatch a click on the matching nav link / dot,
     so they inherit the exact navigation logic wired above instead
     of duplicating it. Channel and Language are two-layer knobs —
     a fixed base plate under a cap image that rotates in CSS.
     ============================================================ */
  const initTvControls = () => {
    const panel = document.getElementById('tv-controls');
    if (!panel) return;

    // A burst of real TV static (random black/white noise drawn to a
    // low-res canvas, scaled up pixelated) — what channel-changing
    // actually looked like, not a flash. Retriggerable: a fresh call
    // just bumps the run id so any in-flight draw loop bails out.
    // `hold: true` keeps the noise running past `duration` until
    // releaseStatic() is called — used while a cold channel video is
    // still buffering so you see "tuning in", not black.
    const staticEl = document.getElementById('tv-static');
    const staticCtx = staticEl ? staticEl.getContext('2d') : null;
    let staticRun = 0;
    let staticHeld = false;
    const showStatic = (duration = 160, hold = false) => {
      if (!staticEl || !staticCtx) return;
      const myRun = ++staticRun;
      staticHeld = hold;
      const isPort = window.matchMedia('(orientation: portrait)').matches;
      const w = isPort ? 225 : 400;
      const h = isPort ? 400 : 225;
      staticEl.width = w;
      staticEl.height = h;
      staticEl.classList.add('is-active');
      const start = performance.now();
      const draw = (now) => {
        if (myRun !== staticRun) return;
        const imgData = staticCtx.createImageData(w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
        staticCtx.putImageData(imgData, 0, 0);
        if (staticHeld || now - start < duration) requestAnimationFrame(draw);
        else staticEl.classList.remove('is-active');
      };
      requestAnimationFrame(draw);
      if (!hold) {
        setTimeout(() => {
          if (myRun === staticRun && !staticHeld) staticEl.classList.remove('is-active');
        }, duration + 80);
      }
    };
    // Drop the hold: the current draw loop is already past its
    // `duration`, so it removes .is-active on its next frame.
    const releaseStatic = () => {
      staticHeld = false;
      if (staticEl) staticEl.classList.remove('is-active');
    };

    // Warm-up burst on load
    if (!reduceMotion) showStatic(window.matchMedia('(orientation: portrait)').matches ? 400 : 900);

    // Click for pushbuttons, dial-clunk for the two rotary knobs.
    const clickSound = new Audio('assets/tv/click.mp3');
    const dialSound = new Audio('assets/tv/dial.mp3');
    const playSound = (audio) => {
      try {
        audio.currentTime = 0;
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch (e) {}
    };

    // Background music — Call Me by Ivana (continuous looping track)
    const musicTrack = new Audio('assets/tv/callme.mp3');
    musicTrack.loop = true;
    musicTrack.volume = 0;
    const TARGET_VOLUME = 0.55;
    let musicFadeTween = null;

    const fadeMusicTo = (targetVol, duration = 3.0, onComplete) => {
      if (typeof gsap !== 'undefined') {
        if (musicFadeTween) musicFadeTween.kill();
        musicFadeTween = gsap.to(musicTrack, {
          volume: targetVol,
          duration,
          ease: 'power2.out',
          onComplete: () => {
            musicFadeTween = null;
            if (onComplete) onComplete();
          }
        });
      } else {
        musicTrack.volume = targetVol;
        if (onComplete) onComplete();
      }
    };

    // Work / About / Contact / Reset — direct instant navigation
    panel.querySelectorAll('.tv-btn[data-goto]').forEach((btn) => {
      let touchTriggered = false;
      const activate = (e) => {
        if (e.type === 'touchend') {
          touchTriggered = true;
          setTimeout(() => { touchTriggered = false; }, 400);
        } else if (e.type === 'click' && touchTriggered) {
          return;
        }

        playSound(clickSound);
        hideChannel();
        const targetSlide = parseInt(btn.dataset.goto, 10);
        if (btn.id !== 'tv-reset') pressTvBtn(btn.id);
        if (targetSlide === 0) {
          showStatic();
        }
        if (typeof goToSlide === 'function') {
          goToSlide(targetSlide);
        } else {
          document.querySelector(`.deck-dots__item[data-goto="${targetSlide}"]`)?.click();
        }
      };

      btn.addEventListener('touchend', activate, { passive: true });
      btn.addEventListener('click', activate);
    });

    // A button only lights up because IT was clicked — never just
    // because scrolling happened to land on its section. It only
    // releases when the slide actually changes away from it, no
    // matter how (another TV button, the dot nav, header nav, or
    // plain scroll).
    const slideToBtn = { 1: 'tv-work', 3: 'tv-about', 5: 'tv-contact' };
    let pressedBtnId = null;

    function pressTvBtn(btnId) {
      if (pressedBtnId && pressedBtnId !== btnId) {
        document.getElementById(pressedBtnId)?.classList.remove('is-current');
      }
      document.getElementById(btnId)?.classList.add('is-current');
      pressedBtnId = btnId;
    }
    document.addEventListener('caller:slidechange', (e) => {
      if (!pressedBtnId) return;
      const mappedSlide = Object.keys(slideToBtn).find((k) => slideToBtn[k] === pressedBtnId);
      if (Number(mappedSlide) !== e.detail.index) {
        document.getElementById(pressedBtnId)?.classList.remove('is-current');
        pressedBtnId = null;
      }
    });

    // Channel view — the 5 commercial parodies. Turning the knob
    // takes over the screen from the deck (which just fades out
    // underneath, still mounted); Work/About/Contact/Reset hand it
    // back. The card's punchline waits 2s after the clip starts,
    // timed in JS (not a CSS delay) so it restarts cleanly no
    // matter how fast someone spins the dial.
    const channelView = document.getElementById('channel-view');
    const channelVideos = channelView ? Array.from(channelView.querySelectorAll('.channel-view__video')) : [];
    const channelCard = document.getElementById('channel-card');
    const channelTitleEl = document.getElementById('channel-card-title');
    const channelTitleKeys = ['channel.realestate', 'channel.vet', 'channel.restaurant', 'channel.lawyer', 'channel.barber'];
    let channelCardTimer = null;

    // Los <video> de canales arrancan preload="none". Se adelanta el
    // primero que se va a mostrar (índice 1, el primer tick del dial)
    // en idle, y el siguiente cada vez que se mira uno — así girar el
    // dial no espera la descarga.
    const warmChannel = (i) => {
      const v = channelVideos[i];
      if (!v || v.dataset.warmed) return;
      v.dataset.warmed = '1';
      v.preload = 'auto';
      try { v.load(); } catch (e) {}
    };
    const scheduleChannelWarm = () => warmChannel(1);
    if ('requestIdleCallback' in window) requestIdleCallback(scheduleChannelWarm, { timeout: 8000 });
    else setTimeout(scheduleChannelWarm, 5000);

    // Point each video's poster at the orientation that matches the
    // <source> that'll actually play, so the still shown before the
    // stream arrives isn't a landscape frame crammed into a phone.
    const syncChannelPosters = () => {
      const port = window.matchMedia('(orientation: portrait)').matches;
      channelVideos.forEach((v) => {
        const base = v.dataset.poster;
        if (base) v.poster = `${base}${port ? 'c' : ''}.webp`;
      });
    };
    syncChannelPosters();
    window.matchMedia('(orientation: portrait)').addEventListener('change', syncChannelPosters);

    // Cancels the previous switch's tune-in wait so its timers can't
    // fire later and cut the static off a newer switch.
    let channelTuneCleanup = null;

    const showChannel = (index) => {
      document.body.classList.add('is-watching-channel');
      warmChannel((index + 1) % channelVideos.length);
      const target = channelVideos[index];
      channelVideos.forEach((v, i) => {
        const active = i === index;
        v.classList.toggle('is-active', active);
        if (active) { v.currentTime = 0; v.play().catch(() => {}); }
        else v.pause();
      });

      // Static covers the switch. Minimum 160ms (same as the RESET
      // button); if the channel's video still has no picture by then,
      // the snow holds until it can play — capped at 2.5s, after which
      // the channel's poster frame shows through. reduceMotion: no
      // noise, poster shows.
      if (channelTuneCleanup) channelTuneCleanup();
      if (!reduceMotion) {
        showStatic(160, true);
        const start = performance.now();
        let done = false;
        let waitTimer = null;
        const finish = () => {
          if (done) return;
          done = true;
          if (target) {
            target.removeEventListener('canplay', onReady);
            target.removeEventListener('playing', onReady);
          }
          clearTimeout(capTimer);
          clearTimeout(waitTimer);
          channelTuneCleanup = null;
          releaseStatic();
        };
        const onReady = () => {
          const elapsed = performance.now() - start;
          if (elapsed < 160) waitTimer = setTimeout(finish, 160 - elapsed);
          else finish();
        };
        const capTimer = setTimeout(finish, 2500);
        channelTuneCleanup = () => {
          if (target) {
            target.removeEventListener('canplay', onReady);
            target.removeEventListener('playing', onReady);
          }
          clearTimeout(capTimer);
          clearTimeout(waitTimer);
          channelTuneCleanup = null;
        };
        if (!target || target.readyState >= 3) {
          onReady();
        } else {
          target.addEventListener('canplay', onReady, { once: true });
          target.addEventListener('playing', onReady, { once: true });
        }
      }

      if (channelTitleEl) {
        const key = channelTitleKeys[index];
        channelTitleEl.dataset.i18n = key;
        channelTitleEl.textContent = I18N[currentLang][key];
      }
      if (channelCard) {
        channelCard.classList.remove('is-in');
        clearTimeout(channelCardTimer);
        channelCardTimer = setTimeout(() => channelCard.classList.add('is-in'), 2000);
      }
    };

    const hideChannel = () => {
      document.body.classList.remove('is-watching-channel');
      clearTimeout(channelCardTimer);
      if (channelTuneCleanup) channelTuneCleanup();
      releaseStatic();
      channelVideos.forEach((v) => v.pause());
      channelCard?.classList.remove('is-in');
    };

    // Scrolling is the gesture people already reach for everywhere
    // else on this site, so treat it as "get me out of here" while
    // watching a channel too — dispatched from the deck's own scroll
    // handler (different closure), same pattern as slidechange/
    // langchange. Deliberately doesn't touch the deck's own state:
    // that never moved while the channel was up, so this just
    // un-hides it — no jump to the start, no re-deriving "where was
    // I".
    document.addEventListener('caller:exitchannel', hideChannel);

    // Channel — rotates through 5 positions, one per commercial.
    // Starts at the first tick, not the middle.
    const channelBtn = document.getElementById('tv-channel');
    if (channelBtn) {
      const cap = channelBtn.querySelector('.tv-knob__cap');
      const positions = [-120, -85, -50, 0, 35]; // degrees — tune to match the 5 tick marks (1st-4th confirmed good; 5th pulled back a touch, was overshooting)
      let ci = 0;
      if (cap) cap.style.setProperty('--cap-rot', `${positions[ci]}deg`);
      channelBtn.addEventListener('click', () => {
        playSound(dialSound);
        ci = (ci + 1) % positions.length;
        if (cap) cap.style.setProperty('--cap-rot', `${positions[ci]}deg`);
        showChannel(ci);
      });
    }

    // Language knob — two positions, mirrors the header lang toggle
    // so both stay in sync no matter which one is used. The site
    // defaults to English, so the knob has to start pointed at EN
    // (left) and swing to ES (right) on click, not the other way.
    const langKnob = document.getElementById('tv-lang-knob');
    if (langKnob) {
      const cap = langKnob.querySelector('.tv-knob__cap');
      let on = false; // false = EN (default), true = ES
      if (cap) cap.style.setProperty('--cap-rot', '-92deg');
      langKnob.addEventListener('click', () => {
        playSound(dialSound);
        on = !on;
        if (cap) cap.style.setProperty('--cap-rot', on ? '12deg' : '-92deg');
        toggleLang();
      });
    }

    // Music — red/green pilot light tracks playback state. Same
    // touchend+click dance as the [data-goto] buttons above: a
    // click-only listener is what let mobile taps land inconsistently
    // (worked once, then the next tap didn't register) — touchend
    // fires immediately and reliably, and the flag stops the
    // synthetic click that follows it from toggling a second time.
    const musicBtn = document.getElementById('tv-music');
    if (musicBtn) {
      let musicTouchTriggered = false;
      const toggleMusic = (e) => {
        if (e.type === 'touchend') {
          musicTouchTriggered = true;
          setTimeout(() => { musicTouchTriggered = false; }, 400);
        } else if (e.type === 'click' && musicTouchTriggered) {
          return;
        }
        playSound(clickSound);
        const on = musicBtn.classList.toggle('is-on');
        if (on) {
          if (musicTrack.paused) {
            musicTrack.play().catch(() => {});
          }
          fadeMusicTo(TARGET_VOLUME, 3.2);
        } else {
          // iOS/Safari ignores JS volume changes on <audio> elements
          // (only the hardware buttons control it there), so fading
          // to volume 0 alone leaves the track audibly playing on
          // iPhone — the button flips to "off" but nothing actually
          // mutes. Pausing once the fade finishes guarantees real
          // silence on every platform, not just the ones that honor
          // .volume.
          fadeMusicTo(0, 1.2, () => musicTrack.pause());
        }
      };
      musicBtn.addEventListener('touchend', toggleMusic, { passive: true });
      musicBtn.addEventListener('click', toggleMusic);
    }
  };

  /* ============================================================
     DELAYED REVEALS — every room's text (.reveal-on-settle) waits
     until its hop has actually landed on the resting shot before
     showing — the "LINE STATUS" board, the empty desk, the note on
     the corkboard. Showing it the instant the slide becomes current
     beat the visitor to the frame it's reacting to. Slide 0 (hero)
     is deliberately excluded — nothing hops INTO it on first load,
     so it would never get a slidechange event to reveal on.
     ============================================================ */
  const revealTargets = {
    1: [document.querySelector('.work__board')],
    2: [document.querySelector('.system__board'), document.querySelector('.system__mobile-nav')],
    3: [document.querySelector('.about__copy')],
    4: [document.querySelector('.cta__inner')],
    5: [document.querySelector('.footer__content')],
  };
  const allRevealEls = Object.values(revealTargets).flat();
  let revealTimer = null;

  document.addEventListener('caller:slidestart', () => {
    allRevealEls.forEach((el) => el?.classList.remove('is-revealed'));
    clearTimeout(revealTimer);
  });

  document.addEventListener('caller:slidechange', (e) => {
    allRevealEls.forEach((el) => el?.classList.remove('is-revealed'));
    clearTimeout(revealTimer);
    const targets = revealTargets[e.detail.index];
    if (!targets) return;
    revealTimer = setTimeout(() => targets.forEach((el) => el?.classList.add('is-revealed')), 500);
  });

  const setupEverything = () => {
    initDeck();
    initTvControls();
    initLenis();
  };

  const ensureReady = () => {
    if (typeof gsap !== 'undefined') {
      setupEverything();
    } else {
      setTimeout(ensureReady, 20);
    }
  };

  if (document.readyState !== 'loading') ensureReady();
  else document.addEventListener('DOMContentLoaded', ensureReady);

})();
