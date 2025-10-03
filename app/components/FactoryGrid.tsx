"use client";

import {JSX, useMemo, useState} from "react";
import {FactoryConfig, GridCell} from "@/app/types/factory";

type Props = { config: FactoryConfig };

export default function FactoryGrid({config}: Props) {
    const W = config.width;
    const H = config.height;

    // gridCells[y][x] holds the type of each cell
    const [gridCells, setGridCells] = useState<GridCell[][]>(() =>
        Array.from({length: H}, (_, y) =>
            Array.from({length: W}, (_, x) => ({
                x,
                y,
                // @ts-ignore
                type: config.blocked.find((b) => b.x === x && b.y === y)
                    ? "blocked"
                    : "empty",
            }))
        )
    );

    const renderGrid = () => {
        const elements: JSX.Element[] = [];

        const visualWidth = W + 2; // include invisible margin
        const visualHeight = gridCells.length + 2; // dynamic height + margins

        for (let yR = visualHeight - 1; yR >= 0; yR--) {
            for (let xR = 0; xR < visualWidth; xR++) {
                const configX = xR - 1; // margin offset
                const configY = yR - 1; // margin offset

                // Trucks
                const truck = config.trucks.find((t) => t.x === configX && t.y === configY);
                if (truck) {
                    elements.push(
                        <div
                            key={`truck-${xR}-${yR}`}
                            className="w-8 h-8 bg-blue-600 flex items-center justify-center text-xs rounded-sm"
                        >
                            T
                        </div>
                    );
                    continue;
                }

                // Outputs
                const output = config.outputs.find((o) => o.x === configX && o.y === configY);
                if (output) {
                    elements.push(
                        <div
                            key={`output-${xR}-${yR}`}
                            className="w-8 h-8 bg-green-600 flex items-center justify-center text-[10px] rounded-sm p-1"
                            title={output.types.join(", ")}
                        >
                            {output.types.join(",")}
                        </div>
                    );
                    continue;
                }

                // Inside main grid
                if (configX >= 0 && configX < W && configY >= 0 && configY < gridCells.length) {
                    const cell: GridCell = gridCells[configY][configX];
                    elements.push(
                        <div
                            key={`cell-${xR}-${yR}`}
                            className={`w-8 h-8 rounded-sm ${
                                cell.type === "empty"
                                    ? "bg-gray-700"
                                    : cell.type === "blocked"
                                        ? "bg-red-800 opacity-60"
                                        : "bg-yellow-500"
                            }`}
                        />
                    );
                    continue;
                }

                // Invisible margin
                elements.push(
                    <div key={`margin-${xR}-${yR}`} className="w-8 h-8"/>
                );
            }
        }

        return elements;
    };

    return (
        <div>
            <div
                className="grid gap-0.5 bg-gray-800 p-2 rounded-lg"
                style={{
                    gridTemplateColumns: `repeat(${W + 2}, 32px)`,
                    gridTemplateRows: `repeat(${gridCells.length + 2}, 32px)`,
                }}
            >
                {renderGrid()}
            </div>
        </div>
    );
}
