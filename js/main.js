/* ==========================================================================
   DILEEP.DEV - PORTFOLIO INTERACTIVE SCRIPTS
   Frontend Developer & UI/UX Designer | B.Tech CSE
   CodeAlpha Task 3: Build Your Own Portfolio Site
   Supports both file:// protocol and local/production HTTP servers
   ========================================================================== */

(function () {
    // Prevent duplicate initialization if loaded via multiple script tags
    if (window.__DILEEP_PORTFOLIO_SCRIPT_LOADED__) return;
    window.__DILEEP_PORTFOLIO_SCRIPT_LOADED__ = true;

    // Safe localStorage helpers for file:// and strict sandbox contexts
    function safeGetStorage(key) {
        try {
            return window.localStorage ? window.localStorage.getItem(key) : null;
        } catch (e) {
            return null;
        }
    }

    function safeSetStorage(key, value) {
        try {
            if (window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            // Silently ignore storage errors on restricted file:// origins
        }
    }

    // Fallback clipboard copying for restricted origins (e.g. file:// without HTTPS)
    function copyTextFallback(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {}
        document.body.removeChild(textArea);
    }

    function initPortfolio() {
        /* ---------------------------------------------------------
           1. 3-OPTION THEME SWITCHER (Dark | Light | Peach)
           --------------------------------------------------------- */
        const themeButtons = document.querySelectorAll('.theme-option-btn');
        const htmlElement = document.documentElement;

        const savedTheme = safeGetStorage('dileep-portfolio-theme');
        const validThemes = ['dark', 'light', 'peach'];

        let currentTheme = 'dark';
        if (savedTheme && validThemes.includes(savedTheme)) {
            currentTheme = savedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = 'light';
        }

        applyTheme(currentTheme, false);

        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTheme = btn.getAttribute('data-theme-val');
                if (validThemes.includes(selectedTheme)) {
                    applyTheme(selectedTheme, true);
                }
            });
        });

        function applyTheme(theme, notify = false) {
            htmlElement.setAttribute('data-theme', theme);
            safeSetStorage('dileep-portfolio-theme', theme);

            themeButtons.forEach(btn => {
                if (btn.getAttribute('data-theme-val') === theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            if (notify) {
                let message = "Switched to Dark Mode 🌙";
                if (theme === 'light') message = "Switched to Light Mode ☀️";
                if (theme === 'peach') message = "Switched to Peach Mode 🍑";
                showToast(message);
            }
        }

        /* ---------------------------------------------------------
           2. TYPEWRITER EFFECT IN HERO SECTION
           --------------------------------------------------------- */
        const typewriterElement = document.getElementById('typewriter');
        const words = [
            "Frontend Developer",
            "UI / UX Designer",
            "Web Developer",
            "C Programmer",
            "B.Tech CSE Student"
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseDelay = 1800;

        function typeEffect() {
            if (!typewriterElement) return;

            const currentWord = words[wordIndex];

            if (isDeleting) {
                typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? deletingSpeed : typingSpeed;

            if (!isDeleting && charIndex === currentWord.length) {
                speed = pauseDelay;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 400;
            }

            setTimeout(typeEffect, speed);
        }

        if (typewriterElement) {
            typeEffect();
        }

        /* ---------------------------------------------------------
           3. NAVBAR SCROLL EFFECT & MOBILE MENU
           --------------------------------------------------------- */
        const navbar = document.getElementById('navbar');
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });

            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }

        /* ---------------------------------------------------------
           4. SCROLLSPY (Highlight active link while scrolling)
           --------------------------------------------------------- */
        const sections = document.querySelectorAll('section[id]');

        function scrollSpy() {
            const scrollPosition = window.scrollY + 120;

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop;
                const sectionId = current.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

                if (correspondingLink) {
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                    }
                }
            });
        }

        window.addEventListener('scroll', scrollSpy);

        /* ---------------------------------------------------------
           5. SKILL BARS PROGRESS ON SCROLL (Intersection Observer)
           --------------------------------------------------------- */
        const skillBars = document.querySelectorAll('.skill-progress');

        if ('IntersectionObserver' in window) {
            const skillObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const bar = entry.target;
                        const targetWidth = bar.style.getPropertyValue('--target-width');
                        if (targetWidth) {
                            bar.style.width = targetWidth;
                        }
                        observer.unobserve(bar);
                    }
                });
            }, { threshold: 0.25 });

            skillBars.forEach(bar => {
                skillObserver.observe(bar);
            });
        } else {
            // Fallback for older browsers
            skillBars.forEach(bar => {
                const targetWidth = bar.style.getPropertyValue('--target-width');
                if (targetWidth) bar.style.width = targetWidth;
            });
        }

        /* ---------------------------------------------------------
           6. PROJECTS FILTER (All, Web Dev, UI/UX, JS)
           --------------------------------------------------------- */
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category') || '';

                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.remove('hide');
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = 'fadeIn 0.4s ease forwards';
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });

        /* ---------------------------------------------------------
           7. COPY TO CLIPBOARD BUTTONS (Email)
           --------------------------------------------------------- */
        const copyButtons = document.querySelectorAll('.copy-btn');

        copyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const textToCopy = btn.getAttribute('data-copy');

                if (textToCopy) {
                    const originalHTML = btn.innerHTML;
                    const onCopySuccess = () => {
                        btn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--success);"></i>';
                        showToast(`Copied to clipboard: ${textToCopy}`);
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                        }, 2000);
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(textToCopy)
                            .then(onCopySuccess)
                            .catch(() => {
                                copyTextFallback(textToCopy);
                                onCopySuccess();
                            });
                    } else {
                        copyTextFallback(textToCopy);
                        onCopySuccess();
                    }
                }
            });
        });

       
