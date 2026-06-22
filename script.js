/* =========================================================
   Providência Contabilidade — Landing Page JS (vanilla)
   Sem dependências de build. Apenas Lucide via CDN para ícones.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Utilitário: executar quando o DOM estiver pronto ---------- */
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  /* ---------- Ícones (Lucide) ---------- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ---------- Header: scroll sólido + barra de progresso ---------- */
  var header = document.getElementById("header");
  var progress = document.getElementById("progress");

  function onScroll() {
    var y = window.scrollY;

    if (header) {
      header.classList.toggle(
        "solid",
        y > 28 || header.classList.contains("menu-open")
      );
    }

    if (progress) {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = height > 0 ? Math.min(y / height, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var menuToggle = document.getElementById("menuToggle");
    var mobileNav = document.getElementById("mobileNav");

    function setMenu(open) {
      if (!header || !menuToggle) return;

      header.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = open ? "hidden" : "";

      onScroll();
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        setMenu(!header.classList.contains("menu-open"));
      });

      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          setMenu(false);
        });
      });
    }
  }

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  function initRevealOnScroll() {
    var revealEls = document.querySelectorAll("[data-reveal]");

    revealEls.forEach(function (el) {
      var delay = el.getAttribute("data-delay");
      if (delay) el.style.transitionDelay = delay + "ms";
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -80px 0px"
        }
      );

      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------- Accordion (FAQ) — single/collapsible ---------- */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
      var trigger = item.querySelector(".faq-item__trigger");
      var content = item.querySelector(".faq-item__content");

      if (trigger && content) {
        trigger.addEventListener("click", function () {
          var isOpen = item.classList.contains("open");

          faqItems.forEach(function (other) {
            other.classList.remove("open");

            var c = other.querySelector(".faq-item__content");
            if (c) c.style.maxHeight = null;
          });

          if (!isOpen) {
            item.classList.add("open");
            content.style.maxHeight = content.scrollHeight + "px";
          }
        });
      }
    });
  }

  /* ---------- Toast ---------- */
  function toast(message, type) {
    var stack = document.getElementById("toastStack");
    if (!stack) return;

    var el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = message;

    stack.appendChild(el);

    void el.offsetWidth;

    el.classList.add("show");

    setTimeout(function () {
      el.classList.remove("show");

      setTimeout(function () {
        el.remove();
      }, 300);
    }, 4000);
  }

  /* ---------- Formulário de contato ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var submitBtn = document.getElementById("submitBtn");

    if (!form || !submitBtn) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var message = form.message.value.trim();
      var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

      if (!name || !emailOk || !message) {
        toast("Verifique os campos e tente novamente.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      var whatsappMessage = encodeURIComponent(
        "Olá! Meu nome é " +
          name +
          ".\n\n" +
          "E-mail: " +
          email +
          "\n" +
          "Telefone: " +
          (phone || "Não informado") +
          "\n\n" +
          "Mensagem:\n" +
          message
      );

      setTimeout(function () {
        window.location.href =
          "https://wa.me/5566996764266?text=" + whatsappMessage;

        toast("Redirecionando para o WhatsApp...", "success");

        form.reset();

        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar mensagem <i data-lucide="send"></i>';

        renderIcons();
      }, 600);
    });
  }

  /* ---------- Ano no rodapé ---------- */
  function initFooterYear() {
    var yearEl = document.getElementById("year");

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /* ---------- Cards de Serviços: carrossel + flip ---------- */
  function initServicesCards() {
    var accordionContainer = document.querySelector("#accordionContainer");
    var cards = document.querySelectorAll("#servicos .accordion-item");

    if (!accordionContainer || !cards.length) return;

    var currentCard = 0;
    var startX = 0;
    var startY = 0;
    var isDragging = false;
    var suppressClickUntil = 0;

    function isMobile() {
      return window.matchMedia("(max-width: 768px)").matches;
    }

    function updateCarousel() {
      if (isMobile()) {
        accordionContainer.style.transform =
          "translateX(-" + currentCard * 100 + "%)";
      } else {
        accordionContainer.style.transform = "";
      }

      cards.forEach(function (card, index) {
        if (index !== currentCard) {
          card.classList.remove("is-flipped");
        }
      });
    }

    function goToCard(index) {
      currentCard = Math.max(0, Math.min(index, cards.length - 1));
      updateCarousel();
    }

    function handleSwipe(diffX, diffY) {
      if (!isMobile()) return;

      if (Math.abs(diffX) < 45 || Math.abs(diffX) < Math.abs(diffY)) {
        return;
      }

      suppressClickUntil = Date.now() + 350;

      var activeCard = cards[currentCard];
      var direction = diffX < 0 ? 1 : -1;

      if (!activeCard.classList.contains("is-flipped")) {
        activeCard.classList.add("is-flipped");
        return;
      }

      activeCard.classList.remove("is-flipped");
      goToCard(currentCard + direction);
    }

    cards.forEach(function (card, index) {
      card.addEventListener("click", function () {
        if (Date.now() < suppressClickUntil) return;

        if (isMobile()) {
          if (index === currentCard) {
            card.classList.toggle("is-flipped");
          }
        } else {
          card.classList.toggle("is-flipped");
        }
      });
    });

    if (window.PointerEvent) {
      accordionContainer.addEventListener("pointerdown", function (event) {
        if (!isMobile()) return;

        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;

        if (accordionContainer.setPointerCapture) {
          try {
            accordionContainer.setPointerCapture(event.pointerId);
          } catch (error) {
            // Evita erro em navegadores que não suportam captura corretamente.
          }
        }
      });

      accordionContainer.addEventListener("pointerup", function (event) {
        if (!isMobile() || !isDragging) return;

        isDragging = false;

        var endX = event.clientX;
        var endY = event.clientY;

        var diffX = endX - startX;
        var diffY = endY - startY;

        handleSwipe(diffX, diffY);
      });

      accordionContainer.addEventListener("pointercancel", function () {
        isDragging = false;
      });
    } else {
      accordionContainer.addEventListener(
        "touchstart",
        function (event) {
          if (!isMobile()) return;

          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        },
        { passive: true }
      );

      accordionContainer.addEventListener(
        "touchend",
        function (event) {
          if (!isMobile()) return;

          var endX = event.changedTouches[0].clientX;
          var endY = event.changedTouches[0].clientY;

          var diffX = endX - startX;
          var diffY = endY - startY;

          handleSwipe(diffX, diffY);
        },
        { passive: true }
      );
    }

    window.addEventListener("resize", function () {
      goToCard(currentCard);
    });

    goToCard(0);
  }

  /* ---------- Carrossel infinito de clientes ---------- */
  function initClientsMarquee() {
    var clientsList = document.querySelector(".clients__list");

    if (!clientsList) return;

    var originalItems = Array.prototype.slice.call(clientsList.children);

    if (!originalItems.length) return;

    if (clientsList.getAttribute("data-marquee-ready") !== "true") {
      originalItems.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clientsList.appendChild(clone);
      });

      clientsList.setAttribute("data-marquee-ready", "true");
    }

    var position = 0;
    var speed = 0.7;
    var paused = false;

    clientsList.addEventListener("mouseenter", function () {
      paused = true;
    });

    clientsList.addEventListener("mouseleave", function () {
      paused = false;
    });

    function animate() {
      if (!paused) {
        position -= speed;

        var halfWidth = clientsList.scrollWidth / 2;

        if (Math.abs(position) >= halfWidth) {
          position = 0;
        }

        clientsList.style.transform =
          "translate3d(" + position + "px, 0, 0)";
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ---------- Init Geral da Aplicação ---------- */
  ready(function () {
    renderIcons();
    onScroll();

    initMobileMenu();
    initRevealOnScroll();
    initFaqAccordion();
    initContactForm();
    initFooterYear();
    initServicesCards();
    initClientsMarquee();

    /*
      Mantive essas chamadas de forma segura.
      Se essas funções existirem em outro arquivo, elas serão executadas.
      Se não existirem, o JavaScript não quebra.
    */
    if (typeof initImageAccordion === "function") {
      initImageAccordion();
    }

    if (typeof initBlogCards === "function") {
      initBlogCards();
    }
  });
})();