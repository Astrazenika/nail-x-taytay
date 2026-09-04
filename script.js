// ===============================
// APP SPLASH SCREEN CLEANUP -- only relevant when running as an
// installed PWA (the splash is CSS-hidden entirely otherwise). Removes
// it from the DOM once its fade-out finishes, so it can't linger and
// block anything for accessibility tools.
// ===============================
(function () {
    const splash = document.getElementById('appSplash');
    if (!splash) return;
    splash.addEventListener('animationend', function () {
        splash.remove();
    });
})();

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

    // Which service the customer wants -- set by clicking a service card,
    // used once they finish picking a date/time on the homepage calendar.
    let pendingServiceIndex = 0;

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

        if (paymentStepEl) paymentStepEl.classList.remove('active');

    }

    // Scrolls back up to the calendar so the customer can pick (or change)
    // a date and time before anything else happens.
    function scrollToApptPicker() {

        const target = document.getElementById('apptPickerStep');

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

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

            if (index === -1) return;

            pendingServiceIndex = index;

            const dateEl = document.getElementById('bookingDate');
            const timeEl = document.getElementById('bookingTime');

            if (dateEl && timeEl && dateEl.value && timeEl.value) {
                openModal(index);
            } else {
                scrollToApptPicker();
            }

        });

    });

    // Changing the dropdown inside the modal updates everything else to match
    serviceSelect.addEventListener('change', function () {

        applyService(parseInt(serviceSelect.value, 10));

    });

    // The floating "Book Now" button jumps straight to the calendar --
    // or, if a date/time is already picked, opens the modal directly.
    const floatingBookBtn = document.getElementById('floatingBookBtn');

    // NOTE: this button's click behavior (Install App vs Manage Booking)
    // is fully handled by the PWA install script near the bottom of this
    // file, which knows the button's current mode. Nothing to wire here.

    // ===============================
    // MOBILE NAV: hamburger toggle
    // ===============================

    const navToggle = document.getElementById('navToggle');
    const navbar = document.querySelector('.navbar');

    if (navToggle && navbar) {

        navToggle.addEventListener('click', function () {

            const isOpen = navbar.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        });

        // Close the menu once a link is tapped
        navbar.querySelectorAll('a').forEach(function (link) {

            link.addEventListener('click', function () {

                navbar.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');

            });

        });

        // Close the menu when tapping anywhere outside it
        document.addEventListener('click', function (e) {

            const clickedInsideNav = navbar.contains(e.target) || navToggle.contains(e.target);

            if (!clickedInsideNav && navbar.classList.contains('open')) {

                navbar.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');

            }

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

    // --- Gallery filter tags -------------------------------------------
    // Optional: tag each photo with a category so the "Full Gallery" view
    // can be filtered by service/design type. Add a line here for any
    // photo you want tagged, e.g.:
    //   'images/gallery/3.jpg': 'Nail Extensions',
    // Untagged photos still show up under "All", just not under a
    // specific filter. Reusing the site's own service names keeps the
    // filter list short and familiar.
    const GALLERY_CATEGORIES = {
        // 'images/gallery/1.jpg': 'Gel Manicure',
        // 'images/gallery/2.jpg': 'Nail Extensions',
    };

    let galleryActiveFilter = 'All';

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
        lightboxOverlay.classList.remove('single-image');
    }

    // For standalone single photos (no prev/next), like the shop's
    // location street-view image -- reuses the same zoom overlay.
    function openSingleImageLightbox(src) {

        lightboxImage.src = src;
        lightboxOverlay.classList.add('open');
        lightboxOverlay.classList.add('single-image');

    }

    const apptLocationPhoto = document.querySelector('.appt-location-photo img');

    if (apptLocationPhoto) {

        apptLocationPhoto.addEventListener('click', function () {
            openSingleImageLightbox(apptLocationPhoto.getAttribute('src'));
        });

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

        function renderGalleryFilterBar() {

            const bar = document.getElementById('galleryFilterBar');
            if (!bar) return;

            const usedCategories = SERVICES
                .map(function (s) { return s.name; })
                .filter(function (name) {
                    return Object.values(GALLERY_CATEGORIES).indexOf(name) !== -1;
                });

            // Only show the filter bar at all once at least one photo has
            // actually been tagged -- no point showing empty filters.
            if (!usedCategories.length) {
                bar.innerHTML = '';
                bar.hidden = true;
                return;
            }

            bar.hidden = false;
            const options = ['All'].concat(usedCategories);

            bar.innerHTML = options.map(function (label) {
                return '<button type="button" class="gallery-filter-pill' +
                    (label === galleryActiveFilter ? ' is-active' : '') +
                    '" data-filter="' + label + '">' + label + '</button>';
            }).join('');

            bar.querySelectorAll('.gallery-filter-pill').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    galleryActiveFilter = btn.getAttribute('data-filter');
                    renderGalleryFilterBar();
                    renderGalleryGrid();
                });
            });

        }

        function renderGalleryGrid() {

            galleryModalGrid.innerHTML = '';

            GALLERY_IMAGES.forEach(function (src, index) {

                if (galleryActiveFilter !== 'All' && GALLERY_CATEGORIES[src] !== galleryActiveFilter) return;

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

        }

        function openGalleryModal() {

            galleryActiveFilter = 'All';
            renderGalleryFilterBar();
            renderGalleryGrid();

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
    const messageToReserveBtn = document.getElementById('messageToReserveBtn');
    const bookingSuccessStep = document.getElementById('bookingSuccessStep');
    const bookingSuccessMessengerBtn = document.getElementById('bookingSuccessMessengerBtn');
    const bookingSuccessDoneBtn = document.getElementById('bookingSuccessDoneBtn');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeInput = document.getElementById('bookingTime');

    let bookedSlots = [];   // "date|time" combos that are already taken
    let doneDates = {};     // date -> true, when at least one booking that day is marked Done
    let blockedDates = [];  // whole days that are unavailable no matter the time

    // Pull the list of booked slots and blocked days straight from Firestore.
    // "db" is set up in the Firebase config block at the bottom of index.html.
    function loadAvailability() {

        if (!window.db) return;

        window.db.collection('bookedSlots').get().then(function (snapshot) {

            bookedSlots = [];
            doneDates = {};

            snapshot.forEach(function (doc) {
                const d = doc.data();
                if (d.status === 'Cancelled') return; // freed up -- don't block rebooking
                if (d.date && d.time) bookedSlots.push(d.date + '|' + d.time);
                if (d.date && d.status === 'Done') doneDates[d.date] = true;
            });

            renderApptCalendar();
            renderApptSlots();

        }).catch(function () {
            bookedSlots = [];
            doneDates = {};
        });

        window.db.collection('blockedDates').get().then(function (snapshot) {

            blockedDates = [];
            snapshot.forEach(function (doc) { blockedDates.push(doc.id); });
            renderApptCalendar();

            // Off days are just a heads-up sign now, not a hard block --
            // only show the banner if TODAY specifically is marked off.
            const offBanner = document.getElementById('offTodayBanner');
            if (offBanner) {
                offBanner.style.display = blockedDates.indexOf(getTodayStr()) !== -1 ? 'flex' : 'none';
            }

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

    const STANDARD_TIME_SLOTS = ['08:00', '10:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

    // ===============================
    // APPOINTMENT PICKER (calendar + time-slot pills)
    // ===============================

    const apptPickerStep = document.getElementById('apptPickerStep');
    const apptCalGrid = document.getElementById('apptCalGrid');
    const apptCalMonthLabel = document.getElementById('apptCalMonthLabel');
    const apptCalPrev = document.getElementById('apptCalPrev');
    const apptCalNext = document.getElementById('apptCalNext');
    const apptSlotsDate = document.getElementById('apptSlotsDate');
    const apptSlotsSubtitle = document.getElementById('apptSlotsSubtitle');
    const apptSlotsList = document.getElementById('apptSlotsList');
    const apptSummaryCard = document.getElementById('apptSummaryCard');
    const apptSummaryContinueBtn = document.getElementById('apptSummaryContinueBtn');
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

        // Count bookings per date from the public, name-free bookedSlots
        // list — safe to show customers "this day already has bookings"
        // without exposing anyone's name or contact info.
        const bookingCountByDate = {};
        bookedSlots.forEach(function (entry) {
            const d = entry.split('|')[0];
            bookingCountByDate[d] = (bookingCountByDate[d] || 0) + 1;
        });

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
            const isOff = blockedDates.indexOf(cellStr) !== -1;
            const bookingCount = bookingCountByDate[cellStr] || 0;

            if (isPast) {
                btn.disabled = true;
            } else {
                btn.addEventListener('click', function () { selectApptDate(cellStr); });
            }

            if (bookingCount > 0 && !isPast) {

                const isDone = !!doneDates[cellStr];
                btn.classList.add(isDone ? 'appt-cal-day--is-done' : 'appt-cal-day--has-bookings');
                btn.title = isDone
                    ? 'Booking completed on this date'
                    : bookingCount + (bookingCount === 1 ? ' booking' : ' bookings') + ' on this date';

            }

            if (isOff && !isPast) {

                const offTag = document.createElement('span');
                offTag.className = 'appt-cal-day-off-tag';
                offTag.textContent = 'OFF';
                btn.appendChild(offTag);

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

        if (apptSummaryCard) apptSummaryCard.hidden = true;

        // Remove any previously-rendered waitlist prompt -- it gets
        // rebuilt fresh each render if the date is still fully booked.
        const existingWaitlistBox = document.querySelector('.waitlist-box');
        if (existingWaitlistBox) existingWaitlistBox.remove();

        if (!selectedApptDate) {
            apptSlotsDate.textContent = 'Select a date';
            if (apptSlotsSubtitle) apptSlotsSubtitle.textContent = 'Choose an available date from the calendar to see appointment times.';
            apptSlotsList.innerHTML =
                '<div class="appt-slots-empty">' +
                '<svg viewBox="0 0 24 24" width="34" height="34"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M3.5 9.5h17M8 3v3.5M16 3v3.5"/><circle cx="8.2" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="15.8" cy="14" r="1" fill="currentColor"/></svg>' +
                '<span>Choose a date on the calendar to see open times.</span>' +
                '</div>';
            return;
        }

        apptSlotsDate.textContent = formatDateLabel(selectedApptDate);
        if (apptSlotsSubtitle) apptSlotsSubtitle.textContent = 'Choose a time that works best for you.';

        // Off days show up as a heads-up tag on the calendar, but no
        // time slots are offered for that date -- pick another day.
        if (blockedDates.indexOf(selectedApptDate) !== -1) {

            if (apptSlotsSubtitle) apptSlotsSubtitle.textContent = '';
            apptSlotsList.innerHTML =
                '<div class="appt-slots-empty"><span>We\'re closed on this date. Please choose another day on the calendar.</span></div>';
            return;

        }

        const isToday = selectedApptDate === getTodayStr();
        const nowMinutes = todayDate.getTime() === new Date().setHours(0, 0, 0, 0) ? (new Date().getHours() * 60 + new Date().getMinutes()) : 0;

        apptSlotsList.innerHTML = '';
        apptSlotsList.classList.add('is-fading-in');
        setTimeout(function () { apptSlotsList.classList.remove('is-fading-in'); }, 20);

        let anySlotAvailable = false;

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

                anySlotAvailable = true;

                if (time === selectedApptTime) {
                    pill.classList.add('is-selected');
                }

                pill.addEventListener('click', function () {
                    selectedApptTime = time;
                    renderApptSlots();
                    showApptSummary();
                });

            }

            apptSlotsList.appendChild(pill);

        });

        // Every slot taken (or already past for today) -- offer the
        // waitlist instead of just a wall of disabled buttons.
        if (!anySlotAvailable) renderWaitlistPrompt(selectedApptDate);

        // Re-show the summary card if a time was already picked (e.g.
        // after re-rendering following a date change).
        if (selectedApptTime) showApptSummary();

    }

    // Shown when a date is fully booked -- lets the customer leave their
    // name/number so staff can reach out if a slot opens up (e.g. from a
    // cancellation). Saved to its own "waitlist" collection.
    function renderWaitlistPrompt(dateStr) {

        const box = document.createElement('div');
        box.className = 'waitlist-box';
        box.innerHTML =
            '<p class="waitlist-title">🕒 Fully booked for this date</p>' +
            '<p class="waitlist-sub">Leave your details and we\'ll message you first if a spot opens up.</p>' +
            '<input type="text" class="waitlist-input" id="waitlistName" placeholder="Your name">' +
            '<input type="tel" class="waitlist-input" id="waitlistContact" placeholder="09XXXXXXXXX" maxlength="11" inputmode="numeric">' +
            '<span class="field-error" id="waitlistError"></span>' +
            '<button type="button" class="waitlist-btn" id="waitlistSubmitBtn">Join the Waitlist</button>' +
            '<p class="waitlist-success" id="waitlistSuccess" hidden>✓ You\'re on the list! We\'ll reach out if a slot frees up.</p>';

        apptSlotsList.parentNode.insertBefore(box, apptSlotsList.nextSibling);

        const contactInput = box.querySelector('#waitlistContact');
        contactInput.addEventListener('input', function () {
            contactInput.value = contactInput.value.replace(/\D/g, '').slice(0, 11);
        });

        box.querySelector('#waitlistSubmitBtn').addEventListener('click', function () {

            const nameEl = box.querySelector('#waitlistName');
            const errEl = box.querySelector('#waitlistError');
            const btn = box.querySelector('#waitlistSubmitBtn');
            const name = nameEl.value.trim();
            const contact = contactInput.value.trim();

            errEl.textContent = '';

            if (!name) { errEl.textContent = 'Please enter your name.'; return; }
            if (!/^09\d{9}$/.test(contact)) { errEl.textContent = 'Please enter a valid Philippine mobile number.'; return; }
            if (!window.db) { errEl.textContent = 'Could not connect right now — please try again shortly.'; return; }

            btn.disabled = true;
            btn.textContent = 'Joining…';

            window.db.collection('waitlist').add({
                date: dateStr,
                name: name,
                contact: contact,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(function () {
                nameEl.hidden = true;
                contactInput.hidden = true;
                btn.hidden = true;
                box.querySelector('#waitlistSuccess').hidden = false;
            }).catch(function () {
                errEl.textContent = 'Something went wrong. Please try again.';
                btn.disabled = false;
                btn.textContent = 'Join the Waitlist';
            });

        });

    }

    // Small confirmation card shown once both a date and time are picked --
    // gives the customer a moment to review before the booking modal opens.
    function showApptSummary() {

        if (!apptSummaryCard || !selectedApptDate || !selectedApptTime) return;

        const dateEl = document.getElementById('apptSummaryDate');
        const timeEl = document.getElementById('apptSummaryTime');
        if (dateEl) dateEl.textContent = formatDateLabel(selectedApptDate);
        if (timeEl) timeEl.textContent = formatTimeLabel(selectedApptTime);

        apptSummaryCard.hidden = false;

    }

    if (apptSummaryContinueBtn) {
        apptSummaryContinueBtn.addEventListener('click', confirmApptSelection);
    }

    function confirmApptSelection() {

        if (!selectedApptDate || !selectedApptTime) return;

        bookingDateInput.value = selectedApptDate;
        bookingTimeInput.value = selectedApptTime;

        if (apptChosenText) {
            apptChosenText.textContent = formatDateLabel(selectedApptDate) + ' · ' + formatTimeLabel(selectedApptTime);
        }

        openModal(pendingServiceIndex);

    }

    // Clears the homepage calendar back to a blank state -- used once a
    // booking is fully completed, or when the customer wants to change
    // their date/time from inside the modal.
    function resetApptPicker() {

        selectedApptDate = null;
        selectedApptTime = null;

        apptViewYear = todayDate.getFullYear();
        apptViewMonth = todayDate.getMonth();

        if (bookingDateInput) bookingDateInput.value = '';
        if (bookingTimeInput) bookingTimeInput.value = '';
        if (apptChosenText) apptChosenText.textContent = 'No date/time selected yet';

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

            closeModal();
            resetApptPicker();
            scrollToApptPicker();

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
            closeModal();
            resetApptPicker();
            scrollToApptPicker();
            return;
        }

        // Safety re-check right before payment -- the date may have been
        // marked off, or someone else may have booked this slot, since
        // the picker was first opened.
        if (blockedDates.indexOf(date) !== -1) {

            alert('Sorry, we\'re closed on that date. Please pick another day.');

            closeModal();
            resetApptPicker();
            scrollToApptPicker();
            return;

        }

        if (bookedSlots.indexOf(date + '|' + time) !== -1) {

            alert('Sorry, that slot was just taken. Please pick another date or time.');

            closeModal();
            resetApptPicker();
            scrollToApptPicker();
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

    function finishAndClose() {

        closeModal();
        bookingForm.reset();
        applyService(0);
        paymentStep.classList.remove('active');
        if (bookingSuccessStep) bookingSuccessStep.classList.remove('active');
        pendingServiceIndex = 0;
        resetApptPicker();

        if (inspoPreviewList) inspoPreviewList.innerHTML = '';
        if (inspoUploadLabel) inspoUploadLabel.textContent = 'Choose photos';

    }

    let currentSuccessBookingId = null;

    function showBookingSuccess(instructionText, customerPhone, bookingId) {

        paymentStep.classList.remove('active');

        const instructionEl = document.getElementById('bookingSuccessInstruction');
        if (instructionEl && instructionText) instructionEl.textContent = instructionText;

        if (customerPhone) renderReferralCode(customerPhone);

        currentSuccessBookingId = bookingId || null;
        resetReminderOptin();

        // Remember this booking on THIS device only -- lets the installed
        // app show a "Manage Booking" shortcut for it until it's Done or
        // Cancelled. Never sent anywhere; just local to the browser.
        if (bookingId && customerPhone) {
            try {
                localStorage.setItem('nailxtaytay_active_booking', JSON.stringify({ id: bookingId, contact: customerPhone }));
            } catch (e) {}
            if (typeof window.refreshFloatingBookingState === 'function') window.refreshFloatingBookingState();
        }

        const calBtn = document.getElementById('bookingSuccessCalendarBtn');
        if (calBtn) {
            if (selectedApptDate && selectedApptTime) {
                const svc = SERVICES[pendingServiceIndex];
                calBtn.href = googleCalendarLinkFor({
                    date: selectedApptDate,
                    time: selectedApptTime,
                    service: svc ? svc.name : 'Appointment'
                });
                calBtn.hidden = false;
            } else {
                calBtn.hidden = true;
            }
        }

        if (bookingSuccessStep) bookingSuccessStep.classList.add('active');

    }

    // ===============================
    // APPOINTMENT REMINDER PUSH NOTIFICATIONS
    // Customer taps "Enable Appointment Reminder" after booking -> browser
    // asks permission -> we save their push subscription onto their own
    // booking doc. A scheduled Cloud Function (see /functions) checks for
    // bookings starting soon and sends the actual reminder -- this all
    // works even if the site isn't open at the time.
    // ===============================

    // Public key only -- safe to expose client-side. Generated once via
    // `web-push generate-vapid-keys`; the matching private key lives only
    // in the Cloud Function's config, never in this file.
    const VAPID_PUBLIC_KEY = 'BJeNGcateRF8fFG6eMZbtua27ijAPt05WdYkWer69Ie0N_XWHso6CHsB1q6CnuXhy29rwmGV6QAPKVbWeAUzYJs';

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    }

    function resetReminderOptin() {

        const box = document.getElementById('reminderOptinBox');
        const btn = document.getElementById('reminderOptinBtn');
        const status = document.getElementById('reminderOptinStatus');
        if (!box) return;

        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

        if (!supported || !currentSuccessBookingId) {
            box.hidden = true;
            return;
        }

        box.hidden = false;

        if (Notification.permission === 'denied') {
            if (btn) btn.hidden = true;
            if (status) {
                status.hidden = false;
                status.textContent = "Notifications are blocked for this site in your browser settings.";
                status.style.color = '#8A6E60';
            }
            return;
        }

        if (btn) {
            btn.hidden = false;
            btn.disabled = false;
            btn.textContent = 'Enable Appointment Reminder';
        }
        if (status) status.hidden = true;

    }

    const reminderOptinBtn = document.getElementById('reminderOptinBtn');

    if (reminderOptinBtn) {

        reminderOptinBtn.addEventListener('click', function () {

            if (!currentSuccessBookingId || !window.db) return;

            reminderOptinBtn.disabled = true;
            reminderOptinBtn.textContent = 'Enabling…';

            navigator.serviceWorker.ready.then(function (registration) {

                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

            }).then(function (subscription) {

                // Scoped update -- Firestore rules only allow the public to
                // touch this one field on their own just-created booking.
                return window.db.collection('bookings').doc(currentSuccessBookingId).update({
                    pushSubscription: subscription.toJSON()
                });

            }).then(function () {

                reminderOptinBtn.hidden = true;
                const status = document.getElementById('reminderOptinStatus');
                if (status) {
                    status.hidden = false;
                    status.textContent = "✓ Reminder enabled — we'll notify you before your appointment.";
                }

            }).catch(function (err) {

                console.error('Could not enable reminder:', err);
                reminderOptinBtn.disabled = false;
                reminderOptinBtn.textContent = 'Enable Appointment Reminder';

                const status = document.getElementById('reminderOptinStatus');
                if (status) {
                    status.hidden = false;
                    status.style.color = '#B3261E';
                    status.textContent = err && err.name === 'NotAllowedError'
                        ? 'Notification permission was not granted.'
                        : 'Could not enable reminders right now. Please try again.';
                }

            });

        });

    }

    function referralLinkFor(phone) {
        const base = window.location.origin + window.location.pathname;
        return base + '?ref=' + encodeURIComponent(phone);
    }

    function renderReferralCode(phone, ids) {

        ids = ids || { pill: 'referralCodePill', qr: 'referralQrCode', copyBtn: 'referralCopyBtn' };

        const pill = document.getElementById(ids.pill);
        if (pill) {
            const textSpan = pill.querySelector('span');
            if (textSpan) textSpan.textContent = phone; else pill.textContent = phone;
        }

        const qrHolder = document.getElementById(ids.qr);
        if (qrHolder && typeof QRCode !== 'undefined') {

            qrHolder.innerHTML = '';

            new QRCode(qrHolder, {
                text: referralLinkFor(phone),
                width: 160,
                height: 160,
                colorDark: '#7A203A',
                colorLight: '#FFFAF8'
            });

        }

        const copyBtn = document.getElementById(ids.copyBtn);
        if (copyBtn) {

            const originalLabel = copyBtn.textContent;

            function shareOrCopy(feedbackEl) {

                const link = referralLinkFor(phone);

                if (navigator.share) {

                    navigator.share({
                        title: 'Nail X Taytay — My Referral Code',
                        text: "Book with Nail X Taytay using my referral link and we both get to enjoy the perks!",
                        url: link
                    }).catch(function () { /* user cancelled the share sheet -- fine */ });

                    return;

                }

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(link).then(function () {
                        if (feedbackEl) {
                            const original = feedbackEl.textContent;
                            feedbackEl.textContent = feedbackEl === copyBtn ? 'Copied! ✓' : '✓';
                            setTimeout(function () { feedbackEl.textContent = original; }, 1800);
                        }
                    }).catch(function () {});
                }

            }

            copyBtn.onclick = function () { shareOrCopy(copyBtn); };

            // Optional small copy icon inside the code box itself, when
            // this layout has one -- triggers the exact same action.
            const codeIconBtn = document.getElementById(ids.copyIcon);
            if (codeIconBtn) codeIconBtn.onclick = function () { shareOrCopy(codeIconBtn); };

        }

    }

    // ---- Check My Referrals: look up referral code + count without booking ----

    const myReferralsNavLink = document.getElementById('myReferralsNavLink');
    const referralCheckModal = document.getElementById('referralCheckModal');
    const referralCheckModalClose = document.getElementById('referralCheckModalClose');
    const referralCheckForm = document.getElementById('referralCheckForm');
    const referralCheckResult = document.getElementById('referralCheckResult');
    const referralCheckNotFound = document.getElementById('referralCheckNotFound');
    const referralCheckBtn = document.getElementById('referralCheckBtn');
    const referralCheckAgainBtn = document.getElementById('referralCheckAgainBtn');
    const referralNotFoundBackBtn = document.getElementById('referralNotFoundBackBtn');

    function showReferralStep(step) {
        // step: 'form' | 'result' | 'notfound'
        if (referralCheckForm) referralCheckForm.hidden = step !== 'form';
        if (referralCheckResult) referralCheckResult.hidden = step !== 'result';
        if (referralCheckNotFound) referralCheckNotFound.hidden = step !== 'notfound';
    }

    function openReferralCheckModal() {

        showReferralStep('form');
        const errEl = document.getElementById('referralCheckError');
        if (errEl) errEl.textContent = '';
        const phoneInput = document.getElementById('referralCheckPhone');
        if (phoneInput) phoneInput.value = '';

        if (referralCheckModal) {
            referralCheckModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

    }

    function closeReferralCheckModal() {
        if (referralCheckModal) {
            referralCheckModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (myReferralsNavLink) {
        myReferralsNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            openReferralCheckModal();
        });
    }

    const referralPromoBanner = document.getElementById('referralPromoBanner');
    if (referralPromoBanner) {
        referralPromoBanner.addEventListener('click', function () {
            openReferralCheckModal();
        });
    }

    if (referralCheckModalClose) referralCheckModalClose.addEventListener('click', closeReferralCheckModal);

    if (referralCheckModal) {
        referralCheckModal.addEventListener('click', function (e) {
            if (e.target === referralCheckModal) closeReferralCheckModal();
        });
    }

    // Accessibility: ESC closes this modal too, matching the site's other modals.
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && referralCheckModal && referralCheckModal.classList.contains('open')) {
            closeReferralCheckModal();
        }
    });

    if (referralCheckAgainBtn) referralCheckAgainBtn.addEventListener('click', function () { showReferralStep('form'); });
    if (referralNotFoundBackBtn) referralNotFoundBackBtn.addEventListener('click', function () { showReferralStep('form'); });

    // Auto-format: strip anything that isn't a digit as the customer types,
    // so pasted numbers with spaces/dashes still validate cleanly.
    const referralPhoneInputEl = document.getElementById('referralCheckPhone');
    if (referralPhoneInputEl) {
        referralPhoneInputEl.addEventListener('input', function () {
            referralPhoneInputEl.value = referralPhoneInputEl.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    // Light client-side cooldown so someone can't hammer the check button --
    // real rate limiting would need a backend function, which this static
    // site doesn't have, but this is a reasonable deterrent on its own.
    let referralCheckCooldownUntil = 0;
    const REFERRAL_REWARD_THRESHOLD = 3;

    function redeemLinkFor(phone) {
        const base = window.location.origin + window.location.pathname;
        return base + '?redeem=' + encodeURIComponent(phone);
    }

    // Shared by both the manual "Check My Referrals" button and the
    // auto-redeem flow (?redeem=... link opened from the reward QR code).
    function performReferralCheck(phone, onDone) {

        const errEl = document.getElementById('referralCheckError');
        if (errEl) errEl.textContent = '';

        if (!window.db) {
            if (errEl) errEl.textContent = 'Could not connect right now — please try again shortly.';
            if (onDone) onDone();
            return;
        }

        // Step 1: does this number belong to an actual customer at all?
        // (i.e. have they ever completed a booking with us)
        window.db.collection('bookings').where('contact', '==', phone).limit(1).get().then(function (ownBookingSnap) {

            if (ownBookingSnap.empty) {
                showReferralStep('notfound');
                return null;
            }

            // Step 2: count how many OTHER bookings list this number as
            // the referrer AND have been marked "Done" by staff. A referral
            // only counts once the referred person actually shows up and
            // gets serviced -- this stops someone from padding their count
            // with random/fake numbers that never lead to a real visit.
            return window.db.collection('bookings')
                .where('referredBy', '==', phone)
                .where('status', '==', 'Done')
                .get().then(function (snapshot) {

                const count = snapshot.size;

                const countEl = document.getElementById('referralCheckCount');
                if (countEl) countEl.textContent = count;

                const statusEl = document.getElementById('referralCheckStatus');
                if (statusEl) statusEl.textContent = count > 0 ? 'Active' : 'New';

                renderReferralCode(phone, {
                    pill: 'checkReferralCodePill',
                    qr: 'checkReferralQrCode',
                    copyBtn: 'checkReferralCopyBtn',
                    copyIcon: 'checkReferralCodeCopyIcon'
                });

                // Every 3rd referral (3, 6, 9, ...) unlocks another 50% OFF
                // reward -- show the "Congratulations" banner with a
                // scannable QR our staff can verify at the counter.
                const rewardBanner = document.getElementById('referralRewardBanner');
                if (rewardBanner) {

                    if (count > 0 && count % REFERRAL_REWARD_THRESHOLD === 0) {

                        const rewardTier = count / REFERRAL_REWARD_THRESHOLD;

                        rewardBanner.hidden = false;

                        const rewardTextEl = document.getElementById('referralRewardText');
                        if (rewardTextEl) {
                            rewardTextEl.innerHTML = "You've referred " + count + " friends and unlocked " +
                                (rewardTier > 1 ? 'reward #' + rewardTier + ' — ' : '') +
                                "<strong>50% OFF</strong> your next booking. Show this QR code to our staff to claim it.";
                        }

                        const rewardQrHolder = document.getElementById('referralRewardQr');
                        if (rewardQrHolder && typeof QRCode !== 'undefined') {
                            rewardQrHolder.innerHTML = '';
                            new QRCode(rewardQrHolder, {
                                text: redeemLinkFor(phone),
                                width: 140,
                                height: 140,
                                colorDark: '#7A203A',
                                colorLight: '#FFFAF8'
                            });
                        }

                        const downloadBtn = document.getElementById('referralRewardDownloadBtn');
                        if (downloadBtn) {
                            downloadBtn.onclick = function () {

                                const canvas = rewardQrHolder ? rewardQrHolder.querySelector('canvas') : null;
                                if (!canvas) return;

                                const link = document.createElement('a');
                                link.download = 'nailxtaytay-reward-' + phone + '.png';
                                link.href = canvas.toDataURL('image/png');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                            };
                        }

                    } else {
                        rewardBanner.hidden = true;
                    }

                }

                showReferralStep('result');

            });

        }).catch(function (err) {
            console.error('Could not check referrals:', err);
            if (errEl) errEl.textContent = 'Something went wrong — please try again.';
        }).finally(function () {
            if (onDone) onDone();
        });

    }

    if (referralCheckBtn) {

        referralCheckBtn.addEventListener('click', function () {

            const phoneInput = document.getElementById('referralCheckPhone');
            const errEl = document.getElementById('referralCheckError');
            const phone = phoneInput.value.trim();

            if (errEl) errEl.textContent = '';

            if (Date.now() < referralCheckCooldownUntil) {
                if (errEl) errEl.textContent = 'Please wait a moment before checking again.';
                return;
            }

            if (!phone) {
                if (errEl) errEl.textContent = 'Please enter your mobile number.';
                return;
            }

            if (!/^09\d{9}$/.test(phone)) {
                if (errEl) errEl.textContent = 'Please enter a valid Philippine mobile number.';
                return;
            }

            referralCheckBtn.disabled = true;
            referralCheckBtn.classList.add('is-loading');
            referralCheckBtn.textContent = 'Checking…';

            performReferralCheck(phone, function () {
                referralCheckBtn.disabled = false;
                referralCheckBtn.classList.remove('is-loading');
                referralCheckBtn.textContent = 'Check My Referrals';
                referralCheckCooldownUntil = Date.now() + 4000;
            });

        });

    }

    // ===============================
    // MANAGE MY BOOKING -- customer looks up their own upcoming
    // appointment(s) by phone number and can add it to their calendar,
    // request a reschedule via Messenger, or cancel outright.
    // ===============================

    const manageBookingModal = document.getElementById('manageBookingModal');
    const manageBookingModalClose = document.getElementById('manageBookingModalClose');
    const manageBookingNavLink = document.getElementById('manageBookingNavLink');
    const manageBookingForm = document.getElementById('manageBookingForm');
    const manageBookingResult = document.getElementById('manageBookingResult');
    const manageBookingNotFound = document.getElementById('manageBookingNotFound');
    const manageBookingSubmitBtn = document.getElementById('manageBookingSubmitBtn');
    const manageBookingBackBtn = document.getElementById('manageBookingBackBtn');
    const manageBookingNotFoundBackBtn = document.getElementById('manageBookingNotFoundBackBtn');
    const manageBookingPhoneInput = document.getElementById('manageBookingPhoneInput');

    function showManageBookingStep(step) {
        if (manageBookingForm) manageBookingForm.hidden = step !== 'form';
        if (manageBookingResult) manageBookingResult.hidden = step !== 'result';
        if (manageBookingNotFound) manageBookingNotFound.hidden = step !== 'notfound';
    }

    function openManageBookingModal(prefillPhone) {

        showManageBookingStep('form');
        const errEl = document.getElementById('manageBookingError');
        if (errEl) errEl.textContent = '';
        if (manageBookingPhoneInput) manageBookingPhoneInput.value = prefillPhone || '';

        if (manageBookingModal) {
            manageBookingModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        // One tap from the floating shortcut -- go straight to their
        // result instead of making them press "Find My Booking" too.
        if (prefillPhone && manageBookingSubmitBtn) manageBookingSubmitBtn.click();

    }

    window.openManageBookingModal = openManageBookingModal;

    function closeManageBookingModal() {
        if (manageBookingModal) {
            manageBookingModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (manageBookingNavLink) {
        manageBookingNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            openManageBookingModal();
        });
    }

    if (manageBookingModalClose) manageBookingModalClose.addEventListener('click', closeManageBookingModal);

    if (manageBookingModal) {
        manageBookingModal.addEventListener('click', function (e) {
            if (e.target === manageBookingModal) closeManageBookingModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && manageBookingModal && manageBookingModal.classList.contains('open')) {
            closeManageBookingModal();
        }
    });

    if (manageBookingBackBtn) manageBookingBackBtn.addEventListener('click', function () { showManageBookingStep('form'); });
    if (manageBookingNotFoundBackBtn) manageBookingNotFoundBackBtn.addEventListener('click', function () { showManageBookingStep('form'); });

    if (manageBookingPhoneInput) {
        manageBookingPhoneInput.addEventListener('input', function () {
            manageBookingPhoneInput.value = manageBookingPhoneInput.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    // Builds a Google Calendar "quick add" link -- no API key needed,
    // just a URL with the event details pre-filled.
    function googleCalendarLinkFor(b) {

        const start = b.date.replace(/-/g, '') + 'T' + b.time.replace(':', '') + '00';
        const startDt = new Date(b.date + 'T' + b.time + ':00');
        const endDt = new Date(startDt.getTime() + 60 * 60000); // default 1hr block
        const end = b.date.replace(/-/g, '') + 'T' +
            String(endDt.getHours()).padStart(2, '0') + String(endDt.getMinutes()).padStart(2, '0') + '00';

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: 'Nail X Taytay Appointment — ' + b.service,
            dates: start + '/' + end,
            details: 'Appointment at Nail X Taytay. Service: ' + b.service,
            location: 'Poland, Santa Ana, Taytay, 1920 Rizal'
        });

        return 'https://calendar.google.com/calendar/render?' + params.toString();

    }

    function renderManageBookingCard(b) {

        const card = document.createElement('div');
        card.className = 'manage-booking-card';

        card.innerHTML =
            '<span class="manage-booking-card-status">' + b.status + '</span>' +
            '<p class="manage-booking-card-service">' + b.service + '</p>' +
            '<p class="manage-booking-card-datetime">📅 ' + formatDateLabel(b.date) + ' · ⏰ ' + formatTimeLabel(b.time) + '</p>' +
            '<div class="manage-booking-card-actions">' +
            '<a class="manage-booking-action-btn manage-booking-action-calendar" href="' + googleCalendarLinkFor(b) + '" target="_blank" rel="noopener">📅 Add to Google Calendar</a>' +
            '<button type="button" class="manage-booking-action-btn manage-booking-action-reschedule" data-action="reschedule">🔄 Request Reschedule</button>' +
            '<button type="button" class="manage-booking-action-btn manage-booking-action-cancel" data-action="cancel">❌ Request Cancellation</button>' +
            '</div>';

        card.querySelector('[data-action="reschedule"]').addEventListener('click', function () {

            const msg = "Hi! I'd like to request a reschedule for my " + b.service +
                ' appointment on ' + formatDateLabel(b.date) + ' at ' + formatTimeLabel(b.time) +
                ' (Booking ID: ' + b.id + '). ';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(msg).catch(function () {});
            }

            window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');

        });

        // Cancellation goes through the admin, not straight to Firestore --
        // this just opens Messenger with the request pre-filled, same as
        // Reschedule. Staff cancels it from the Booking Log once confirmed.
        card.querySelector('[data-action="cancel"]').addEventListener('click', function () {

            const msg = "Hi! I'd like to request to CANCEL my " + b.service +
                ' appointment on ' + formatDateLabel(b.date) + ' at ' + formatTimeLabel(b.time) +
                ' (Booking ID: ' + b.id + '). ';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(msg).catch(function () {});
            }

            window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');

        });

        return card;

    }

    if (manageBookingSubmitBtn) {

        manageBookingSubmitBtn.addEventListener('click', function () {

            const phone = manageBookingPhoneInput.value.trim();
            const errEl = document.getElementById('manageBookingError');
            if (errEl) errEl.textContent = '';

            if (!phone) {
                if (errEl) errEl.textContent = 'Please enter your mobile number.';
                return;
            }

            if (!/^09\d{9}$/.test(phone)) {
                if (errEl) errEl.textContent = 'Please enter a valid Philippine mobile number.';
                return;
            }

            if (!window.db) {
                if (errEl) errEl.textContent = 'Could not connect right now — please try again shortly.';
                return;
            }

            manageBookingSubmitBtn.disabled = true;
            manageBookingSubmitBtn.textContent = 'Searching…';

            window.db.collection('bookings').where('contact', '==', phone).where('status', '==', 'Pending').get()
                .then(function (snapshot) {

                    manageBookingSubmitBtn.disabled = false;
                    manageBookingSubmitBtn.textContent = 'Find My Booking';

                    if (snapshot.empty) {
                        showManageBookingStep('notfound');
                        return;
                    }

                    const bookings = [];
                    snapshot.forEach(function (doc) { bookings.push(Object.assign({ id: doc.id }, doc.data())); });
                    bookings.sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });

                    const list = document.getElementById('manageBookingList');
                    list.innerHTML = '';
                    bookings.forEach(function (b) { list.appendChild(renderManageBookingCard(b)); });

                    showManageBookingStep('result');

                })
                .catch(function (err) {
                    manageBookingSubmitBtn.disabled = false;
                    manageBookingSubmitBtn.textContent = 'Find My Booking';
                    console.error('Manage booking lookup failed:', err);
                    if (errEl) {
                        errEl.textContent = (err && err.code === 'permission-denied')
                            ? 'This feature needs an updated Firestore rules setup. Please contact the site owner.'
                            : 'Something went wrong. Please try again.';
                    }
                });

        });

    }
    // this site with ?redeem=<phone> -- automatically show that number's
    // referral status so staff can verify the 50% OFF reward on the spot.
    (function autoRedeemFromQr() {

        const params = new URLSearchParams(window.location.search);
        const redeemPhone = params.get('redeem');
        if (!redeemPhone) return;

        openReferralCheckModal();
        showReferralStep('result');
        performReferralCheck(redeemPhone);

    })();

    // Referral capture: if someone arrived via a friend's referral link
    // (?ref=09XXXXXXXXX), remember it and show a small note in the form.
    // No page is off-limits here since bookedSlots/etc. are already public.
    let referredByNumber = null;

    (function captureReferral() {

        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (!ref) return;

        referredByNumber = ref;

        const note = document.getElementById('referralDetectedNote');
        const numberEl = document.getElementById('referralDetectedNumber');
        if (numberEl) numberEl.textContent = ref;
        if (note) note.hidden = false;

    })();

    // Anti-abuse check: a phone number can only ever generate referral
    // credit ONCE, on its very first booking. If this number has booked
    // before (repeat customer) or is trying to refer itself, the referral
    // is dropped -- this stops the same person from looping the same
    // referral link over and over to fake up referral counts.
    // Atomically reserves a date+time slot AND creates the booking in one
    // Firestore transaction. The slot doc's ID IS the date+time combo, so
    // two customers racing for the same slot can't both succeed -- the
    // transaction that loses the race sees the slot already exists and
    // is rejected with SLOT_TAKEN, instead of silently double-booking.
    function reserveBookingAtomically(bookingData) {

        if (!window.db) return Promise.reject(new Error('NO_DB'));

        const slotId = bookingData.date + '_' + bookingData.time;
        const slotRef = window.db.collection('bookedSlots').doc(slotId);
        const bookingRef = window.db.collection('bookings').doc();

        return window.db.runTransaction(function (transaction) {

            return transaction.get(slotRef).then(function (slotDoc) {

                if (slotDoc.exists) {
                    const err = new Error('This time slot was just taken by someone else.');
                    err.code = 'SLOT_TAKEN';
                    throw err;
                }

                transaction.set(slotRef, {
                    date: bookingData.date,
                    time: bookingData.time,
                    status: 'Pending',
                    bookingId: bookingRef.id
                });

                transaction.set(bookingRef, Object.assign({}, bookingData, {
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }));

            });

        }).then(function () {
            return bookingRef.id;
        });

    }

    function validateReferrer(contact, claimedReferrer) {

        if (!claimedReferrer) return Promise.resolve(null);
        if (claimedReferrer === contact) return Promise.resolve(null); // self-referral
        if (!window.db) return Promise.resolve(claimedReferrer);

        return window.db.collection('bookings').where('contact', '==', contact).limit(1).get().then(function (snapshot) {
            return snapshot.empty ? claimedReferrer : null; // empty = first-ever booking for this number
        }).catch(function () {
            return claimedReferrer; // if the check itself fails, don't block the booking over it
        });

    }

    if (bookingSuccessDoneBtn) {
        bookingSuccessDoneBtn.addEventListener('click', finishAndClose);
    }

    if (bookingSuccessMessengerBtn) {
        bookingSuccessMessengerBtn.addEventListener('click', function () {
            window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');
        });
    }

    // Shortcut for customers who'd rather just chat first instead of
    // using the on-site GCash flow -- opens Messenger with their current
    // form details, without reserving the slot (no payment proof yet, so
    // the shop will confirm and reserve manually over chat).
    if (messageToReserveBtn) {

        messageToReserveBtn.addEventListener('click', function () {

            const selectedService = SERVICES[parseInt(serviceSelect.value, 10)];
            const name = document.getElementById('bookingName').value || '(not provided)';
            const contact = document.getElementById('bookingContact').value || '(not provided)';
            const date = document.getElementById('bookingDate').value || '(not provided)';
            const time = document.getElementById('bookingTime').value || '(not provided)';
            const notes = document.getElementById('bookingNotes').value || '(none)';

            const message =
                "Hi! I'd like to book an appointment — can we arrange the details and payment here?\n\n" +
                'Service: ' + (selectedService ? selectedService.name : '') + '\n' +
                'Name: ' + name + '\n' +
                'Contact Number: ' + contact + '\n' +
                'Preferred Date: ' + date + '\n' +
                'Preferred Time: ' + time + '\n' +
                'Notes: ' + notes;

            let savedBookingId = null;

            function proceedToMessenger() {

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(message).catch(function () {});
                }

                window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');

                showBookingSuccess("We've copied your details — paste them into Messenger to finish arranging your booking with us.", contact, savedBookingId);

            }

            // Record this booking too, same as the GCash path -- so it
            // shows up in the Booking Log and reserves the slot right away.
            // IMPORTANT: we wait for the save to actually finish before
            // opening Messenger -- on mobile, switching to another app can
            // pause/kill the page mid-request, cutting the save off short.
            if (window.db) {

                validateReferrer(contact, referredByNumber).then(function (validReferrer) {

                    return reserveBookingAtomically({
                        service: selectedService ? selectedService.name : '',
                        name: name,
                        contact: contact,
                        date: date,
                        time: time,
                        notes: notes,
                        price: (selectedService && typeof selectedService.price === 'number') ? selectedService.price : null,
                        status: 'Pending',
                        referredBy: validReferrer
                    });

                }).then(function (bookingId) {

                    savedBookingId = bookingId;
                    bookedSlots.push(date + '|' + time);
                    proceedToMessenger();

                }).catch(function (err) {

                    if (err && err.code === 'SLOT_TAKEN') {
                        alert("Sorry, this time slot was just booked by someone else. Please pick another time.");
                        loadAvailability();
                        resetApptPicker();
                        closeModal();
                        return;
                    }

                    console.error('Could not save booking:', err);
                    proceedToMessenger();

                });

            } else {
                proceedToMessenger();
            }

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

            let savedBookingId = null;

            function proceedAfterSave() {

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
                        showBookingSuccess("We've received your booking! Please finish sending it on Messenger so we can confirm.", contact, savedBookingId);
                    });

                    return;

                }

                // Fallback (desktop, or no photos attached): copy the message and
                // open Messenger -- ask them to attach the photos manually
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(message).catch(function () {});
                }

                window.open('https://m.me/' + MESSENGER_PAGE_USERNAME, '_blank');

                showBookingSuccess(
                    'Your booking details have been copied — please PASTE this message' +
                    (inspoFiles.length ? ', attach your inspo photo(s) and GCash payment screenshot,' : ' and attach your GCash payment screenshot,') +
                    ' then hit send in Messenger to confirm your appointment.',
                    contact,
                    savedBookingId
                );

            }

            // Record this booking in Firestore, so it shows up in the
            // admin dashboard and as taken for the next customer.
            // IMPORTANT: wait for the save to actually finish before opening
            // Messenger/sharing -- on mobile, switching to another app can
            // pause/kill the page mid-request, cutting the save off short.
            if (window.db) {

                validateReferrer(contact, referredByNumber).then(function (validReferrer) {

                    return reserveBookingAtomically({
                        service: selectedService ? selectedService.name : '',
                        name: name,
                        contact: contact,
                        date: date,
                        time: time,
                        notes: notes,
                        price: (selectedService && typeof selectedService.price === 'number') ? selectedService.price : null,
                        status: 'Pending',
                        referredBy: validReferrer
                    });

                }).then(function (bookingId) {

                    savedBookingId = bookingId;
                    bookedSlots.push(date + '|' + time);
                    proceedAfterSave();

                }).catch(function (err) {

                    if (err && err.code === 'SLOT_TAKEN') {
                        alert("Sorry, this time slot was just booked by someone else. Please pick another time.");
                        loadAvailability();
                        resetApptPicker();
                        closeModal();
                        return;
                    }

                    console.error('Could not save booking:', err);
                    proceedAfterSave();

                });

            } else {
                proceedAfterSave();
            }

        });

    }

    // ===============================
    // SERVICES: circles are laid out in a line by CSS and clickable
    // right away -- the gentle floating motion keeps running via the
    // .featured-circle CSS animation.
    // ===============================

    circlesUnlocked = true;

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

        const PARTICLE_COUNT = 24;

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
        switchAdminView('table');
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
    const countInstalls = document.getElementById('countInstalls');

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

        if (countInstalls) {
            window.db.collection('stats').doc('counters').get().then(function (doc) {
                countInstalls.textContent = doc.exists ? (doc.data().appInstalls || 0) : 0;
            }).catch(function () {});
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
                        referredBy: d.referredBy || '',
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

        renderNextAppointment();

    }

    // ---- Next Appointment widget: finds the soonest upcoming Pending
    // booking, shows a live countdown, and flags that same row in the
    // table so it's easy to spot who's coming up next. ----

    let nextApptBookingId = null;

    function getBookingDateTime(b) {
        if (!b || !b.date || !b.time) return null;
        const dt = new Date(b.date + 'T' + b.time + ':00');
        return isNaN(dt.getTime()) ? null : dt;
    }

    function findNextAppointment() {

        const now = new Date();
        let best = null;
        let bestDt = null;

        allBookings.forEach(function (b) {
            if (b.status !== 'Pending') return;
            const dt = getBookingDateTime(b);
            if (!dt || dt < now) return;
            if (!bestDt || dt < bestDt) {
                bestDt = dt;
                best = b;
            }
        });

        return best ? { booking: best, dt: bestDt } : null;

    }

    function formatCountdown(dt) {

        const diffMs = dt.getTime() - Date.now();
        if (diffMs <= 0) return { text: 'Starting now', level: 'urgent' };

        const mins = Math.round(diffMs / 60000);

        if (mins < 60) return { text: 'in ' + mins + (mins === 1 ? ' min' : ' mins'), level: mins <= 30 ? 'urgent' : 'warning' };

        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;

        if (hours < 24) {
            const text = 'in ' + hours + 'h' + (remMins ? ' ' + remMins + 'm' : '');
            return { text: text, level: hours <= 2 ? 'warning' : 'normal' };
        }

        const days = Math.floor(hours / 24);
        return { text: days === 1 ? 'Tomorrow' : 'in ' + days + ' days', level: 'normal' };

    }

    function renderNextAppointment() {

        const widget = document.getElementById('adminNextAppt');
        if (!widget) return;

        const next = findNextAppointment();

        if (!next) {
            widget.hidden = true;
            nextApptBookingId = null;
            return;
        }

        nextApptBookingId = next.booking.id;

        const detailEl = document.getElementById('adminNextApptDetail');
        const countdownEl = document.getElementById('adminNextApptCountdown');
        const countdown = formatCountdown(next.dt);

        if (detailEl) {
            detailEl.textContent = next.booking.name + ' — ' + formatBookingDate(next.booking.date) + ', ' + formatBookingTime(next.booking.time);
        }

        if (countdownEl) countdownEl.textContent = countdown.text;

        widget.classList.remove('is-warning', 'is-urgent');
        if (countdown.level === 'warning') widget.classList.add('is-warning');
        if (countdown.level === 'urgent') widget.classList.add('is-urgent');

        widget.hidden = false;

    }

    // Live tick so the countdown stays accurate without needing a manual
    // refresh -- cheap since it only touches text/classes, no re-fetch.
    setInterval(function () {
        if (adminDashboardModal && adminDashboardModal.classList.contains('open')) {
            renderNextAppointment();
        }
    }, 30000);

    function getFilteredBookings() {

        const q = (adminSearchInput && adminSearchInput.value || '').trim().toLowerCase();
        const statusFilter = adminFilterStatus ? adminFilterStatus.value : '';
        const serviceFilter = adminFilterService ? adminFilterService.value : '';

        return allBookings.filter(function (b) {

            // Table View = active (Pending) bookings only; Archive = anything
            // no longer active (Done or Cancelled). Keeps the working list
            // short once a booking is finished or cancelled.
            if (adminArchiveMode) {
                if (b.status !== 'Done' && b.status !== 'Cancelled') return false;
            } else {
                if (b.status === 'Done' || b.status === 'Cancelled') return false;
            }

            if (statusFilter && b.status !== statusFilter) return false;
            if (serviceFilter && b.service !== serviceFilter) return false;

            if (q) {
                const haystack = (b.name + ' ' + b.contact + ' ' + b.service + ' ' + b.notes).toLowerCase();
                if (haystack.indexOf(q) === -1) return false;
            }

            return true;

        }).sort(function (a, b) {
            // Soonest date+time first -- date is YYYY-MM-DD and time is
            // HH:MM, so a plain string comparison sorts chronologically.
            const aKey = (a.date || '') + ' ' + (a.time || '');
            const bKey = (b.date || '') + ' ' + (b.time || '');
            return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
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

            const emptyMsg = adminArchiveMode
                ? "No completed bookings yet. Once you mark a booking \u201cDone,\u201d it'll show up here."
                : 'No bookings match your search or filters.';

            adminDashBody.innerHTML =
                '<div class="admin-empty-state">' +
                '<div class="admin-empty-icon"><svg viewBox="0 0 24 24" width="28" height="28"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path stroke="currentColor" stroke-width="1.6" d="m21 21-4.3-4.3"/></svg></div>' +
                '<p>' + emptyMsg + '</p>' +
                '</div>';
            return;

        }

        const bulkBar = document.createElement('div');
        bulkBar.className = 'admin-bulk-bar';
        bulkBar.id = 'adminBulkBar';
        bulkBar.hidden = true;
        bulkBar.innerHTML =
            '<span class="admin-bulk-count" id="adminBulkCount">0 selected</span>' +
            '<button type="button" class="admin-bulk-btn admin-bulk-done" id="adminBulkDoneBtn">✓ Mark as Done</button>' +
            '<button type="button" class="admin-bulk-btn admin-bulk-delete" id="adminBulkDeleteBtn">🗑 Delete</button>' +
            '<button type="button" class="admin-bulk-clear" id="adminBulkClearBtn">Clear</button>';
        adminDashBody.appendChild(bulkBar);

        const table = document.createElement('table');
        table.className = 'admin-booking-table';

        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th class="admin-th-check"><input type="checkbox" id="adminSelectAllCheck" aria-label="Select all"></th><th>Name</th><th>Date</th><th>Time</th></tr>';
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        rows.forEach(function (b) {

            const row = document.createElement('tr');
            row.className = 'admin-booking-row-compact';
            row.setAttribute('data-id', b.id);

            const isNext = b.id === nextApptBookingId;
            if (isNext) row.classList.add('is-next-appt');

            row.innerHTML =
                '<td data-label="" class="admin-td-check"><input type="checkbox" class="admin-row-check" data-id="' + b.id + '" aria-label="Select this booking"></td>' +
                '<td data-label="Name">' +
                '<span class="admin-row-name-cell">' +
                '<span class="admin-row-status-dot admin-status-' + b.status + '"></span>' +
                '<span>' + b.name + '</span>' +
                (isNext ? '<span class="admin-row-next-badge" title="This is the next upcoming appointment">⚠ Next</span>' : '') +
                '</span>' +
                '</td>' +
                '<td data-label="Date">' + formatBookingDate(b.date) + '</td>' +
                '<td data-label="Time">' + formatBookingTime(b.time) + ' <span class="admin-row-chevron">›</span></td>';

            tbody.appendChild(row);

        });

        table.appendChild(tbody);
        adminDashBody.appendChild(table);

        // Tap/click anywhere on a row to see the full details -- except
        // the checkbox itself, which toggles selection instead.
        tbody.querySelectorAll('.admin-booking-row-compact').forEach(function (row) {
            row.addEventListener('click', function (e) {
                if (e.target.closest('.admin-row-check')) return;
                openBookingDetailModal(row.getAttribute('data-id'));
            });
        });

        wireAdminBulkActions(tbody);

    }

    function findBooking(id) {
        return allBookings.filter(function (b) { return b.id === id; })[0];
    }

    // ---- Bulk actions: select several bookings at once, then mark them
    // all Done or delete them all in one go, using a single Firestore
    // batch write instead of one request per row. ----

    function wireAdminBulkActions(tbody) {

        const bulkBar = document.getElementById('adminBulkBar');
        const bulkCount = document.getElementById('adminBulkCount');
        const selectAllCheck = document.getElementById('adminSelectAllCheck');
        const rowChecks = Array.prototype.slice.call(tbody.querySelectorAll('.admin-row-check'));

        function updateBulkBar() {

            const checked = rowChecks.filter(function (c) { return c.checked; });

            if (bulkBar) bulkBar.hidden = checked.length === 0;
            if (bulkCount) bulkCount.textContent = checked.length + (checked.length === 1 ? ' selected' : ' selected');

            if (selectAllCheck) {
                selectAllCheck.checked = checked.length > 0 && checked.length === rowChecks.length;
                selectAllCheck.indeterminate = checked.length > 0 && checked.length < rowChecks.length;
            }

        }

        rowChecks.forEach(function (checkbox) {
            checkbox.addEventListener('change', updateBulkBar);
            checkbox.addEventListener('click', function (e) { e.stopPropagation(); });
        });

        if (selectAllCheck) {
            selectAllCheck.addEventListener('click', function (e) { e.stopPropagation(); });
            selectAllCheck.addEventListener('change', function () {
                rowChecks.forEach(function (c) { c.checked = selectAllCheck.checked; });
                updateBulkBar();
            });
        }

        function getSelectedIds() {
            return rowChecks.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-id'); });
        }

        const clearBtn = document.getElementById('adminBulkClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                rowChecks.forEach(function (c) { c.checked = false; });
                updateBulkBar();
            });
        }

        const doneBtn = document.getElementById('adminBulkDoneBtn');
        if (doneBtn) {

            doneBtn.addEventListener('click', function () {

                const ids = getSelectedIds();
                if (!ids.length || !window.db) return;

                if (!confirm('Mark ' + ids.length + (ids.length === 1 ? ' booking' : ' bookings') + ' as Done?')) return;

                doneBtn.disabled = true;
                doneBtn.textContent = 'Updating…';

                const batch = window.db.batch();

                ids.forEach(function (id) {
                    const b = findBooking(id);
                    if (!b) return;
                    batch.update(window.db.collection('bookings').doc(id), { status: 'Done' });
                    batch.update(window.db.collection('bookedSlots').doc(b.date + '_' + b.time), { status: 'Done' });
                });

                batch.commit().then(function () {

                    ids.forEach(function (id) {
                        const b = findBooking(id);
                        if (b) b.status = 'Done';
                    });

                    renderBookingTable();

                }).catch(function () {
                    alert('Could not update some bookings. Please try again.');
                    doneBtn.disabled = false;
                    doneBtn.textContent = '✓ Mark as Done';
                });

            });

        }

        const deleteBtn = document.getElementById('adminBulkDeleteBtn');
        if (deleteBtn) {

            deleteBtn.addEventListener('click', function () {

                const ids = getSelectedIds();
                if (!ids.length || !window.db) return;

                if (!confirm('Delete ' + ids.length + (ids.length === 1 ? ' booking' : ' bookings') + '? This cannot be undone.')) return;

                deleteBtn.disabled = true;
                deleteBtn.textContent = 'Deleting…';

                const batch = window.db.batch();
                const slotsToFree = [];

                ids.forEach(function (id) {
                    const b = findBooking(id);
                    if (!b) return;
                    batch.delete(window.db.collection('bookings').doc(id));
                    slotsToFree.push(b.date + '_' + b.time);
                });

                batch.commit().then(function () {

                    allBookings = allBookings.filter(function (b) { return ids.indexOf(b.id) === -1; });
                    renderBookingTable();

                    // Free up the slots too -- best-effort, doesn't block the UI update.
                    const slotBatch = window.db.batch();
                    slotsToFree.forEach(function (slotId) {
                        slotBatch.delete(window.db.collection('bookedSlots').doc(slotId));
                    });
                    slotBatch.commit().catch(function () {});

                }).catch(function () {
                    alert('Could not delete some bookings. Please try again.');
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = '🗑 Delete';
                });

            });

        }

    }

    const adminBookingDetailModal = document.getElementById('adminBookingDetailModal');
    const adminDetailCloseBtn = document.getElementById('adminDetailCloseBtn');
    let currentDetailBookingId = null;

    function closeBookingDetailModal() {
        if (adminBookingDetailModal) {
            adminBookingDetailModal.classList.remove('open');
        }
        currentDetailBookingId = null;
    }

    function renderDetailModalContent(id) {

        const b = findBooking(id);
        if (!b) { closeBookingDetailModal(); return; }

        document.getElementById('detailBookingId').textContent = b.id;
        document.getElementById('detailName').textContent = b.name;
        document.getElementById('detailContact').textContent = b.contact;
        document.getElementById('detailDate').textContent = formatBookingDate(b.date);
        document.getElementById('detailTime').textContent = formatBookingTime(b.time);
        document.getElementById('detailService').textContent = b.service;
        document.getElementById('detailReferredBy').textContent = b.referredBy || '—';
        document.getElementById('detailNotes').textContent = b.notes || '(none)';

        const priceWrap = document.getElementById('detailPriceWrap');
        priceWrap.innerHTML = '<button type="button" class="admin-price-cell" id="detailPriceBtn" data-id="' + b.id + '">' +
            (b.price != null ? '₱' + b.price : 'Add price') + '</button>';
        document.getElementById('detailPriceBtn').addEventListener('click', function (e) {
            editBookingPrice(e.currentTarget, function () { renderDetailModalContent(id); });
        });

        const statusBtn = document.getElementById('detailStatusBtn');
        statusBtn.textContent = b.status;
        statusBtn.className = 'admin-status-badge admin-status-' + b.status;
        statusBtn.onclick = function () {
            toggleBookingDone(id, function () { renderDetailModalContent(id); });
        };

    }

    function openBookingDetailModal(id) {

        currentDetailBookingId = id;
        renderDetailModalContent(id);

        if (adminBookingDetailModal) {
            adminBookingDetailModal.classList.add('open');
        }

    }

    if (adminDetailCloseBtn) adminDetailCloseBtn.addEventListener('click', closeBookingDetailModal);

    if (adminBookingDetailModal) {
        adminBookingDetailModal.addEventListener('click', function (e) {
            if (e.target === adminBookingDetailModal) closeBookingDetailModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && adminBookingDetailModal && adminBookingDetailModal.classList.contains('open')) {
            closeBookingDetailModal();
        }
    });

    const detailDeleteBtn = document.getElementById('detailDeleteBtn');
    if (detailDeleteBtn) {
        detailDeleteBtn.addEventListener('click', function () {
            if (!currentDetailBookingId) return;
            deleteBooking(currentDetailBookingId, function () { closeBookingDetailModal(); });
        });
    }

    // One click flips Pending <-> Done -- no dropdowns, no extra steps.
    function toggleBookingDone(id, onDone) {

        const b = findBooking(id);
        if (!b || !window.db) return;

        const nextStatus = b.status === 'Done' ? 'Pending' : 'Done';

        window.db.collection('bookings').doc(id).update({ status: nextStatus })
            .then(function () {
                b.status = nextStatus;
                renderBookingTable();
                if (onDone) onDone();
            })
            .catch(function () {
                alert('Could not update this booking. Please try again.');
            });

        // Keep the public bookedSlots record in sync -- this is what turns
        // the customer-facing calendar dot from green to red once a booking
        // is completed. The slot doc's ID is now the date+time combo (not
        // the booking ID), so look it up directly by that same key.
        // Best-effort: doesn't block the main status update.
        window.db.collection('bookedSlots').doc(b.date + '_' + b.time).update({ status: nextStatus }).catch(function () {});

    }

    // Turns the Price cell into an inline number input on click, and
    // saves to Firestore as soon as the admin clicks away or hits Enter.
    function editBookingPrice(cellBtn, onDone) {

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

        function finish() {
            renderBookingTable();
            if (onDone) onDone();
        }

        function commit() {

            const raw = input.value.trim();
            const newPrice = raw === '' ? null : Math.max(0, parseFloat(raw));

            if (newPrice === b.price) {
                finish();
                return;
            }

            window.db.collection('bookings').doc(id).update({ price: newPrice })
                .then(function () {
                    b.price = newPrice;
                    finish();
                })
                .catch(function () {
                    alert('Could not save the price. Please try again.');
                    finish();
                });

        }

        input.addEventListener('blur', commit);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') finish();
        });

    }


    function deleteBooking(id, onDeleted) {

        const b = findBooking(id);
        if (!b || !window.db) return;

        if (!confirm('Delete the booking for ' + b.name + ' on ' + formatBookingDate(b.date) + '? This cannot be undone.')) return;

        window.db.collection('bookings').doc(id).delete()
            .then(function () {

                allBookings = allBookings.filter(function (x) { return x.id !== id; });
                renderBookingTable();
                if (onDeleted) onDeleted();

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

        const header = ['Booking ID', 'Date', 'Time', 'Customer Name', 'Contact Number', 'Referred By', 'Service', 'Price', 'Status', 'Notes'];

        function csvEscape(val) {
            const str = String(val == null ? '' : val);
            return '"' + str.replace(/"/g, '""') + '"';
        }

        const lines = [header.map(csvEscape).join(',')];

        rows.forEach(function (b) {
            lines.push([b.id, b.date, formatBookingTime(b.time), b.name, b.contact, b.referredBy || '', b.service, b.price != null ? b.price : '', b.status, b.notes]
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

    // One-time cleanup for calendar dots left behind by bookings deleted
    // before Firestore rules allowed deleting bookedSlots (that permission
    // bug is fixed now, but old leftovers need clearing out manually once).
    const adminCleanupSlotsBtn = document.getElementById('adminCleanupSlotsBtn');

    if (adminCleanupSlotsBtn) {

        adminCleanupSlotsBtn.addEventListener('click', function () {

            if (!window.db) return;

            adminCleanupSlotsBtn.disabled = true;
            adminCleanupSlotsBtn.textContent = 'Checking…';

            window.db.collection('bookedSlots').get().then(function (slotsSnap) {

                // A slot is valid if some current booking actually has that
                // exact date+time -- the slot doc's ID IS that combo now
                // (see reserveBookingAtomically), so this is a direct check.
                const validSlotIds = {};
                allBookings.forEach(function (b) {
                    if (b.date && b.time) validSlotIds[b.date + '_' + b.time] = true;
                });

                const existingSlotIds = {};
                slotsSnap.forEach(function (doc) { existingSlotIds[doc.id] = true; });

                const orphaned = [];
                slotsSnap.forEach(function (doc) {
                    if (!validSlotIds[doc.id]) orphaned.push(doc.ref);
                });

                // The other direction: active bookings (made before the
                // atomic reservation system, or otherwise missing their
                // slot doc) that show up as "still open" on the customer
                // calendar even though they're really taken.
                const missing = [];
                allBookings.forEach(function (b) {
                    if (!b.date || !b.time) return;
                    if (b.status !== 'Pending' && b.status !== 'Done') return;
                    const slotId = b.date + '_' + b.time;
                    if (!existingSlotIds[slotId]) missing.push({ id: slotId, date: b.date, time: b.time, status: b.status });
                });

                if (!orphaned.length && !missing.length) {
                    alert('No calendar sync issues found — everything is already in sync.');
                    return null;
                }

                const parts = [];
                if (orphaned.length) parts.push(orphaned.length + ' leftover slot' + (orphaned.length === 1 ? '' : 's') + ' with no matching booking');
                if (missing.length) parts.push(missing.length + ' booking' + (missing.length === 1 ? '' : 's') + ' missing from the calendar (shows as open when it isn\'t)');

                if (!confirm('Found: ' + parts.join(', and ') + '. Fix this now?')) {
                    return null;
                }

                const jobs = orphaned.map(function (ref) { return ref.delete(); });

                missing.forEach(function (m) {
                    jobs.push(window.db.collection('bookedSlots').doc(m.id).set({
                        date: m.date,
                        time: m.time,
                        status: m.status
                    }));
                });

                return Promise.all(jobs).then(function () {
                    alert('Fixed ' + orphaned.length + ' leftover ' + (orphaned.length === 1 ? 'dot' : 'dots') + ' and ' + missing.length + ' missing calendar ' + (missing.length === 1 ? 'entry' : 'entries') + '.');
                    loadAvailability();
                });

            }).catch(function (err) {
                console.error('Cleanup failed:', err);
                alert('Could not check for calendar sync issues. Make sure your Firestore rules allow admin read/write on bookedSlots, then try again.');
            }).finally(function () {
                adminCleanupSlotsBtn.disabled = false;
                adminCleanupSlotsBtn.textContent = '🧹 Clean Up Calendar';
            });

        });

    }

    [adminSearchInput, adminFilterStatus, adminFilterService].forEach(function (el) {
        if (el) el.addEventListener('input', renderBookingTable);
    });

    // ===============================
    // ADMIN CALENDAR VIEW -- see every booked date/time at a glance,
    // and mark/unmark "off" days (shown as a heads-up sign on the site,
    // but customers can still book those dates).
    // ===============================

    const adminTabTable = document.getElementById('adminTabTable');
    const adminTabCalendar = document.getElementById('adminTabCalendar');
    const adminTabReferrals = document.getElementById('adminTabReferrals');
    const adminTabArchive = document.getElementById('adminTabArchive');
    const adminToolbar = document.getElementById('adminToolbar');
    const adminCalendarView = document.getElementById('adminCalendarView');
    const adminReferralsView = document.getElementById('adminReferralsView');
    const adminDashCalGrid = document.getElementById('adminDashCalGrid');
    const adminDashCalMonthLabel = document.getElementById('adminDashCalMonthLabel');
    const adminDashCalPrev = document.getElementById('adminDashCalPrev');
    const adminDashCalNext = document.getElementById('adminDashCalNext');
    const adminDashCalDetail = document.getElementById('adminDashCalDetail');

    let adminOffDates = [];
    let adminCalYear = new Date().getFullYear();
    let adminCalMonth = new Date().getMonth();
    let adminCalSelectedDate = null;

    let adminArchiveMode = false; // true = Archive tab (Done bookings only)

    function switchAdminView(view) {

        const showCalendar = view === 'calendar';
        const showReferrals = view === 'referrals';
        const showArchive = view === 'archive';
        const showTable = !showCalendar && !showReferrals && !showArchive;

        adminArchiveMode = showArchive;

        adminTabTable.classList.toggle('is-active', showTable);
        adminTabCalendar.classList.toggle('is-active', showCalendar);
        if (adminTabReferrals) adminTabReferrals.classList.toggle('is-active', showReferrals);
        if (adminTabArchive) adminTabArchive.classList.toggle('is-active', showArchive);

        const showList = showTable || showArchive;
        adminToolbar.style.display = showList ? 'flex' : 'none';
        adminDashBody.style.display = showList ? 'block' : 'none';
        adminCalendarView.style.display = showCalendar ? 'grid' : 'none';
        if (adminReferralsView) adminReferralsView.style.display = showReferrals ? 'block' : 'none';

        if (showCalendar) {
            renderAdminCalendar(); // draw the day grid right away, even before off-dates load
            loadAdminOffDates();
        }
        if (showReferrals) renderAdminReferrals();
        if (showList) renderBookingTable();

    }

    if (adminTabTable) adminTabTable.addEventListener('click', function () { switchAdminView('table'); });
    if (adminTabCalendar) adminTabCalendar.addEventListener('click', function () { switchAdminView('calendar'); });
    if (adminTabReferrals) adminTabReferrals.addEventListener('click', function () { switchAdminView('referrals'); });
    if (adminTabArchive) adminTabArchive.addEventListener('click', function () { switchAdminView('archive'); });

    // ===============================
    // REWARD QR SCANNER -- staff scan a customer's reward QR (their phone's
    // "Congratulations" code) with the device camera, and instantly see how
    // many rewards they've earned vs already used, with a button to mark
    // one as used. Uses the html5-qrcode library already loaded on this page.
    // ===============================

    const adminScanBtn = document.getElementById('adminScanBtn');
    const adminQrScannerOverlay = document.getElementById('adminQrScannerOverlay');
    const adminQrScannerClose = document.getElementById('adminQrScannerClose');
    const adminScanResultEl = document.getElementById('adminScanResult');
    const adminScanResultName = document.getElementById('adminScanResultName');
    const adminScanResultDetail = document.getElementById('adminScanResultDetail');
    const adminRedeemBtn = document.getElementById('adminRedeemBtn');
    const adminScanAgainBtn = document.getElementById('adminScanAgainBtn');

    let html5QrScanner = null;
    let currentScannedPhone = null;

    let scannerBusy = false; // true while start()/stop() is in flight, to prevent overlapping calls

    function stopAdminScanner() {

        if (!html5QrScanner) return Promise.resolve();

        const scanner = html5QrScanner;
        html5QrScanner = null;

        return scanner.stop().then(function () {
            return scanner.clear();
        }).catch(function () {
            // Already stopped/never started -- fine, nothing left to clean up.
        });

    }

    function startAdminScanner() {

        if (scannerBusy) return; // a start or stop is already in progress -- ignore this click
        scannerBusy = true;

        // Always fully stop any previous instance first -- starting a new
        // one while the last is still releasing the camera is what caused
        // the scanner to freeze/get stuck.
        stopAdminScanner().then(function () {

            if (typeof Html5Qrcode === 'undefined') {
                document.getElementById('adminQrReaderRegion').innerHTML =
                    '<p class="admin-dash-status">Scanner failed to load. Check your internet connection and try again.</p>';
                scannerBusy = false;
                return;
            }

            adminScanResultEl.hidden = true;
            currentScannedPhone = null;

            const scanner = new Html5Qrcode('adminQrReaderRegion');
            html5QrScanner = scanner;

            const scanBoxSize = Math.min(220, Math.floor(window.innerWidth * 0.6));

            scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: scanBoxSize },
                function (decodedText) {

                    // A phone can hold multiple reward QRs across visits --
                    // ignore repeat frames of the same code while we're
                    // already showing a result for it.
                    if (decodedText === currentScannedPhone) return;

                    let phone = null;

                    try {
                        const url = new URL(decodedText);
                        phone = url.searchParams.get('redeem') || url.searchParams.get('ref');
                    } catch (e) {
                        // not a URL -- ignore, keep scanning
                    }

                    if (!phone || !/^09\d{9}$/.test(phone)) return;

                    currentScannedPhone = decodedText;
                    showAdminScanResult(phone);

                },
                function () { /* per-frame no-match -- expected constantly while aiming, ignore */ }
            ).then(function () {
                scannerBusy = false;
            }).catch(function (err) {
                document.getElementById('adminQrReaderRegion').innerHTML =
                    '<p class="admin-dash-status">Could not access the camera. Please allow camera permission and try again.</p>';
                console.error('Scanner start failed:', err);
                scannerBusy = false;
            });

        });

    }

    function showAdminScanResult(phone) {

        adminScanResultName.textContent = 'Looking up ' + phone + '…';
        adminScanResultDetail.textContent = '';
        adminRedeemBtn.hidden = true;
        adminScanResultEl.hidden = false;

        if (!window.db) {
            adminScanResultName.textContent = 'Could not connect right now.';
            return;
        }

        Promise.all([
            window.db.collection('bookings').where('contact', '==', phone).limit(1).get(),
            window.db.collection('bookings').where('referredBy', '==', phone).where('status', '==', 'Done').get(),
            window.db.collection('referralRewards').doc(phone).get()
        ]).then(function (results) {

            const ownSnap = results[0];
            const referredSnap = results[1];
            const rewardDoc = results[2];

            const name = ownSnap.empty ? phone : (ownSnap.docs[0].data().name || phone);
            const count = referredSnap.size;
            const earned = Math.floor(count / ADMIN_REFERRAL_REWARD_THRESHOLD);
            const claimed = rewardDoc.exists ? (rewardDoc.data().claimedCount || 0) : 0;
            const remaining = Math.max(0, earned - claimed);

            adminScanResultName.textContent = name + ' — ' + phone;

            if (remaining > 0) {
                adminScanResultDetail.textContent =
                    count + ' completed referrals · ' + remaining + ' reward' + (remaining === 1 ? '' : 's') + ' available (' + claimed + ' already used)';
                adminRedeemBtn.hidden = false;
                adminRedeemBtn.textContent = 'Mark 1 Reward as Used';
                adminRedeemBtn.onclick = function () { markRewardUsed(phone); };
            } else if (earned > 0) {
                adminScanResultDetail.textContent =
                    count + ' completed referrals · all ' + earned + ' reward' + (earned === 1 ? '' : 's') + ' already used.';
                adminRedeemBtn.hidden = true;
            } else {
                adminScanResultDetail.textContent =
                    count + ' completed referral' + (count === 1 ? '' : 's') + ' so far — needs ' + ADMIN_REFERRAL_REWARD_THRESHOLD + ' to earn a reward.';
                adminRedeemBtn.hidden = true;
            }

        }).catch(function (err) {

            if (err && err.code === 'permission-denied') {
                adminScanResultName.textContent = 'Missing Firestore permission.';
                adminScanResultDetail.textContent = 'Your Firestore rules need read/write access to "referralRewards" and update access to "bookedSlots" for signed-in admins. See the setup notes for the exact rule to add.';
            } else {
                adminScanResultName.textContent = 'Something went wrong.';
                adminScanResultDetail.textContent = 'Please try scanning again.';
            }

            console.error('Reward lookup failed:', err);
        });

    }

    function markRewardUsed(phone) {

        if (!window.db) return;

        adminRedeemBtn.disabled = true;
        adminRedeemBtn.textContent = 'Marking as used…';

        window.db.collection('referralRewards').doc(phone).set({
            claimedCount: firebase.firestore.FieldValue.increment(1),
            lastClaimedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).then(function () {

            adminRedeemBtn.textContent = '✅ Marked as Used';
            renderAdminReferrals(); // refresh the leaderboard so it reflects the new claim

        }).catch(function (err) {
            adminRedeemBtn.disabled = false;
            adminRedeemBtn.textContent = 'Mark 1 Reward as Used';
            alert('Could not mark this reward as used. Please try again.');
            console.error('Mark-used failed:', err);
        });

    }

    function closeAdminScanner() {
        stopAdminScanner();
        adminQrScannerOverlay.hidden = true;
    }

    if (adminScanBtn) {

        adminScanBtn.addEventListener('click', function () {
            adminQrScannerOverlay.hidden = false;
            adminRedeemBtn.disabled = false;
            startAdminScanner();
        });

    }

    if (adminQrScannerClose) {
        adminQrScannerClose.addEventListener('click', closeAdminScanner);
    }

    if (adminQrScannerOverlay) {
        adminQrScannerOverlay.addEventListener('click', function (e) {
            if (e.target === adminQrScannerOverlay) closeAdminScanner();
        });
    }

    // ESC closes the scanner too, matching every other modal on the site --
    // this was missing before, which was part of why the scanner felt stuck.
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && adminQrScannerOverlay && !adminQrScannerOverlay.hidden) {
            closeAdminScanner();
        }
    });

    if (adminScanAgainBtn) {

        adminScanAgainBtn.addEventListener('click', function () {

            adminRedeemBtn.disabled = false;
            adminScanResultEl.hidden = true;
            currentScannedPhone = null;

            // If the camera is somehow no longer running (e.g. it was lost
            // or never started), fall back to a full (re)start.
            if (!html5QrScanner) startAdminScanner();

        });

    }

    // Builds a referrer leaderboard straight from the existing bookings
    // cache -- no separate collection needed. For each unique phone number
    // that appears as someone's referredBy, count how many bookings list
    // them as the referrer, and look up their own name from their most
    // recent booking so the list is easy to read at a glance.
    // Keep in sync with REFERRAL_REWARD_THRESHOLD in the customer-facing
    // referral check code -- every N completed referrals earns one reward.
    const ADMIN_REFERRAL_REWARD_THRESHOLD = 3;

    function renderAdminReferrals() {

        const list = document.getElementById('adminReferralsList');
        if (!list) return;

        const countsByPhone = {};

        allBookings.forEach(function (b) {
            if (!b.referredBy) return;
            if (b.status !== 'Done') return; // only completed visits count as a real referral
            countsByPhone[b.referredBy] = (countsByPhone[b.referredBy] || 0) + 1;
        });

        const referrerPhones = Object.keys(countsByPhone);

        if (!referrerPhones.length) {
            list.innerHTML = '<p class="admin-dash-status">No referrals recorded yet.</p>';
            return;
        }

        // One read of the whole (small) rewards collection, instead of one
        // read per referrer -- claimedCount tracks how many rewards each
        // phone number has already redeemed in person.
        const claimedLookup = {};

        function buildAndRenderRows() {

            const rows = referrerPhones.map(function (phone) {

                const ownBooking = allBookings.find(function (b) { return b.contact === phone; });
                const count = countsByPhone[phone];
                const earned = Math.floor(count / ADMIN_REFERRAL_REWARD_THRESHOLD);
                const claimed = claimedLookup[phone] || 0;
                const remaining = Math.max(0, earned - claimed);

                return {
                    phone: phone,
                    name: ownBooking ? ownBooking.name : '—',
                    count: count,
                    claimed: claimed,
                    remaining: remaining
                };

            }).sort(function (a, b) { return b.count - a.count; });

            list.innerHTML =
                '<table class="admin-referrals-table">' +
                '<thead><tr><th>Referrer</th><th>Phone</th><th>Referrals</th><th>Reward</th></tr></thead>' +
                '<tbody>' +
                rows.map(function (r) {

                    let rewardCell = '<span class="admin-reward-badge admin-reward-none">—</span>';

                    if (r.remaining > 0 && r.claimed > 0) {
                        rewardCell = '<span class="admin-reward-badge admin-reward-available">🎁 ' + r.remaining + ' available</span>' +
                            '<span class="admin-reward-badge admin-reward-used">' + r.claimed + ' used</span>';
                    } else if (r.remaining > 0) {
                        rewardCell = '<span class="admin-reward-badge admin-reward-available">🎁 ' + r.remaining + ' available</span>';
                    } else if (r.claimed > 0) {
                        rewardCell = '<span class="admin-reward-badge admin-reward-used">' + r.claimed + ' used</span>';
                    }

                    return '<tr>' +
                        '<td data-label="Referrer">' + r.name + '</td>' +
                        '<td data-label="Phone">' + r.phone + '</td>' +
                        '<td data-label="Referrals"><span class="admin-referral-count-badge">' + r.count + '</span></td>' +
                        '<td data-label="Reward">' + rewardCell + '</td></tr>';
                }).join('') +
                '</tbody>' +
                '</table>';

        }

        if (window.db) {

            window.db.collection('referralRewards').get().then(function (snapshot) {
                snapshot.forEach(function (doc) {
                    claimedLookup[doc.id] = doc.data().claimedCount || 0;
                });
                buildAndRenderRows();
            }).catch(function () {
                buildAndRenderRows(); // still show the list even if this read fails
            });

        } else {
            buildAndRenderRows();
        }

    }

    function loadAdminOffDates() {

        if (!window.db) return;

        window.db.collection('blockedDates').get().then(function (snapshot) {

            adminOffDates = [];
            snapshot.forEach(function (doc) { adminOffDates.push(doc.id); });
            renderAdminCalendar();

        }).catch(function () {
            adminOffDates = [];
            renderAdminCalendar();
        });

    }

    function adminDateToStr(y, m, d) {
        return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    }

    function renderAdminCalendar() {

        if (!adminDashCalGrid) return;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        adminDashCalMonthLabel.textContent = monthNames[adminCalMonth] + ' ' + adminCalYear;

        const firstOfMonth = new Date(adminCalYear, adminCalMonth, 1);
        const startWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(adminCalYear, adminCalMonth + 1, 0).getDate();
        const todayStr = adminDateToStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

        adminDashCalGrid.innerHTML = '';

        for (let i = 0; i < startWeekday; i++) {
            const blank = document.createElement('span');
            blank.className = 'admin-cal-day admin-cal-day--empty';
            adminDashCalGrid.appendChild(blank);
        }

        for (let day = 1; day <= daysInMonth; day++) {

            const cellStr = adminDateToStr(adminCalYear, adminCalMonth, day);
            const dayBookings = allBookings.filter(function (b) { return b.date === cellStr; });
            const isOff = adminOffDates.indexOf(cellStr) !== -1;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'admin-cal-day';

            const dayNum = document.createElement('span');
            dayNum.textContent = day;
            btn.appendChild(dayNum);

            if (dayBookings.length) {
                const countLabel = document.createElement('span');
                countLabel.className = 'admin-cal-day-count';
                countLabel.textContent = dayBookings.length;
                countLabel.title = dayBookings.length + (dayBookings.length === 1 ? ' booking' : ' bookings');
                btn.appendChild(countLabel);
            }

            if (isOff) {
                const tag = document.createElement('span');
                tag.className = 'admin-cal-day-off-tag';
                tag.textContent = 'OFF';
                btn.appendChild(tag);
            }

            if (cellStr === todayStr) btn.classList.add('admin-cal-day--today');
            if (cellStr === adminCalSelectedDate) btn.classList.add('admin-cal-day--selected');

            btn.addEventListener('click', function () {
                adminCalSelectedDate = cellStr;
                renderAdminCalendar();
                renderAdminCalDetail(cellStr, dayBookings, isOff);
            });

            adminDashCalGrid.appendChild(btn);

        }

    }

    function renderAdminCalDetail(dateStr, dayBookings, isOff) {

        if (!adminDashCalDetail) return;

        let html = '<p class="admin-cal-detail-date">' + formatBookingDate(dateStr) + '</p>';

        html += '<button type="button" class="admin-cal-off-btn ' + (isOff ? 'is-off' : 'is-on') + '" id="adminCalOffToggle">' +
            (isOff ? 'Remove OFF for this date' : 'Mark this date as OFF') +
            '</button>';

        if (dayBookings.length) {

            dayBookings
                .slice()
                .sort(function (a, b) { return a.time < b.time ? -1 : 1; })
                .forEach(function (b) {

                    html += '<div class="admin-cal-booking-item">' +
                        '<div class="admin-cal-booking-time">' + formatBookingTime(b.time) + '</div>' +
                        '<div class="admin-cal-booking-name">' + b.name + '</div>' +
                        '<div class="admin-cal-booking-service">' + b.service + '</div>' +
                        '</div>';

                });

        } else {

            html += '<p class="admin-cal-detail-empty-day">No bookings on this date.</p>';

        }

        adminDashCalDetail.innerHTML = html;

        document.getElementById('adminCalOffToggle').addEventListener('click', function () {
            toggleOffDate(dateStr, isOff);
        });

        renderAdminCalWaitlist(dateStr);

    }

    // Shows anyone waiting for this date to open up, fetched separately
    // since it's a Firestore query rather than data already cached locally.
    function renderAdminCalWaitlist(dateStr) {

        if (!window.db || !adminDashCalDetail) return;

        window.db.collection('waitlist').where('date', '==', dateStr).get().then(function (snapshot) {

            // The panel may have moved on to a different date by the time
            // this resolves -- only apply it if we're still looking at dateStr.
            if (adminDashCalDetail.querySelector('.admin-cal-detail-date').textContent !== formatBookingDate(dateStr)) return;
            if (snapshot.empty) return;

            let waitlistHtml = '<p class="admin-cal-waitlist-heading">🕒 Waitlist (' + snapshot.size + ')</p>';

            snapshot.forEach(function (doc) {
                const w = doc.data();
                waitlistHtml += '<div class="admin-cal-waitlist-item">' +
                    '<span>' + w.name + '</span>' +
                    '<a href="tel:' + w.contact + '">' + w.contact + '</a>' +
                    '</div>';
            });

            adminDashCalDetail.insertAdjacentHTML('beforeend', waitlistHtml);

        }).catch(function () {});

    }

    function toggleOffDate(dateStr, currentlyOff) {

        if (!window.db) return;

        const ref = window.db.collection('blockedDates').doc(dateStr);
        const action = currentlyOff ? ref.delete() : ref.set({ off: true });

        action.then(function () {

            if (currentlyOff) {
                adminOffDates = adminOffDates.filter(function (d) { return d !== dateStr; });
            } else {
                adminOffDates.push(dateStr);
            }

            renderAdminCalendar();

            const dayBookings = allBookings.filter(function (b) { return b.date === dateStr; });
            renderAdminCalDetail(dateStr, dayBookings, !currentlyOff);

        }).catch(function () {
            alert('Could not update this date. Please try again.');
        });

    }

    if (adminDashCalPrev) {

        adminDashCalPrev.addEventListener('click', function () {
            adminCalMonth--;
            if (adminCalMonth < 0) { adminCalMonth = 11; adminCalYear--; }
            renderAdminCalendar();
        });

    }

    if (adminDashCalNext) {

        adminDashCalNext.addEventListener('click', function () {
            adminCalMonth++;
            if (adminCalMonth > 11) { adminCalMonth = 0; adminCalYear++; }
            renderAdminCalendar();
        });

    }


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

// ===============================
// PWA INSTALL -- lets people add this site to their phone's home screen
// so it opens like a real app (no address bar), without going through
// Chrome every time.
// ===============================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').catch(function () {});
    });
}

