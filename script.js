// ===============================
// BOOKING MODAL
// ===============================

document.addEventListener('DOMContentLoaded', function () {

    // Single source of truth for all service data.
    // Every part of the modal (dropdown, preview, summary) reads from here,
    // so nothing can ever fall out of sync.
    const SERVICES = [
        { name: 'Gel Manicure',    price: 399, duration: '1-2 Hours',         img: 'images/gel-manicure.png' },
        { name: 'Gel Pedicure',    price: 449, duration: '1-2 Hours',         img: 'images/service-pedicure.png' },
        { name: 'Nail Extensions', price: 449, duration: '2-3 Hours',         img: 'images/service-extensions.png' },
        { name: 'BIAB',            price: 449, duration: '2 Hours',           img: 'images/service-biab.png' },
        { name: 'Custom Nail Art', price: null, duration: 'Depends on Design', img: 'images/service-custom-art.png' }
    ];

    const RESERVATION_FEE = 100;

    const modal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('modalClose');
    const modalPhoto = document.getElementById('modalPhoto');
    const modalServiceName = document.getElementById('modalServiceName');
    const modalServicePrice = document.getElementById('modalServicePrice');
    const summaryPrice = document.getElementById('summaryPrice');
    const remainingBalance = document.getElementById('remainingBalance');
    const serviceDuration = document.getElementById('serviceDuration');
    const warningText = document.getElementById('warningText');
    const serviceSelect = document.getElementById('serviceSelect');
    const serviceItems = document.querySelectorAll('.service-item');
    const bookingForm = document.getElementById('bookingForm');

    // The circles only become clickable once they've settled into a
    // straight line after "View All Services" is pressed.
    let circlesUnlocked = false;

    function formatPrice(price) {
        return price === null ? 'Price may vary' : '₱' + price;
    }

    // Build the dropdown once from SERVICES, so its options always match
    // the cards and can never drift out of sync.
    SERVICES.forEach(function (service, index) {

        const option = document.createElement('option');
        option.value = index;
        option.textContent = service.price === null
            ? service.name
            : service.name + ' — ' + formatPrice(service.price);

        serviceSelect.appendChild(option);

    });

    // Updates every part of the modal (preview photo, price, summary box,
    // warning text, dropdown selection) from a single service index.
    function applyService(index) {

        const service = SERVICES[index];
        if (!service) return;

        modalPhoto.src = service.img;
        modalPhoto.alt = service.name;
        modalServiceName.textContent = service.name;
        modalServicePrice.textContent = formatPrice(service.price);

        summaryPrice.textContent = formatPrice(service.price);
        serviceDuration.textContent = service.duration;

        if (service.price === null) {
            remainingBalance.textContent = 'Depends on Design';
            warningText.textContent = 'A non-refundable fee of ₱' + RESERVATION_FEE +
                ' is required to secure your appointment. The final price will be confirmed based on your chosen design.';
        } else {
            const remaining = service.price - RESERVATION_FEE;
            remainingBalance.textContent = '₱' + remaining;
            warningText.textContent = 'A non-refundable fee of ₱' + RESERVATION_FEE +
                ' is required to secure your appointment. The remaining balance of ₱' + remaining +
                ' will be paid during your appointment.';
        }

        serviceSelect.value = index;

    }

    function openModal(index) {

        applyService(index);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

    }

    function closeModal() {

        modal.classList.remove('open');
        document.body.style.overflow = '';

        const paymentStepEl = document.getElementById('paymentStep');
        const bookingFormFieldsEl = document.getElementById('bookingFormFields');

        if (paymentStepEl) paymentStepEl.classList.remove('active');
        if (bookingFormFieldsEl) bookingFormFieldsEl.style.display = 'block';

    }

    // Click on a service card opens the modal pre-filled with that service --
    // but only once the circles have settled into their final straight line.
    serviceItems.forEach(function (item) {

        item.addEventListener('click', function () {

            if (!circlesUnlocked) {
                return;
            }

            const serviceName = item.getAttribute('data-service');
            const index = SERVICES.findIndex(function (s) { return s.name === serviceName; });

            if (index !== -1) {
                openModal(index);
            }

        });

    });

    // Changing the dropdown inside the modal updates everything else to match
    serviceSelect.addEventListener('change', function () {

        applyService(parseInt(serviceSelect.value, 10));

    });

    // The hero "Book Appointment" button opens the booking modal directly,
    // pre-filled with the first service, instead of just scrolling down.
    const heroBookBtn = document.getElementById('heroBookBtn');

    if (heroBookBtn) {

        heroBookBtn.addEventListener('click', function (e) {

            e.preventDefault();
            openModal(0);

        });

    }

    // The floating "Book Now" button does the same
    const floatingBookBtn = document.getElementById('floatingBookBtn');

    if (floatingBookBtn) {

        floatingBookBtn.addEventListener('click', function (e) {

            e.preventDefault();
            openModal(0);

        });

    }

    // ===============================
    // GALLERY: random preview + full gallery modal
    // ===============================

    // --- Name your photos 1.jpg, 2.jpg, 3.jpg, etc. inside images/gallery/
    //     Then just update this ONE number to match how many you have.
    //     No limit -- change it to 100 if you have 100 photos. ---
    const GALLERY_PHOTO_COUNT = 100;

    const GALLERY_IMAGES = [];

    for (let i = 1; i <= GALLERY_PHOTO_COUNT; i++) {
        GALLERY_IMAGES.push('images/gallery/' + i + '.jpg');
    }

    function shuffleCopy(arr) {

        const copy = arr.slice();

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }

        return copy;

    }

    // Show 4 random photos in the homepage preview every time the page loads
    const galleryPreview = document.getElementById('galleryPreview');

    if (galleryPreview && GALLERY_IMAGES.length) {

        const previewImgs = Array.prototype.slice.call(
            galleryPreview.querySelectorAll('.gallery-item img')
        );

        function showRandomSet() {

            const shuffled = shuffleCopy(GALLERY_IMAGES);

            previewImgs.forEach(function (img, index) {

                // Fade out, swap the photo, then fade back in
                img.style.transition = 'opacity .4s ease';
                img.style.opacity = '0';

                setTimeout(function () {

                    // Cycles back to the start of the list if there are fewer
                    // photos than preview slots, so every slot always shows something.
                    img.src = shuffled[index % shuffled.length];
                    img.style.opacity = '1';

                }, 400);

            });

        }

        showRandomSet();

        // Keep rotating every 3 seconds regardless of how many photos exist --
        // even with only 4 photos, reshuffling changes which slot shows which.
        if (GALLERY_IMAGES.length > 1) {
            setInterval(showRandomSet, 3000);
        }

    }

    // "View Gallery" opens a modal showing every photo in GALLERY_IMAGES
    const viewFullGalleryBtn = document.getElementById('viewFullGalleryBtn');
    const galleryModal = document.getElementById('galleryModal');
    const galleryModalClose = document.getElementById('galleryModalClose');
    const galleryModalGrid = document.getElementById('galleryModalGrid');

    // Lightbox elements (zoomed single-photo view with prev/next)
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let lightboxIndex = 0;

    function openLightbox(index) {

        lightboxIndex = index;
        lightboxImage.src = GALLERY_IMAGES[lightboxIndex];
        lightboxOverlay.classList.add('open');

    }

    function closeLightbox() {
        lightboxOverlay.classList.remove('open');
    }

    function showLightboxPhoto(step) {

        lightboxIndex = (lightboxIndex + step + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        lightboxImage.src = GALLERY_IMAGES[lightboxIndex];

    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function () { showLightboxPhoto(-1); });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function () { showLightboxPhoto(1); });
    }

    if (lightboxOverlay) {

        lightboxOverlay.addEventListener('click', function (e) {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {

            if (!lightboxOverlay.classList.contains('open')) {
                return;
            }

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showLightboxPhoto(-1);
            if (e.key === 'ArrowRight') showLightboxPhoto(1);

        });

    }

    if (viewFullGalleryBtn && galleryModal && galleryModalGrid) {

        function openGalleryModal() {

            galleryModalGrid.innerHTML = '';

            GALLERY_IMAGES.forEach(function (src, index) {

                const item = document.createElement('div');
                item.className = 'gallery-modal-item';

                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Nail art photo';

                // Clicking any photo zooms it into the lightbox
                item.addEventListener('click', function () {
                    openLightbox(index);
                });

                item.appendChild(img);
                galleryModalGrid.appendChild(item);

            });

            galleryModal.classList.add('open');
            document.body.style.overflow = 'hidden';

        }

        function closeGalleryModal() {

            galleryModal.classList.remove('open');
            document.body.style.overflow = '';

        }

        viewFullGalleryBtn.addEventListener('click', openGalleryModal);
        galleryModalClose.addEventListener('click', closeGalleryModal);

        galleryModal.addEventListener('click', function (e) {
            if (e.target === galleryModal) {
                closeGalleryModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && galleryModal.classList.contains('open')) {
                closeGalleryModal();
            }
        });

    }

    // Close interactions
    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // --- Change this to your own Facebook Page username to update where
    //     booking details get sent on Messenger. ---
    const MESSENGER_PAGE_USERNAME = '61585935434579';

    // --- Your Google Apps Script Web App URL. This lets the site check
    //     which dates are already booked, and record new bookings. ---
    const BOOKINGS_API_URL = 'https://script.google.com/macros/s/AKfycbwVBa_xcdWElqx5T1ynu-ntbcYaVbKnZ7o4cD8qLx5_jFB9h1vm5RIKGl_e3OcrNjM8/exec';

    const bookingFormFields = document.getElementById('bookingFormFields');
    const paymentStep = document.getElementById('paymentStep');
    const paymentBackBtn = document.getElementById('paymentBackBtn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeInput = document.getElementById('bookingTime');

    let bookedSlots = [];   // "date|time" combos that are already taken
    let blockedDates = [];  // whole days that are unavailable no matter the time

    // Pull the list of booked slots and blocked days from the Google Sheet.
    function loadAvailability() {

        if (!BOOKINGS_API_URL) return;

        fetch(BOOKINGS_API_URL)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                bookedSlots = data.bookedSlots || [];
                blockedDates = data.blockedDates || [];
            })
            .catch(function () {
                // If the sheet can't be reached, just proceed without blocking anything
                bookedSlots = [];
                blockedDates = [];
            });

    }

    loadAvailability();

    // --- Prevent picking a past date, and disable time slots that have
    //     already passed today, so no one can accidentally book a moment
    //     that's already gone. ---
    function getTodayStr() {

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;

    }

    function timeToMinutes(hhmm) {

        const parts = hhmm.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        // "00:00" here means the last slot of the night (midnight), not the
        // very start of the day -- so treat it as the end of the day (1440)
        // rather than 0, otherwise it would always look "already passed".
        if (hours === 0 && minutes === 0) {
            return 24 * 60;
        }

        return hours * 60 + minutes;

    }

    function updateTimeOptionsAvailability() {

        if (!bookingDateInput || !bookingTimeInput) return;

        const isToday = bookingDateInput.value === getTodayStr();
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        Array.prototype.forEach.call(bookingTimeInput.options, function (opt) {

            if (!opt.value) return; // skip the "Select time" placeholder

            const optMinutes = timeToMinutes(opt.value);
            opt.disabled = isToday && optMinutes <= nowMinutes;

        });

        // If the time that was selected is now in the past, clear it
        const currentSelection = bookingTimeInput.options[bookingTimeInput.selectedIndex];

        if (currentSelection && currentSelection.disabled) {
            bookingTimeInput.value = '';
        }

    }

    if (bookingDateInput) {

        // Can't pick a date before today
        bookingDateInput.min = getTodayStr();

        bookingDateInput.addEventListener('change', updateTimeOptionsAvailability);

    }

    updateTimeOptionsAvailability();

    let dateWarning = document.getElementById('dateWarning');

    if (!dateWarning && bookingDateInput) {

        dateWarning = document.createElement('p');
        dateWarning.id = 'dateWarning';
        dateWarning.className = 'date-warning';
        bookingDateInput.closest('.input-icon-wrap').insertAdjacentElement('afterend', dateWarning);

    }

    // Only conflicts when BOTH the date AND the time match an existing
    // booking -- a different time on the same date is perfectly fine, and
    // so is the same time on a different date.
    function checkAvailability() {

        if (!bookingDateInput || !bookingTimeInput || !dateWarning) return;

        const date = bookingDateInput.value;
        const time = bookingTimeInput.value;

        if (date && blockedDates.indexOf(date) !== -1) {

            dateWarning.textContent = 'This date is not available (day off). Please choose another date.';
            dateWarning.style.display = 'block';
            bookingDateInput.setCustomValidity('This date is not available.');
            return;

        }

        if (date && time && bookedSlots.indexOf(date + '|' + time) !== -1) {

            dateWarning.textContent = 'That time is already booked on this date. Please choose a different time or date.';
            dateWarning.style.display = 'block';
            bookingTimeInput.setCustomValidity('This time slot is already booked.');
            return;

        }

        dateWarning.style.display = 'none';
        bookingDateInput.setCustomValidity('');
        bookingTimeInput.setCustomValidity('');

    }

    if (bookingDateInput) bookingDateInput.addEventListener('change', checkAvailability);
    if (bookingTimeInput) bookingTimeInput.addEventListener('change', checkAvailability);


    // Contact Number: strip anything that isn't a digit (including pasted
    // text), and cap it at 11 digits to match the 09XXXXXXXXX PH format.
    const bookingContactInput = document.getElementById('bookingContact');

    if (bookingContactInput) {

        bookingContactInput.addEventListener('input', function () {

            let digitsOnly = bookingContactInput.value.replace(/\D/g, '');

            if (digitsOnly.length > 11) {
                digitsOnly = digitsOnly.slice(0, 11);
            }

            bookingContactInput.value = digitsOnly;

        });

    }

    // Submitting the form (clicking "Pay ₱100 now to Reserve") doesn't book
    // anything yet -- it just reveals the QR code so the customer can pay.
    bookingForm.addEventListener('submit', function (e) {

        e.preventDefault();

        const date = bookingDateInput.value;
        const time = bookingTimeInput.value;

        if (blockedDates.indexOf(date) !== -1) {
            bookingDateInput.reportValidity();
            return;
        }

        if (bookedSlots.indexOf(date + '|' + time) !== -1) {
            bookingTimeInput.reportValidity();
            return;
        }

        bookingFormFields.style.display = 'none';
        paymentStep.classList.add('active');

    });

    // "Back to form" returns to editing without losing what was typed
    if (paymentBackBtn) {

        paymentBackBtn.addEventListener('click', function () {

            paymentStep.classList.remove('active');
            bookingFormFields.style.display = 'block';

        });

    }

    // Show small thumbnail previews when photos are chosen (up to 3)
    const inspoPhotoInput = document.getElementById('bookingInspoPhoto');
    const inspoPreviewList = document.getElementById('inspoPreviewList');
    const inspoUploadLabel = document.getElementById('inspoUploadLabel');
    const MAX_INSPO_PHOTOS = 3;

    function renderInspoPreviews() {

        inspoPreviewList.innerHTML = '';

        const files = Array.prototype.slice.call(inspoPhotoInput.files);

        if (!files.length) {
            inspoUploadLabel.textContent = 'Choose photos';
            return;
        }

        inspoUploadLabel.textContent = files.length + ' photo' + (files.length > 1 ? 's' : '') + ' selected';

        files.forEach(function (file) {

            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement('img');
                img.className = 'inspo-preview';
                img.src = e.target.result;
                img.alt = 'Inspo preview';
                inspoPreviewList.appendChild(img);
            };

            reader.readAsDataURL(file);

        });

    }

    if (inspoPhotoInput) {

        inspoPhotoInput.addEventListener('change', function () {

            if (inspoPhotoInput.files.length > MAX_INSPO_PHOTOS) {

                alert('Please choose up to ' + MAX_INSPO_PHOTOS + ' photos only.');
                inspoPhotoInput.value = '';
                inspoPreviewList.innerHTML = '';
                inspoUploadLabel.textContent = 'Choose photos';
                return;

            }

            renderInspoPreviews();

        });

    }

    // off to Messenger, where the shop owner can verify the GCash payment
    // and manually confirm the appointment.
    if (confirmPaymentBtn) {

        confirmPaymentBtn.addEventListener('click', function () {

            const selectedService = SERVICES[parseInt(serviceSelect.value, 10)];
            const name = document.getElementById('bookingName').value || '(not provided)';
            const contact = document.getElementById('bookingContact').value || '(not provided)';
            const date = document.getElementById('bookingDate').value || '(not provided)';
            const time = document.getElementById('bookingTime').value || '(not provided)';
            const notes = document.getElementById('bookingNotes').value || '(none)';
            const inspoFiles = inspoPhotoInput ? Array.prototype.slice.call(inspoPhotoInput.files) : [];

            const message =
                'Hi! I just paid the ₱100 reservation fee for a booking.\n\n' +
                'Service: ' + (selectedService ? selectedService.name : '') + '\n' +
                'Name: ' + name + '\n' +
                'Contact Number: ' + contact + '\n' +
                'Date: ' + date + '\n' +
                'Time: ' + time + '\n' +
                'Notes: ' + notes + '\n\n' +
                'Here is my payment screenshot' + (inspoFiles.length ? ' and design inspo photo(s)' : '') + ':';

            // Record this date as booked in the Google Sheet, so it shows
            // up as taken for the next customer
            if (BOOKINGS_API_URL) {

                fetch(BOOKINGS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        service: selectedService ? selectedService.name : '',
                        name: name,
                        contact: contact,
                        date: date,
                        time: time,
                        notes: notes
                    })
                }).then(function () {
                    bookedSlots.push(date + '|' + time);
                }).catch(function () {});

            }

            function finishAndClose() {

                closeModal();
                bookingForm.reset();
                applyService(0);
                paymentStep.classList.remove('active');
                bookingFormFields.style.display = 'block';

                if (inspoPreviewList) inspoPreviewList.innerHTML = '';
                if (inspoUploadLabel) inspoUploadLabel.textContent = 'Choose photos';

            }

            // On phones, the Web Share API can hand the inspo photos directly
            // to whichever app the customer picks (including Messenger) --
            // no manual attaching needed.
            if (inspoFiles.length && navigator.canShare && navigator.canShare({ files: inspoFiles })) {

                navigator.share({
                    files: inspoFiles,
                    text: message
                }).catch(function () {
                    // If they cancel the share sheet, still fall back below
                }).then(function () {
                    window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');
                    finishAndClose();
                });

                return;

            }

            // Fallback (desktop, or no photos attached): copy the message and
            // open Messenger -- ask them to attach the photos manually
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(message).catch(function () {});
            }

            alert(
                'Your booking details have been copied!\n\n' +
                'Messenger will now open — please PASTE this message' +
                (inspoFiles.length ? ', attach your inspo photo(s) and GCash payment screenshot,' : ' and attach your GCash payment screenshot,') +
                ' then hit send to confirm your appointment.'
            );

            window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');

            finishAndClose();

        });

    }

    // ===============================
    // SERVICES: ORBIT <-> STRAIGHT LINE ANIMATION (toggle)
    // ===============================

    const featuredCircles = document.getElementById('featuredCircles');
    const viewAllBtn = document.getElementById('viewAllServicesBtn');

    if (featuredCircles && viewAllBtn) {

        const circles = Array.prototype.slice.call(featuredCircles.querySelectorAll('.featured-circle'));
        let isLine = false;
        let isAnimating = false;

        const V_HEIGHT = 340;
        const LINE_HEIGHT = 220;

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // Positions the 5 circles into the V-shape, centered on whatever the
        // container's actual measured width happens to be -- no guessing.
        const V_SHAPE = [
            { top: 0,   offset: 0 },
            { top: 95,  offset: -115 },
            { top: 95,  offset: 115 },
            { top: 190, offset: -215 },
            { top: 190, offset: 215 }
        ];

        function layoutVShape(animated) {

            const circleSize = 130;
            const centerX = featuredCircles.offsetWidth / 2;

            circles.forEach(function (circle, index) {

                circle.style.transition = animated
                    ? 'top .8s cubic-bezier(.34,1.56,.64,1), left .8s cubic-bezier(.34,1.56,.64,1)'
                    : 'none';

                const pos = V_SHAPE[index];

                circle.style.top = pos.top + 'px';
                circle.style.left = (centerX + pos.offset - circleSize / 2) + 'px';

                circle.classList.remove('show-label');

            });

        }

        featuredCircles.style.height = V_HEIGHT + 'px';
        layoutVShape(false);

        function playForward() {

            isAnimating = true;
            featuredCircles.classList.add('is-active');
            featuredCircles.style.height = V_HEIGHT + 'px';

            const circleSize = 130;
            const containerWidth = featuredCircles.offsetWidth;
            const containerHeight = V_HEIGHT;
            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;
            const radius = Math.min(containerWidth, containerHeight) / 2 - circleSize / 2 - 30;

            // No CSS transition during the animation -- positions are driven frame-by-frame
            circles.forEach(function (circle) {
                circle.style.transition = 'none';
            });

            // Capture each circle's actual current position (the V-shape spot it's
            // already sitting in) so the very first frame can start exactly there --
            // no snap/jump before the motion begins.
            const startPositions = circles.map(function (circle) {
                return {
                    x: parseFloat(circle.style.left) || 0,
                    y: parseFloat(circle.style.top) || 0
                };
            });

            // Every circle's fixed slot on the perfect circle, evenly spaced.
            const baseAngles = circles.map(function (circle, index) {
                return (index * ((Math.PI * 2) / circles.length)) - Math.PI / 2;
            });

            const targetPositions = baseAngles.map(function (angle) {
                return {
                    x: centerX + radius * Math.cos(angle) - circleSize / 2,
                    y: centerY + radius * Math.sin(angle) - circleSize / 2
                };
            });

            const moveDuration = 550;   // glide smoothly from V-shape into the circle
            const spinDuration = 1200;  // then spin together around it
            const totalDuration = moveDuration + spinDuration;
            const totalRotation = Math.PI * 2 * 1.25; // a turn and a quarter
            const startTime = performance.now();

            function animate(now) {

                const elapsed = now - startTime;

                if (elapsed < moveDuration) {

                    // Phase 1: glide from the current V-shape position into the circle slot
                    const progress = easeInOutCubic(elapsed / moveDuration);

                    circles.forEach(function (circle, index) {

                        const start = startPositions[index];
                        const target = targetPositions[index];

                        circle.style.left = (start.x + (target.x - start.x) * progress) + 'px';
                        circle.style.top = (start.y + (target.y - start.y) * progress) + 'px';

                    });

                } else {

                    // Phase 2: now perfectly on the circle, spin together
                    const spinElapsed = Math.min(elapsed - moveDuration, spinDuration);
                    const progress = easeInOutCubic(spinElapsed / spinDuration);
                    const rotation = progress * totalRotation;

                    circles.forEach(function (circle, index) {

                        const angle = baseAngles[index] + rotation;
                        const x = centerX + radius * Math.cos(angle) - circleSize / 2;
                        const y = centerY + radius * Math.sin(angle) - circleSize / 2;

                        circle.style.left = x + 'px';
                        circle.style.top = y + 'px';

                    });

                }

                if (elapsed < totalDuration) {
                    requestAnimationFrame(animate);
                } else {
                    settleIntoLine();
                }

            }

            function settleIntoLine() {

                const gap = 45;
                const totalWidth = (circleSize * circles.length) + (gap * (circles.length - 1));
                const startLeft = Math.max(0, (containerWidth - totalWidth) / 2);
                const lineTop = 40;

                featuredCircles.style.transition = 'height .7s ease';
                featuredCircles.style.height = LINE_HEIGHT + 'px';

                circles.forEach(function (circle, index) {

                    circle.style.transition = 'top .9s cubic-bezier(.34,1.56,.64,1), left .9s cubic-bezier(.34,1.56,.64,1)';

                    setTimeout(function () {

                        circle.style.left = (startLeft + index * (circleSize + gap)) + 'px';
                        circle.style.top = lineTop + 'px';

                    }, index * 70);

                });

                // Reveal each service's name and price once it settles into place
                const settleTime = 900 + (circles.length * 70);

                circles.forEach(function (circle, index) {

                    setTimeout(function () {
                        circle.classList.add('show-label');
                    }, settleTime + (index * 60));

                });

                // Once fully settled, resume the gentle floating so the row
                // never looks completely frozen in place, and unlock clicking
                // so the circles can now open the booking modal
                setTimeout(function () {
                    featuredCircles.classList.remove('is-active');
                    isAnimating = false;
                    isLine = true;
                    circlesUnlocked = true;
                    featuredCircles.classList.add('is-unlocked');
                }, settleTime + 200);

            }

            requestAnimationFrame(animate);

        }

        function playBackward() {

            isAnimating = true;
            circlesUnlocked = false;
            featuredCircles.classList.remove('is-unlocked');
            featuredCircles.classList.add('is-active');

            circles.forEach(function (circle) {
                circle.classList.remove('show-label');
            });

            featuredCircles.style.transition = 'height .7s ease';
            featuredCircles.style.height = V_HEIGHT + 'px';

            layoutVShape(true);

            setTimeout(function () {
                featuredCircles.classList.remove('is-active');
                isAnimating = false;
                isLine = false;
            }, 850);

        }

        viewAllBtn.addEventListener('click', function () {

            if (isAnimating) {
                return;
            }

            if (isLine) {
                playBackward();
            } else {
                playForward();
            }

        });

    }

});