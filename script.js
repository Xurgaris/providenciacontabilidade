/* =========================================================
   Providência Contabilidade — Landing Page JS (vanilla)
   Sem dependências de build. Apenas Lucide via CDN para ícones.
   ========================================================= */
(function () {
  "use strict";

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
    if (header && progress) {
      header.classList.toggle("solid", y > 28 || header.classList.contains("menu-open"));
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = height > 0 ? Math.min(y / height, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
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

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
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
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Accordion (FAQ) — single/collapsible ---------- */
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

  /* ---------- Toast ---------- */
  function toast(message, type) {
    var stack = document.getElementById("toastStack");
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = message;
    stack.appendChild(el);
    void el.offsetWidth; // Força reflow
    el.classList.add("show");
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 4000);
  }

  /* ---------- Formulário de contato ---------- */
  var form = document.getElementById("contactForm");
  var submitBtn = document.getElementById("submitBtn");

  if (form && submitBtn) {
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
        "Olá! Meu nome é " + name + ".\n\n" +
        "E-mail: " + email + "\n" +
        "Telefone: " + (phone || "Não informado") + "\n\n" +
        "Mensagem:\n" + message
      );

      setTimeout(function () {
        window.location.href = "https://wa.me/5566999999999?text=" + whatsappMessage;
        toast("Redirecionando para o WhatsApp...", "success");
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar mensagem <i data-lucide="send"></i>';
        renderIcons();
      }, 600);
    });
  }

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- NOVO: Acordeão de Imagens (Gen-AI Section) ---------- */
  function initImageAccordion() {
    var accordionContainer = document.getElementById('accordionContainer');
    if (!accordionContainer) return;
    
    var items = accordionContainer.querySelectorAll('.accordion-item');
    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        items.forEach(function (el) { el.classList.remove('active'); });
        item.classList.add('active');
      });
    });
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

 
  
  function animate() {
    if (!paused) {
      position -= speed;

      var halfWidth = clientsList.scrollWidth / 2;

      if (Math.abs(position) >= halfWidth) {
        position = 0;
      }

      clientsList.style.transform = "translate3d(" + position + "px, 0, 0)";
    }

    requestAnimationFrame(animate);
  }

  animate();
}

  /* ---------- Blog Cards: buscar 3 posts mais recentes do Firebase ---------- */
  function initBlogCards() {
    var firebaseConfig = {
      apiKey: "AIzaSyCKqpE1brE6kHYmvJrKMVfpI3AJmyh61zM",
      authDomain: "contabilidadecampoverde-416cf.firebaseapp.com",
      projectId: "contabilidadecampoverde-416cf",
      storageBucket: "contabilidadecampoverde-416cf.firebasestorage.app",
      messagingSenderId: "207228669111",
      appId: "1:207228669111:web:d59374813554d0180f9132"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    var db = firebase.firestore();

    db.collection("posts")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .limit(3)
      .get()
      .then(function(snapshot) {
        var cards = [
          document.getElementById("blog-card-1"),
          document.getElementById("blog-card-2"),
          document.getElementById("blog-card-3")
        ];

        if (!snapshot.empty) {
          snapshot.docs.forEach(function(doc, index) {
            var post = doc.data();
            var card = cards[index];

            if (card) {
              var cat = card.querySelector(".post-card__cat");
              var date = card.querySelector(".post-card__date");
              var title = card.querySelector("h3");
              var excerpt = card.querySelector(".post-card__excerpt");
              var link = card.querySelector(".post-card__more");
              var imgDiv = card.querySelector(".post-card__img div");

              if (cat) cat.textContent = post.tags && post.tags.length > 0 ? post.tags[0] : "Artigo";
              if (date) {
                var pubDate = post.publishedAt ? new Date(post.publishedAt.toMillis ? post.publishedAt.toMillis() : post.publishedAt) : new Date();
                date.innerHTML = '<i data-lucide="calendar-days"></i> ' + pubDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
              }
              if (title) title.textContent = post.title || "";
              if (excerpt) excerpt.textContent = post.excerpt || "";
              if (link) link.parentElement.href = "blog-firebase/index.html?slug=" + (post.slug || "");
              if (imgDiv && post.coverImage && post.coverImage.url) {
                imgDiv.style.background = "url(" + post.coverImage.url + ") center/cover no-repeat";
              }
            }
          });
        }

        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      })
      .catch(function(error) {
        console.error("Erro ao buscar posts do blog:", error);
      });
  }

  /* ---------- Init Geral da Aplicação ---------- */
  renderIcons();
  onScroll();
  initImageAccordion();
  initClientsMarquee();
  initBlogCards();
})();
