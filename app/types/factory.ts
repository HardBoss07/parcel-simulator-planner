export type Truck = { x: number; y: number };
export type Output = { x: number; y: number; types: string[] };

export type GridCell = {
    x: number;
    y: number;
    type: "empty" | "conveyor" | "blocked";
    belt?: {
        kind: "straight" | "corner_cw" | "corner_ccw" | "loader" | "unloader";
        rotation: 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
    };
};

export type FactoryConfig = {
    width: number;
    height: number;
    trucks: Truck[];
    outputs: Output[];
    blocked?: { x: number; y: number }[];
};

export type FactoryPlan = {
    config: FactoryConfig;
    cells: GridCell[];
}