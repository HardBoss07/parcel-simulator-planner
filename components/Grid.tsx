import React from "react";
import {GridCell} from "@/components/GridCell";
import {CellData, CellType} from "@/types/grid";

export default function Grid() {
    const gridWidth = 40;
    const gridHeight = 20;

    const grid: CellData[] = [];
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cellType: CellType = "EMPTY";
            grid.push({posX: x, posY: y, type: cellType});
        }
    }

    return (
        <div
            className="grid gap-[2px] m-4 rounded-md p-2"
            style={{
                backgroundColor: "#333",
                gridTemplateColumns: `repeat(${gridWidth}, min-content)`,
            }}
        >
            {grid.map((cell) => (
                <GridCell key={`${cell.posX}-${cell.posY}`} {...cell} />
            ))}
        </div>
    );
}
