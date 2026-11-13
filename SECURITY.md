# Security Policy

## Supported Versions

Security updates and patches are applied to the active `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| 3.4.x   | :white_check_mark: |
| 3.3.x   | :x:                |
| < 3.3   | :x:                |

---

## Reporting a Vulnerability

As a client-side static web application without a server-side database or user authentication backend, security risks are primarily limited to client-side resource integrity, DOM safety, and third-party script references.

If you discover a security vulnerability or sensitive data exposure:

1. **Do not disclose publicly** in an open GitHub issue.
2. Please open a private advisory via **GitHub Security Advisories** on this repository (under the **Security** tab → **Report a vulnerability**).
3. If private advisories are unavailable, create an issue clearly labelled `[Security Advisory]` without publishing sensitive exploit payloads.

We will review reports promptly and publish fixes directly to the `main` branch.
