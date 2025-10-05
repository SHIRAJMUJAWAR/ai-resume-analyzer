export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();
        if (!file) {
            return {
                imageUrl: "",
                file: null,
                error: "No file provided",
            };
        }
        const arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || (arrayBuffer as ArrayBuffer).byteLength === 0) {
            return {
                imageUrl: "",
                file: null,
                error: "File is empty or could not be read",
            };
        }
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        if (!pdf || pdf.numPages < 1) {
            return {
                imageUrl: "",
                file: null,
                error: "PDF could not be loaded or has no pages",
            };
        }
        const page = await pdf.getPage(1);
        if (!page) {
            return {
                imageUrl: "",
                file: null,
                error: "Failed to get first page of PDF",
            };
        }
        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            return {
                imageUrl: "",
                file: null,
                error: "Failed to get 2D context from canvas",
            };
        }
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        try {
            await page.render({ canvasContext: context, viewport }).promise;
        } catch (renderErr) {
            return {
                imageUrl: "",
                file: null,
                error: `Failed to render PDF page: ${renderErr}`,
            };
        }
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });
                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob from canvas (blob is null)",
                        });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}