# Daily Weather Notifier

A standalone static website hosted on GitHub Pages that works as a PWA and sends daily weather notifications at 7 AM Los Angeles time.

## How to Use

1.  **Visit the site**: (Once deployed to GitHub Pages).
2.  **Add Locations**: Enter your zip code or city/state and click "Add Location".
3.  **Set Preferences**: Choose the start time and interval for notifications.
4.  **Subscribe**: Click "Subscribe to Notifications".
5.  **Submit Subscription**: Click the generated link "Create GitHub Issue" to submit your subscription data. Do not change the issue title or body.

## Setup (For Repository Owner)

To make this work for your repo, you need to set up VAPID keys for Web Push. You can generate them using the provided Go script.

### Generating VAPID Keys (Optional)
If you want to generate your own keys, run the Go script in the repository:
```bash
go run scripts/gen_vapid.go
```
This will output a new pair of public and private keys.

### 1. Add GitHub Secrets:
Go to your repository settings -> Secrets and variables -> Actions.
Add the following repository secrets:
*   `VAPID_PUBLIC_KEY`: `YOUR_PUBLIC_VAPID_KEY_PLACEHOLDER`
*   `VAPID_PRIVATE_KEY`: `YOUR_PRIVATE_VAPID_KEY_PLACEHOLDER`

2.  **Enable GitHub Pages**:
    *   Go to repository settings -> Pages.
    *   Select "Deploy from a branch" and choose the branch (usually `main`) and folder (`/`).

3.  **GitHub Actions Permissions**:
    *   The GitHub Action needs permission to read issues. Ensure `GITHUB_TOKEN` has read permissions for issues.

## Architecture

*   **Frontend**: Static HTML/JS hosted on GitHub Pages.
*   **Database**: IndexedDB in the user's browser for locations. GitHub Issues for subscriptions.
*   **Notifications**: GitHub Actions runs hourly, reads subscriptions from open issues with title "New Subscription", checks preferences, and sends Web Push notifications if due.
*   **Weather Data**: Fetched from Open-Meteo by the Service Worker when a push notification is received.

## Security

Please see [SECURITY.md](SECURITY.md) for details on how to report security vulnerabilities.

## Maintenance

Keep this `README.md`, `PROMPT.md`, and `SECURITY.md` up to date with any changes.
