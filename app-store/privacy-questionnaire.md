# App Store Connect — App Privacy working notes

These notes describe FOH Toolkit 3.1 as currently implemented. Re-check them immediately before submission if analytics, payments, crash reporting, advertising, sign-in providers or new cloud features are added.

## Data linked to the user

### Contact Info — Email Address
Collected when the user creates an account. Used for authentication and account access. Not used for third-party advertising.

### User Content
May include:
- optional profile name/company/role
- saved shows and show notes
- Community preset submissions
- Community comments
- Community reports
- ratings and block relationships

Used to provide app functionality, cloud sync and Community moderation.

### Identifiers — User ID
Supabase account UUID is used internally to associate synced state, Community activity, roles, ratings, reports and moderation data with the account.

## Data not collected by FOH Toolkit cloud

### Audio Data
Microphone audio used by RTA and Ring Out is analysed on-device and is not recorded, stored or uploaded by FOH Toolkit.

### Precise Location
Not requested or collected by FOH Toolkit.

### Contacts / Photos / Health / Financial / Purchases
Not requested or collected by the current app.

## Tracking

FOH Toolkit does not currently use advertising SDKs, cross-app tracking or data brokers. On that basis, **Data Used to Track You: No**.

## Guest mode

A user can use core features without an account. Guest show/settings data remains local to the device unless the user later signs in and migrates/syncs it.

## Third-party processors

- **Supabase:** authentication, database and cloud app state/Community features.
- **GitHub Pages:** hosts the public web/PWA build and legal/support pages.

Review each provider's current SDK/service behaviour before submission and update App Store Connect if implementation changes.

## Purpose selections likely applicable in App Store Connect

- App Functionality
- Developer Communications may apply only if support communications are later collected directly in-app. Current GitHub support links do not create a FOH Toolkit support database.

Do not select Advertising, Third-Party Advertising, Product Personalisation or Other Purposes unless the implementation changes.
