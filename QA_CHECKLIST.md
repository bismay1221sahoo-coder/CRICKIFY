# CRICKIFY QA Checklist

Run this checklist before deploy or major release.

## 1. Setup Checks
- [ ] `client/.env` and `server/.env` values are correct.
- [ ] Optional error tracking envs set if enabled: `VITE_SENTRY_DSN`, `SENTRY_DSN`.
- [ ] Backend server starts without error.
- [ ] Frontend starts without console errors.
- [ ] Image/video upload works (Cloudinary credentials valid).

## 2. Auth Flow (User)
- [ ] Register with new email.
- [ ] Login with same account.
- [ ] Wrong password shows proper error message.
- [ ] Logout clears session and redirects correctly.
- [ ] Protected routes (`/sell`, `/my-listings`) redirect to login if not logged in.

## 3. Seller Flow
- [ ] Seller can open `/sell`.
- [ ] Product media upload works.
- [ ] Purchase proof upload works.
- [ ] Submit fails if product media missing.
- [ ] Submit fails if both proof and proof reason missing.
- [ ] Listing submit success toast appears.
- [ ] Listing appears in `/my-listings` as `PENDING`.

## 4. Admin Review Flow
- [ ] Admin can open `/admin`.
- [ ] Non-admin cannot open `/admin` (redirect to home).
- [ ] Pending listing appears in admin panel.
- [ ] Approve action works and listing disappears from pending list.
- [ ] Reject modal opens with textarea.
- [ ] Reject button stays disabled for empty reason.
- [ ] Reject action with valid reason works.

## 5. Marketplace Visibility Rules
- [ ] `APPROVED` listing appears on Home.
- [ ] `PENDING` listing does not appear on Home.
- [ ] `REJECTED` listing does not appear on Home.
- [ ] Approved listing opens in `/listings/:id`.

## 6. Listing Details
- [ ] Main product image opens in fullscreen modal on click.
- [ ] Fullscreen modal closes on backdrop click and close button.
- [ ] Description URLs are clickable.
- [ ] Purchase proof appears in separate block.
- [ ] Seller call button works if phone exists.

## 7. My Listings
- [ ] Seller sees only own listings.
- [ ] Status badge shows properly (`PENDING/APPROVED/REJECTED`).
- [ ] Rejected reason appears for rejected items.
- [ ] Delete listing works from my listings page.
- [ ] Deleted listing is removed from page instantly.

## 8. Storage Cleanup
- [ ] Deleting a listing removes product media from Cloudinary.
- [ ] Deleting a listing removes purchase proof media from Cloudinary.

## 9. Responsive UI
- [ ] Navbar works on mobile menu toggle.
- [ ] Home hero and filters are usable on mobile.
- [ ] Sell form fields and upload grids look correct on mobile.
- [ ] My listings cards stack properly on mobile.
- [ ] Admin cards and action buttons are usable on mobile.
- [ ] Listing details page is readable on mobile and desktop.

## 10. Error Handling
- [ ] Invalid token returns proper auth error.
- [ ] Oversized upload shows clean error message.
- [ ] Invalid file type shows clean error message.
- [ ] API/network failure shows visible UI error (no crash).

## 11. Final Release Gate
- [ ] `npm run build` passes for client.
- [ ] Critical user flows pass (register -> sell -> admin approve -> listing live).
- [ ] No blocker bug remains open.

## Optional Bug Log Template
Use this format while testing:

- `Case:` (e.g. Seller submit without proof reason)
- `Expected:`
- `Actual:`
- `Severity:` Low / Medium / High / Critical
- `Screenshot/Video:`
- `Status:` Open / Fixed / Retest

## Optional Automated Smoke Run
- From `client` folder run: `npm run test:e2e`
- If first-time on a machine, install browser binaries: `npx playwright install`
