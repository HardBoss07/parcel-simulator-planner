import {GridCell} from "@/app/types/factory";

export const deepCloneGrid = (grid: GridCell[][]): GridCell[][] =>
    grid.map(row => row.map(cell => ({...cell, belt: cell.belt ? {...cell.belt} : undefined})));






