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
          "https://wa.me/5566996958300?text=" + whatsappMessage;

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

  function initServicesCards() {
  var accordionContainer = document.querySelector("#accordionContainer");
  var cards = document.querySelectorAll("#servicos .accordion-item");

  if (!accordionContainer || !cards.length) return;

  var currentCard = 0;
  var startX = 0;
  var startY = 0;
  var isDragging = false;
  var suppressClickUntil = 0;

  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");

  function isCarouselMode() {
    return window.matchMedia("(max-width: 1440px)").matches;
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = currentCard === 0;
    nextBtn.disabled = currentCard === cards.length - 1;

    prevBtn.classList.toggle("is-disabled", currentCard === 0);
    nextBtn.classList.toggle("is-disabled", currentCard === cards.length - 1);
  }

  function updateCarousel() {
    if (isCarouselMode()) {
      var firstCardOffset = cards[0].offsetLeft;
      var activeCardOffset = cards[currentCard].offsetLeft;
      var offset = activeCardOffset - firstCardOffset;

      accordionContainer.style.transform = "translate3d(-" + offset + "px, 0, 0)";
    } else {
      accordionContainer.style.transform = "";
    }

    cards.forEach(function (card, index) {
      if (index !== currentCard) {
        card.classList.remove("is-flipped");
      }
    });

    updateArrows();
  }

  function goToCard(index) {
    currentCard = Math.max(0, Math.min(index, cards.length - 1));
    updateCarousel();
  }

  function handleSwipe(diffX, diffY) {
    if (!isCarouselMode()) return;

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

      if (isCarouselMode()) {
        if (index === currentCard) {
          card.classList.toggle("is-flipped");
        } else {
          goToCard(index);
        }
      } else {
        card.classList.toggle("is-flipped");
      }
    });
  });

  if (window.PointerEvent) {
    accordionContainer.addEventListener("pointerdown", function (event) {
      if (!isCarouselMode()) return;

      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;

      if (accordionContainer.setPointerCapture) {
        try {
          accordionContainer.setPointerCapture(event.pointerId);
        } catch (error) {}
      }
    });

    accordionContainer.addEventListener("pointerup", function (event) {
      if (!isCarouselMode() || !isDragging) return;

      isDragging = false;

      var diffX = event.clientX - startX;
      var diffY = event.clientY - startY;

      handleSwipe(diffX, diffY);
    });

    accordionContainer.addEventListener("pointercancel", function () {
      isDragging = false;
    });
  } else {
    accordionContainer.addEventListener(
      "touchstart",
      function (event) {
        if (!isCarouselMode()) return;

        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      },
      { passive: true }
    );

    accordionContainer.addEventListener(
      "touchend",
      function (event) {
        if (!isCarouselMode()) return;

        var diffX = event.changedTouches[0].clientX - startX;
        var diffY = event.changedTouches[0].clientY - startY;

        handleSwipe(diffX, diffY);
      },
      { passive: true }
    );
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      goToCard(currentCard - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      goToCard(currentCard + 1);
    });
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

  /* ---------- Dados do Blog (para cards da home) ---------- */
  var blogPostsHome = [
    {
      id: 1,
      title: "Como organizar a contabilidade da sua empresa antes que os problemas apareçam",
      slug: "como-organizar-contabilidade-empresa",
      category: "Gestão Contábil",
      image: "https://placehold.co/600x400/1e40af/ffffff?text=Contabilidade",
      publishedAt: "2026-06-22T09:30:00",
      readTime: "5 min",
      excerpt: "A contabilidade não deve ser lembrada apenas quando o imposto vence. Veja como transformar números em controle, previsibilidade e segurança."
    },
    {
      id: 2,
      title: "Simples Nacional: quando ele ajuda e quando pode limitar o crescimento",
      slug: "simples-nacional-ajuda-ou-limita",
      category: "Impostos",
      image: "https://placehold.co/600x400/991b1b/ffffff?text=Impostos",
      publishedAt: "2026-06-20T14:10:00",
      readTime: "6 min",
      excerpt: "O Simples Nacional pode ser vantajoso, mas nem sempre é a melhor escolha. Entenda quando vale a pena revisar o enquadramento tributário."
    },
    {
      id: 3,
      title: "MEI precisa de contador? Entenda onde começam os riscos",
      slug: "mei-precisa-de-contador",
      category: "MEI",
      image: "https://placehold.co/600x400/166534/ffffff?text=MEI",
      publishedAt: "2026-06-18T11:45:00",
      readTime: "4 min",
      excerpt: "O MEI é simples, mas não é livre de obrigações. Veja em quais situações o apoio contábil evita problemas e prepara a evolução do negócio."
    },
    {
      id: 4,
      title: "Fluxo de caixa: o relatório que todo empresário deveria olhar toda semana",
      slug: "fluxo-de-caixa-empresarial",
      category: "Gestão Financeira",
      image: "https://placehold.co/600x400/581c87/ffffff?text=Fluxo+de+Caixa",
      publishedAt: "2026-06-16T16:20:00",
      readTime: "5 min",
      excerpt: "Vender bem não significa ter dinheiro sobrando. O fluxo de caixa mostra se a empresa realmente consegue sustentar suas operações."
    },
    {
      id: 5,
      title: "Pró-labore: por que o dono da empresa não deve retirar dinheiro sem controle",
      slug: "pro-labore-retirada-socios",
      category: "Sócios",
      image: "https://placehold.co/600x400/9a3412/ffffff?text=Pro-Labore",
      publishedAt: "2026-06-14T10:00:00",
      readTime: "5 min",
      excerpt: "Misturar finanças pessoais e empresariais prejudica a gestão e pode gerar riscos fiscais. O pró-labore ajuda a profissionalizar a retirada dos sócios."
    },
    {
      id: 6,
      title: "Abertura de empresa: o que decidir antes de emitir o primeiro CNPJ",
      slug: "abertura-de-empresa-cnpj",
      category: "Abertura de Empresa",
      image: "https://placehold.co/600x400/854d0e/ffffff?text=Abertura+de+Empresa",
      publishedAt: "2026-06-12T13:40:00",
      readTime: "6 min",
      excerpt: "Abrir uma empresa não é apenas escolher um nome. Natureza jurídica, CNAE, regime tributário e planejamento inicial fazem diferença."
    },
    {
      id: 7,
      title: "Nota fiscal: erros simples que podem gerar dor de cabeça para a empresa",
      slug: "erros-na-emissao-de-nota-fiscal",
      category: "Fiscal",
      image: "https://placehold.co/600x400/9d174d/ffffff?text=Nota+Fiscal",
      publishedAt: "2026-06-10T08:50:00",
      readTime: "4 min",
      excerpt: "Emitir nota fiscal parece simples, mas erros em serviço, código, valor ou imposto podem gerar inconsistências e retrabalho."
    },
    {
      id: 8,
      title: "Folha de pagamento: por que pequenas falhas podem sair caro",
      slug: "folha-de-pagamento-cuidados",
      category: "Departamento Pessoal",
      image: "https://placehold.co/600x400/0e7490/ffffff?text=Folha+de+Pagamento",
      publishedAt: "2026-06-08T15:15:00",
      readTime: "5 min",
      excerpt: "Salários, encargos, férias, rescisões e benefícios exigem controle. Uma folha mal calculada afeta caixa, equipe e obrigações legais."
    },
    {
      id: 9,
      title: "Planejamento tributário: pagar menos imposto sem colocar a empresa em risco",
      slug: "planejamento-tributario-empresa",
      category: "Impostos",
      image: "https://placehold.co/600x400/7c2d12/ffffff?text=Planejamento+Tributário",
      publishedAt: "2026-06-06T09:05:00",
      readTime: "7 min",
      excerpt: "Reduzir impostos de forma legal exige análise, projeção e acompanhamento. O planejamento tributário evita decisões baseadas em achismo."
    },
    {
      id: 10,
      title: "Indicadores financeiros que mostram se sua empresa está saudável",
      slug: "indicadores-financeiros-empresa-saudavel",
      category: "Gestão Financeira",
      image: "https://placehold.co/600x400/4c1d95/ffffff?text=Indicadores+Financeiros",
      publishedAt: "2026-06-04T17:30:00",
      readTime: "6 min",
      excerpt: "Lucro, margem, endividamento e caixa precisam ser acompanhados juntos. Um único número não mostra a realidade completa do negócio."
    }
  ];

  function formatDateHome(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function initBlogCards() {
    var card1 = document.getElementById("blog-card-1");
    var card2 = document.getElementById("blog-card-2");
    var card3 = document.getElementById("blog-card-3");

    if (!card1 || !card2 || !card3) return;

    // Ordenar posts por data (mais recentes primeiro) e pegar os 3 últimos
    var sortedPosts = blogPostsHome.slice().sort(function(a, b) {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    var latestPosts = sortedPosts.slice(0, 3);

    // Atualizar card 1
    if (latestPosts[0]) {
      var post1 = latestPosts[0];
      card1.querySelector(".post-card__img div").style.backgroundImage = "linear-gradient(135deg, rgba(5, 5, 5, 0.10), rgba(5, 5, 5, 0.68)), url('" + post1.image + "')";
      card1.querySelector(".post-card__cat").textContent = post1.category;
      card1.querySelector(".post-card__date").innerHTML = '<i data-lucide="calendar-days"></i> ' + formatDateHome(post1.publishedAt);
      card1.querySelector("h3").textContent = post1.title;
      card1.querySelector(".post-card__excerpt").textContent = post1.excerpt;
      card1.querySelector("a").href = "blog/blog.html";
    }

    // Atualizar card 2
    if (latestPosts[1]) {
      var post2 = latestPosts[1];
      card2.querySelector(".post-card__img div").style.backgroundImage = "linear-gradient(135deg, rgba(5, 5, 5, 0.10), rgba(5, 5, 5, 0.68)), url('" + post2.image + "')";
      card2.querySelector(".post-card__cat").textContent = post2.category;
      card2.querySelector(".post-card__date").innerHTML = '<i data-lucide="calendar-days"></i> ' + formatDateHome(post2.publishedAt);
      card2.querySelector("h3").textContent = post2.title;
      card2.querySelector(".post-card__excerpt").textContent = post2.excerpt;
      card2.querySelector("a").href = "blog/blog.html";
    }

    // Atualizar card 3
    if (latestPosts[2]) {
      var post3 = latestPosts[2];
      card3.querySelector(".post-card__img div").style.backgroundImage = "linear-gradient(135deg, rgba(5, 5, 5, 0.10), rgba(5, 5, 5, 0.68)), url('" + post3.image + "')";
      card3.querySelector(".post-card__cat").textContent = post3.category;
      card3.querySelector(".post-card__date").innerHTML = '<i data-lucide="calendar-days"></i> ' + formatDateHome(post3.publishedAt);
      card3.querySelector("h3").textContent = post3.title;
      card3.querySelector(".post-card__excerpt").textContent = post3.excerpt;
      card3.querySelector("a").href = "blog/blog.html";
    }

    // Re-renderizar ícones Lucide
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
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
    initBlogCards();

    /*
      Mantive essas chamadas de forma segura.
      Se essas funções existirem em outro arquivo, elas serão executadas.
      Se não existirem, o JavaScript não quebra.
    */
    if (typeof initImageAccordion === "function") {
      initImageAccordion();
    }
  });
})();