document.addEventListener('DOMContentLoaded', function () {

    let deferredInstallPrompt = null;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    function isRunningStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    const floatBtn = document.getElementById('floatingBookBtn');
    const floatIcon = document.getElementById('floatingBookIcon');
    const floatLabel = document.getElementById('floatingBookLabel');

    const ICONS = {
        install: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>',
        manage: '<rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3.5 9.5h17M8 3v3.5M16 3v3.5"/>'
    };

    let floatMode = 'hidden';

    function setFloatingButton(mode) {

        floatMode = mode;

        if (!floatBtn) return;

        if (mode === 'hidden') {
            floatBtn.hidden = true;
            return;
        }

        floatBtn.hidden = false;
        floatBtn.setAttribute('aria-label', mode === 'manage' ? 'Manage Booking' : 'Install App');
        if (floatIcon) floatIcon.innerHTML = ICONS[mode];
        if (floatLabel) floatLabel.textContent = mode === 'manage' ? 'Manage Booking' : 'Install App';

    }

    // Checks whether THIS device has a booking it just made that's still
    // active, and shows/hides the floating "Manage Booking" shortcut
    // accordingly. Runs on load, and again right after a new booking or
    // a cancellation -- exposed globally so those flows can trigger it.
    function refreshFloatingBookingState() {

        if (!isRunningStandalone()) return; // this shortcut is app-only, per request

        let saved = null;
        try { saved = JSON.parse(localStorage.getItem('nailxtaytay_active_booking') || 'null'); } catch (e) {}

        if (!saved || !saved.id) {
            setFloatingButton('hidden');
            return;
        }

        if (!window.db) {
            setFloatingButton('hidden');
            return;
        }

        window.db.collection('bookings').doc(saved.id).get().then(function (doc) {

            if (!doc.exists || doc.data().status !== 'Pending') {
                // Booking is Done, Cancelled, or gone -- the "session" is over.
                try { localStorage.removeItem('nailxtaytay_active_booking'); } catch (e) {}
                setFloatingButton('hidden');
                return;
            }

            setFloatingButton('manage');

        }).catch(function () {
            setFloatingButton('hidden');
        });

    }

    window.refreshFloatingBookingState = refreshFloatingBookingState;

    // ---- Install counter -- purely a number the admin can see, no
    // personal info attached. Fires once per real install. ----
    function recordAppInstall() {
        if (!window.db) return;
        window.db.collection('stats').doc('counters').set({
            appInstalls: firebase.firestore.FieldValue.increment(1)
        }, { merge: true }).catch(function () {});
    }

    if (isRunningStandalone()) {

        // Already installed: no install prompt to offer -- but there
        // might be a "Manage Booking" shortcut to show instead.
        refreshFloatingBookingState();

    } else {

        setFloatingButton('install');

        // Android/Chrome: browser tells us installation is genuinely available
        // right now -- capture it so the floating button can use it directly
        // (skipping the manual-instructions fallback) when the user taps it.
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredInstallPrompt = e;
        });

        window.addEventListener('appinstalled', function () {
            deferredInstallPrompt = null;
            recordAppInstall();
            // Install just happened -- the "Install App" prompt should never
            // show again in this tab, even though this tab itself is still
            // a regular browser window and not the new standalone one.
            setFloatingButton('hidden');
            refreshFloatingBookingState(); // switches to "Manage Booking" if applicable
        });

        // Some browsers finish installing and flip this SAME window into
        // standalone mode without a full reload -- catch that transition
        // too, instead of only relying on the one-time check at load.
        var standaloneQuery = window.matchMedia('(display-mode: standalone)');
        if (standaloneQuery.addEventListener) {
            standaloneQuery.addEventListener('change', function (e) {
                if (e.matches) refreshFloatingBookingState();
            });
        }

    }

    function runPwaInstallFlow() {

        if (deferredInstallPrompt) {

            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.finally(function () {
                deferredInstallPrompt = null;
            });

        } else if (isIOS) {

            alert(
                'To install this app on your iPhone:\n\n' +
                '1. Tap the Share button (square with an arrow up) at the bottom of Safari.\n' +
                '2. Scroll down and tap "Add to Home Screen".\n' +
                '3. Tap "Add".'
            );

        } else {

            alert(
                'Your browser doesn\'t support one-tap install.\n\n' +
                'Open this site in Chrome for the smoothest experience, then use the menu (⋮) → "Add to Home screen" or "Install app".'
            );

        }

    }

    window.runPwaInstallFlow = runPwaInstallFlow;

    if (floatBtn) {

        floatBtn.addEventListener('click', function () {

            if (floatMode === 'manage') {

                let saved = null;
                try { saved = JSON.parse(localStorage.getItem('nailxtaytay_active_booking') || 'null'); } catch (e) {}

                if (saved && saved.contact && typeof window.openManageBookingModal === 'function') {
                    window.openManageBookingModal(saved.contact);
                }

            } else {
                runPwaInstallFlow();
            }

        });

    }

});