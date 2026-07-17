document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. Theme Toggle (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById("theme-toggle");
    const body = document.body;

    // Check saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-theme");
    }

    themeToggleBtn.addEventListener("click", () => {
        body.classList.toggle("light-theme");
        
        // Save choice
        if (body.classList.contains("light-theme")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });

    // ==========================================
    // 2. Typewriter Effect
    // ==========================================
    const typewriterElement = document.getElementById("typewriter-text");
    const phrases = [
        "instantly summarize notes.",
        "generate AI study guides.",
        "chat with Claude about your courses.",
        "prepare for exams with ease."
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // delete faster
        } else {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80; // type slower
        }

        // If word is finished typing
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000; // pause at end of word
            isDeleting = true;
        } 
        // If word is finished deleting
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // short pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }

    // Start Typewriter
    if (typewriterElement) {
        setTimeout(type, 1000);
    }

    // ==========================================
    // 3. FAQ Accordion Interaction
    // ==========================================
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        const content = item.querySelector(".faq-content");

        trigger.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            // Close all other active items first for clean accordions
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".faq-content").style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
