#!/usr/bin/env npx ts-node
/**
 * Google Calendar OAuth helper
 *
 * Run once per host to get a refresh token.
 *
 * Usage:
 *   npx ts-node scripts/gcal-auth.ts
 *
 * Then follow the prompt: open the URL in a browser logged in as the host,
 * approve the permissions, copy the code from the redirect URL, paste it here.
 * The script prints the refresh token — paste it into your .env file.
 *
 * You need GCAL_CLIENT_ID, GCAL_CLIENT_SECRET, and GCAL_REDIRECT_URI set
 * in your environment (or .env.local) before running this.
 */

import { google } from 'googleapis';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CLIENT_ID = process.env.GCAL_CLIENT_ID;
const CLIENT_SECRET = process.env.GCAL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GCAL_REDIRECT_URI ?? 'http://localhost:3000/api/auth/gcal/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: GCAL_CLIENT_ID and GCAL_CLIENT_SECRET must be set in .env.local');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // force consent screen so refresh_token is always returned
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\n=== Curiosity Theory — Google Calendar OAuth ===\n');
console.log('1. Make sure you are signed in to the correct Google account in your browser.');
console.log('2. Open this URL:\n');
console.log('   ' + authUrl);
console.log('\n3. Approve the permissions.');
console.log('4. You will be redirected to a URL like:');
console.log('   http://localhost:3000/api/auth/gcal/callback?code=XXXX');
console.log('5. Copy the "code" value from that URL and paste it below.\n');

rl.question('Paste the authorization code: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2.getToken(code.trim());
    if (!tokens.refresh_token) {
      console.error('\nERROR: No refresh token returned.');
      console.error('This usually means the account already granted access without a consent screen.');
      console.error('Go to https://myaccount.google.com/permissions, revoke access for your app, then re-run this script.');
      process.exit(1);
    }
    console.log('\n=== SUCCESS ===\n');
    console.log('Add this to your .env.local:\n');
    console.log(`GCAL_JUSTIN_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('   (or GCAL_DAKOTAH_REFRESH_TOKEN= if this is Dakotah\'s account)\n');
    console.log('Calendar ID: For non-primary calendars, find the calendar ID in');
    console.log('Google Calendar > Settings > [calendar name] > Calendar ID\n');
  } catch (err) {
    console.error('Token exchange failed:', err);
    process.exit(1);
  }
});
