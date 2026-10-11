# Security

The website now implements database-backed sessions, account-scoped devices and administrator job authorization. It remains a development platform; a production rollout requires a deliberate hosting and security review.

## Previously committed service-account key

A Google service-account credential file was previously committed under Server/Chat. Removing it from the current tree does not revoke the key or remove it from Git history.

The owner must revoke the exposed key in Google Cloud, review its permissions and activity, and create a replacement only if a reviewed integration requires one. Do not commit replacements or paste them into issues, pull requests or chat.

## Implemented controls

- Database credentials outside source; exact frontend Origin for mutating browser requests.
- Bcrypt password hashes, random session cookies and hashed session tokens in MySQL.
- HttpOnly/SameSite cookies, expiry, logout and secure cookies in HTTPS production mode.
- No public account record collections or password-bearing request logs.
- Administrator-only job publishing and owner-scoped device operations.
- Hashed per-device Bearer keys and metric range validation.
- Controlled API errors, limited request bodies and authentication attempt limiting.

Device transport authentication cannot validate sensor calibration or truthfulness. Authentication limiting is in-process and must be replaced or supplemented for a scaled deployment. Email verification, password recovery and multifactor authentication are not yet implemented.

Use private environment configuration and HTTPS before public deployment. Report vulnerabilities privately to the maintainer through an available private contact channel; do not publish secrets or personal data in reports.
