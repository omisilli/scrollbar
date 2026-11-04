# scrollbar

A thin bar of your own along the right edge: it shows when the pointer
comes near or the page scrolls, fades when it stops, and can be dragged or
pressed — for the page, and for any scrolling panel or pop-up. With or
without Lenis. One script, one stylesheet, no dependencies,
framework-agnostic.

```html
<div data-pg-scrollbar>                       <!-- the strip, along the edge -->
    <div data-pg-scrollbar-grip>              <!-- moves; the part you hold -->
        <div data-pg-scrollbar-thumb></div>   <!-- what is seen -->
    </div>
</div>
```

```sh
npm install github:omisilli/scrollbar#v1.0.0
```

```ts
import { initScrollbar } from "@plusguard/scrollbar";
import "@plusguard/scrollbar/index.css";

initScrollbar();
```

Or from CSS, which lets you pick the cascade layer:

```css
@import "@plusguard/scrollbar/index.css" layer(components);
```

### Without a build step

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/omisilli/scrollbar@v1.0.0/index.css" />

<script type="module">
    import { initScrollbar } from "https://cdn.jsdelivr.net/gh/omisilli/scrollbar@v1.0.0/dist/index.js";

    initScrollbar();
</script>
```

Pin the version (`@v1.0.0`) on a live site. A pinned URL never changes;
`@1` follows the newest 1.x release.

## Why your own bar

|                                   | The browser's bar                          | scrollbar                                        |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| Look                              | Colour and thickness, Chrome and Firefox differently | Anything — it is markup                 |
| Shows only while needed           | macOS only (overlay bars)                  | ✓ on hover and while scrolling, everywhere       |
| Takes no room                     | macOS only; elsewhere ~15px is lost        | ✓ floats over the content — see the gutter       |
| The same in pop-ups and panels    | `::-webkit-scrollbar` is ignored by Firefox | ✓ the same bar in every browser                 |
| Keyboard, touch, Find in page     | ✓                                          | ✓ untouched — the page still scrolls natively    |

## Three layers

| Attribute                   | Is                                                                  |
| --------------------------- | ------------------------------------------------------------------- |
| `data-pg-scrollbar`         | The strip along the edge, `--pg-scrollbar-area` wide (18px). Where the pointer finds the bar; it takes the track colour while shown |
| `data-pg-scrollbar-grip`    | What moves and what you hold — as wide as the strip, so a thin bar is easy to take hold of |
| `data-pg-scrollbar-thumb`   | What is seen: 6px, 10px under the pointer. Only a look — it can grow without moving the grip |

The value of `data-pg-scrollbar` names what it scrolls: empty for the
page, `"#id"` for a panel.

## The page

Put the strip anywhere in the page — at the top of the content wrapper is
a good place. It is fixed to the screen's edge.

**Suggestion — a page skeleton.** Content up top, footer at the bottom of
the screen even when the page is short:

```html
<body>
    <div class="page" style="min-height: 100dvh; display: flex; flex-direction: column">
        <div class="page-up" style="flex: 1" data-pg-scrollbar-gutter>
            <div data-pg-scrollbar>…</div>
            …the page…
        </div>
        <footer data-pg-scrollbar-gutter>…</footer>
    </div>
</body>
```

### The gutter

The bar floats over the content, unlike the browser's own, which takes
its room. Centred content would sit off-centre in what is visible.
`data-pg-scrollbar-gutter` gives an element `padding-inline-end` of the
strip's width: its background still runs to the edge, under the bar, and
its content centres in what is left.

Give it to what scrolls with the page — the content wrapper, the footer —
not to fixed parts such as a header, which the bar does not scroll. It
replaces the element's own right padding, so put it on a full-width
wrapper rather than on something padded.

It applies only where the bar is shown: with a script and a mouse.

## Panels and pop-ups

A panel's bar goes **beside** what scrolls, in a positioned box — inside
it, it would scroll away with the content:

```html
<div class="popup" style="position: relative; height: 20rem; overflow: hidden">
    <ul id="items" style="height: 100%; overflow-y: auto" data-lenis-prevent>…</ul>
    <div data-pg-scrollbar="#items">
        <div data-pg-scrollbar-grip><div data-pg-scrollbar-thumb></div></div>
    </div>
