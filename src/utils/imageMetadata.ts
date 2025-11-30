export const addDpiToPng = async (blob: Blob, dpi: number): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47) {
        console.error("Not a valid PNG file");
        return blob;
    }

    // Calculate pixels per meter (PNG uses meters)
    // 1 inch = 0.0254 meters
    const pixelsPerMeter = Math.round(dpi / 0.0254);

    // Create pHYs chunk
    // Length (4 bytes) + Type (4 bytes) + Data (9 bytes) + CRC (4 bytes) = 21 bytes
    const physChunk = new Uint8Array(21);
    const view = new DataView(physChunk.buffer);

    // Length: 9 bytes
    view.setUint32(0, 9);

    // Type: pHYs
    physChunk[4] = 112; // p
    physChunk[5] = 72;  // H
    physChunk[6] = 89;  // Y
    physChunk[7] = 115; // s

    // Data:
    // Pixels per unit, X axis (4 bytes)
    view.setUint32(8, pixelsPerMeter);
    // Pixels per unit, Y axis (4 bytes)
    view.setUint32(12, pixelsPerMeter);
    // Unit specifier: 1 = meter (1 byte)
    physChunk[16] = 1;

    // CRC
    const crc = calculateCrc(physChunk.slice(4, 17));
    view.setUint32(17, crc);

    // Insert pHYs chunk after IHDR chunk
    // Find end of IHDR
    let pos = 8;
    while (pos < data.length) {
        const length = new DataView(data.buffer).getUint32(pos);
        const type = String.fromCharCode(data[pos + 4], data[pos + 5], data[pos + 6], data[pos + 7]);

        if (type === 'IHDR') {
            pos += 8 + length + 4; // Skip IHDR
            break;
        }
        pos += 8 + length + 4;
    }

    // Construct new file
    const newData = new Uint8Array(data.length + physChunk.length);
    newData.set(data.slice(0, pos), 0);
    newData.set(physChunk, pos);
    newData.set(data.slice(pos), pos + physChunk.length);

    return new Blob([newData], { type: 'image/png' });
};

export const addDpiToJpeg = async (blob: Blob, dpi: number): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    if (data[0] !== 0xFF || data[1] !== 0xD8) {
        console.error("Not a valid JPEG file");
        return blob;
    }

    // Find APP0 marker (FF E0)
    let pos = 2;
    while (pos < data.length) {
        if (data[pos] === 0xFF) {
            const marker = data[pos + 1];
            if (marker === 0xE0) {
                // Found APP0
                // Check for JFIF identifier
                if (
                    data[pos + 4] === 0x4A && // J
                    data[pos + 5] === 0x46 && // F
                    data[pos + 6] === 0x49 && // I
                    data[pos + 7] === 0x46 && // F
                    data[pos + 8] === 0x00    // \0
                ) {
                    // It's JFIF. Update density.
                    // Units (1 byte) at offset 11: 1 = dots per inch
                    data[pos + 11] = 1;
                    // X density (2 bytes) at offset 12
                    data[pos + 12] = (dpi >> 8) & 0xFF;
                    data[pos + 13] = dpi & 0xFF;
                    // Y density (2 bytes) at offset 14
                    data[pos + 14] = (dpi >> 8) & 0xFF;
                    data[pos + 15] = dpi & 0xFF;

                    return new Blob([data], { type: 'image/jpeg' });
                }
            }
            // Skip other markers
            // const length = (data[pos + 2] << 8) | data[pos + 3];
            // pos += 2 + length;
            // Actually, if we didn't find APP0 immediately after SOI, we might want to insert it.
            // But usually canvas.toDataURL('image/jpeg') produces a JFIF compatible JPEG.
            // Let's just assume standard structure for now or return original if not found.
            break;
        }
        pos++;
    }

    // If no APP0 found or not JFIF, we could insert it, but for simplicity let's return original.
    // Most browser generated JPEGs have JFIF.
    return blob;
};

// CRC Table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
        } else {
            c = c >>> 1;
        }
    }
    crcTable[n] = c;
}

function calculateCrc(buf: Uint8Array): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return c ^ 0xffffffff;
}
