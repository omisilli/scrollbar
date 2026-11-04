"use client";

import { useEffect } from "react";
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

                    {/* A full-width slider: no gutter — it runs under the bar. */}
                    <section className="flex h-48">
                        <div className="flex-1 bg-neutral-900" />
                        <div className="flex-1 bg-neutral-500" />
                    </section>
                </div>

                <footer data-pg-scrollbar-gutter className="border-t p-12 text-center">
                    Footer
                </footer>
            </div>
        </>
    );
}
