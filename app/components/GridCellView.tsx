"use client";

import React from "react";
import {GridCell} from "@/app/types/factory";
import BeltIcon from "@/app/components/icons/BeltIcon";

type Props = {
    cell: GridCell;
    size: number;
    onLeftDown: () => void;
    onRightClick: () => void;
    onEnter: () => void;
    onLeave: () => void;
};

export default function GridCellView({ cell, size, onLeftDown, onRightClick, onEnter, onLeave }: Props) {
    const bg = cell.type === "empty" ? "bg-gray-700" : cell.type === "blocked" ? "bg-red-800 opacity-60" : "bg-gray-700";
    return (
        <div
            className={`relative rounded-sm ${bg}`}
            style={{width: `${size}px`, height: `${size}px`}}
            onMouseDown={(e) => { if (e.button === 0) onLeftDown(); }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(); }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {cell.belt && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <BeltIcon kind={cell.belt.kind} rotation={cell.belt.rotation} size={size} />
                </div>
            )}
        </div>
    );
}


