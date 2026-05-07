# Prompt - Daily Weather Notifier on GitHub Pages

Host a standalone static website on GitHub Pages working as a PWA that allows users to specify multiple locations (via zip code or city/state) and receive daily weather notifications at 7 AM Los Angeles time.

## Architecture
*   **GitHub Actions**: Scheduled to run daily at 14:00 UTC. Sends a generic "trigger" Web Push notification to the subscribed user.
*   **PWA Frontend**:
    *   Allows user to add/remove locations (Zip Code or City, State).
    *   Uses Open-Meteo Geocoding API to resolve names to coordinates.
    *   Stores locations in IndexedDB.
    *   Handles Web Push subscription.
*   **Service Worker**:
    *   Listens for the `push` event from GitHub Actions.
    *   Reads stored locations from IndexedDB.
    *   Fetches weather data from Open-Meteo for those locations.
    *   Displays notifications for each location.
*   **Weather API**: Open-Meteo (Forecast and Geocoding).
*   **GitHub Pages**: Hosts the PWA static site.

## Subscription Management
*   **Option B (GitHub Issues)**: Users click a link to create a GitHub Issue with their subscription data. The GitHub Action parses these issues to send notifications. This makes subscription data public in the repo.

## Rules
*   With any updates to this project, keep the `README.md`, `PROMPT.md`, and `SECURITY.md` files automatically up to date.
