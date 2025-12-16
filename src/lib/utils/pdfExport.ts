import html2pdf from 'html2pdf.js';

export const exportToPdf = async (element: HTMLElement, fileName: string) => {
    // Configuration for html2pdf
    const opt = {
        margin: 0, // We rely on the editor's internal padding for margins
        filename: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // Higher scale for better resolution 
            useCORS: true, // For images loaded from external URLs
            logging: false,
            windowWidth: 794 // Force A4 width in pixels (approx) to match editor layout logic
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("PDF Export failed:", error);
        throw error;
    }
};

/**
 * Generate a PDF blob for print preview (does not save to disk)
 * Returns a blob URL that can be opened in a new tab for preview/print
 */
export const generatePdfBlob = async (element: HTMLElement): Promise<string> => {
    // Configuration for html2pdf (same as export but no filename)
    const opt = {
        margin: [10, 10, 10, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 794,
            letterRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        }
    };

    try {
        // Create html2pdf worker and generate PDF
        const worker = html2pdf();
        const pdf = await worker.set(opt).from(element).toPdf().get('pdf');

        // Convert jsPDF object to blob
        const pdfBlob = pdf.output('blob');

        // Create a blob URL that can be opened in browser
        const blobUrl = URL.createObjectURL(pdfBlob);

        return blobUrl;
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error;
    }
};
