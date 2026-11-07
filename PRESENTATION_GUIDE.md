# FindIt final presentation guide

## 5-minute demonstration

### 1. Problem and solution — 30 seconds

Explain that lost belongings are hard to reconnect with their owners when reports are scattered across group chats. FindIt puts Lost and Found reports on one searchable campus board.

### 2. Show the real-data board — 45 seconds

Sign in and show the campus board. Search by an item word and location, then use Lost/Found and category filters. Explain that listing cards are loaded from MongoDB; the frontend does not preload fake items.

### 3. Create a matching pair — 60 seconds

Use two student accounts. Account A posts a Lost report. Account B posts the corresponding Found report with a compatible category and similar words/location. Mention that a new report is validated by Express and saved through Mongoose.

### 4. Show matching and private proof — 75 seconds

On Account A, open Matches & claims. Explain the score and match reasons. Open the Found report and send a detail that was intentionally left out of the public listing. Show the reporter's Claim requests inbox and accept or decline.

### 5. Complete the handoff — 30 seconds

After an accepted claim, show the contact path. Explain that accepting confirms the reporter is willing to arrange a handoff; it does not falsely mark the item returned. Mark it returned only after the actual handoff.

### 6. Show administration and architecture — 60 seconds

Open the Admin desk with the configured admin account. Show user/listing totals and moderation controls. Describe the React/Vite frontend, Express API, MongoDB collections, and HTTP-only session cookie.

## Before presenting

- Confirm MongoDB is running and /api/health reports database: connected.
- Start the API and frontend from the VS Code tasks or the two commands in README.md.
- Register two demo student accounts and create the Lost/Found pair in advance if internet or typing time is limited.
- Use a configured admin account only if showing the Admin desk.
- Do not use real student identifiers or private ownership details in a public presentation.
- The frontend no longer contains seeded listing examples, so an empty database will correctly show an empty board.

## Viva talking points

- Why MongoDB? Listings, student accounts, sessions, and claim requests are document-shaped records related by MongoDB ObjectIds.
- How does a match work? It compares category, item title, description terms, and location, then returns the strongest candidates with reasons.
- How are claims private? Claim text is stored in a separate claims collection and only returned by authenticated inbox endpoints for the claimant and the Found reporter.
- What prevents a false match from being treated as fact? The score is only a suggestion. A human reviews a private detail and makes the handoff decision.
- What would be next for a production deployment? Campus identity verification, email delivery, rate limits, image object storage, audit logging, and deployment hardening.

## Honest project limitations

The current project does not independently verify student identity, send production emails, or guarantee that a suggested match is correct. The app should be presented as a working campus prototype with a private review flow.