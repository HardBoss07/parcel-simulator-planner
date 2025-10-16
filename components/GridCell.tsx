import React from "react";
import {CellData} from "@/types/grid";

export function GridCell({posX, posY, type}: CellData) {
    const color =
        type === "BLOCKED"
            ? "bg-transparent"
            : type === "STATIC"
                ? "bg-blue-500"
                : "bg-[#3d3d3d]"; // darker "EMPTY" cell to blend with #333 bg

    return (
        <div
            className={`w-7 h-7 ${color} border border-[#555] rounded-sm`}
        />
    );
}
