(() => {
  const menuButton = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Abrir menu";
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menuButton.querySelector(".sr-only").textContent = open ? "Abrir menu" : "Fechar menu";
      navigation.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });

    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1020) closeMenu();
    });
  }

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-slide]")];
    const dots = [...carousel.querySelectorAll("[data-dot]")];
    const previousButton = carousel.querySelector("[data-previous]");
    const nextButton = carousel.querySelector("[data-next]");
    const playButton = carousel.querySelector("[data-play]");
    const playIcon = carousel.querySelector("[data-play-icon]");
    const counter = carousel.querySelector("[data-counter]");
    const announcement = carousel.querySelector("[data-carousel-announcement]");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let userPaused = motionPreference.matches;
    let interactionPaused = false;
    let pageHidden = document.hidden;
    let timer = 0;
    let pointerStart = null;

    const isPaused = () => userPaused || interactionPaused || pageHidden;

    const updatePlayButton = () => {
      const paused = isPaused();
      playButton.setAttribute("aria-pressed", String(paused));
      playButton.setAttribute("aria-label", paused ? "Iniciar apresentação automática" : "Pausar apresentação automática");
      playIcon.textContent = paused ? "▶" : "Ⅱ";
    };

    const stopTimer = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };

    const startTimer = () => {
      stopTimer();
      updatePlayButton();
      if (isPaused()) return;
      timer = window.setInterval(() => showSlide(current + 1, false), 7000);
    };

    const showSlide = (index, announce = true) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
        slide.inert = !active;
      });
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === current;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      counter.value = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      counter.textContent = counter.value;
      if (announce) announcement.textContent = `Slide ${current + 1} de ${slides.length}.`;
    };

    previousButton.addEventListener("click", () => {
      showSlide(current - 1);
      startTimer();
    });

    nextButton.addEventListener("click", () => {
      showSlide(current + 1);
      startTimer();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startTimer();
      });
    });

    playButton.addEventListener("click", () => {
      userPaused = !userPaused;
      startTimer();
    });

    carousel.addEventListener("pointerenter", () => {
      interactionPaused = true;
      startTimer();
    });

    carousel.addEventListener("pointerleave", () => {
      interactionPaused = false;
      startTimer();
    });

    carousel.addEventListener("focusin", () => {
      interactionPaused = true;
      startTimer();
    });

    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        interactionPaused = false;
        startTimer();
      }
    });

    carousel.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") pointerStart = event.clientX;
    });

    carousel.addEventListener("pointerup", (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 45) return;
      showSlide(distance > 0 ? current - 1 : current + 1);
      startTimer();
    });

    document.addEventListener("visibilitychange", () => {
      pageHidden = document.hidden;
      startTimer();
    });

    motionPreference.addEventListener("change", (event) => {
      if (event.matches) userPaused = true;
      startTimer();
    });

    showSlide(0, false);
    startTimer();
  }

  const agenda = document.querySelector("[data-agenda]");

  if (agenda) {
    const tabs = [...agenda.querySelectorAll("[data-agenda-tab]")];
    const panels = [...agenda.querySelectorAll("[data-agenda-panel]")];

    const selectTab = (index, focus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== index;
      });
      if (focus) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(index));
      tab.addEventListener("keydown", (event) => {
        let target = index;
        if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(target, true);
      });
    });
  }

  const registrationForm = document.querySelector("[data-registration-form]");

  if (registrationForm) {
    const formCard = document.querySelector("[data-form-card]");
    const submitButton = registrationForm.querySelector("[data-submit]");
    const errorBox = registrationForm.querySelector("[data-form-error]");
    const successView = formCard.querySelector("[data-success]");
    const closedView = formCard.querySelector("[data-closed]");
    const protocolField = successView.querySelector("[data-protocol]");
    const newRegistrationButton = successView.querySelector("[data-new-registration]");
    const dayFields = [...registrationForm.querySelectorAll('input[name="days"]')];
    const deadline = new Date("2026-10-18T03:00:00.000Z");
    const endpoint = "https://ucpel-summit.morgana-azevedo.chatgpt.site/api/inscricoes";

    const showError = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const clearError = () => {
      errorBox.textContent = "";
      errorBox.hidden = true;
    };

    const validateDays = () => {
      const selected = dayFields.some((field) => field.checked);
      dayFields[0].setCustomValidity(selected ? "" : "Selecione ao menos um dia.");
      return selected;
    };

    const updateDeadline = () => {
      if (Date.now() < deadline.getTime()) return;
      registrationForm.hidden = true;
      successView.hidden = true;
      closedView.hidden = false;
    };

    dayFields.forEach((field) => field.addEventListener("change", validateDays));
    registrationForm.addEventListener("input", clearError);

    registrationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearError();
      validateDays();

      if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
      }

      const data = new FormData(registrationForm);
      const payload = {
        fullName: String(data.get("fullName") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        institution: String(data.get("institution") || "").trim(),
        course: String(data.get("course") || "").trim(),
        participantType: String(data.get("participantType") || ""),
        days: data.getAll("days").map(String),
        accessibility: String(data.get("accessibility") || "").trim(),
        consent: data.get("consent") === "on",
        website: String(data.get("website") || "")
      };

      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.textContent = "Enviando inscrição";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        let result = {};
        try {
          result = await response.json();
        } catch {
          result = {};
        }

        if (!response.ok || !result.protocol) {
          throw new Error(result.error || "Não foi possível concluir a inscrição.");
        }

        protocolField.textContent = result.protocol;
        registrationForm.hidden = true;
        closedView.hidden = true;
        successView.hidden = false;
        successView.focus?.();
        successView.scrollIntoView({ behavior: "smooth", block: "center" });
        registrationForm.reset();
        validateDays();
      } catch (error) {
        const message = error instanceof TypeError
          ? "Não foi possível conectar ao serviço de inscrições. Verifique sua conexão e tente novamente."
          : error.message || "Não foi possível concluir a inscrição.";
        showError(message);
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        submitButton.textContent = "Confirmar inscrição";
      }
    });

    newRegistrationButton.addEventListener("click", () => {
      successView.hidden = true;
      registrationForm.hidden = false;
      clearError();
      registrationForm.querySelector('input[name="fullName"]').focus();
    });

    validateDays();
    updateDeadline();
    window.setInterval(updateDeadline, 60000);
  }
})();