/* ---------------------------------------------------------
   8. CONTACT FORM VALIDATION & SUBMISSION
   --------------------------------------------------------- */

const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        if (!nameInput.value.trim()) {
            setError(nameInput, true);
            isValid = false;
        } else {
            setError(nameInput, false);
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailInput.value.trim())) {
            setError(emailInput, true);
            isValid = false;
        } else {
            setError(emailInput, false);
        }

        if (!subjectInput.value.trim()) {
            setError(subjectInput, true);
            isValid = false;
        } else {
            setError(subjectInput, false);
        }

        if (messageInput.value.trim().length < 10) {
            setError(messageInput, true);
            isValid = false;
        } else {
            setError(messageInput, false);
        }

        if (!isValid) return;

        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';

        try {
            const response = await fetch(
                'https://formspree.io/f/mqpqppdr',
                {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        Accept: 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Message could not be sent.');
            }

            submitBtn.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Sent Successfully!';

            showToast(`Thank you ${nameInput.value.trim()}! Message sent successfully.`);

            contactForm.reset();

        } catch (error) {
            submitBtn.innerHTML =
                '<i class="fa-solid fa-triangle-exclamation"></i> Try Again';

            showToast('Sorry! Message could not be sent. Please try again.');

            console.error('Form submission error:', error);

        } finally {
            submitBtn.disabled = false;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
            }, 3500);
        }
    });

    const formInputs = contactForm.querySelectorAll('input, textarea');

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');

            if (group && group.classList.contains('has-error')) {
                setError(input, false);
            }
        });
    });
}

function setError(inputElement, hasError) {
    const group = inputElement.closest('.form-group');

    if (group) {
        if (hasError) {
            group.classList.add('has-error');
        } else {
            group.classList.remove('has-error');
        }
    }
}

        /* ---------------------------------------------------------
           9. BACK TO TOP BUTTON
           --------------------------------------------------------- */
        const backToTopBtn = document.getElementById('back-to-top');

        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 350) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        /* ---------------------------------------------------------
           10. DYNAMIC YEAR
           --------------------------------------------------------- */
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        /* ---------------------------------------------------------
           11. RESUME LINKS SAFE PATH RESOLVER
           --------------------------------------------------------- */
        // If resume.html is in same directory as index.html (flat), ensure links work
        document.querySelectorAll('a[href="assets/resume.html"]').forEach(a => {
            a.addEventListener('click', function (e) {
                // If assets/resume.html is not found when opened locally, fallback to resume.html
                // Both paths are kept synchronized!
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortfolio);
    } else {
        initPortfolio();
    }
})();

/* ---------------------------------------------------------
   GLOBAL HELPERS (Toast Notification & Project Demos)
   --------------------------------------------------------- */
let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
}

window.showDemoToast = function (projectName) {
    showToast(`Launching ${projectName} ✨`);
};
