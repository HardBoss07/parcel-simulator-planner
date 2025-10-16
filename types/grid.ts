export interface CellData{
    posX: number;
    posY: number;
    type: CellType;
}

export type CellType = "BLOCKED" | "STATIC" | "EMPTY";