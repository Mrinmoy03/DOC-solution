import React, { useEffect, useState } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';
import type { GridCell } from '../../types/crop';
import type { CollageStyle } from '../../types/collage';

interface CollageCellProps {
    cell: GridCell;
    style: CollageStyle;
    isActive: boolean;
    onSetActive: () => void;
}

export const CollageCell: React.FC<CollageCellProps> = ({
    cell,
    style,
    isActive,
    onSetActive,
}) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    // Load image
    useEffect(() => {
        if (cell.image?.url && !cell.image.imageObj) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImage(img);
            };
            img.src = cell.image.url;
        } else if (cell.image?.imageObj) {
            setImage(cell.image.imageObj);
        } else {
            setImage(null);
        }
    }, [cell.image?.url, cell.image?.imageObj]);

    // Calculate crop for object-fit: cover behavior
    const cropParams = React.useMemo(() => {
        if (!image || !cell.image) {
            return null;
        }

        const cropData = cell.image.cropData;

        // If we have crop data from the cropper, use it directly
        if (cropData && cropData.width && cropData.height) {
            console.log('Applying crop data:', {
                cellIndex: cell.index,
                cropData,
                imageSize: { width: image.width, height: image.height },
                cellSize: { width: cell.width, height: cell.height },
            });

            // Clamp coordinates to valid ranges
            let cropX = Math.max(0, cropData.x);
            let cropY = Math.max(0, cropData.y);
            let cropWidth = cropData.width;
            let cropHeight = cropData.height;

            // Adjust width if x was negative
            if (cropData.x < 0) {
                cropWidth = cropWidth + cropData.x; // Reduce width by the negative offset
            }

            // Adjust height if y was negative
            if (cropData.y < 0) {
                cropHeight = cropHeight + cropData.y; // Reduce height by the negative offset
            }

            // Ensure crop doesn't exceed image bounds
            cropWidth = Math.min(cropWidth, image.width - cropX);
            cropHeight = Math.min(cropHeight, image.height - cropY);

            console.log('Clamped crop:', { x: cropX, y: cropY, width: cropWidth, height: cropHeight });

            return {
                crop: {
                    x: cropX,
                    y: cropY,
                    width: cropWidth,
                    height: cropHeight,
                },
            };
        }

        // Otherwise, use default object-fit: cover behavior
        const imgAspect = image.width / image.height;
        const cellAspect = cell.width / cell.height;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = image.width;
        let sourceHeight = image.height;

        if (imgAspect > cellAspect) {
            // Image is wider - crop sides
            sourceWidth = image.height * cellAspect;
            sourceX = (image.width - sourceWidth) / 2;
        } else {
            // Image is taller - crop top/bottom
            sourceHeight = image.width / cellAspect;
            sourceY = (image.height - sourceHeight) / 2;
        }

        return {
            crop: {
                x: Math.max(0, sourceX),
                y: Math.max(0, sourceY),
                width: Math.min(sourceWidth, image.width - sourceX),
                height: Math.min(sourceHeight, image.height - sourceY),
            },
        };
    }, [image, cell.image, cell.width, cell.height]);


    return (
        <Group
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            clipFunc={(ctx) => {
                if (style.borderRadius > 0) {
                    ctx.beginPath();
                    ctx.moveTo(style.borderRadius, 0);
                    ctx.lineTo(cell.width - style.borderRadius, 0);
                    ctx.quadraticCurveTo(cell.width, 0, cell.width, style.borderRadius);
                    ctx.lineTo(cell.width, cell.height - style.borderRadius);
                    ctx.quadraticCurveTo(cell.width, cell.height, cell.width - style.borderRadius, cell.height);
                    ctx.lineTo(style.borderRadius, cell.height);
                    ctx.quadraticCurveTo(0, cell.height, 0, cell.height - style.borderRadius);
                    ctx.lineTo(0, style.borderRadius);
                    ctx.quadraticCurveTo(0, 0, style.borderRadius, 0);
                    ctx.closePath();
                } else {
                    ctx.rect(0, 0, cell.width, cell.height);
                }
            }}
        >
            {/* Cell background */}
            <Rect
                x={0}
                y={0}
                width={cell.width}
                height={cell.height}
                fill="#f8fafc"
                stroke={style.borderWidth > 0 ? style.borderColor : '#e2e8f0'}
                strokeWidth={style.borderWidth > 0 ? style.borderWidth : 2}
                dash={style.borderWidth > 0 ? undefined : [5, 5]}
            />

            {/* Image */}
            {image && cropParams && (
                <KonvaImage
                    key={`${cell.index}-${cell.width}-${cell.height}`}
                    image={image}
                    x={0}
                    y={0}
                    width={cell.width}
                    height={cell.height}
                    crop={cropParams.crop}
                />
            )}
        </Group>
    );
};
