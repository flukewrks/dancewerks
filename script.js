document.addEventListener('DOMContentLoaded', function() {

    // --- Navbar Scroll Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Burger Menu Functionality ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinksLi.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        burger.classList.toggle('toggle');
    });
    
    // --- Smooth Scrolling & Mobile Menu Auto-Close ---
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Only process links that are anchors to the same page
            if (href && href.includes('#')) {
                const parts = href.split('#');
                const page = parts[0];
                const hash = parts[1];

                // If it's a link to an anchor on the current page
                if (!page || page === window.location.pathname.split('/').pop() || page === 'index.html') {
                    e.preventDefault();

                    if (nav.classList.contains('nav-active')) {
                        nav.classList.remove('nav-active');
                        burger.classList.remove('toggle');
                        navLinksLi.forEach(li => li.style.animation = '');
                    }

                    const targetSection = document.getElementById(hash);
                    if (targetSection) {
                        window.scrollTo({
                            top: targetSection.offsetTop - (header ? header.offsetHeight : 0),
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // --- Button Click Feedback ---
    const allButtons = document.querySelectorAll('.cta-button');
    allButtons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.97)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // --- Calendar Modal Control ---
    const calendarModal = document.getElementById('calendarModal');
    const openCalendarButtons = document.querySelectorAll('.open-modal-button');
    const closeCalendarButton = document.querySelector('#calendarModal .close-button');

    function openCalendarModal() { if(calendarModal) calendarModal.style.display = 'flex'; }
    function closeCalendarModal() { if(calendarModal) calendarModal.style.display = 'none'; }

    openCalendarButtons.forEach(button => button.addEventListener('click', openCalendarModal));
    if(closeCalendarButton) closeCalendarButton.addEventListener('click', closeCalendarModal);

    // --- Contact Modal Control ---
    const contactModal = document.getElementById('contactModal');
    const openContactButtons = document.querySelectorAll('.open-contact-btn');
    const closeContactButton = document.querySelector('.contact-close');

    function openContactModal(e) { 
        e.preventDefault(); 
        if(contactModal) contactModal.style.display = 'flex'; 
    }
    function closeContactModal() { if(contactModal) contactModal.style.display = 'none'; }

    openContactButtons.forEach(button => button.addEventListener('click', openContactModal));
    if(closeContactButton) closeContactButton.addEventListener('click', closeContactModal);

    // --- Meet The Crew Modal Control ---
    const crewModal = document.getElementById('crewModal');
    const openCrewButton = document.querySelector('.open-crew-btn');
    const closeCrewButton = document.querySelector('.crew-close');

    function openCrewModal(e) { 
        e.preventDefault();
        if (crewModal) crewModal.style.display = 'flex'; 
    }
    function closeCrewModal() { if (crewModal) crewModal.style.display = 'none'; }

    if (openCrewButton) openCrewButton.addEventListener('click', openCrewModal);
    if (closeCrewButton) closeCrewButton.addEventListener('click', closeCrewModal);

    // --- Instructor Video Modal Control ---
    const instructorVideoModal = document.getElementById('instructorVideoModal');
    const instructorVideoPlayer = document.getElementById('instructorVideoPlayer');
    const openInstructorVideoTriggers = document.querySelectorAll('.instructor-card');
    const closeInstructorVideoButton = document.querySelector('.instructor-video-close');

    function openInstructorVideo(e) {
        if (e.target.closest('.instructor-social')) {
            return;
        }

        const card = e.currentTarget;
        const videoSrc = card.dataset.videoSrc;
        
        if (videoSrc && instructorVideoModal && instructorVideoPlayer) {
            const sourceElement = instructorVideoPlayer.querySelector('source');
            sourceElement.setAttribute('src', videoSrc);
            instructorVideoPlayer.load();
            instructorVideoModal.style.display = 'flex';
            instructorVideoPlayer.play().catch(error => {
                console.log("Autoplay was prevented:", error);
            });
        }
    }

    function closeInstructorVideo() {
        if (instructorVideoModal && instructorVideoPlayer) {
            instructorVideoModal.style.display = 'none';
            instructorVideoPlayer.pause();
            instructorVideoPlayer.querySelector('source').setAttribute('src', '');
        }
    }

    openInstructorVideoTriggers.forEach(trigger => {
        trigger.addEventListener('click', openInstructorVideo);
    });

    if (closeInstructorVideoButton) {
        closeInstructorVideoButton.addEventListener('click', closeInstructorVideo);
    }
    
    // --- Window Click to Close Any Modal ---
    window.addEventListener('click', function(event) {
        if (event.target == calendarModal) closeCalendarModal();
        if (event.target == contactModal) closeContactModal();
        if (event.target == crewModal) closeCrewModal();
        if (event.target == instructorVideoModal) closeInstructorVideo();
    });

});
