// ===============================================================
// Nail X Taytay -- Automatic appointment reminder push notifications
// ===============================================================
//
// This runs on a schedule (every 10 minutes) in the background,
// completely independent of whether anyone has the website open.
// It looks for Pending bookings whose appointment time is coming up
// within the next hour, and sends each customer a push notification
// reminder -- but only if they opted in (tapped "Enable Reminder"
// after booking, which saves a "pushSubscription" on their booking).
//
// Deployment requires the Firebase "Blaze" (pay-as-you-go) plan,
// since scheduled Cloud Functions aren't available on the free plan.
// See DEPLOY-PUSH-NOTIFICATIONS.txt for full setup steps.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const webpush = require('web-push');

admin.initializeApp();

// These come from Firebase's function config (set via the CLI --
// never hardcode the private key here). See the deploy guide.
const VAPID_PUBLIC_KEY = functions.config().vapid && functions.config().vapid.public;
const VAPID_PRIVATE_KEY = functions.config().vapid && functions.config().vapid.private;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:nailxtaytay@example.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

// How far ahead to look for upcoming appointments needing a reminder.
// The schedule runs every 10 minutes, so a 65-minute window with a
// "already sent" flag guarantees every booking gets exactly one
// reminder somewhere between ~55-65 minutes before their appointment.
const REMINDER_WINDOW_MINUTES = 65;

exports.sendBookingReminders = functions
    .runWith({ timeoutSeconds: 120 })
    .pubsub.schedule('every 10 minutes')
    .onRun(async function () {

        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.error('VAPID keys are not configured -- run `firebase functions:config:set vapid.public=... vapid.private=...` and redeploy.');
            return null;
        }

        const db = admin.firestore();
        const now = new Date();
        const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MINUTES * 60000);

        const snapshot = await db.collection('bookings').where('status', '==', 'Pending').get();

        const jobs = [];

        snapshot.forEach(function (doc) {

            const b = doc.data();

            if (!b.pushSubscription || b.reminderSent) return;
            if (!b.date || !b.time) return;

            const apptDt = new Date(b.date + 'T' + b.time + ':00');
            if (isNaN(apptDt.getTime())) return;
            if (apptDt < now || apptDt > windowEnd) return;

            const payload = JSON.stringify({
                title: '💅 Appointment Reminder',
                body: 'Hi ' + (b.name || 'there') + '! Your Nail X Taytay appointment is coming up soon. See you shortly!'
            });

            const job = webpush.sendNotification(b.pushSubscription, payload)
                .then(function () {
                    return doc.ref.update({ reminderSent: true });
                })
                .catch(function (err) {

                    console.error('Push failed for booking', doc.id, err && err.statusCode);

                    // Subscription is no longer valid (customer uninstalled,
                    // revoked permission, etc.) -- clear it so we stop
                    // retrying on every run.
                    if (err && (err.statusCode === 410 || err.statusCode === 404)) {
                        return doc.ref.update({ pushSubscription: admin.firestore.FieldValue.delete() });
                    }

                });

            jobs.push(job);

        });

        await Promise.all(jobs);

        console.log('Reminder run complete -- checked', snapshot.size, 'pending bookings, sent', jobs.length, 'reminder(s).');

        return null;

    });
