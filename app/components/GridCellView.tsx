"use client";

import React from "react";
import {GridCell} from "@/app/types/factory";
import BeltIcon from "@/app/components/icons/BeltIcon";
import {GlowEffect} from "@/app/utils/scanner";

type Props = {
    cell: GridCell;
    size: number;
    glowEffects?: GlowEffect[];
    onLeftDown: () => void;
    onRightClick: () => void;
    onEnter: () => void;
    onLeave: () => void;
    isEditMode?: boolean;
    isCurrentEditPosition?: boolean;
};

export default function GridCellView({
                                         cell,
                                         size,
                                         glowEffects = [],
                                         onLeftDown,
                                         onRightClick,
                                         onEnter,
                                         onLeave,
                                         isEditMode = false,
                                         isCurrentEditPosition = false
                                     }: Props) {
    const bg = cell.type === "empty" ? "bg-gray-700" :
        cell.type === "blocked" ? "bg-red-800 opacity-60" :
            cell.type === "scanner" ? "bg-purple-700" : "bg-gray-700";

    // Check if this cell has any glow effects
    const cellGlows = glowEffects.filter(glow => glow.x === cell.x && glow.y === cell.y);

    // Determine glow class based on glow type
    const getGlowClass = (type: string) => {
        switch (type) {
            case "invalid":
                return "border-2 border-red-500";
            case "no_sticker":
                return "border-2 border-yellow-500";
            case "valid":
                return "border-2 border-green-500";
            default:
                return "";
        }
    };

    // Get the primary glow class (if multiple glows, prioritize invalid > no_sticker > valid)
    const primaryGlow = cellGlows.find(g => g.type === "invalid") ||
        cellGlows.find(g => g.type === "no_sticker") ||
        cellGlows.find(g => g.type === "valid");

    const glowClass = primaryGlow ? getGlowClass(primaryGlow.type) : "";

    // Add grayish border for cells with belts
    const beltBorderClass = cell.belt ? "border border-gray-400" : "";
    
    // Add white border for current edit position
    const editModeBorderClass = isEditMode && isCurrentEditPosition ? "border-2 border-white" : "";

    return (
        <div
            className={`relative rounded-sm ${bg} ${glowClass} ${beltBorderClass} ${editModeBorderClass}`}
            style={{width: `${size}px`, height: `${size}px`}}
            onMouseDown={(e) => {
                if (e.button === 0) onLeftDown();
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRightClick();
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {cell.belt && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <BeltIcon kind={cell.belt.kind} rotation={cell.belt.rotation} size={size}/>
                </div>
            )}
            {cell.scanner && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white font-bold text-xs">
                        {cell.scanner.kind === "sticker_checker" ? "SC" :
                            cell.scanner.kind === "weight_scanner" ? "WS" :
                                cell.scanner.kind === "serial_scanner" ? "SN" :
                                    cell.scanner.kind === "country_scanner" ? "CS" : "SC"}
                    </div>
                </div>
            )}
        </div>
    );
}



