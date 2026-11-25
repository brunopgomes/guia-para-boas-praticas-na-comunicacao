/* ==========================================================================
   GUIA DE BOAS PRÁTICAS — interações em JavaScript puro
   Sem frameworks ou dependências externas.
   ========================================================================== */

// Sinaliza que o JS está ativo para habilitar animações de entrada com fallback seguro.
document.documentElement.classList.add("js-ready");

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     1. MENU MOBILE (botão, clique em âncoras, tecla Esc e clique externo)
     ------------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  const setMenuOpen = (isOpen) => {
    if (!menuButton || !nav) return;
    nav.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  };

  menuButton?.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("open");
    setMenuOpen(willOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      setMenuOpen(false);
      menuButton?.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("open")) return;
    if (!header?.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && nav?.classList.contains("open")) {
      setMenuOpen(false);
    }
  });

  /* ------------------------------------------------------------------------
     2. ESTADO DO CABEÇALHO AO ROLAR A PÁGINA
     ------------------------------------------------------------------------ */
  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------------
     3. ANIMAÇÕES DISCRETAS DE ENTRADA COM INTERSECTIONOBSERVER
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll(".reveal");

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
     4. DESTAQUE SUTIL DA SEÇÃO ATIVA NA NAVEGAÇÃO
     ------------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cta)'));
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeId = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            const isCurrent = link.getAttribute("href") === activeId;
            link.classList.toggle("is-active", isCurrent);
            if (isCurrent) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    observedSections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------------
     5. MOVIMENTO SUTIL DE PROFUNDIDADE NA CAPA (SOMENTE DESKTOP COM MOUSE)
     ------------------------------------------------------------------------ */
  const heroVisual = document.querySelector(".hero-visual");
  const cover = document.querySelector(".cover-wrap");
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (heroVisual && cover && !reduceMotion && hasFinePointer) {
    heroVisual.addEventListener("pointerenter", () => {
      cover.classList.add("is-tracking");
    });

    heroVisual.addEventListener("pointermove", (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      cover.style.setProperty("--cover-rot", `${(3 + x * 4.5).toFixed(2)}deg`);
      cover.style.setProperty("--cover-tx", `${(x * 10).toFixed(1)}px`);
      cover.style.setProperty("--cover-ty", `${(y * 8).toFixed(1)}px`);
    });

    heroVisual.addEventListener("pointerleave", () => {
      cover.classList.remove("is-tracking");
      cover.style.removeProperty("--cover-rot");
      cover.style.removeProperty("--cover-tx");
      cover.style.removeProperty("--cover-ty");
    });
  }

  /* ------------------------------------------------------------------------
     6. PLACEHOLDERS TEMPORÁRIOS OFFLINE PARA IMAGENS AINDA NÃO ADICIONADAS
     Mantém os nomes reais em assets/ intactos no HTML.
     ------------------------------------------------------------------------ */
  const buildPlaceholderSvg = (title, filePath, theme) => {
    const isNavy = theme === "navy";
    const bg = isNavy ? "#0b376d" : "#f4f2ea";
    const border = isNavy ? "#2a578f" : "#d5dce6";
    const heading = isNavy ? "#ffffff" : "#0b376d";
    const sub = isNavy ? "#c8d7e7" : "#5d6c7e";
    const accent = "#ffb915";

    const escapeXml = (text) =>
      String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
        <rect width="600" height="760" fill="${bg}"/>
        <rect x="28" y="28" width="544" height="704" rx="10" fill="none" stroke="${border}" stroke-width="2" stroke-dasharray="8 8"/>
        <rect x="260" y="302" width="80" height="6" rx="3" fill="${accent}"/>
        <text x="300" y="360" text-anchor="middle" font-family="Manrope, Segoe UI, Arial, sans-serif" font-size="28" font-weight="800" fill="${heading}">${escapeXml(title)}</text>
        <text x="300" y="404" text-anchor="middle" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="18" font-weight="500" fill="${sub}">${escapeXml(filePath)}</text>
        <text x="300" y="446" text-anchor="middle" font-family="DM Sans, Segoe UI, Arial, sans-serif" font-size="15" fill="${sub}">Espaço reservado para imagem</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const applyPlaceholderIfMissing = (img) => {
    if (img.dataset.placeholderApplied === "true") return;
    img.dataset.placeholderApplied = "true";
    img.classList.add("is-placeholder");
    img.src = buildPlaceholderSvg(
      img.dataset.placeholderTitle || "Imagem do guia",
      img.dataset.placeholderFile || "",
      img.dataset.placeholderTheme || "light"
    );
  };

  document.querySelectorAll("img[data-placeholder-file]").forEach((img) => {
    img.addEventListener("error", () => applyPlaceholderIfMissing(img));
    if (img.complete && img.naturalWidth === 0) {
      applyPlaceholderIfMissing(img);
    }
  });

  /* ------------------------------------------------------------------------
     7. PROTEÇÃO PARA LINK AINDA NÃO CONFIGURADO (href="#")
     ------------------------------------------------------------------------ */
  const articleLink = document.querySelector(".access-secondary");
  articleLink?.addEventListener("click", (event) => {
    if (articleLink.getAttribute("href") === "#") {
      event.preventDefault();
    }
  });
});
