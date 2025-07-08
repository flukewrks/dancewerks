document.addEventListener('DOMContentLoaded', function() {

    // =========================================================================
    // --- General Page Scripts (Navbar, Modals, etc.) ---
    // =========================================================================
    
    // --- Sticky Header on Scroll ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile Navigation (Burger Menu) ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            
            const navLinksLi = nav.querySelectorAll('li');
            navLinksLi.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
            burger.classList.toggle('toggle');
        });
    }
    
    // --- Contact Modal ---
    const contactModal = document.getElementById('contactModal');
    const openContactButtons = document.querySelectorAll('.open-contact-btn');
    const closeContactButton = document.querySelector('.contact-close');

    function openContactModal(e) { 
        e.preventDefault(); 
        if(contactModal) contactModal.style.display = 'flex'; 
    }
    function closeContactModal() { 
        if(contactModal) contactModal.style.display = 'none'; 
    }

    openContactButtons.forEach(button => button.addEventListener('click', openContactModal));
    if(closeContactButton) closeContactButton.addEventListener('click', closeContactModal);

    // --- Close any modal when clicking on the background ---
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // =========================================================================
    // --- Advanced Booking Schedule Logic (for schedule.html) ---
    // =========================================================================
    const schedulePage = document.querySelector('.schedule-page');
    if (schedulePage) {
        
        // --- CONFIGURATION & STATE ---
        const apiKey = 'AIzaSyAu4n1B--z5tP4hfSmlwuqh5YmJxkwSaWE'; 
        const calendarId = 'dancewerkstudio@dncwrks.com';
        const priceData = {
            solo: { 4: 3500, 8: 6800 },
            duo: { 4: 1900, 8: 3600 },
            trio: { 4: 1500, 8: 2800 },
            'group-small': { 4: 1300, 8: 2400 },
            'group-large': { 4: 1100, 8: 2000 }
        };

        let bookedSlots = new Set();
        let selectedSlots = new Map();
        let currentDate = new Date();
        let selectedDate = null;
        
        // --- DOM ELEMENT CACHING ---
        const packageSelector = document.getElementById('package-type');
        const groupSizeWrapper = document.getElementById('group-size-wrapper');
        const groupSizeSelect = document.getElementById('group-size-select');
        const groupSizeInput = document.getElementById('group-size-input');
        const durationRadios = document.querySelectorAll('input[name="duration"]');
        const priceDisplay = document.getElementById('calculated-price');
        const bookingTypeRadios = document.querySelectorAll('input[name="booking-type"]');
        const recurringOptions = document.getElementById('recurring-options');
        const requestBookingBtn = document.getElementById('request-booking-btn');
        const selectedHoursSpan = document.getElementById('selected-hours');
        const totalHoursSpan = document.getElementById('total-hours');
        const timeSelectionStep = document.getElementById('time-selection-step');
        const actionBar = document.getElementById('action-bar-step');
        
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearDisplay = document.getElementById('month-year-display');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const timeSlotDisplay = document.getElementById('time-slot-display');
        const timeSlotHeader = document.getElementById('time-slot-header');
        const timeSlotsContainer = document.getElementById('time-slots-container');

        const bookingModal = document.getElementById('bookingConfirmationModal');
        const closeBookingModalBtn = document.querySelector('.booking-confirm-close');

        // --- DATA FETCHING & PROCESSING ---
        async function fetchCalendarData() {
            calendarGrid.innerHTML = `<div class="loading-spinner"></div>`;
            const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch calendar data (status: ${response.status})`);
                const data = await response.json();
                processEvents(data.items);
                renderCalendar();
            } catch (error) {
                console.error("Error fetching calendar data:", error);
                calendarGrid.innerHTML = `<p style="color: red; text-align: center;">Error loading schedule. Please try again later.</p>`;
            }
        }

        function processEvents(events) {
            bookedSlots.clear();
            if (!events) return;
            events.forEach(event => {
                if (!event.start.dateTime || !event.end.dateTime) return; // Skip all-day events
                const start = new Date(event.start.dateTime);
                const end = new Date(event.end.dateTime);
                
                let current = new Date(start);
                while (current < end) {
                    bookedSlots.add(current.toISOString());
                    current.setHours(current.getHours() + 1);
                }
            });
        }

        // --- UI RENDERING ---
        function renderCalendar() {
            calendarGrid.innerHTML = '';
            monthYearDisplay.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDayOfMonth; i++) {
                calendarGrid.insertAdjacentHTML('beforeend', `<div class="day-cell other-month"></div>`);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const cellDate = new Date(year, month, i);
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                dayCell.textContent = i;
                dayCell.dataset.date = cellDate.toISOString();

                if (cellDate < new Date().setHours(0,0,0,0)) dayCell.classList.add('is-disabled');
                if (cellDate.toDateString() === new Date().toDateString()) dayCell.classList.add('is-today');
                if (selectedDate && cellDate.toDateString() === selectedDate.toDateString()) dayCell.classList.add('is-selected');
                
                calendarGrid.appendChild(dayCell);
            }
        }

        function renderTimeSlotsForDate(date) {
            timeSlotDisplay.style.display = 'block';
            timeSlotHeader.textContent = `Available Slots for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
            timeSlotsContainer.innerHTML = '';

            for (let hour = 9; hour < 21; hour++) { // Assuming studio hours 9 AM to 9 PM
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);
                const slotTimeISO = slotTime.toISOString();
                
                const wrapper = document.createElement('div');
                wrapper.className = 'time-slot-checkbox';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = slotTimeISO;
                checkbox.value = slotTimeISO;
                checkbox.checked = selectedSlots.has(slotTimeISO);

                const label = document.createElement('label');
                label.htmlFor = slotTimeISO;
                // Label text is set in updateAvailability()
                
                wrapper.appendChild(checkbox);
                wrapper.appendChild(label);
                timeSlotsContainer.appendChild(wrapper);
            }
            updateAvailability();
        }

        // --- UI & STATE UPDATES ---
        function updateUI() {
            const packageType = packageSelector.value;
            const duration = parseInt(document.querySelector('input[name="duration"]:checked').value);

            // Toggle visibility of group size selectors
            const isGroupSmall = packageType === 'group-small';
            const isGroupLarge = packageType === 'group-large';
            groupSizeWrapper.style.display = isGroupSmall || isGroupLarge ? 'block' : 'none';
            groupSizeSelect.style.display = isGroupSmall ? 'block' : 'none';
            groupSizeInput.style.display = isGroupLarge ? 'block' : 'none';
            
            // Handle 1-hour "Contact Us" case
            if (duration === 1) {
                if(timeSelectionStep) timeSelectionStep.style.display = 'none';
                if(actionBar) actionBar.style.display = 'none';
                priceDisplay.textContent = 'Contact via Line';
                return;
            } else {
                if(timeSelectionStep) timeSelectionStep.style.display = 'block';
                if(actionBar) actionBar.style.display = 'flex';
            }

            // Calculate number of people
            let numPeople = 1;
            if (isGroupSmall) numPeople = parseInt(groupSizeSelect.value);
            else if (isGroupLarge) numPeople = parseInt(groupSizeInput.value) || 6;
            else {
                const selectedOption = packageSelector.options[packageSelector.selectedIndex];
                numPeople = parseInt(selectedOption.dataset.min);
            }
            
            // Calculate and display price
            const pricePerPerson = priceData[packageType]?.[duration];
            if (pricePerPerson) {
                const totalPrice = pricePerPerson * numPeople;
                priceDisplay.innerHTML = `${totalPrice.toLocaleString()} THB <small>(Total for ${numPeople} person/people)</small>`;            } else {
                priceDisplay.textContent = 'N/A';
            }

            totalHoursSpan.textContent = duration;
            clearSelections();
        }
        
        function clearSelections() {
            selectedSlots.clear();
            if(selectedDate) renderTimeSlotsForDate(selectedDate); // Re-render to uncheck boxes
            updateBookingButton();
        }

        function updateAvailability() {
            const bookingType = document.querySelector('input[name="booking-type"]:checked').value;
            const sessionDuration = (bookingType === 'recurring') ? parseInt(document.querySelector('input[name="recurring-duration"]:checked').value) : 1;

            document.querySelectorAll('.time-slot-checkbox').forEach(wrapper => {
                const checkbox = wrapper.querySelector('input');
                const slotTime = new Date(checkbox.value);
                let isSlotAvailable = true;

                // For recurring, we only need to check the base availability
                if (selectedSlots.has(checkbox.value) && bookingType === 'custom') return;

                // Check if any hour within the potential session is booked
                for (let i = 0; i < sessionDuration; i++) {
                    const checkTime = new Date(slotTime);
                    checkTime.setHours(slotTime.getHours() + i);
                    if (bookedSlots.has(checkTime.toISOString())) {
                        isSlotAvailable = false;
                        break;
                    }
                }
                
                checkbox.disabled = !isSlotAvailable;
                const endTime = new Date(slotTime);
                endTime.setHours(slotTime.getHours() + sessionDuration);
                
                const formatTime = (date) => date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

                wrapper.querySelector('label').textContent = isSlotAvailable 
                    ? `${formatTime(slotTime)} - ${formatTime(endTime)}`
                    : 'Reserved';
            });
            updateBookingButton();
        }

        function updateBookingButton() {
            const totalRequired = parseInt(totalHoursSpan.textContent);
            const selectedCount = selectedSlots.size;
            requestBookingBtn.disabled = selectedCount !== totalRequired;
            selectedHoursSpan.textContent = selectedCount;
        }

        // --- EVENT HANDLERS ---
        
        /**
         * MODIFIED FUNCTION
         * This function now handles clicking a day on the calendar.
         * It updates the view to show the slots for the selected day
         * WITHOUT clearing slots that were already selected on other days.
         */
        function handleDateClick(e) {
            const target = e.target;
            if (!target.classList.contains('day-cell') || target.classList.contains('is-disabled') || target.classList.contains('other-month')) return;

            // Remove 'selected' style from the previously viewed day
            const previouslySelected = document.querySelector('.day-cell.is-selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('is-selected');
            }
            
            // Add 'selected' style to the newly clicked day to show which day is being viewed
            target.classList.add('is-selected');
            
            // Update the state to the new date
            selectedDate = new Date(target.dataset.date);
            
            // Render the time slots for the new date.
            // This function will correctly check `selectedSlots` and show any
            // pre-selected slots for this day as checked.
            renderTimeSlotsForDate(selectedDate);
        }

        function handleSlotSelection(checkbox) {
            const bookingType = document.querySelector('input[name="booking-type"]:checked').value;
            const totalRequiredHours = parseInt(totalHoursSpan.textContent);
            const isRecurring = bookingType === 'recurring';
            const sessionDuration = isRecurring ? parseInt(document.querySelector('input[name="recurring-duration"]:checked').value) : 1;

            if (checkbox.checked) {
                // Check if adding the slot(s) exceeds the package total
                if (selectedSlots.size + sessionDuration > totalRequiredHours) {
                    alert(`You can only select up to ${totalRequiredHours} hours for this package.`);
                    checkbox.checked = false;
                    return;
                }
                
                if (isRecurring) {
                    // Logic for selecting all recurring slots at once
                    const sessionsToBook = totalRequiredHours / sessionDuration;
                    const startTime = new Date(checkbox.value);
                    let canBookAll = true;
                    let tempSlots = new Map();

                    for (let i = 0; i < sessionsToBook; i++) {
                        for (let j = 0; j < sessionDuration; j++) {
                            const recurringTime = new Date(startTime);
                            recurringTime.setDate(startTime.getDate() + (i * 7)); // Add weeks
                            recurringTime.setHours(startTime.getHours() + j);    // Add hours within session
                            if (bookedSlots.has(recurringTime.toISOString())) {
                                canBookAll = false; break;
                            }
                            tempSlots.set(recurringTime.toISOString(), true);
                        }
                        if (!canBookAll) break;
                    }

                    if (!canBookAll) {
                        alert(`Cannot book recurring sessions. A future slot in this series is already reserved. Please try "Custom Selection" instead.`);
                        checkbox.checked = false;
                        return;
                    }
                    // If all clear, replace current selection with the full recurring series
                    clearSelections();
                    selectedSlots = tempSlots;
                    document.querySelectorAll('.time-slot-checkbox input').forEach(cb => {
                        cb.checked = selectedSlots.has(cb.value);
                    });
                } else { // Custom selection
                    for (let i = 0; i < sessionDuration; i++) {
                        const newSlotTime = new Date(checkbox.value);
                        newSlotTime.setHours(newSlotTime.getHours() + i);
                        selectedSlots.set(newSlotTime.toISOString(), true);
                    }
                }
            } else { // Unchecking a box
                 if (isRecurring) {
                    clearSelections();
                 } else { // Custom
                    for (let i = 0; i < sessionDuration; i++) {
                        const newSlotTime = new Date(checkbox.value);
                        newSlotTime.setHours(newSlotTime.getHours() + i);
                        selectedSlots.delete(newSlotTime.toISOString());
                    }
                 }
            }
            updateBookingButton();
        }

        function openBookingConfirmationModal() {
            const totalRequired = parseInt(totalHoursSpan.textContent);
            if (selectedSlots.size !== totalRequired) {
                alert(`Please select exactly ${totalRequired} hours to proceed.`);
                return;
            }

            const summaryList = document.getElementById('summary-details-list');
            summaryList.innerHTML = '';
            let summaryTextForForm = '';
            
            // Get package details
            const packageType = packageSelector.value;
            const duration = parseInt(document.querySelector('input[name="duration"]:checked').value);
            const isGroup = packageType.includes('group');
            let numPeople = 1;
            if(isGroup) {
                numPeople = packageType === 'group-small' 
                    ? parseInt(groupSizeSelect.value) 
                    : parseInt(groupSizeInput.value) || 6;
            } else {
                numPeople = parseInt(packageSelector.options[packageSelector.selectedIndex].dataset.min);
            }
            const pricePerPerson = priceData[packageType][duration];
            const totalPrice = pricePerPerson * numPeople;

            // Populate modal text
            document.getElementById('summary-package').textContent = `Package: ${packageSelector.options[packageSelector.selectedIndex].text} (${duration} Hours)`;
            document.getElementById('summary-price').textContent = `Total Price: ${totalPrice.toLocaleString()} THB`;

            // Populate selected slots
            const sortedSlots = Array.from(selectedSlots.keys()).sort();
            sortedSlots.forEach(isoString => {
                const time = new Date(isoString);
                const formattedTime = time.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                const li = document.createElement('li');
                li.textContent = formattedTime;
                summaryList.appendChild(li);
                summaryTextForForm += `${formattedTime}\n`;
            });
            
            // Populate hidden form field for submission
            document.getElementById('hidden-summary').value = 
                `Booking Request:\n` +
                `Package: ${packageSelector.options[packageSelector.selectedIndex].text} (${duration} Hours, ${numPeople} people)\n` +
                `Total Price: ${totalPrice.toLocaleString()} THB\n\n` +
                `Selected Slots:\n${summaryTextForForm}`;

            bookingModal.style.display = 'flex';
        }
        
        // --- EVENT LISTENER SETUP ---
        function addEventListeners() {
            packageSelector.addEventListener('change', updateUI);
            groupSizeSelect.addEventListener('change', updateUI);
            groupSizeInput.addEventListener('input', updateUI);
            durationRadios.forEach(radio => radio.addEventListener('change', updateUI));
            
            bookingTypeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    recurringOptions.style.display = e.target.value === 'recurring' ? 'grid' : 'none';
                    clearSelections();
                });
            });
            document.querySelectorAll('input[name="recurring-duration"]').forEach(radio => radio.addEventListener('change', clearSelections));
            
            calendarGrid.addEventListener('click', handleDateClick);
            timeSlotsContainer.addEventListener('change', e => {
                if (e.target.type === 'checkbox') handleSlotSelection(e.target);
            });

            requestBookingBtn.addEventListener('click', openBookingConfirmationModal);
            if(closeBookingModalBtn) closeBookingModalBtn.addEventListener('click', () => bookingModal.style.display = 'none');
            
            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                fetchCalendarData();
            });
            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                fetchCalendarData();
            });
        }

        // --- INITIALIZATION ---
        async function initializeBookingPage() {
            addEventListeners();
            await fetchCalendarData();
            updateUI();
        }

        initializeBookingPage();
    }
});
// =========================================================================
    // --- Meet The Crew & Video Modals ---
    // =========================================================================
    
    // ดึง Element ที่เกี่ยวข้องมาเก็บในตัวแปร
    const crewModal = document.getElementById('crewModal');
    const openCrewBtn = document.querySelector('.open-crew-btn');
    const closeCrewBtn = document.querySelector('.crew-close');
    
    const videoModal = document.getElementById('instructorVideoModal');
    const videoPlayer = document.getElementById('instructorVideoPlayer');
    const instructorCards = document.querySelectorAll('.instructor-card');
    const closeVideoBtn = document.querySelector('.instructor-video-close');

    // --- ฟังก์ชันสำหรับเปิด-ปิดหน้าต่าง "Meet The Crew" ---
    if (openCrewBtn && crewModal) {
        // เมื่อกดปุ่ม "Meet The Crew"
        openCrewBtn.addEventListener('click', () => {
            crewModal.style.display = 'flex';
        });
    }

    if (closeCrewBtn && crewModal) {
        // เมื่อกดปุ่มปิด (X)
        closeCrewBtn.addEventListener('click', () => {
            crewModal.style.display = 'none';
        });
    }

    // --- ฟังก์ชันสำหรับเปิดวิดีโอเมื่อคลิกที่การ์ด Instructor ---
    if (instructorCards.length > 0 && videoModal && videoPlayer) {
        instructorCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoSrc = card.getAttribute('data-video-src');
                if (videoSrc) {
                    videoPlayer.src = videoSrc;
                    videoModal.style.display = 'flex';
                }
            });
        });
    }

    // --- ฟังก์ชันสำหรับปิดหน้าต่างวิดีโอ ---
    if (closeVideoBtn && videoModal && videoPlayer) {
        closeVideoBtn.addEventListener('click', () => {
            videoPlayer.pause(); // หยุดวิดีโอ
            videoPlayer.currentTime = 0; // รีเซ็ตเวลาวิดีโอ
            videoModal.style.display = 'none';
        });
    }
// --- Booking Modal (from Navbar "Book Now" button) ---
    const calendarModal = document.getElementById('calendarModal');
    const openBookingModalBtns = document.querySelectorAll('.open-booking-modal-btn');
    const closeCalendarBtn = calendarModal ? calendarModal.querySelector('.close-button') : null;

    if (openBookingModalBtns.length > 0 && calendarModal) {
        openBookingModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                calendarModal.style.display = 'flex';
            });
        });
    }

    if (closeCalendarBtn) {
        closeCalendarBtn.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });
    }
// --- Dreamwerks Registration Modal ---
const dreamwerksModal = document.getElementById('dreamwerksModal');
const openDreamwerksBtn = document.getElementById('open-dreamwerks-btn');
const closeDreamwerksBtn = document.querySelector('.dreamwerks-close');

if (openDreamwerksBtn && dreamwerksModal) {
    openDreamwerksBtn.addEventListener('click', () => {
        dreamwerksModal.style.display = 'flex';
    });
}

if (closeDreamwerksBtn && dreamwerksModal) {
    closeDreamwerksBtn.addEventListener('click', () => {
        dreamwerksModal.style.display = 'none';
    });
}
