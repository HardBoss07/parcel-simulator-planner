import {FactoryConfig, GridCell} from "@/app/types/factory";

export function generateGrid(config: FactoryConfig): GridCell[][] {
    const grid: GridCell[][] = [];

    // grid[0] = bottom row (y=0)
    for (let y = 0; y < config.height; y++) {
        const row: GridCell[] = [];
        for (let x = 0; x < config.width; x++) {
            const isBlocked = config.blocked?.some((b) => b.x === x && b.y === y);
            row.push({
                x,
                y,
                type: isBlocked ? "blocked" : "empty",
            });
        }
        grid.push(row);
    }

    return grid;
}
