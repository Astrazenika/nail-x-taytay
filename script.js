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
        resetApptPicker();

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

    }

    function closeModal() {

        modal.classList.remove('open');
        document.body.style.overflow = '';

        const paymentStepEl = document.getElementById('paymentStep');

        if (paymentStepEl) paymentStepEl.classList.remove('active');

        resetApptPicker();

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

    const bookingFormFields = document.getElementById('bookingFormFields');
    const paymentStep = document.getElementById('paymentStep');
    const paymentBackBtn = document.getElementById('paymentBackBtn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeInput = document.getElementById('bookingTime');

    let bookedSlots = [];   // "date|time" combos that are already taken
    let blockedDates = [];  // whole days that are unavailable no matter the time

    // Pull the list of booked slots and blocked days straight from Firestore.
    // "db" is set up in the Firebase config block at the bottom of index.html.
    function loadAvailability() {

        if (!window.db) return;

        window.db.collection('bookedSlots').get().then(function (snapshot) {

            bookedSlots = [];

            snapshot.forEach(function (doc) {
                const d = doc.data();
                if (d.date && d.time) bookedSlots.push(d.date + '|' + d.time);
            });

            renderApptCalendar();
            renderApptSlots();

        }).catch(function () {
            bookedSlots = [];
        });

        window.db.collection('blockedDates').get().then(function (snapshot) {

            blockedDates = [];
            snapshot.forEach(function (doc) { blockedDates.push(doc.id); });
            renderApptCalendar();

        }).catch(function () {
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

    function dateToStr(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
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

    function formatTimeLabel(hhmm) {

        const minutes = timeToMinutes(hhmm) % (24 * 60);
        let h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const suffix = h >= 12 ? 'PM' : 'AM';

        if (h === 0) h = 12;
        else if (h > 12) h -= 12;

        return h + (m ? ':' + String(m).padStart(2, '0') : ':00') + ' ' + suffix;

    }

    function formatDateLabel(dateStr) {

        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    }

    const STANDARD_TIME_SLOTS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];

    // ===============================
    // APPOINTMENT PICKER (calendar + time-slot pills)
    // ===============================

    const apptPickerStep = document.getElementById('apptPickerStep');
    const apptCalGrid = document.getElementById('apptCalGrid');
    const apptCalMonthLabel = document.getElementById('apptCalMonthLabel');
    const apptCalPrev = document.getElementById('apptCalPrev');
    const apptCalNext = document.getElementById('apptCalNext');
    const apptSlotsDate = document.getElementById('apptSlotsDate');
    const apptSlotsList = document.getElementById('apptSlotsList');
    const apptChosenSummary = document.getElementById('apptChosenSummary');
    const apptChosenText = document.getElementById('apptChosenText');
    const apptChangeBtn = document.getElementById('apptChangeBtn');

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    let apptViewYear = todayDate.getFullYear();
    let apptViewMonth = todayDate.getMonth();
    let selectedApptDate = null;
    let selectedApptTime = null;

    function renderApptCalendar() {

        if (!apptCalGrid) return;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        apptCalMonthLabel.textContent = monthNames[apptViewMonth] + ' ' + apptViewYear;

        // Can't go back before the month we're currently in
        apptCalPrev.disabled = (apptViewYear === todayDate.getFullYear() && apptViewMonth === todayDate.getMonth());

        const firstOfMonth = new Date(apptViewYear, apptViewMonth, 1);
        const startWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(apptViewYear, apptViewMonth + 1, 0).getDate();

        apptCalGrid.innerHTML = '';

        for (let i = 0; i < startWeekday; i++) {
            const blank = document.createElement('span');
            blank.className = 'appt-cal-day appt-cal-day--empty';
            apptCalGrid.appendChild(blank);
        }

        for (let day = 1; day <= daysInMonth; day++) {

            const cellDate = new Date(apptViewYear, apptViewMonth, day);
            const cellStr = dateToStr(cellDate);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'appt-cal-day';
            btn.textContent = day;

            const isPast = cellDate < todayDate;
            const isBlocked = blockedDates.indexOf(cellStr) !== -1;

            if (isPast || isBlocked) {
                btn.disabled = true;
            } else {
                btn.addEventListener('click', function () { selectApptDate(cellStr); });
            }

            if (cellStr === dateToStr(todayDate)) {
                btn.classList.add('appt-cal-day--today');
            }

            if (cellStr === selectedApptDate) {
                btn.classList.add('appt-cal-day--selected');
            }

            apptCalGrid.appendChild(btn);

        }

    }

    function selectApptDate(dateStr) {

        selectedApptDate = dateStr;
        selectedApptTime = null;

        renderApptCalendar();
        renderApptSlots();

    }

    function renderApptSlots() {

        if (!apptSlotsList) return;

        if (!selectedApptDate) {
            apptSlotsDate.textContent = 'Select a date';
            apptSlotsList.innerHTML = '<p class="appt-slots-empty">Choose a date on the calendar to see open times.</p>';
            return;
        }

        apptSlotsDate.textContent = formatDateLabel(selectedApptDate);

        const isToday = selectedApptDate === getTodayStr();
        const nowMinutes = todayDate.getTime() === new Date().setHours(0, 0, 0, 0) ? (new Date().getHours() * 60 + new Date().getMinutes()) : 0;

        apptSlotsList.innerHTML = '';

        STANDARD_TIME_SLOTS.forEach(function (time) {

            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'appt-slot-pill';
            pill.textContent = formatTimeLabel(time);

            const isBooked = bookedSlots.indexOf(selectedApptDate + '|' + time) !== -1;
            const isPastToday = isToday && timeToMinutes(time) <= nowMinutes;

            if (isBooked || isPastToday) {
                pill.disabled = true;
            } else {

                if (time === selectedApptTime) {
                    pill.classList.add('is-selected');
                }

                pill.addEventListener('click', function () {
                    selectedApptTime = time;
                    confirmApptSelection();
                });

            }

            apptSlotsList.appendChild(pill);

        });

    }

    function confirmApptSelection() {

        if (!selectedApptDate || !selectedApptTime) return;

        bookingDateInput.value = selectedApptDate;
        bookingTimeInput.value = selectedApptTime;

        if (apptChosenText) {
            apptChosenText.textContent = formatDateLabel(selectedApptDate) + ' · ' + formatTimeLabel(selectedApptTime);
        }

        apptPickerStep.style.display = 'none';
        bookingFormFields.style.display = 'block';

    }

    function resetApptPicker() {

        selectedApptDate = null;
        selectedApptTime = null;

        apptViewYear = todayDate.getFullYear();
        apptViewMonth = todayDate.getMonth();

        if (bookingDateInput) bookingDateInput.value = '';
        if (bookingTimeInput) bookingTimeInput.value = '';
        if (apptChosenText) apptChosenText.textContent = 'No date/time selected yet';

        if (apptPickerStep) apptPickerStep.style.display = 'block';
        if (bookingFormFields) bookingFormFields.style.display = 'none';

        renderApptCalendar();
        renderApptSlots();

    }

    if (apptCalPrev) {

        apptCalPrev.addEventListener('click', function () {

            apptViewMonth--;
            if (apptViewMonth < 0) { apptViewMonth = 11; apptViewYear--; }
            renderApptCalendar();

        });

    }

    if (apptCalNext) {

        apptCalNext.addEventListener('click', function () {

            apptViewMonth++;
            if (apptViewMonth > 11) { apptViewMonth = 0; apptViewYear++; }
            renderApptCalendar();

        });

    }

    if (apptChangeBtn) {

        apptChangeBtn.addEventListener('click', function () {

            bookingFormFields.style.display = 'none';
            apptPickerStep.style.display = 'block';
            renderApptCalendar();
            renderApptSlots();

        });

    }

    renderApptCalendar();
    renderApptSlots();


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

        if (!date || !time) {
            bookingFormFields.style.display = 'none';
            apptPickerStep.style.display = 'block';
            return;
        }

        // Someone else may have booked this slot while the form was open --
        // re-check against the sheet one last time before taking payment.
        if (blockedDates.indexOf(date) !== -1 || bookedSlots.indexOf(date + '|' + time) !== -1) {

            alert('Sorry, that slot was just taken. Please pick another date or time.');

            bookingFormFields.style.display = 'none';
            resetApptPicker();
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

            // Record this booking in Firestore, so it shows up in the
            // admin dashboard and as taken for the next customer
            if (window.db) {

                window.db.collection('bookings').add({
                    service: selectedService ? selectedService.name : '',
                    name: name,
                    contact: contact,
                    date: date,
                    time: time,
                    notes: notes,
                    price: (selectedService && typeof selectedService.price === 'number') ? selectedService.price : null,
                    status: 'Pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () {
                    bookedSlots.push(date + '|' + time);
                }).catch(function () {});

                // Public, PII-free record -- this is what lets any visitor's
                // calendar know a slot is taken without exposing names/contacts.
                window.db.collection('bookedSlots').add({
                    date: date,
                    time: time
                }).catch(function () {});

            }

            function finishAndClose() {

                closeModal();
                bookingForm.reset();
                applyService(0);
                paymentStep.classList.remove('active');

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
// ===============================
// LUXURY POLISH LAYER
// Sticky navbar glass/shrink, floating gold particles, button ripple,
// scroll-reveal, and subtle hero parallax. Purely additive -- doesn't
// touch any of the booking/gallery logic above.
// ===============================

document.addEventListener('DOMContentLoaded', function () {

    // --- Navbar: add a "scrolled" state once the page moves past the hero top ---
    const luxHeader = document.querySelector('.header');

    if (luxHeader) {

        function updateHeaderState() {
            luxHeader.classList.toggle('is-scrolled', window.scrollY > 24);
        }

        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });

    }

    // --- Floating gold particles inside the hero ---
    const particleHost = document.getElementById('heroParticles');

    if (particleHost && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

        const PARTICLE_COUNT = 18;

        for (let i = 0; i < PARTICLE_COUNT; i++) {

            const p = document.createElement('span');
            p.className = 'hero-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (6 + Math.random() * 6) + 's';
            p.style.animationDelay = (Math.random() * 8) + 's';
            p.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);

            particleHost.appendChild(p);

        }

    }

    // --- Ripple effect on every primary/outline/book button ---
    const rippleTargets = document.querySelectorAll('.btn-primary, .btn-outline, .btn-book');

    rippleTargets.forEach(function (btn) {

        btn.addEventListener('click', function (e) {

            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'lux-ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            btn.appendChild(ripple);

            setTimeout(function () { ripple.remove(); }, 650);

        });

    });

    // --- Scroll reveal: fade/slide up sections and cards as they enter view ---
    const revealSelectors = [
        '.section-heading',
        '.feature',
        '.about-photo',
        '.about-text',
        '.pricing-card',
        '.review-card',
        '.footer-item'
    ];

    const revealEls = document.querySelectorAll(revealSelectors.join(','));

    revealEls.forEach(function (el) {
        el.classList.add('lux-reveal');
    });

    if ('IntersectionObserver' in window) {

        const revealObserver = new IntersectionObserver(function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {
                    entry.target.classList.add('lux-in');
                    revealObserver.unobserve(entry.target);
                }

            });

        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });

    } else {

        // No IntersectionObserver support -- just show everything
        revealEls.forEach(function (el) { el.classList.add('lux-in'); });

    }

    // --- Subtle mouse parallax on the hero photo (desktop only) ---
    const heroPhotoFrame = document.querySelector('.hero-photo-frame');
    const heroSection = document.querySelector('.hero');

    if (heroPhotoFrame && heroSection && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {

        heroSection.addEventListener('mousemove', function (e) {

            const rect = heroSection.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            heroPhotoFrame.style.transform = 'translate(' + (relX * 14) + 'px,' + (relY * 14) + 'px)';

        });

        heroSection.addEventListener('mouseleave', function () {
            heroPhotoFrame.style.transform = 'translate(0,0)';
        });

    }

});

// ===============================
// ADMIN SIGN-IN + BOOKING LOG DASHBOARD (Firebase Auth + Firestore)
// ===============================
// Lets Nail X Taytay staff sign in with a real account and see every
// booking that's been submitted through the site, instead of relying
// only on Messenger. Uses the same Firebase project set up in the
// firebase config block at the bottom of index.html -- "auth" and "db"
// are attached to window there.
document.addEventListener('DOMContentLoaded', function () {

    const adminEntryBtn = document.getElementById('adminEntryBtn');
    const headerAdminBtn = document.getElementById('headerAdminBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginClose = document.getElementById('adminLoginClose');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminEmailInput = document.getElementById('adminEmailInput');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const adminLoginError = document.getElementById('adminLoginError');
    const adminPwToggle = document.getElementById('adminPwToggle');
    const adminPwEyeOpen = document.getElementById('adminPwEyeOpen');
    const adminPwEyeClosed = document.getElementById('adminPwEyeClosed');

    if (adminPwToggle) {

        adminPwToggle.addEventListener('click', function () {

            const showing = adminPasswordInput.type === 'text';

            adminPasswordInput.type = showing ? 'password' : 'text';
            adminPwToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');

            adminPwEyeOpen.style.display = showing ? '' : 'none';
            adminPwEyeClosed.style.display = showing ? 'none' : '';

        });

    }

    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const adminDashboardClose = document.getElementById('adminDashboardClose');
    const adminDashBody = document.getElementById('adminDashBody');
    const adminDashStatus = document.getElementById('adminDashStatus');
    const adminRefreshBtn = document.getElementById('adminRefreshBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    function openAdminOverlay(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeAdminOverlay(modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openDashboard() {
        openAdminOverlay(adminDashboardModal);
        loadBookingLog();
    }

    // "Admin" link in the footer: straight to the dashboard if a
    // Firebase session is already active, otherwise ask to sign in.
    if (adminEntryBtn) {

        adminEntryBtn.addEventListener('click', function () {

            if (!window.auth) {
                alert('Firebase isn\'t set up yet -- see firebase-setup-guide.txt.');
                return;
            }

            if (window.auth.currentUser) {
                openDashboard();
            } else {
                adminLoginForm.reset();
                adminLoginError.classList.remove('show');
                openAdminOverlay(adminLoginModal);
            }

        });

    }

    if (adminLoginClose) {
        adminLoginClose.addEventListener('click', function () { closeAdminOverlay(adminLoginModal); });
    }

    if (adminLoginModal) {
        adminLoginModal.addEventListener('click', function (e) {
            if (e.target === adminLoginModal) closeAdminOverlay(adminLoginModal);
        });
    }

    if (adminLoginForm) {

        adminLoginForm.addEventListener('submit', function (e) {

            e.preventDefault();

            if (!window.auth) return;

            adminLoginError.classList.remove('show');

            window.auth.signInWithEmailAndPassword(adminEmailInput.value, adminPasswordInput.value)
                .then(function () {
                    closeAdminOverlay(adminLoginModal);
                    openDashboard();
                })
                .catch(function () {
                    adminLoginError.textContent = 'Incorrect email or password. Please try again.';
                    adminLoginError.classList.add('show');
                });

        });

    }

    if (adminDashboardClose) {
        adminDashboardClose.addEventListener('click', function () { closeAdminOverlay(adminDashboardModal); });
    }

    if (adminDashboardModal) {
        adminDashboardModal.addEventListener('click', function (e) {
            if (e.target === adminDashboardModal) closeAdminOverlay(adminDashboardModal);
        });
    }

    if (adminLogoutBtn) {

        adminLogoutBtn.addEventListener('click', function () {

            if (window.auth) window.auth.signOut();
            closeAdminOverlay(adminDashboardModal);

        });

    }

    if (adminRefreshBtn) {
        adminRefreshBtn.addEventListener('click', loadBookingLog);
    }

    const adminExportBtn = document.getElementById('adminExportBtn');
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminFilterStatus = document.getElementById('adminFilterStatus');
    const adminFilterService = document.getElementById('adminFilterService');
    const countTotal = document.getElementById('countTotal');
    const countPending = document.getElementById('countPending');
    const countDone = document.getElementById('countDone');
    const countRevenue = document.getElementById('countRevenue');

    let allBookings = []; // cached after each load, so search/filter never re-hits Firestore

    function formatBookingTime(hhmm) {

        if (!hhmm) return '';

        const parts = hhmm.split(':');
        let h = parseInt(parts[0], 10);
        const m = parts[1] || '00';
        const suffix = h >= 12 ? 'PM' : 'AM';

        if (h === 0) h = 12;
        else if (h > 12) h -= 12;

        return h + ':' + m + ' ' + suffix;

    }

    const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Turns "2026-08-14" into "2026-Aug-14" so the month is unmistakable
    // at a glance. Falls back to the raw string if it's not that shape.
    function formatBookingDate(dateStr) {

        if (!dateStr) return '';

        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;

        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthName = MONTH_ABBR[monthIndex];

        if (!monthName) return dateStr;

        return parts[0] + '-' + monthName + '-' + parts[2];

    }

    function loadBookingLog() {

        if (!adminDashBody) return;

        adminDashBody.innerHTML = '';
        adminDashStatus.textContent = 'Loading bookings…';
        adminDashStatus.style.display = 'block';
        adminDashBody.appendChild(adminDashStatus);

        if (!window.db) {
            adminDashStatus.textContent = 'Firebase isn\'t set up yet -- see firebase-setup-guide.txt.';
            return;
        }

        window.db.collection('bookings').get()
            .then(function (snapshot) {

                allBookings = [];

                snapshot.forEach(function (doc) {
                    const d = doc.data();
                    allBookings.push({
                        id: doc.id,
                        date: d.date || '',
                        time: d.time || '',
                        name: d.name || '',
                        contact: d.contact || '',
                        service: d.service || '',
                        notes: d.notes || '',
                        price: (typeof d.price === 'number') ? d.price : null,
                        status: d.status === 'Done' ? 'Done' : 'Pending'
                    });
                });

                // Newest first: sort by date, then time, descending
                allBookings.sort(function (a, b) {
                    const aKey = a.date + ' ' + a.time;
                    const bKey = b.date + ' ' + b.time;
                    return aKey < bKey ? 1 : -1;
                });

                populateServiceFilter();
                renderBookingTable();

            })
            .catch(function () {

                adminDashStatus.textContent = 'Could not load bookings. Make sure you\'re signed in with an admin account that has Firestore access.';

            });

    }

    function populateServiceFilter() {

        if (!adminFilterService) return;

        const current = adminFilterService.value;
        const services = [];

        allBookings.forEach(function (b) {
            if (b.service && services.indexOf(b.service) === -1) services.push(b.service);
        });

        adminFilterService.innerHTML = '<option value="">All Services</option>' +
            services.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');

        adminFilterService.value = services.indexOf(current) !== -1 ? current : '';

    }

    function updateCounters() {

        if (!countTotal) return;

        countTotal.textContent = allBookings.length;
        countPending.textContent = allBookings.filter(function (b) { return b.status === 'Pending'; }).length;
        countDone.textContent = allBookings.filter(function (b) { return b.status === 'Done'; }).length;

        const revenue = allBookings
            .filter(function (b) { return b.status === 'Done'; })
            .reduce(function (sum, b) { return sum + (b.price || 0); }, 0);

        countRevenue.textContent = '₱' + revenue.toLocaleString();

    }

    function getFilteredBookings() {

        const q = (adminSearchInput && adminSearchInput.value || '').trim().toLowerCase();
        const statusFilter = adminFilterStatus ? adminFilterStatus.value : '';
        const serviceFilter = adminFilterService ? adminFilterService.value : '';

        return allBookings.filter(function (b) {

            if (statusFilter && b.status !== statusFilter) return false;
            if (serviceFilter && b.service !== serviceFilter) return false;

            if (q) {
                const haystack = (b.name + ' ' + b.contact + ' ' + b.service + ' ' + b.notes).toLowerCase();
                if (haystack.indexOf(q) === -1) return false;
            }

            return true;

        });

    }

    function renderBookingTable() {

        updateCounters();

        const rows = getFilteredBookings();

        adminDashBody.innerHTML = '';

        if (!allBookings.length) {

            adminDashBody.innerHTML =
                '<div class="admin-empty-state">' +
                '<div class="admin-empty-icon"><svg viewBox="0 0 24 24" width="28" height="28"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 5h16v15H4z"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 9h16M8 3v4M16 3v4"/></svg></div>' +
                '<p>No appointments found. New bookings will automatically appear here.</p>' +
                '</div>';
            return;

        }

        if (!rows.length) {

            adminDashBody.innerHTML =
                '<div class="admin-empty-state">' +
                '<div class="admin-empty-icon"><svg viewBox="0 0 24 24" width="28" height="28"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path stroke="currentColor" stroke-width="1.6" d="m21 21-4.3-4.3"/></svg></div>' +
                '<p>No bookings match your search or filters.</p>' +
                '</div>';
            return;

        }

        const table = document.createElement('table');
        table.className = 'admin-booking-table';

        const thead = document.createElement('thead');
        thead.innerHTML =
            '<tr>' +
            '<th>Booking ID</th><th>Date</th><th>Time</th><th>Customer Name</th><th>Contact</th>' +
            '<th>Service</th><th>Price</th><th>Notes</th><th>Done?</th><th>Actions</th>' +
            '</tr>';
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        rows.forEach(function (b) {

            const row = document.createElement('tr');

            const notesCell = document.createElement('td');
            notesCell.className = 'admin-booking-notes';
            notesCell.textContent = b.notes || '—';
            notesCell.title = b.notes || '';

            const priceLabel = b.price != null ? '₱' + b.price : 'Add price';

            row.innerHTML =
                '<td class="admin-booking-id" title="' + b.id + '">' + b.id.slice(0, 8) + '</td>' +
                '<td>' + formatBookingDate(b.date) + '</td>' +
                '<td>' + formatBookingTime(b.time) + '</td>' +
                '<td>' + b.name + '</td>' +
                '<td>' + b.contact + '</td>' +
                '<td>' + b.service + '</td>' +
                '<td><button type="button" class="admin-price-cell" data-id="' + b.id + '">' + priceLabel + '</button></td>' +
                '<td></td>' +
                '<td><button type="button" class="admin-status-badge admin-status-' + b.status + '" data-id="' + b.id + '">' + b.status + '</button></td>' +
                '<td>' +
                '<div class="admin-row-actions">' +
                '<button type="button" class="admin-icon-btn admin-icon-view" data-id="' + b.id + '" title="View" aria-label="View">' +
                '<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
                '</button>' +
                '<button type="button" class="admin-icon-btn admin-icon-delete" data-id="' + b.id + '" title="Delete" aria-label="Delete">' +
                '<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"/></svg>' +
                '</button>' +
                '</div>' +
                '</td>';

            row.children[7].replaceWith(notesCell);

            tbody.appendChild(row);

        });

        table.appendChild(tbody);
        adminDashBody.appendChild(table);

        // Wire per-row actions (view / edit price / toggle done / delete)
        tbody.querySelectorAll('.admin-icon-view').forEach(function (btn) {
            btn.addEventListener('click', function () { viewBooking(btn.getAttribute('data-id')); });
        });

        tbody.querySelectorAll('.admin-status-badge').forEach(function (btn) {
            btn.addEventListener('click', function () { toggleBookingDone(btn.getAttribute('data-id')); });
        });

        tbody.querySelectorAll('.admin-price-cell').forEach(function (btn) {
            btn.addEventListener('click', function () { editBookingPrice(btn); });
        });

        tbody.querySelectorAll('.admin-icon-delete').forEach(function (btn) {
            btn.addEventListener('click', function () { deleteBooking(btn.getAttribute('data-id')); });
        });

    }

    function findBooking(id) {
        return allBookings.filter(function (b) { return b.id === id; })[0];
    }

    function viewBooking(id) {

        const b = findBooking(id);
        if (!b) return;

        alert(
            'Booking ID: ' + b.id + '\n' +
            'Date: ' + formatBookingDate(b.date) + '\n' +
            'Time: ' + formatBookingTime(b.time) + '\n' +
            'Name: ' + b.name + '\n' +
            'Contact: ' + b.contact + '\n' +
            'Service: ' + b.service + '\n' +
            'Price: ' + (b.price != null ? '₱' + b.price : 'Not set') + '\n' +
            'Status: ' + b.status + '\n' +
            'Notes: ' + (b.notes || '(none)')
        );

    }

    // One click flips Pending <-> Done -- no dropdowns, no extra steps.
    function toggleBookingDone(id) {

        const b = findBooking(id);
        if (!b || !window.db) return;

        const nextStatus = b.status === 'Done' ? 'Pending' : 'Done';

        window.db.collection('bookings').doc(id).update({ status: nextStatus })
            .then(function () {
                b.status = nextStatus;
                renderBookingTable();
            })
            .catch(function () {
                alert('Could not update this booking. Please try again.');
            });

    }

    // Turns the Price cell into an inline number input on click, and
    // saves to Firestore as soon as the admin clicks away or hits Enter.
    function editBookingPrice(cellBtn) {

        const id = cellBtn.getAttribute('data-id');
        const b = findBooking(id);
        if (!b || !window.db) return;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'admin-price-input';
        input.value = b.price != null ? b.price : '';
        input.placeholder = '0';
        input.min = '0';

        cellBtn.replaceWith(input);
        input.focus();
        input.select();

        function commit() {

            const raw = input.value.trim();
            const newPrice = raw === '' ? null : Math.max(0, parseFloat(raw));

            if (newPrice === b.price) {
                renderBookingTable();
                return;
            }

            window.db.collection('bookings').doc(id).update({ price: newPrice })
                .then(function () {
                    b.price = newPrice;
                    renderBookingTable();
                })
                .catch(function () {
                    alert('Could not save the price. Please try again.');
                    renderBookingTable();
                });

        }

        input.addEventListener('blur', commit);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') renderBookingTable();
        });

    }


    function deleteBooking(id) {

        const b = findBooking(id);
        if (!b || !window.db) return;

        if (!confirm('Delete the booking for ' + b.name + ' on ' + formatBookingDate(b.date) + '? This cannot be undone.')) return;

        window.db.collection('bookings').doc(id).delete()
            .then(function () {

                allBookings = allBookings.filter(function (x) { return x.id !== id; });
                renderBookingTable();

                // Free up the slot on the public calendar too
                return window.db.collection('bookedSlots')
                    .where('date', '==', b.date)
                    .where('time', '==', b.time)
                    .get();

            })
            .then(function (snapshot) {

                if (!snapshot) return;
                snapshot.forEach(function (doc) { doc.ref.delete().catch(function () {}); });

            })
            .catch(function () {
                alert('Could not delete this booking. Please try again.');
            });

    }

    function exportBookingsCSV() {

        const rows = getFilteredBookings();

        if (!rows.length) {
            alert('There are no bookings to export.');
            return;
        }

        const header = ['Booking ID', 'Date', 'Time', 'Customer Name', 'Contact Number', 'Service', 'Price', 'Status', 'Notes'];

        function csvEscape(val) {
            const str = String(val == null ? '' : val);
            return '"' + str.replace(/"/g, '""') + '"';
        }

        const lines = [header.map(csvEscape).join(',')];

        rows.forEach(function (b) {
            lines.push([b.id, b.date, formatBookingTime(b.time), b.name, b.contact, b.service, b.price != null ? b.price : '', b.status, b.notes]
                .map(csvEscape).join(','));
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        const now = new Date();
        const stamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

        a.href = url;
        a.download = 'nail-x-taytay-bookings-' + stamp + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    }

    if (adminExportBtn) {
        adminExportBtn.addEventListener('click', exportBookingsCSV);
    }

    [adminSearchInput, adminFilterStatus, adminFilterService].forEach(function (el) {
        if (el) el.addEventListener('input', renderBookingTable);
    });


    if (headerAdminBtn) {

        headerAdminBtn.addEventListener('click', function () {
            openDashboard();
        });

    }

    // If an admin is already signed in (e.g. page refresh), keep them
    // signed in -- Firebase remembers the session automatically. This is
    // also what shows/hides the "Admin" button up in the header -- only
    // someone who is actually signed in ever sees it.
    if (window.auth) {

        window.auth.onAuthStateChanged(function (user) {

            if (headerAdminBtn) {
                headerAdminBtn.style.display = user ? 'inline-flex' : 'none';
            }

            if (!user && adminDashboardModal.classList.contains('open')) {
                closeAdminOverlay(adminDashboardModal);
            }

        });

    }

});