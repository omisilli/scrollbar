/*
 * scrollbar — a bar of your own, for the page and for any scrolling panel.
 *
 *   <div data-pg-scrollbar>                       the strip, along the edge
 *       <div data-pg-scrollbar-grip>              moves; the part you hold
 *           <div data-pg-scrollbar-thumb></div>   what is seen
 *       </div>
 *   </div>
 *
 * data-pg-scrollbar names what it scrolls: empty for the page, "#id" for a
 * panel. A panel's bar goes beside the panel, in a positioned box — inside
 * it, it would scroll away with the content.
 *
 * Option, on the strip:
 *   data-pg-scrollbar-idle   ms after scrolling stops before it fades.
 *                            Default 600; "none" keeps it shown
 *
 * Written by scrollbar:
 *   on the strip   data-pg-scrollbar-active   "true" while scrolling,
 *                                             hovered or dragged
 *                  data-pg-scrollbar-dragging "true" while dragged
 *                  data-pg-scrollbar-needed   "false" when everything fits
 *                                             or the scrolling is locked
 *                  --pg-scrollbar-grip-size / -offset, in px
 *   on a panel     data-pg-scrollbar-host     its own bar steps aside
 *   on <html>      data-pg-scrollbar-dragging while a bar is dragged
 *
 * It reads the real scroll position, so it works with and without Lenis:
 * Lenis moves the page itself. The browser's own bar is hidden by
 * index.css from the first frame — nothing shifts when this script arrives.
 */
