# Flower Browser UI Design

## Goal

Make the flower-first mobile browsing experience attractive, compact, and robust when a flower has many owners.

## Confirmed behavior

- The initial view is `flowers`.
- The page provides two in-page display modes: `card` and `compact`.
- The selected display mode persists in browser local storage.
- Owner names are rendered as wrapping chips inside their card or row and never overflow horizontally.
- Search, member view, missing-image notices, and image export retain their current behavior.

## Layout

Card mode remains image-led: each flower has a thumbnail, name, owner count, and a wrapping owner-chip row. Compact mode is a single-column list with a smaller thumbnail, flower name, owner count, and the same wrapping chip row. Both modes use fixed thumbnail dimensions and `min-width: 0` on flexible text containers to prevent narrow-screen overflow.

## Controls

The existing member/flower view tabs default to the flower tab. A compact segmented control below them selects `card` or `compact`. Its selection is restored on the next visit, while the main browse view remains flower-first when the page initially loads.

## Verification

Automated tests will assert the flower-first default, layout selector markup, local-storage behavior, and CSS overflow guards. The complete Node test suite will run after implementation.
