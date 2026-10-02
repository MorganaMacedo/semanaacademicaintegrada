const header = document.querySelector("[data-header]")
const menuToggle = document.querySelector("[data-menu-toggle]")
const menu = document.querySelector("[data-menu]")
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24)
}

const closeMenu = () => {
  if (!menuToggle || !menu) return
  menuToggle.setAttribute("aria-expanded", "false")
  menu.classList.remove("is-open")
  document.body.classList.remove("menu-open")
}

updateHeader()
window.addEventListener("scroll", updateHeader, { passive: true })

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true"
  menuToggle.setAttribute("aria-expanded", String(!open))
  menu?.classList.toggle("is-open", !open)
  document.body.classList.toggle("menu-open", !open)
})

menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu))

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu()
})

const carousel = document.querySelector("[data-carousel]")

if (carousel) {
  const slides = [...carousel.querySelectorAll(".hero-slide")]
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")]
  const previous = carousel.querySelector("[data-carousel-prev]")
  const next = carousel.querySelector("[data-carousel-next]")
  let current = 0
  let timer

  const showSlide = index => {
    current = (index + slides.length) % slides.length
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current
      slide.classList.toggle("is-active", active)
      slide.inert = !active
    })
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current
      dot.classList.toggle("is-active", active)
      dot.setAttribute("aria-selected", String(active))
      dot.tabIndex = active ? 0 : -1
    })
  }

  const stop = () => window.clearInterval(timer)
  const start = () => {
    stop()
    if (!reduceMotion && !document.hidden) timer = window.setInterval(() => showSlide(current + 1), 6500)
  }

  previous?.addEventListener("click", () => {
    showSlide(current - 1)
    start()
  })

  next?.addEventListener("click", () => {
    showSlide(current + 1)
    start()
  })

  dots.forEach(dot => dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.carouselDot))
    start()
  }))

  carousel.addEventListener("mouseenter", stop)
  carousel.addEventListener("mouseleave", start)
  carousel.addEventListener("focusin", stop)
  carousel.addEventListener("focusout", start)
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start())
  showSlide(0)
  start()
}

const scheduleTabs = [...document.querySelectorAll("[data-day]")]
const schedulePanels = [...document.querySelectorAll("[data-panel]")]

const activateDay = day => {
  scheduleTabs.forEach(tab => {
    const active = tab.dataset.day === day
    tab.classList.toggle("is-active", active)
    tab.setAttribute("aria-selected", String(active))
    tab.tabIndex = active ? 0 : -1
  })
  schedulePanels.forEach(panel => {
    const active = panel.dataset.panel === day
    panel.classList.toggle("is-active", active)
    panel.hidden = !active
  })
}

scheduleTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateDay(tab.dataset.day))
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    let nextIndex = index
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + scheduleTabs.length) % scheduleTabs.length
    if (event.key === "ArrowRight") nextIndex = (index + 1) % scheduleTabs.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = scheduleTabs.length - 1
    activateDay(scheduleTabs[nextIndex].dataset.day)
    scheduleTabs[nextIndex].focus()
  })
})

activateDay("20")
