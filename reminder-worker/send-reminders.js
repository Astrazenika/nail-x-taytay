// ===============================================================
// Nail X Taytay -- Automatic appointment reminder push notifications
// (GitHub Actions version -- no Firebase Blaze plan / credit card needed)
// ===============================================================
//
// This script is meant to be run on a schedule by GitHub Actions (see
// ../.github/workflows/send-reminders.yml), completely free. It connects
// to Firestore using a service account, looks for Pending bookings
// starting soon that have an opted-in push subscription, and sends
// each one a reminder notification -- then marks it as sent so it's
// never sent twice.
//
// Required secrets (set in the GitHub repo's Settings -> Secrets):
//   FIREBASE_SERVICE_ACCOUNT  -- the full JSON key from Firebase Console
//                                 (Project settings -> Service accounts
//                                 -> Generate new private key)
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//
// See DEPLOY-PUSH-NOTIFICATIONS.txt for full setup steps.

const admin = require('firebase-admin');
const webpush = require('web-push');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

webpush.setVapidDetails(
    'mailto:nailxtaytay@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// How far ahead to look for upcoming appointments needing a reminder.
// The workflow runs every 10 minutes, so a 65-minute window with a
// "already sent" flag guarantees every booking gets exactly one
// reminder somewhere between ~55-65 minutes before their appointment.
const REMINDER_WINDOW_MINUTES = 65;

async function main() {

    const db = admin.firestore();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MINUTES * 60000);

    const snapshot = await db.collection('bookings').where('status', '==', 'Pending').get();

    let sentCount = 0;

    for (const doc of snapshot.docs) {

        const b = doc.data();

        if (!b.pushSubscription || b.reminderSent) continue;
        if (!b.date || !b.time) continue;

        const apptDt = new Date(b.date + 'T' + b.time + ':00');
        if (isNaN(apptDt.getTime())) continue;
        if (apptDt < now || apptDt > windowEnd) continue;

        const payload = JSON.stringify({
            title: '💅 Appointment Reminder',
            body: 'Hi ' + (b.name || 'there') + '! Your Nail X Taytay appointment is coming up soon. See you shortly!'
        });

        try {

            await webpush.sendNotification(b.pushSubscription, payload);
            await doc.ref.update({ reminderSent: true });
            sentCount++;
            console.log('Sent reminder for booking', doc.id);

        } catch (err) {

            console.error('Push failed for booking', doc.id, err && err.statusCode);

            // Subscription is no longer valid (customer uninstalled,
            // revoked permission, etc.) -- clear it so we stop
            // retrying on every run.
            if (err && (err.statusCode === 410 || err.statusCode === 404)) {
                await doc.ref.update({ pushSubscription: admin.firestore.FieldValue.delete() });
            }

        }

    }

    console.log('Reminder run complete -- checked', snapshot.size, 'pending booking(s), sent', sentCount, 'reminder(s).');

}

main().then(function () {
    process.exit(0);
}).catch(function (err) {
    console.error('Reminder run failed:', err);
    process.exit(1);
});
