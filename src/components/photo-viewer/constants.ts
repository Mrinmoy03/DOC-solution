export const PRESET_CATEGORIES = [
    // ------------------------------------------------------
    // BASIC ENHANCEMENTS (most used by everyone)
    // ------------------------------------------------------

    {
        title: 'Basic Enhancements',
        presets: [
            { name: 'Normal', filter: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'Vivid', filter: { brightness: 110, contrast: 120, saturate: 130, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'High Contrast', filter: { brightness: 95, contrast: 150, saturate: 120, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'Soft Glow', filter: { brightness: 118, contrast: 90, saturate: 95, grayscale: 0, sepia: 5, hueRotate: 0, blur: 0 } },
            { name: 'Deep Noir', filter: { brightness: 90, contrast: 150, saturate: 0, grayscale: 100, sepia: 5, hueRotate: 0, blur: 0 } },
            {
                name: 'Sharp Detail',
                filter: {
                    brightness: 102,
                    contrast: 135,
                    saturate: 110,
                    grayscale: 0,
                    sepia: 0,
                    hueRotate: 0,
                    blur: 0
                }
            },

        ]
    },

    // ------------------------------------------------------
    // WARM / COOL — universal colour grading
    // ------------------------------------------------------
    {
        title: 'Warm / Cool Looks',
        presets: [
            { name: 'Warm', filter: { brightness: 105, contrast: 100, saturate: 110, grayscale: 0, sepia: 20, hueRotate: -5, blur: 0 } },
            { name: 'Warm Gold', filter: { brightness: 110, contrast: 95, saturate: 135, grayscale: 0, sepia: 35, hueRotate: -10, blur: 0 } },
            { name: 'Cold', filter: { brightness: 100, contrast: 110, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 180, blur: 0 } },
            { name: 'Ice Blue', filter: { brightness: 112, contrast: 105, saturate: 85, grayscale: 0, sepia: 0, hueRotate: 200, blur: 0 } },
        ]
    },

    // ------------------------------------------------------
    // FILM / RETRO — trending on Instagram & VSCO
    // ------------------------------------------------------
    {
        title: 'Film / Retro Looks',
        presets: [
            { name: 'Vintage', filter: { brightness: 100, contrast: 90, saturate: 80, grayscale: 0, sepia: 30, hueRotate: 0, blur: 0 } },
            { name: 'Retro Film', filter: { brightness: 108, contrast: 95, saturate: 75, grayscale: 10, sepia: 25, hueRotate: -5, blur: 0 } },
            { name: 'Old Photo', filter: { brightness: 112, contrast: 85, saturate: 65, grayscale: 15, sepia: 35, hueRotate: 0, blur: 0 } },
            { name: 'Matte Fade', filter: { brightness: 108, contrast: 78, saturate: 90, grayscale: 0, sepia: 10, hueRotate: 0, blur: 0 } },
        ]
    },

    // ------------------------------------------------------
    // CINEMATIC — popular in reels, edits, color grading
    // ------------------------------------------------------
    {
        title: 'Cinematic Filters',
        presets: [
            { name: 'Teal & Orange', filter: { brightness: 105, contrast: 130, saturate: 120, grayscale: 0, sepia: 0, hueRotate: -10, blur: 0 } },
            { name: 'Moody Cinema', filter: { brightness: 90, contrast: 140, saturate: 90, grayscale: 0, sepia: 10, hueRotate: -15, blur: 0 } },
            { name: 'Cinema Warm', filter: { brightness: 110, contrast: 120, saturate: 110, grayscale: 0, sepia: 25, hueRotate: -8, blur: 0 } },
            { name: 'Silver Screen', filter: { brightness: 100, contrast: 125, saturate: 0, grayscale: 100, sepia: 5, hueRotate: 0, blur: 0 } },
        ]
    },

    // ------------------------------------------------------
    // PORTRAIT — the ones people ACTUALLY use
    // ------------------------------------------------------
    {
        title: 'Portrait Filters',
        presets: [
            { name: 'Warm Skin', filter: { brightness: 110, contrast: 95, saturate: 110, grayscale: 0, sepia: 20, hueRotate: -2, blur: 0 } },
            { name: 'Soft Portrait', filter: { brightness: 115, contrast: 85, saturate: 95, grayscale: 0, sepia: 10, hueRotate: 0, blur: 0 } },
            { name: 'Bright Face', filter: { brightness: 120, contrast: 90, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'Golden Skin', filter: { brightness: 110, contrast: 90, saturate: 105, grayscale: 0, sepia: 35, hueRotate: -5, blur: 0 } },
        ]
    },

    // ------------------------------------------------------
    // BLACK & WHITE — essential and professional
    // ------------------------------------------------------
    {
        title: 'Black & White Pack',
        presets: [
            { name: 'Mono', filter: { brightness: 110, contrast: 110, saturate: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'Soft BW', filter: { brightness: 118, contrast: 90, saturate: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0 } },
            { name: 'Hard BW', filter: { brightness: 85, contrast: 160, saturate: 0, grayscale: 100, sepia: 5, hueRotate: 0, blur: 0 } },
            { name: 'Sepia Noir', filter: { brightness: 100, contrast: 120, saturate: 0, grayscale: 50, sepia: 50, hueRotate: 0, blur: 0 } },
        ]
    },
];
