import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ChartNodeView } from '../components/ChartNodeView';

export interface ChartOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        chart: {
            insertChart: (options: any) => ReturnType;
        };
    }
}

export const Chart = Node.create<ChartOptions>({
    name: 'chart',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            tableId: {
                default: null,
            },
            chartType: {
                default: 'bar',
            },
            labelColumnIndex: {
                default: 0,
            },
            dataColumnIndices: {
                default: [],
            },
            colors: {
                default: ['#8884d8'],
            },
            title: {
                default: '',
            },
            smooth: {
                default: true,
            },
            donut: {
                default: false,
            },
            showGrid: {
                default: true,
            },
            showLegend: {
                default: true,
            },
            showValues: {
                default: false,
            },
            backgroundColor: {
                default: '#ffffff',
            },
            textColor: {
                default: '#666',
            },
            gridColor: {
                default: '#e0e0e0',
            },
            xAxisLabel: {
                default: '',
            },
            yAxisLabel: {
                default: '',
            },
            width: {
                default: 600,
            },
            height: {
                default: 300,
            },
            x: {
                default: 0,
            },
            y: {
                default: 0,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="chart"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chart' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ChartNodeView);
    },

    addCommands() {
        return {
            insertChart: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});
