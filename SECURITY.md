# Security Policy

## Supported versions

Gahz is deployed continuously from the `main` branch. Only the latest version on `main`, which is the one live at
<https://gahz.web.app>, receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**
(<https://github.com/albaraa-prog/gahz/security/advisories/new>). Include:

- what the problem is and where it is (file, URL or feature),
- steps to reproduce it,
- what an attacker could do with it.

You should get a first reply within 7 days. Once a fix is live, the report is credited in the advisory unless you
prefer to stay anonymous.

## Scope

In scope:

- the web app in this repository,
- the Firestore security rules in `firestore.rules`,
- the GitHub Actions workflows in `.github/workflows`.

Out of scope:

- The Firebase web configuration (`apiKey`, `projectId` and the other `VITE_FIREBASE_*` values). These identify the
  project to Firebase and are shipped to every browser by design. Access to data is controlled by the Firestore
  rules and Firebase Authentication, not by keeping these values secret.
- Wrong or outdated quiz questions. Please open a normal issue or pull request for those.

## For contributors

- Never commit real keys. Local configuration belongs in `.env.local`, which is ignored by git.
- Service account keys must never be added to the repository. The deploy key lives only in GitHub Actions secrets.
