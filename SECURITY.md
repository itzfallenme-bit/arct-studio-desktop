# Security policy

## Supported versions

Security fixes are applied to the latest released version of Arct Studio. Older releases are not maintained.

## Reporting a vulnerability

Do not open a public issue for a security problem.

Use GitHub's private vulnerability reporting for this repository:

https://github.com/itzfallenme-bit/arct-studio-desktop/security/advisories/new

Include:

- A description of the issue and its impact
- Steps to reproduce it
- The affected version and platform
- Any proof-of-concept files or logs, with secrets removed

You should receive an acknowledgement within a few business days. Please allow time for a fix and release before disclosing the issue publicly.

## Scope

Arct Studio is a local desktop app. Relevant reports include:

- Remote code execution or sandbox escape in the Tauri shell
- Cross-origin or iframe isolation problems between bundled tools
- Leakage of local data or the Google AI key
- Unsafe handling of untrusted documents, URLs, or tool output
- Dependency vulnerabilities that affect the shipped app

## API keys

Never include a Google AI key, GitHub token, signing key, or other credential in an issue, pull request, log, or screenshot. Arct Studio does not ship a Google AI key; users provide their own and it is stored locally.
