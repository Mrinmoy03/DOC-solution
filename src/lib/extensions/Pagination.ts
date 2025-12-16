import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { useEditorStore } from '../../store/editorStore';

const paginationKey = new PluginKey('pagination');

export const Pagination = Extension.create({
    name: 'pagination',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: paginationKey,
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, set) {
                        if (tr.getMeta(paginationKey)) {
                            return tr.getMeta(paginationKey);
                        }
                        return set.map(tr.mapping, tr.doc);
                    },
                },
                view() {
                    return {
                        update(view, prevState) {
                            const layoutChange = view.state.tr.getMeta('layoutChange');
                            const docChanged = !prevState.doc.eq(view.state.doc);

                            if (docChanged || layoutChange) {
                                requestAnimationFrame(() => {
                                    measureAndPaginate(view);
                                });
                            }
                        }
                    };
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});

function measureAndPaginate(view: any) {
    if (!view || !view.state || view.isDestroyed) return;

    const store = useEditorStore.getState();
    const { page, ruler, pageMargins, headerFooter } = store;

    const PAGE_HEIGHT = page.height;
    const DEFAULT_TOP = ruler.topMargin;
    const DEFAULT_BOTTOM = ruler.bottomMargin;
    const GAP_SIZE = 20;

    const decorations: Decoration[] = [];
    let pageIndex = 0;

    const getEffectiveTop = (pIndex: number) => {
        const t = pageMargins[pIndex]?.top ?? DEFAULT_TOP;
        return headerFooter.showHeader ? Math.max(t, (headerFooter.headerMargin * 96) + 24) : t;
    };

    const getEffectiveBottom = (pIndex: number) => {
        const b = pageMargins[pIndex]?.bottom ?? DEFAULT_BOTTOM;
        return headerFooter.showFooter ? Math.max(b, (headerFooter.footerMargin * 96) + 24) : b;
    };

    let currentMarginTop = getEffectiveTop(0);
    let currentMarginBottom = getEffectiveBottom(0);

    let usableHeight = PAGE_HEIGHT - currentMarginTop - currentMarginBottom;
    let cursorY = 0;

    view.state.doc.descendants((node: any, pos: number) => {
        if (!node.isBlock) return false;

        const domNode = view.nodeDOM(pos);
        if (!domNode || !(domNode instanceof HTMLElement)) return true;

        const height = domNode.offsetHeight;
        const style = window.getComputedStyle(domNode);
        const marginTop = parseInt(style.marginTop) || 0;
        const marginBottom = parseInt(style.marginBottom) || 0;
        const totalHeight = height + marginTop + marginBottom;

        if (totalHeight === 0 && node.content.size === 0) return false;

        if (cursorY + totalHeight <= usableHeight) {
            cursorY += totalHeight;
        } else {
            const remainingSpace = usableHeight - cursorY;

            pageIndex++;
            const nextMarginTop = getEffectiveTop(pageIndex);
            const nextMarginBottom = getEffectiveBottom(pageIndex);

            const fillerHeight = remainingSpace + currentMarginBottom + GAP_SIZE;
            const spacerHeight = nextMarginTop;

            const decoration = Decoration.widget(pos, () => {
                const container = document.createElement('div');
                container.className = 'print-page-break-container';
                container.style.width = '100%';
                container.style.pointerEvents = 'none';
                container.style.userSelect = 'none';

                // Filler: Consumes space on current page + gap. Hidden in print.
                const filler = document.createElement('div');
                filler.className = 'print-page-break-filler';
                filler.style.height = `${fillerHeight}px`;
                filler.style.width = '100%';

                // Spacer: Represents top margin of next page. Kept in print.
                const spacer = document.createElement('div');
                spacer.className = 'print-page-break-spacer';
                spacer.style.height = `${spacerHeight}px`;
                spacer.style.width = '100%';

                container.appendChild(filler);
                container.appendChild(spacer);
                return container;
            }, { side: -1 });

            decorations.push(decoration);

            cursorY = totalHeight;
            usableHeight = PAGE_HEIGHT - nextMarginTop - nextMarginBottom;
            currentMarginTop = nextMarginTop;
            currentMarginBottom = nextMarginBottom;
        }

        return false;
    });

    const tr = view.state.tr.setMeta(paginationKey, DecorationSet.create(view.state.doc, decorations));
    view.dispatch(tr);
}
