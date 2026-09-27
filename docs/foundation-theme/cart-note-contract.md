# F10 cart note contract

`cart-note` is a terminal theme block with one localized label, a `name="note"` textarea, a native Save note submit control, live save status and an explicit Retry control. The cart page starter template includes it. The drawer renders a static default note after its editable children; adding a `cart-note` child replaces that default and lets a merchant reorder the note in the drawer tree. The drawer note stays inside the supplemental panel region.

The page note belongs to `cart-page-form`; the drawer note belongs to `cart-drawer-form`. Both forms post to the locale-aware cart URL and include the note in native checkout or update submissions. An empty cart page supplies a small update form so a note can still be saved without JavaScript.

With JavaScript, every note instance shares one draft. Input updates the other instances, saves after 600 ms, and saves immediately on blur or Save note. Requests to `cart/update.js` run sequentially; a change made during a request is sent after that request succeeds. Clearing the textarea sends an empty note. Errors leave the draft intact, show a localized error, and expose Retry. Checkout waits for the latest save and stays on the cart if saving fails. Cart section replacement restores the draft and focused note textarea where possible.

## Live Liquid theme proof still required

1. Type a note in the drawer, reload and confirm it persists; edit it on the cart page and confirm the drawer mirrors it.
2. Clear the note, reload, and confirm it remains empty. Type rapidly while throttling the network and verify the last value wins.
3. Force a failed update response, verify the error and Retry control, then confirm checkout waits for a successful save.
4. Repeat note Save and checkout on the cart page with JavaScript disabled, including an empty cart. Confirm the Theme Editor selects the drawer note block and that adding a dynamic note does not show a duplicate.
