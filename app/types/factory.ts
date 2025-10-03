export type Truck = { x: number; y: number };
export type Output = { x: number; y: number; types: string[] };

export type GridCell = {
    x: number;
    y: number;
    type: "empty" | "conveyor" | "blocked";
};

export type FactoryConfig = {
    width: number;
    height: number;
    trucks: Truck[];
    outputs: Output[];
    blocked?: { x: number; y: number }[];
};
