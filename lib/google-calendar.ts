import { google, calendar_v3, people_v1 } from 'googleapis';
import { Credentials } from 'google-auth-library';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google`;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google Calendar credentials not found in environment variables');
}

function createOAuthClient() {
    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
}

// Get authorization URL for Google Calendar access
export function getAuthUrl(state?: string): string {
    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/contacts'
    ];

    const client = createOAuthClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state
    });
}

// Exchange authorization code for tokens
export async function getTokens(code: string): Promise<Credentials> {
    try {
        const client = createOAuthClient();
        const { tokens } = await client.getToken(code);
        return tokens;
    } catch (error) {
        console.error('Error getting Google tokens:', error);
        throw new Error('Failed to get Google tokens');
    }
}

// Create authenticated calendar client
export function createCalendarClient(accessToken: string, refreshToken?: string): calendar_v3.Calendar {
    const auth = createOAuthClient();

    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return google.calendar({ version: 'v3', auth });
}

// Get user's calendar list
export async function getCalendars(accessToken: string, refreshToken?: string): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    try {
        const calendar = createCalendarClient(accessToken, refreshToken);
        const response = await calendar.calendarList.list();
        return response.data.items || [];
    } catch (error) {
        console.error('Error getting calendars:', error);
        throw new Error('Failed to get calendars');
    }
}

// Create a calendar event for a program session
export async function createEvent(
    accessToken: string,
    refreshToken: string | undefined,
    calendarId: string,
    eventData: calendar_v3.Schema$Event
) {
    try {
        const calendar = createCalendarClient(accessToken, refreshToken);
        const response = await calendar.events.insert({
            calendarId,
            requestBody: eventData,
            sendUpdates: 'all'
        });
        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event');
    }
}

// Update an existing calendar event
export async function updateEvent(
    accessToken: string,
    refreshToken: string | undefined,
    calendarId: string,
    eventId: string,
    eventData: calendar_v3.Schema$Event
) {
    try {
        const calendar = createCalendarClient(accessToken, refreshToken);
        const response = await calendar.events.update({
            calendarId,
            eventId,
            requestBody: eventData
        });
        return response.data;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw new Error('Failed to update calendar event');
    }
}

// Delete a calendar event
export async function deleteEvent(
    accessToken: string,
    refreshToken: string | undefined,
    calendarId: string,
    eventId: string
) {
    try {
        const calendar = createCalendarClient(accessToken, refreshToken);
        await calendar.events.delete({
            calendarId,
            eventId
        });
        return true;
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw new Error('Failed to delete calendar event');
    }
}

// Get events from a calendar within a date range
export async function getEvents(
    accessToken: string,
    refreshToken: string | undefined,
    calendarId: string,
    timeMin: string,
    timeMax: string,
    showDeleted: boolean = false
) {
    try {
        const calendar = createCalendarClient(accessToken, refreshToken);
        const response = await calendar.events.list({
            calendarId,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            showDeleted: showDeleted
        });
        return response.data.items;
    } catch (error) {
        console.error('Error getting calendar events:', error);
        throw new Error('Failed to get calendar events');
    }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
    try {
        const client = createOAuthClient();
        client.setCredentials({
            refresh_token: refreshToken
        });

        const { credentials } = await client.refreshAccessToken();
        return credentials;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw new Error('Failed to refresh access token');
    }
}

// Create authenticated people client
export function createPeopleClient(accessToken: string, refreshToken?: string): people_v1.People {
    const auth = createOAuthClient();
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    return google.people({ version: 'v1', auth });
}

// Create a new contact
export async function createContact(
    accessToken: string,
    refreshToken: string | undefined,
    contactData: {
        givenName: string;
        familyName: string;
        email?: string;
        phoneNumber?: string;
    }
) {
    try {
        const people = createPeopleClient(accessToken, refreshToken);

        const resource: people_v1.Schema$Person = {
            names: [{ givenName: contactData.givenName, familyName: contactData.familyName }],
        };

        if (contactData.email) {
            resource.emailAddresses = [{ value: contactData.email }];
        }

        if (contactData.phoneNumber) {
            resource.phoneNumbers = [{ value: contactData.phoneNumber }];
        }

        const response = await people.people.createContact({
            requestBody: resource
        });

        return response.data;
    } catch (error) {
        console.error('Error creating contact:', error);
        // Don't throw, just log. We don't want to fail the webhook just because contact sync failed.
        return null;
    }
}

// Search for existing contact by email
export async function searchContact(
    accessToken: string,
    refreshToken: string | undefined,
    email: string
) {
    try {
        const people = createPeopleClient(accessToken, refreshToken);

        const response = await people.people.searchContacts({
            query: email,
            readMask: 'names,emailAddresses,phoneNumbers',
        });

        if (response.data.results && response.data.results.length > 0) {
            // Return the first match
            return response.data.results[0].person;
        }

        return null;
    } catch (error) {
        console.error('Error searching contact:', error);
        return null;
    }
}
