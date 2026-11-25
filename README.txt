KENYA POOL CLUB | V5.0 MOBILE MULTIPLAYER PLAYTEST
==================================================
This is a playable development build, not a released commercial game.
All currency is fictional, non-redeemable demo credit. No M-Pesa connection,
real payments, cash withdrawals, identity verification or public hosting.
Use fictional names, phone numbers, next-of-kin aliases and PINs only.

1. GET STARTED ON WINDOWS
------------------------
- Unzip the entire downloaded folder. Do not open files directly inside the ZIP.
- Install Node.js (current LTS, nodejs.org) if it is not already installed.
  This build has no third-party package dependencies; no npm install needed.
  Node 22.16.0 was used during development.
- Double-click START_GAME.bat. A console will print a computer URL and one or
  more local Wi-Fi/network URLs. Keep the window open while playing.
- On the PC, open http://localhost:8080 in a modern browser.
- On your phone, connect to the same trusted Wi-Fi as the PC and open the
  printed Phone URL (for example, http://192.168.1.20:8080). Use the actual
  address printed on your computer, not the example or localhost.
- If Windows Firewall prompts, allow Node.js only on your trusted private
  network. A guest Wi-Fi network may isolate devices. Do not expose the demo
  server to the public internet or use port forwarding.
- Rotate the phone to landscape for the best match view. Tap the full-screen
  control if the mobile browser supports it.

On macOS/Linux: open a terminal in the extracted folder and run node server.js
(or sh start.sh). If port 8080 is unavailable, set the PORT environment
variable before launching and use the new port in both browsers.

2. TRY THE DEMO WALLET AND ROOM FLOW
-----------------------------------
- Create a fictional demo account on each device with a different username
  and a fictional 4–8 digit PIN. The optional identity fields are mock data.
- Tap Demo top-up. Enter a fictional amount such as KES 1,000. The demo
  applies the specified 15% fee and credits KES 850. No charge is made.
- Choose Killer Shot or Traditional / Triangle. Create a room with a virtual
  entry (e.g. 50 credits) and player capacity. You may also create a free room.
- On the second device, choose the open room or enter its displayed room code.
- The host starts the match. Playing order is randomized on the server.
  A non-active player cannot shoot. All clients see the shared table.
- A demo entry is reserved on room join; leaving before the start refunds it.
  The virtual winner receives the combined entry pool. Killer ties share it;
  any indivisible cent is assigned in winner order. No real cash value.
- Wallet & history shows demo top-ups, fee details, entries, refunds and wins.
- Select Free practice in either mode to train alone without using credits.
  Reset or return to the lobby whenever you like.

3. MATCH CONTROLS
-----------------
- Tap/drag the table to aim. The dashed white line shows the cue path, the
  ghost ball shows predicted contact, and the gold line shows the approximate
  object-ball direction (no spin or bank-shot prediction yet).
- Drag the vertical power bar upwards on the left; release to shoot.
- Rotate the circular fine-aim wheel on the right, or use its arrow buttons.
- The shot clock is 30 seconds, no score penalty on timeout.
- When white is pocketed in Killer, the next player chooses a free position
  on the white line. The fouling player may keep an unobstructed target or
  move the next remaining target to a clear location on the right half.
  The server rejects overlaps and blocked direct paths. Placement timers use
  automatic valid placement after 30 seconds (a provisional digital rule).
- Sound is enabled after a user interaction, subject to browser restrictions.
  Toggle the music-note icon to mute original ambience and sound effects.

4. IMPLEMENTED / PROVISIONAL
----------------------------
Killer: confirmed 3–15, 1, 2 sequence; 156 points; paired cushion arrangement;
corrected white-ball scoring; random order; dynamic drop/reinstatement;
sole active player wins immediately; equal-score ties; scratch placement.
No-contact scratch penalty is still provisional: deduct target value only.
The order of scratch placements and automatic placement timeout are also
provisional digital interpretations. The next remaining target is used.

Triangle: playable preview. Confirmed Kenyan two-shot rule for wrong first
contact or white pocketed. Solids/stripes, open-table group assignment,
premature black, black on break respot, scratch placement and retaining an
extra shot are provisional. Solo practice is simplified.

Graphics: high-resolution textured canvas, wood/felt/metal details, rolling
sphere textures driven by server ball orientation, cue and aim guides.
Physics is approximate 2D with visual 3D-style ball rolling, not a fully
calibrated 3D billiards simulation. Cue spin is approximate and professional art assets are not complete. Mobile browsers and physical devices still need field testing.

Network: one shared authoritative server over a local network. Clients poll
for snapshots and smooth movement. It is NOT deployed to the public web.
Demo accounts and ledger persist in demo-data.json. Unfinished rooms are
refunded on restart; active matches do not resume. The PIN and session token
are not sufficient production security; no TLS or production rate limiting.
Only use the prototype on a trusted private network with fictional details.
The test server does not include match forfeiture/disconnect adjudication.

5. TESTS
--------
Run npm test (no install needed) from this folder. Tests cover 46 engine
assertions, wallet fee and tie math, access control, virtual deposits, stake
reservation and refund, synchronized shot, and free practice. Earlier builds were tested with two independent browser contexts. V5 API tests also cover simulated withdrawals, insufficient funds and authorization. Full match
settlement through the UI, physical phone compatibility, sustained 10-player
load and audio quality have not been independently verified.

6. FUTURE RELEASES
------------------
- Match the owner's reference screenshots and refine visual polish, precision
  physics, spin controls, touch ergonomics and device performance.
- Confirm all Triangle rules, add robust matchmaking/reconnect/forfeit policies,
  public HTTPS hosting, persistent database, security and independent QA.
- Tournament brackets, verified match results, sponsor-funded prize records,
  event management and a separate admin interface. The tournament card is a
  roadmap item only, not an operating feature.
- Production payments and any real-money feature must remain disabled until
  regulatory classification/licensing, payment-provider approval, age checks,
  responsible gaming, privacy, safeguarding of funds, taxation and security
  requirements have been verified and satisfied. Review whether next-of-kin
  information has a necessary lawful purpose before collecting real details.

V5 controls: drag the left power handle UP and release to shoot. Return to bottom to cancel. Keyboard: arrows set power, Enter shoots. Spin: tap white ball icon, drag red dot, Done. Cue locker: select one of six free cosmetic cues. Spin resets after each shot. V5 uses approximate spin physics and slower maximum ball speed for visibility.

V5 Royal Edition: new gold/emerald theme and cue artwork. Open Wallet, select Demo M-Pesa withdrawal, confirm an amount and see a simulated receipt. This deducts fictional credits only; no actual recipient or payment service is used. Fee of zero is illustrative, not a commercial decision. All six cues share identical physics.
