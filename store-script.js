document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Image Slider Logic ---
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        const nextBtn = document.querySelector('.slider-btn.next');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const dotsContainer = document.querySelector('.slider-dots');
        let currentIndex = 0;
        let slideInterval;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });
        const dots = document.querySelectorAll('.dot');

        function updateDots(index) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }

        function goToSlide(index) {
            if (index >= slides.length) {
                index = 0;
            } else if (index < 0) {
                index = slides.length - 1;
            }
            sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateDots(currentIndex);
            resetInterval();
        }
        
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000); // Auto-slide every 5 seconds
        }

        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        
        resetInterval(); // Start auto-sliding
    }

    // --- 2. Delivery Option Logic (เวอร์ชันอัปเดต) ---
const deliveryOptions = document.querySelectorAll('input[name="delivery_option"]');
const addressContainer = document.getElementById('shipping-address-container');
const addressTextarea = document.getElementById('store-address');
const pickupLocationContainer = document.getElementById('pickup-location-container');

function toggleDeliveryFields() {
    const selectedOption = document.querySelector('input[name="delivery_option"]:checked').value;

    if (selectedOption === 'จัดส่ง') {
        addressContainer.style.display = 'block';
        if (addressTextarea) addressTextarea.required = true;

        if (pickupLocationContainer) pickupLocationContainer.style.display = 'none';
    } else { // 'รับที่สถาบัน'
        addressContainer.style.display = 'none';
        if (addressTextarea) addressTextarea.required = false;

        if (pickupLocationContainer) pickupLocationContainer.style.display = 'block';
    }
}

if (deliveryOptions.length > 0) {
    // ทำงานทันทีเมื่อโหลดหน้าเว็บ
    toggleDeliveryFields();
    // เพิ่ม Listener รอการเปลี่ยนแปลง
    deliveryOptions.forEach(option => {
        option.addEventListener('change', toggleDeliveryFields);
    });
}
});
// --- 3. Order Counter Logic ---
    const currentOrdersElement = document.getElementById('current-orders');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const soldOutText = document.getElementById('sold-out-text');
    const orderFormButton = document.querySelector('#order-form button');

    // ===== VVV คุณสามารถแก้ไขตัวเลขตรงนี้ได้เลย VVV =====
    const ordersPlaced = 0; // << แก้ไขจำนวนที่สั่งซื้อแล้วที่นี่
    const totalStock = 100;
    // ===============================================

    if (currentOrdersElement && progressBarFill) {
        // อัปเดตตัวเลข
        currentOrdersElement.textContent = ordersPlaced;

        // คำนวณ % ของ Progress Bar
        const percentage = (ordersPlaced / totalStock) * 100;
        progressBarFill.style.width = `${percentage}%`;

        // ตรวจสอบถ้าหากของหมด
        if (ordersPlaced >= totalStock) {
            if(soldOutText) soldOutText.style.display = 'block';
            if(orderFormButton) {
                orderFormButton.disabled = true;
                orderFormButton.textContent = 'SOLD OUT';
                orderFormButton.classList.add('cta-button-unavailable'); // ใช้ class ที่เราเคยสร้างไว้
            }
        }
    }