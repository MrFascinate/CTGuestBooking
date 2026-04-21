import { Resend } from 'resend';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { config } from './config';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatBookingTime(isoUtc: string, guestTimezone: string): string {
  const zoned = toZonedTime(new Date(isoUtc), guestTimezone);
  return format(zoned, "EEEE, MMMM d 'at' h:mm a zzz");
}

export async function sendBookingConfirmation(params: {
  guestName: string;
  guestEmail: string;
  startUtc: string;
  guestTimezone: string;
  topic: string;
  rescheduleUrl: string;
  cancelUrl: string;
}) {
  const time = formatBookingTime(params.startUtc, params.guestTimezone);

  await resend.emails.send({
    from: config.fromEmail,
    to: params.guestEmail,
    subject: "You're booked on Curiosity Theory",
    html: bookingHtml({ ...params, time }),
  });
}

export async function sendRescheduleConfirmation(params: {
  guestName: string;
  guestEmail: string;
  oldStartUtc: string;
  newStartUtc: string;
  guestTimezone: string;
  rescheduleUrl: string;
  cancelUrl: string;
}) {
  const oldTime = formatBookingTime(params.oldStartUtc, params.guestTimezone);
  const newTime = formatBookingTime(params.newStartUtc, params.guestTimezone);

  await resend.emails.send({
    from: config.fromEmail,
    to: params.guestEmail,
    subject: 'Your Curiosity Theory recording has moved',
    html: rescheduleHtml({ ...params, oldTime, newTime }),
  });
}

export async function sendCancellationConfirmation(params: {
  guestName: string;
  guestEmail: string;
  startUtc: string;
  guestTimezone: string;
}) {
  const time = formatBookingTime(params.startUtc, params.guestTimezone);

  await resend.emails.send({
    from: config.fromEmail,
    to: params.guestEmail,
    subject: 'Your Curiosity Theory recording is canceled',
    html: cancelHtml({ ...params, time }),
  });
}

const emailBase = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #f0f0f0; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .logo { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #d4a847; margin-bottom: 32px; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 16px; color: #f0f0f0; }
  p { font-size: 15px; line-height: 1.6; color: #a0a0a0; margin: 0 0 16px; }
  .highlight { color: #f0f0f0; }
  .time-block { background: #111; border-left: 3px solid #d4a847; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0; }
  .time-block p { margin: 0; color: #f0f0f0; font-size: 16px; font-weight: 500; }
  .btn { display: inline-block; background: #d4a847; color: #050505; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; font-size: 14px; margin-right: 12px; margin-bottom: 8px; }
  .btn-ghost { display: inline-block; border: 1px solid #333; color: #a0a0a0; text-decoration: none; padding: 11px 24px; border-radius: 4px; font-size: 14px; margin-bottom: 8px; }
  .divider { border: none; border-top: 1px solid #1a1a1a; margin: 32px 0; }
  .footer { font-size: 12px; color: #444; }
  .footer a { color: #666; }
  del { color: #555; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">Curiosity Theory</div>
  ${content}
  <hr class="divider">
  <p class="footer">
    <a href="https://curiositytheorypod.com">curiositytheorypod.com</a>
  </p>
</div>
</body>
</html>
`;

function bookingHtml(p: {
  guestName: string;
  time: string;
  topic: string;
  rescheduleUrl: string;
  cancelUrl: string;
}) {
  return emailBase(`
    <h1>You're booked.</h1>
    <p>Hey ${p.guestName}, your recording slot is confirmed.</p>
    <div class="time-block"><p>${p.time}</p></div>
    <p><span class="highlight">Topic:</span> ${p.topic}</p>
    <p>You'll get a Google Calendar invite shortly. A Riverside.fm link is included in the invite description.</p>
    <p>A few things that help the recording go well:</p>
    <p>Headphones on. Mic tested. Browser tabs closed except Riverside. Phone on silent. Join 5 minutes early for a sound check.</p>
    <p>Questions? Reply to this email.</p>
    <div style="margin-top: 28px;">
      <a href="${p.rescheduleUrl}" class="btn-ghost">Reschedule</a>
      <a href="${p.cancelUrl}" class="btn-ghost" style="margin-left: 8px;">Cancel</a>
    </div>
  `);
}

function rescheduleHtml(p: {
  guestName: string;
  oldTime: string;
  newTime: string;
  rescheduleUrl: string;
  cancelUrl: string;
}) {
  return emailBase(`
    <h1>Your recording time has changed.</h1>
    <p>Hey ${p.guestName}, here is your updated slot.</p>
    <div class="time-block">
      <p><del>${p.oldTime}</del></p>
      <p style="margin-top: 8px;">${p.newTime}</p>
    </div>
    <p>A Google Calendar update is on the way.</p>
    <div style="margin-top: 28px;">
      <a href="${p.rescheduleUrl}" class="btn-ghost">Reschedule again</a>
      <a href="${p.cancelUrl}" class="btn-ghost" style="margin-left: 8px;">Cancel</a>
    </div>
  `);
}

function cancelHtml(p: { guestName: string; time: string }) {
  return emailBase(`
    <h1>Recording canceled.</h1>
    <p>Hey ${p.guestName}, your ${p.time} recording has been canceled.</p>
    <p>Your Google Calendar invite will be removed.</p>
    <p>Want to reschedule for a different date?</p>
    <a href="${config.publicBaseUrl}" class="btn">Pick a new time</a>
  `);
}
