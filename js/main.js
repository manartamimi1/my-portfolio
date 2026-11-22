/* ==========================================================================
   Manar Altamimi | Portfolio scripts
   1. Loading screen
   2. Typing effect
   3. Floating background dots
   4. Footer year
   5. Contact form ("Email me")
   6. Light / dark theme
   7. Rotating job title
   ========================================================================== */


/* 1. Loading screen
   Shows the progress bar for a few seconds (so the "checking the watch"
   animation can play), waits for the page to finish loading, then fades out. */
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MIN_LOADING_TIME = prefersReducedMotion ? 800 : 3600; // milliseconds
const BAR_STEP = 4; // the bar fills in chunky 4% steps for a pixel look

let pageLoaded = document.readyState === "complete";
window.addEventListener("load", () => {
  pageLoaded = true;
});

function runLoader() {
  const startTime = performance.now();

  function update(now) {
    const timeProgress = Math.min((now - startTime) / MIN_LOADING_TIME, 1) * 100;

    // Hold at 92% until the page has really finished loading
    const progress = pageLoaded ? timeProgress : Math.min(timeProgress, 92);
    const shown = progress >= 100 ? 100 : Math.floor(progress / BAR_STEP) * BAR_STEP;
    loaderFill.style.width = shown + "%";

    if (shown < 100) {
      requestAnimationFrame(update);
    } else {
      setTimeout(hideLoader, 400);
    }
  }

  requestAnimationFrame(update);
}

function hideLoader() {
  loader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  setTimeout(() => loader.remove(), 700);
  startTyping();
}


/* 2. Typing effect for the greeting (edit the text here) */
const greeting = "> hello, world";
const typedElement = document.getElementById("typed");
let letterIndex = 0;

function typeNextLetter() {
  typedElement.textContent = greeting.slice(0, letterIndex++);

  if (letterIndex <= greeting.length) {
    setTimeout(typeNextLetter, 90);
  }
}

function startTyping() {
  typeNextLetter();
  startRoles();
}


/* 3. Floating pixel dots in the background (also on the loading screen) */
const DOT_COUNT = 14;

function createDots(parent) {
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = document.createElement("div");

    dot.className = "dot";
    dot.style.left = Math.random() * 100 + "vw";
    dot.style.top = Math.random() * 100 + "vh";
    dot.style.animationDelay = Math.random() * -8 + "s";

    parent.appendChild(dot);
  }
}

createDots(document.body);
if (loader) createDots(loader);


/* 4. Footer year */
document.getElementById("year").textContent = new Date().getFullYear();


/* 5. Contact form
   The "Email me" button opens a form. The message is sent to CONTACT_EMAIL
   through the free FormSubmit service (the first message needs a one-time
   confirmation click in your inbox). If the in-page send fails, the form is
   submitted the normal way instead. */
const CONTACT_EMAIL = "manaraltamimi106@gmail.com";

const contactDialog = document.getElementById("contact-dialog");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");

function setStatus(message, isError) {
  contactStatus.textContent = message;
  contactStatus.classList.toggle("is-error", Boolean(isError));
}

document.getElementById("open-contact").addEventListener("click", (event) => {
  event.preventDefault(); // stop the plain mailto link, show the form instead
  setStatus("");
  contactDialog.showModal();
});

document.getElementById("close-contact").addEventListener("click", () => {
  contactDialog.close();
});

// Clicking the dark area outside the window also closes it
contactDialog.addEventListener("click", (event) => {
  if (event.target === contactDialog) contactDialog.close();
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(contactForm));
  const submitButton = contactForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  setStatus("Sending...");

  try {
    const response = await fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok || String(result.success) !== "true") {
      throw new Error(result.message || "Send failed");
    }

    contactForm.reset();
    setStatus("Message sent. Thank you, I will reply soon.");
  } catch (error) {
    // The in-page send failed (for example, the file is opened from a folder, not a website).
    // Fall back to a normal form submit, which opens the form service in a new tab.
    setStatus("Sending the message...");
    contactForm.target = "_blank";
    contactForm.submit();
  } finally {
    submitButton.disabled = false;
  }
});


/* 6. Light / dark theme
   The saved choice is applied in the <head> of index.html (so there is no flash).
   This button switches the theme and remembers it for next time. */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode"
  );
}

applyTheme(document.documentElement.dataset.theme || "dark");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";

  applyTheme(next);

  try {
    localStorage.setItem("theme", next);
  } catch (error) {
    /* Private browsing: the theme just won't be remembered */
  }
});


/* 7. Rotating job title (the line under "Hi, I'm Manar Altamimi")
   It types a title, waits, deletes it, then types the next one. */
const roles = ["AI Engineer", "Software Engineer"]; // add or change job titles here
const ROLE_TYPE_SPEED = 90;   // milliseconds per letter when typing
const ROLE_DELETE_SPEED = 50; // milliseconds per letter when deleting
const ROLE_HOLD_TIME = 2000;  // how long each title stays on screen

const roleElement = document.getElementById("role");

function startRoles() {
  if (prefersReducedMotion || roles.length < 2) return; // keep the first title still

  let roleIndex = 0;
  let letterCount = roles[0].length; // the first title is already on screen
  let deleting = false;

  function step() {
    const role = roles[roleIndex];

    if (deleting) {
      letterCount--;
      roleElement.textContent = role.slice(0, letterCount);

      if (letterCount === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(step, 300);
      } else {
        setTimeout(step, ROLE_DELETE_SPEED);
      }
    } else {
      letterCount++;
      roleElement.textContent = role.slice(0, letterCount);

      if (letterCount === role.length) {
        deleting = true;
        setTimeout(step, ROLE_HOLD_TIME);
      } else {
        setTimeout(step, ROLE_TYPE_SPEED);
      }
    }
  }

  setTimeout(() => {
    deleting = true;
    step();
  }, ROLE_HOLD_TIME);
}


/* Start: show the loading screen first, then reveal the page */
if (loader) {
  runLoader();
} else {
  startTyping();
}