const ATTR = "data-pg-scrollbar";
const GRIP = "data-pg-scrollbar-grip";
const IDLE = "data-pg-scrollbar-idle";
const ACTIVE = "data-pg-scrollbar-active";
const DRAGGING = "data-pg-scrollbar-dragging";
const NEEDED = "data-pg-scrollbar-needed";
const HOST = "data-pg-scrollbar-host";
const DEFAULT_IDLE = 600;
const DEFAULT_MIN = 32;
function px(value) {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : 0;
}
function write(el, attr, value) {
    if (el.getAttribute(attr) !== value)
        el.setAttribute(attr, value);
}
function writeVar(el, name, value) {
    if (el.style.getPropertyValue(name) !== value)
        el.style.setProperty(name, value);
}
/* JSX writes a bare data-pg-scrollbar as "true": the page, as empty does. */
function isPage(value) {
    return !value || value === "true";
}
function scrollerOf(strip) {
    const value = strip.getAttribute(ATTR);
    if (isPage(value))
        return document.documentElement;
    if (value?.startsWith("#"))
        return document.getElementById(decodeURIComponent(value.slice(1)));
    return null;
}
const cannotScroll = (el) => ["hidden", "clip"].includes(getComputedStyle(el).overflowY);
function setup(strip) {
    const scroller = scrollerOf(strip);
    const grip = strip.querySelector(`[${GRIP}]`);
    if (!scroller || !grip)
        return null;
    const page = scroller === document.documentElement;
    const events = page ? window : scroller;
    if (!page)
        scroller.setAttribute(HOST, "");
    let hovered = false;
    let dragging = false;
    let scrolling = false;
    let timer = 0;
    let frame = 0;
    let startY = 0;
    let startTop = 0;
    const top = () => (page ? scrollY : scroller.scrollTop);
    const view = () => (page ? innerHeight : scroller.clientHeight);
    // A lock (overflow hidden or clip) on the page or the panel: no bar.
    const locked = () => (page ? cannotScroll(scroller) || cannotScroll(document.body) : cannotScroll(scroller));
    const idle = () => {
        const raw = strip.getAttribute(IDLE);
        if (raw === "none")
            return Number.POSITIVE_INFINITY;
        const ms = raw ? Number(raw) : Number.NaN;
        return Number.isFinite(ms) ? Math.max(0, ms) : DEFAULT_IDLE;
    };
    /* The track is the strip less its padding (the inset); the grip is as
       long, in it, as the screen is in the content — never under the min. */
    const geometry = () => {
        const style = getComputedStyle(strip);
        const track = strip.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
        const total = scroller.scrollHeight;
        const range = Math.max(0, total - view());
        const min = px(style.getPropertyValue("--pg-scrollbar-min")) || DEFAULT_MIN;
        const size = range ? Math.min(track, Math.max(min, (track * view()) / total)) : track;
        return { track, range, size, travel: Math.max(0, track - size), inset: px(style.paddingTop) };
    };
    const paint = () => {
        frame = 0;
        const g = geometry();
        write(strip, NEEDED, String(g.range > 1 && !locked()));
        writeVar(strip, "--pg-scrollbar-grip-size", `${g.size.toFixed(1)}px`);
        const at = g.range ? (g.travel * Math.min(1, Math.max(0, top() / g.range))).toFixed(1) : "0";
        writeVar(strip, "--pg-scrollbar-grip-offset", `${at}px`);
        write(strip, ACTIVE, String(scrolling || hovered || dragging || idle() === Number.POSITIVE_INFINITY));
    };
    const schedule = () => {
        if (!frame)
            frame = requestAnimationFrame(paint);
    };
    const onScroll = () => {
        scrolling = true;
        clearTimeout(timer);
        const ms = idle();
        if (ms !== Number.POSITIVE_INFINITY) {
            timer = window.setTimeout(() => {
                scrolling = false;
                schedule();
            }, ms);
        }
        schedule();
    };
    const scrollTo = (y, behavior) => {
        (page ? window : scroller).scrollTo({ top: y, behavior });
    };
    /* Dragging: as the browser's own bar does, at once — the page follows
       the pointer. Pointer capture keeps the drag going off the strip. */
    const onGripDown = (event) => {
        if (event.button !== 0)
            return;
        event.preventDefault();
        event.stopPropagation();
        dragging = true;
        startY = event.clientY;
        startTop = top();
        grip.setPointerCapture(event.pointerId);
        write(strip, DRAGGING, "true");
        document.documentElement.setAttribute(DRAGGING, "");
        schedule();
    };
    const onGripMove = (event) => {
        if (!dragging)
            return;
        const g = geometry();
        if (g.travel)
            scrollTo(startTop + ((event.clientY - startY) * g.range) / g.travel, "instant");
    };
    const onGripUp = (event) => {
        if (!dragging)
            return;
        dragging = false;
        if (grip.hasPointerCapture(event.pointerId))
            grip.releasePointerCapture(event.pointerId);
        write(strip, DRAGGING, "false");
        document.documentElement.removeAttribute(DRAGGING);
        // Fade as after any scroll, not at once.
        onScroll();
    };
    /* A press on the strip, off the grip: glide there, the grip centred on
       the press. */
    const onStripDown = (event) => {
        if (event.button !== 0 || grip.contains(event.target))
            return;
        event.preventDefault();
        const g = geometry();
        if (!g.travel)
            return;
        const at = event.clientY - strip.getBoundingClientRect().top - g.inset - g.size / 2;
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo((Math.min(g.travel, Math.max(0, at)) * g.range) / g.travel, reduce ? "instant" : "smooth");
    };
    const onEnter = () => {
        hovered = true;
        schedule();
    };
    const onLeave = () => {
        hovered = false;
        schedule();
    };
    // Content that grows or shrinks moves the grip without a scroll.
    const ro = new ResizeObserver(schedule);
    ro.observe(strip);
    ro.observe(scroller);
    if (!page)
        [...scroller.children].forEach((child) => ro.observe(child));
    events.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", schedule);
    grip.addEventListener("pointerdown", onGripDown);
    grip.addEventListener("pointermove", onGripMove);
    grip.addEventListener("pointerup", onGripUp);
    grip.addEventListener("pointercancel", onGripUp);
    strip.addEventListener("pointerdown", onStripDown);
    strip.addEventListener("pointerenter", onEnter);
    strip.addEventListener("pointerleave", onLeave);
    paint();
    return {
        alive: () => strip.isConnected && scroller.isConnected && scrollerOf(strip) === scroller,
        update: schedule,
        destroy() {
            ro.disconnect();
            events.removeEventListener("scroll", onScroll);
            removeEventListener("resize", schedule);
            grip.removeEventListener("pointerdown", onGripDown);
            grip.removeEventListener("pointermove", onGripMove);
            grip.removeEventListener("pointerup", onGripUp);
            grip.removeEventListener("pointercancel", onGripUp);
            strip.removeEventListener("pointerdown", onStripDown);
            strip.removeEventListener("pointerenter", onEnter);
            strip.removeEventListener("pointerleave", onLeave);
            clearTimeout(timer);
            if (frame)
                cancelAnimationFrame(frame);
            if (!page)
                scroller.removeAttribute(HOST);
            if (dragging)
                document.documentElement.removeAttribute(DRAGGING);
        },
    };
}
/* Only the newest call answers — a late cleanup from an older one (React
   remounting) cannot switch it off. Same rule as the other packages. */
let live = null;
/* Start every bar on the page, and any added later; returns the cleanup. */
export function initScrollbar() {
    if (typeof document === "undefined")
        return () => { };
    const self = {};
    live = self;
    const bars = new Map();
    let pending = 0;
    const sync = () => {
        pending = 0;
        if (live !== self)
            return;
        for (const [strip, bar] of bars) {
            if (bar.alive())
                continue;
            bar.destroy();
            bars.delete(strip);
        }
        document.querySelectorAll(`[${ATTR}]`).forEach((strip) => {
            if (bars.has(strip))
                return;
            const bar = setup(strip);
            if (bar)
                bars.set(strip, bar);
        });
        bars.forEach((bar) => bar.update());
    };
    // Bars added later (another route, a pop-up opening), panels that
    // appear after their bar, and locks switched on or off — any change
    // can matter; the work is batched to one frame.
    const mo = new MutationObserver(() => {
        if (!pending)
            pending = requestAnimationFrame(sync);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    sync();
    return () => {
        mo.disconnect();
        if (pending)
            cancelAnimationFrame(pending);
        bars.forEach((bar) => bar.destroy());
        bars.clear();
        if (live === self)
            live = null;
    };
}
