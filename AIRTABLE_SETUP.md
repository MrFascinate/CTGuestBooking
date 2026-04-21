# Airtable Setup — Curiosity Theory Guest Booking

Create a base called **Curiosity Theory Guests**, then create a table called **Bookings**.

## Table: Bookings

| Field name        | Field type       | Notes                                                |
|-------------------|------------------|------------------------------------------------------|
| Name              | Single line text | Guest's full name                                    |
| Email             | Email            |                                                      |
| Topic             | Long text        | What the guest wants to discuss                      |
| Bio Link          | URL              | Guest website, LinkedIn, Twitter, etc.               |
| Timezone          | Single line text | IANA timezone string e.g. America/New_York           |
| Scheduled Date    | Date             | Enable "Include time field" and set to UTC           |
| Status            | Single select    | Options: Booked, Recorded, Published, Canceled, No-show |
| Google Event ID   | Single line text | ID of the event on Justin's calendar                 |
| Booking Token     | Single line text | UUID v4 — used in reschedule/cancel links            |
| Created At        | Date             | Enable "Include time field"                          |
| Last Modified     | Date             | Enable "Include time field"                          |

## Getting your Base ID and API key

1. Go to airtable.com/account → Developer Hub → Personal access tokens
2. Create a token with scopes: `data.records:read`, `data.records:write`
3. Add your base under "Access"
4. Copy the token → paste as `AIRTABLE_API_KEY` in your .env.local

To get the Base ID:
- Open the base in Airtable
- The URL looks like: `https://airtable.com/appXXXXXXXXXXXXXX/...`
- The `appXXXXXX` part is your Base ID → paste as `AIRTABLE_BASE_ID`

## Notes

- The `Booking Token` field must have unique values enforced at the app level (we generate UUID v4s, so collisions are astronomically unlikely — no need to add a uniqueness constraint in Airtable).
- `Scheduled Date` is stored as UTC ISO strings. The guest's display timezone is stored in the `Timezone` field and used at send time.
- Status transitions: Booked → Recorded → Published (manual pipeline tracking). Canceled and No-show are set programmatically or manually.
