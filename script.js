/**
 * Vector FX Landing Page JavaScript
 * Version: 1.0.0
 * Production-ready with error handling and performance optimizations
 */

'use strict';

// ========================================
// Application Initialization
// ========================================
(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        try {
            initScrollAnimations();
            initWaitlistForm();
            initSmoothScroll();
            initNavbarScroll();
            initCurrentYear();
            initKeyboardNavigation();
        } catch (error) {
            console.error('Vector FX: Initialization error', error);
        }
    }
})();

// ========================================
// Scroll Animations with Intersection Observer
// ========================================
function initScrollAnimations() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    // Add animation class to elements
    const animatedElements = document.querySelectorAll(
        '.problem-item, .feature-card, .method-item, .audience-card, .comparison-col'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animations
                const delay = Math.min(index * 100, 500); // Cap delay at 500ms
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// Waitlist Form Handler (Formspree Integration)
// ========================================
function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('waitlistSuccess');
    
    if (!form || !successMessage) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();
        
        // Validate email
        if (!email || !isValidEmail(email)) {
            shakeElement(emailInput);
            emailInput.focus();
            announceToScreenReader('Please enter a valid email address');
            return;
        }
        
        // Disable button and show loading state
        const originalButtonContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerHTML = '<span>Joining...</span>';
        
        try {
            // Submit to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Form submission failed');
            }
            
            // Show success state
            form.style.display = 'none';
            successMessage.classList.add('show');
            
            // Announce success to screen readers
            announceToScreenReader('Success! You\'re on the waitlist. We\'ll be in touch soon.');
            
            // Trigger celebration effect (if user hasn't opted for reduced motion)
            if (!prefersReducedMotion()) {
                createConfetti();
            }
            
            // Track conversion (replace with actual analytics)
            trackEvent('waitlist_signup', { email_domain: email.split('@')[1] });
            
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Re-enable button on error
            submitBtn.disabled = false;
            submitBtn.setAttribute('aria-busy', 'false');
            submitBtn.innerHTML = originalButtonContent;
            
            announceToScreenReader('There was an error. Please try again.');
        }
    }
}

// ========================================
// Email Validation
// ========================================
function isValidEmail(email) {
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// ========================================
// UI Feedback Functions
// ========================================
function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease';
    element.style.borderColor = '#ef4444';
    element.setAttribute('aria-invalid', 'true');
    
    setTimeout(() => {
        element.style.animation = '';
        element.style.borderColor = '';
        element.setAttribute('aria-invalid', 'false');
    }, 500);
}

// Inject shake animation if not already present
(function() {
    if (document.getElementById('vectorfx-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'vectorfx-animations';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
        }
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ========================================
// Confetti Effect
// ========================================
function createConfetti() {
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#ffffff'];
    const confettiCount = 50;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 2 + 2;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -20px;
            opacity: ${Math.random() * 0.7 + 0.3};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall ${duration}s linear forwards;
        `;
        confetti.setAttribute('aria-hidden', 'true');
        fragment.appendChild(confetti);
    }
    
    document.body.appendChild(fragment);
    
    // Clean up confetti after animation
    setTimeout(() => {
        document.querySelectorAll('[style*="confettiFall"]').forEach(el => el.remove());
    }, 4000);
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const nav = document.querySelector('.nav');
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                // Use native smooth scroll if available
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback for older browsers
                    window.scrollTo(0, targetPosition);
                }
                
                // Set focus for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

// ========================================
// Navbar Scroll Effect
// ========================================
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let ticking = false;
    
    function updateNavbar() {
        const scrollY = window.pageYOffset;
        
        if (scrollY > 100) {
            nav.style.background = 'rgba(10, 10, 15, 0.95)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.8)';
            nav.style.boxShadow = 'none';
        }
        
        ticking = false;
    }
    
    // Use requestAnimationFrame for performance
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

// ========================================
// Dynamic Year Update
// ========================================
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ========================================
// Keyboard Navigation Enhancements
// ========================================
function initKeyboardNavigation() {
    // Handle Escape key to close any open modals/menus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open elements (extend as needed)
            document.activeElement.blur();
        }
    });
}

// ========================================
// Accessibility Helpers
// ========================================
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 1000);
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ========================================
// Analytics Placeholder
// ========================================
function trackEvent(eventName, eventData = {}) {
    // Replace with actual analytics implementation
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventData);
    }
    
    // Console log for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Track Event:', eventName, eventData);
    }
}

// ========================================
// Parallax Effect (Desktop Only)
// ========================================
(function() {
    // Only enable on larger screens and when reduced motion is not preferred
    if (window.innerWidth < 1024 || prefersReducedMotion()) return;
    
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;
    
    let rafId = null;
    
    document.addEventListener('mousemove', (e) => {
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
            const rect = heroVisual.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / 50;
            const deltaY = (e.clientY - centerY) / 50;
            
            heroVisual.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            rafId = null;
        });
    }, { passive: true });
})();

// ========================================
// Service Worker Registration (PWA Support)
// ========================================
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration.scope);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