</div>
```

The list gets `data-pg-scrollbar-host`, and its own bar is hidden — in
every browser, Firefox too. Write `data-pg-scrollbar-host` in the markup
yourself to hide it from the first frame, before the script runs. With
Lenis on the page, `data-lenis-prevent` keeps the list's own scroll.

A panel that appears later — a pop-up opening, a route changing — is
picked up as it appears; one that is closed takes its size when it opens.

## Behaviour

- **Showing.** Hidden until the pointer is over the strip or the page (or
  panel) scrolls; it fades `data-pg-scrollbar-idle` ms after scrolling
  stops — 600 by default, `"none"` to keep it shown. A short wait, so the
  separate ticks of a wheel do not make it blink.
- **Dragging** is immediate, as with the browser's own bar. The hand stays
  closed and no text is selected for as long as the drag lasts, wherever
  the pointer goes.
- **Pressing the strip** off the grip glides there, the grip centred on
  the press — at once with reduced motion asked for.
- **Nothing to scroll** — everything fits — and the strip is not shown.
- **Locked.** When the page (or panel) cannot scroll — `overflow: hidden`
  or `clip`, as any scroll lock sets, and as Lenis does when it stops —
  the strip is not shown. No link to a particular lock is needed.

### Before the script, on touch screens, without a script

The browser's own bar is hidden by CSS, not by the script:
`(scripting: enabled) and (pointer: fine)` and a page bar in the markup. So
it is gone from the very first frame, and nothing shifts sideways when the
script arrives — on Windows that bar is about 15px wide.

| Case                               | What is seen                                           |
| ---------------------------------- | ------------------------------------------------------ |
| The script still loading           | No bar for a moment; wheel, keys and touch scroll as ever |
| The script running                 | This bar                                               |
| Scripts switched off               | The browser's own bar                                  |
| A touch screen                     | The browser's own bar, no gutter                       |

## Written by scrollbar

| Attribute / variable                         | On         | Meaning                                    |
| -------------------------------------------- | ---------- | ------------------------------------------ |
| `data-pg-scrollbar-active`                   | the strip  | `"true"` while scrolling, hovered or dragged |
| `data-pg-scrollbar-dragging`                 | the strip, `<html>` | while dragged                     |
| `data-pg-scrollbar-needed`                   | the strip  | `"false"` when everything fits, or locked  |
| `data-pg-scrollbar-host`                     | a panel    | its own bar is hidden                      |
| `--pg-scrollbar-grip-size` / `-grip-offset`  | the strip  | the grip's length and place, px            |

Style anything on these — a strip that only takes its track colour while
dragged, say: `[data-pg-scrollbar-dragging="true"] { … }`.

## CSS variables

| Variable                    | Default                    | Meaning                                         |
| --------------------------- | -------------------------- | ----------------------------------------------- |
| `--pg-scrollbar-area`       | `18px`                     | The strip's width — and the gutter's            |
| `--pg-scrollbar-inset`      | `4px`                      | Gap to the strip's ends and its outer edge      |
| `--pg-scrollbar-size`       | `6px`                      | The thumb's thickness                           |
| `--pg-scrollbar-size-hover` | `10px`                     | …under the pointer, and while dragged           |
| `--pg-scrollbar-min`        | `32px`                     | The shortest grip, on a very long page          |
| `--pg-scrollbar-color`      | `rgb(127 127 127 / 0.6)`   | The thumb — light and dark themes alike; a brand colour works too |
| `--pg-scrollbar-track`      | `rgb(127 127 127 / 0.1)`   | The strip while shown                           |
| `--pg-scrollbar-shadow`     | `0 0 4px rgb(0 0 0 / 0.2)` | Around the thumb, so it shows over photos; `none` for none |

Set them anywhere above the strip, per screen size if you like. Every
look rule is at zero weight (`:where`), so a class of yours wins.

## Lenis

Nothing to hand over: Lenis scrolls the page itself, and the bar reads
that. Dragging sets the scroll directly — stop any glide on a press so
the two do not pull against each other (`lenis.scrollTo(lenis.scroll, {
immediate: true })` on `pointerdown`). With `autoToggle: true`, Lenis stops
when a lock clips the page — and the bar steps away with it.

## From quaSmoothScrollBar

| Before                                                    | Now                                               |
| --------------------------------------------------------- | ------------------------------------------------- |
| Started Lenis too (`new Lenis`, `window.lenis`)           | Lenis is the page's; the bar does not need it     |
| Without Lenis: an error on the first line, no bar         | The same bar with or without Lenis                |
| `#qua-virtualScrollArea` / `…BarArea` / `…Bar`            | `data-pg-scrollbar` / `-grip` / `-thumb`          |
| Shown while `html.lenis-scrolling`                        | `data-pg-scrollbar-active`, with the 0.6s wait    |
| Hidden while `html.lenis-stopped`                         | Hidden while the page cannot scroll — any lock    |
| Hidden below 992px                                        | Hidden on touch screens, whatever their width     |
| `body::-webkit-scrollbar { display: none }`, always       | Only where this bar works, and Firefox too        |
| `.qua-mainArea { padding-right: 18px }`                   | `data-pg-scrollbar-gutter`                        |
| Page only; panels styled with `::-webkit-scrollbar`       | Panels and pop-ups get the same bar               |
| Drag only                                                 | Drag, and a press on the strip                    |

## React

Call `initScrollbar` once, in an effect — it returns its own cleanup:

```tsx
useEffect(() => initScrollbar(), []);
```

The bars are markup, so they render with the rest; a bare
`data-pg-scrollbar` in JSX is the page's bar (React writes it as `"true"`).
If `initScrollbar` is called again before the first cleanup runs (React
remounting in development), only the newest call answers.

See [`examples/react/Example.tsx`](examples/react/Example.tsx). A plain HTML
version, with a panel, a pop-up and a `?lenis` switch, is in
[`examples/static/index.html`](examples/static/index.html).
