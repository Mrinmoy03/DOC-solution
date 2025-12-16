import { create } from 'zustand';

interface RulerState {
    showRuler: boolean;
    leftMargin: number;
    rightMargin: number;
    topMargin: number;
    bottomMargin: number;
    firstLineIndent: number;
    leftIndent: number;
    tabStops: number[];
}

interface PageState {
    width: number; // in pixels, e.g., 816 for Letter
    height: number; // in pixels, e.g., 1056 for Letter
    orientation: 'portrait' | 'landscape';
}

interface HeaderFooterState {
    headerMargin: number;
    footerMargin: number;
    showHeader: boolean;
    showFooter: boolean;
    headerContent: string;
    footerContent: string;
    headerLineStyle: string;
    footerLineStyle: string;
    headerLineColor: string;
    footerLineColor: string;
}

interface PageNumberState {
    showPageNumbers: boolean;
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    format: '1, 2, 3' | 'i, ii, iii' | 'a, b, c';
    showOnFirstPage: boolean;
}

interface PageMargins {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

interface EditorState {
    ruler: RulerState;
    page: PageState;
    headerFooter: HeaderFooterState;
    pageNumber: PageNumberState;
    zoom: number;
    wordCount: number;
    currentPage: number;
    totalPages: number;
    activeEditor: any; // Using any to avoid circular dependency with Tiptap Editor type
    pageMargins: Record<number, PageMargins>;

    // Actions
    setRulerState: (updates: Partial<RulerState>) => void;
    setPageState: (updates: Partial<PageState>) => void;
    setHeaderFooterState: (updates: Partial<HeaderFooterState>) => void;
    setPageNumberState: (updates: Partial<PageNumberState>) => void;
    setZoom: (zoom: number) => void;
    setWordCount: (count: number) => void;
    setCurrentPage: (page: number) => void;
    setTotalPages: (pages: number) => void;
    toggleRuler: () => void;
    setActiveEditor: (editor: any) => void;
    setPageMargins: (pageIndex: number, margins: Partial<PageMargins>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    ruler: {
        showRuler: true,
        leftMargin: 96, // 1 inch = 96px
        rightMargin: 96,
        topMargin: 96,
        bottomMargin: 96,
        firstLineIndent: 0,
        leftIndent: 0,
        tabStops: [],
    },
    page: {
        width: 816, // 8.5 inches * 96 dpi
        height: 1056, // 11 inches * 96 dpi
        orientation: 'portrait',
    },
    headerFooter: {
        headerMargin: 0.5,
        footerMargin: 0.5,
        showHeader: false,
        showFooter: false,
        headerContent: '',
        footerContent: '',
        headerLineStyle: 'none',
        footerLineStyle: 'none',
        headerLineColor: '#000000',
        footerLineColor: '#000000',
    },
    pageNumber: {
        showPageNumbers: false,
        position: 'bottom-left',
        format: '1, 2, 3',
        showOnFirstPage: true,
    },
    zoom: 100,
    wordCount: 0,
    currentPage: 1,
    totalPages: 1,
    activeEditor: null,
    pageMargins: {},

    setRulerState: (updates) =>
        set((state) => ({ ruler: { ...state.ruler, ...updates } })),
    setPageState: (updates) =>
        set((state) => ({ page: { ...state.page, ...updates } })),
    setHeaderFooterState: (updates) =>
        set((state) => ({ headerFooter: { ...state.headerFooter, ...updates } })),
    setPageNumberState: (updates) =>
        set((state) => ({ pageNumber: { ...state.pageNumber, ...updates } })),
    setZoom: (zoom) => set({ zoom }),
    setWordCount: (wordCount) => set({ wordCount }),
    setCurrentPage: (currentPage) => set({ currentPage }),
    setTotalPages: (totalPages) => set({ totalPages }),
    toggleRuler: () =>
        set((state) => ({ ruler: { ...state.ruler, showRuler: !state.ruler.showRuler } })),
    setActiveEditor: (editor) => set({ activeEditor: editor }),
    setPageMargins: (pageIndex, margins) =>
        set((state) => ({
            pageMargins: {
                ...state.pageMargins,
                [pageIndex]: { ...state.pageMargins[pageIndex], ...margins },
            },
        })),
}));
