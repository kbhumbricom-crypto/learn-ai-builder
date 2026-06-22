document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('slide-indicator');
    const progressFill = document.getElementById('progress-fill');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateDeck() {
        // Update slides
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update indicator
        indicator.textContent = `${currentSlide + 1} / ${totalSlides}`;

        // Update progress bar
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressFill.style.width = `${progress}%`;

        // Update buttons
        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevBtn.style.cursor = currentSlide === 0 ? 'default' : 'pointer';
        
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        nextBtn.style.cursor = currentSlide === totalSlides - 1 ? 'default' : 'pointer';
    }

    function goToNextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateDeck();
        }
    }

    function goToPrevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateDeck();
        }
    }

    // Event listeners for buttons
    nextBtn.addEventListener('click', goToNextSlide);
    prevBtn.addEventListener('click', goToPrevSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            goToNextSlide();
        } else if (e.key === 'ArrowLeft') {
            goToPrevSlide();
        }
    });

    // Initialize
    updateDeck();
});
