import {GridCell} from "@/app/types/factory";

export type GlowType = "invalid" | "no_sticker" | "valid";

export interface GlowEffect {
    x: number;
    y: number;
    type: GlowType;
}

/**
 * Calculate glow effects for a scanner based on its position and rotation
 * @param scannerX - X position of the scanner
 * @param scannerY - Y position of the scanner
 * @param rotation - Rotation of the scanner (0, 45, 90, 135, 180, 225, 270, 315)
 * @param scannerKind - Type of scanner
 * @returns Array of glow effects for adjacent cells
 */
export function calculateScannerGlows(scannerX: number, scannerY: number, rotation: number, scannerKind: string): GlowEffect[] {
    const glows: GlowEffect[] = [];

    // All scanners have the same pattern: 1 input, 2 outputs (L: invalid, R: valid)
    // Except sticker checker which has 3 outputs (straight: no sticker, L: invalid, R: valid)

    switch (rotation) {
        case 0: // Facing right (0°)
            if (scannerKind === "sticker_checker") {
                // Input from left, outputs: straight(right), L(up), R(down)
                glows.push(
                    {x: scannerX + 1, y: scannerY, type: "no_sticker"},     // straight
                    {x: scannerX, y: scannerY + 1, type: "invalid"},        // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}            // R
                );
            } else {
                // Other scanners: L(up), R(down)
                glows.push(
                    {x: scannerX, y: scannerY + 1, type: "invalid"},        // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}            // R
                );
            }
            break;
        case 45: // Facing up-right (45°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX + 1, y: scannerY + 1, type: "no_sticker"}, // straight
                    {x: scannerX + 1, y: scannerY, type: "invalid"},         // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}            // R
                );
            } else {
                glows.push(
                    {x: scannerX + 1, y: scannerY, type: "invalid"},         // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}            // R
                );
            }
            break;
        case 90: // Facing up (90°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX, y: scannerY + 1, type: "no_sticker"},      // straight
                    {x: scannerX - 1, y: scannerY, type: "invalid"},       // L
                    {x: scannerX + 1, y: scannerY, type: "valid"}           // R
                );
            } else {
                glows.push(
                    {x: scannerX - 1, y: scannerY, type: "invalid"},       // L
                    {x: scannerX + 1, y: scannerY, type: "valid"}           // R
                );
            }
            break;
        case 135: // Facing up-left (135°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX - 1, y: scannerY + 1, type: "no_sticker"},  // straight
                    {x: scannerX - 1, y: scannerY, type: "invalid"},        // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}           // R
                );
            } else {
                glows.push(
                    {x: scannerX - 1, y: scannerY, type: "invalid"},        // L
                    {x: scannerX, y: scannerY - 1, type: "valid"}           // R
                );
            }
            break;
        case 180: // Facing left (180°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX - 1, y: scannerY, type: "no_sticker"},     // straight
                    {x: scannerX, y: scannerY - 1, type: "invalid"},        // L
                    {x: scannerX, y: scannerY + 1, type: "valid"}           // R
                );
            } else {
                glows.push(
                    {x: scannerX, y: scannerY - 1, type: "invalid"},        // L
                    {x: scannerX, y: scannerY + 1, type: "valid"}           // R
                );
            }
            break;
        case 225: // Facing down-left (225°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX - 1, y: scannerY - 1, type: "no_sticker"}, // straight
                    {x: scannerX, y: scannerY - 1, type: "invalid"},        // L
                    {x: scannerX - 1, y: scannerY, type: "valid"}           // R
                );
            } else {
                glows.push(
                    {x: scannerX, y: scannerY - 1, type: "invalid"},        // L
                    {x: scannerX - 1, y: scannerY, type: "valid"}           // R
                );
            }
            break;
        case 270: // Facing down (270°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX, y: scannerY - 1, type: "no_sticker"},     // straight
                    {x: scannerX + 1, y: scannerY, type: "invalid"},        // L
                    {x: scannerX - 1, y: scannerY, type: "valid"}            // R
                );
            } else {
                glows.push(
                    {x: scannerX + 1, y: scannerY, type: "invalid"},        // L
                    {x: scannerX - 1, y: scannerY, type: "valid"}            // R
                );
            }
            break;
        case 315: // Facing down-right (315°)
            if (scannerKind === "sticker_checker") {
                glows.push(
                    {x: scannerX + 1, y: scannerY - 1, type: "no_sticker"}, // straight
                    {x: scannerX, y: scannerY - 1, type: "invalid"},         // L
                    {x: scannerX + 1, y: scannerY, type: "valid"}           // R
                );
            } else {
                glows.push(
                    {x: scannerX, y: scannerY - 1, type: "invalid"},         // L
                    {x: scannerX + 1, y: scannerY, type: "valid"}           // R
                );
            }
            break;
    }

    return glows;
}

/**
 * Get all glow effects for all scanners in the grid
 * @param gridCells - 2D array of grid cells
 * @returns Array of all glow effects
 */
export function getAllScannerGlows(gridCells: GridCell[][]): GlowEffect[] {
    const allGlows: GlowEffect[] = [];

    for (let y = 0; y < gridCells.length; y++) {
        for (let x = 0; x < gridCells[y].length; x++) {
            const cell = gridCells[y][x];
            if (cell.type === "scanner" && cell.scanner) {
                const glows = calculateScannerGlows(x, y, cell.scanner.rotation, cell.scanner.kind);
                allGlows.push(...glows);
            }
        }
    }

    return allGlows;
}
