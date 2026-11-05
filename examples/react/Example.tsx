"use client";

import { useEffect, useRef } from "react";
import { initScrollbar } from "@plusguard/scrollbar";
import "@plusguard/scrollbar/index.css";

/* Mount once, high in the tree. Bars rendered later — another route, a
   pop-up opening — are picked up too. With Lenis there is nothing to hand
   over: the bar reads the real scroll, which Lenis moves. */
export function Scrollbars() {
    useEffect(() => initScrollbar(), []);
    return null;
}

/* Three layers: the strip along the edge, the grip you hold, the thumb you
   see. Empty data-pg-scrollbar (JSX writes "true"): the page. */
function Bar({ of }: { of?: string }) {
    return (
        <div data-pg-scrollbar={of ?? ""}>
            <div data-pg-scrollbar-grip>
                <div data-pg-scrollbar-thumb />
            </div>
        </div>
    );
}

/*
 * The page's gutter, shown: each row has a box centred in it, a dashed line
 * at the middle of what can be seen, and a tag at the far end. With
 * data-pg-scrollbar-gutter the box sits on the line and the tag stays in
 * sight; without — as a full-width slider, banner or video should be — the
 * box is half a strip to the right and the tag is under the bar.
 */
function GutterRows() {
    const rows = useRef<HTMLDivElement>(null);

    // How far each box sits from the line.
    useEffect(() => {
        const measure = () => {
            rows.current?.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
                const box = row.querySelector("[data-box]")!.getBoundingClientRect();
                const line = row.querySelector("[data-line]")!.getBoundingClientRect().left;
                const off = Math.round(box.left + box.width / 2 - line);
                row.querySelector("[data-off]")!.textContent = off ? `${off}px right of the line` : "on the line";
            });
        };
        measure();
        addEventListener("resize", measure);
        return () => removeEventListener("resize", measure);
    }, []);

    return (
        <div ref={rows} className="flex flex-col gap-3">
            {[
                { gutter: true, label: "With the gutter" },
                { gutter: false, label: "Without" },
            ].map((r) => (
                <section
                    key={r.label}
                    data-row
                    data-pg-scrollbar-gutter={r.gutter || undefined}
                    className="relative flex h-36 items-center justify-center bg-neutral-100"
                >
                    {/* The middle of what can be seen: with the gutter the row's
                        own box ends at the strip; without, pull the line back by
                        half the strip — only where the bar is shown. */}
                    <span
                        data-line
                        aria-hidden
                        className={`absolute inset-y-0 left-1/2 border-l-2 border-dashed border-blue-600 ${r.gutter ? "" : "pointer-fine:left-[calc(50%-var(--pg-scrollbar-area)/2)]"}`}
                    />
                    <div data-box className="rounded-lg border bg-white px-5 py-3 text-center text-sm">
                        {r.label}
                        <small data-off className="block text-neutral-500" />
                    </div>
                    <span className="absolute inset-y-0 right-0 grid place-items-center bg-blue-600 px-3 text-sm text-white">
                        end
                    </span>
                </section>
            ))}
        </div>
    );
}

export function Example() {
    return (
        <>
            <Scrollbars />

            {/* The page: content up top, footer at the bottom of the screen
                even on a short page. */}
            <div className="flex min-h-dvh flex-col">
                <div className="flex-1">
                    <Bar />

                    {/* Fixed: the bar does not scroll it — no gutter. */}
                    <header className="fixed inset-x-0 top-0 h-14 bg-white/90 backdrop-blur" />

                    {/* data-pg-scrollbar-gutter on each section, as needed: the
                        strip's width is kept free, so the content centres in what
                        is left. */}
                    <section data-pg-scrollbar-gutter>
                        <main className="mx-auto max-w-3xl px-4 pt-24">
                            {/* A panel with its own bar: the box is positioned and does
                                not scroll; the list does. data-lenis-prevent keeps
                                Lenis off the list's own scroll. */}
                            <div className="relative h-72 overflow-hidden rounded-lg border">
                                <ul id="items" data-lenis-prevent className="h-full overflow-y-auto">
                                    {Array.from({ length: 40 }, (_, i) => (
                                        <li key={i} data-pg-scrollbar-gutter className="border-b py-2 pl-4">
                                            Item {i + 1}
                                        </li>
                                    ))}
                                </ul>
                                <Bar of="#items" />
                            </div>
                        </main>
                    </section>

                    {/* The page's gutter, shown: the same full-width row twice. */}
                    <GutterRows />
                </div>

                <footer data-pg-scrollbar-gutter className="border-t p-12 text-center">
                    Footer
                </footer>
            </div>
        </>
    );
}
