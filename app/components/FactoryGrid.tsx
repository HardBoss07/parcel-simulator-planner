"use client";

import {JSX, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle} from "react";
import {FactoryConfig, GridCell, FactoryPlan} from "@/app/types/factory";
import BeltIcon from "@/app/components/icons/BeltIcon";
import GridCellView from "@/app/components/GridCellView";
import {deepCloneGrid} from "@/app/utils/gridState";
import {getAllScannerGlows, GlowEffect} from "@/app/utils/scanner";

type ToolKind =
    "straight"
    | "corner_cw"
    | "corner_ccw"
    | "loader"
    | "unloader"
    | "sticker_checker"
    | "weight_scanner"
    | "serial_scanner"
    | "country_scanner";
type Rotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

type Props = {
    config: FactoryConfig;
    activeTool: { kind: ToolKind; rotation: Rotation };
    setActiveTool: (updater: (t: { kind: ToolKind; rotation: Rotation }) => {
        kind: ToolKind;
        rotation: Rotation
    }) => void;
    isEditMode: boolean;
    editPosition: { x: number; y: number };
    setEditPosition: (position: { x: number; y: number }) => void;
};

export interface FactoryGridRef {
    onClear: () => void;
    onUndo: () => void;
    canUndo: boolean;
    onSaveJSON: () => void;
    onImportJSON: () => void;
}

const FactoryGrid = forwardRef<FactoryGridRef, Props>(({config, activeTool, setActiveTool, isEditMode, editPosition, setEditPosition}, ref) => {
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

    // Responsive sizing
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [cellSize, setCellSize] = useState<number>(32);

    useEffect(() => {
        const computeSize = () => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const visualWidth = W + 2; // include invisible margin columns
            const visualHeight = gridCells.length + 2; // include invisible margin rows

            // Leave a small padding inside the container
            const availableWidth = Math.max(0, rect.width - 8);
            const availableHeight = Math.max(0, rect.height - 8);

            const sizeByWidth = availableWidth / visualWidth;
            const sizeByHeight = availableHeight / visualHeight;
            const nextSize = Math.floor(Math.max(12, Math.min(sizeByWidth, sizeByHeight)));
            setCellSize(nextSize);
        };

        computeSize();

        const ro = new ResizeObserver(() => computeSize());
        if (containerRef.current) {
            ro.observe(containerRef.current);
        }

        const onResize = () => computeSize();
        window.addEventListener("resize", onResize);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, [W, gridCells.length]);

    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null);
    const hoveredRef = useRef<{ x: number; y: number } | null>(null);
    const rotateGuardRef = useRef<{ key: string; ts: number } | null>(null);

    // Calculate glow effects for all scanners
    const scannerGlows = useMemo(() => getAllScannerGlows(gridCells), [gridCells]);

    // History stack for undo
    const [history, setHistory] = useState<GridCell[][][]>([]);
    const pushHistoryFromCurrent = () => {
        setHistory(h => [...h, deepCloneGrid(gridCells)]);
    };
    const undo = () => {
        setHistory(h => {
            if (h.length === 0) return h;
            const next = h.slice(0, -1);
            const last = h[h.length - 1];
            setGridCells(last.map(row => row.map(cell => ({...cell, belt: cell.belt ? {...cell.belt} : undefined}))));
            return next;
        });
    };

    const saveJSON = () => {
        const factoryPlan: FactoryPlan = {
            config,
            cells: gridCells.flat()
        };

        const jsonString = JSON.stringify(factoryPlan, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'factory-plan.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const factoryPlan: FactoryPlan = JSON.parse(content);

                    // Validate the imported data
                    if (!factoryPlan.config || !factoryPlan.cells) {
                        alert('Invalid factory plan format');
                        return;
                    }

                    // Convert flat cells array back to 2D grid
                    const newGridCells: GridCell[][] = [];
                    for (let y = 0; y < config.height; y++) {
                        newGridCells[y] = [];
                        for (let x = 0; x < config.width; x++) {
                            const cell = factoryPlan.cells.find(c => c.x === x && c.y === y);
                            if (cell) {
                                newGridCells[y][x] = cell;
                            } else {
                                newGridCells[y][x] = {
                                    x,
                                    y,
                                    type: config.blocked?.find((b) => b.x === x && b.y === y) ? "blocked" : "empty"
                                };
                            }
                        }
                    }

                    pushHistoryFromCurrent();
                    setGridCells(newGridCells);
                } catch (error) {
                    alert('Error parsing JSON file: ' + (error as Error).message);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    };

    // Expose handlers to parent component
    useImperativeHandle(ref, () => ({
        onClear: () => {
            pushHistoryFromCurrent();
            setGridCells(prev => prev.map(row => row.map(c => ({
                ...c,
                type: c.type === "blocked" ? "blocked" : "empty",
                belt: undefined,
                scanner: undefined
            }))));
        },
        onUndo: undo,
        canUndo: history.length > 0,
        onSaveJSON: saveJSON,
        onImportJSON: importJSON
    }), [history.length, gridCells]);

    useEffect(() => {
        const up = () => setIsDrawing(false);
        window.addEventListener("mouseup", up);
        return () => window.removeEventListener("mouseup", up);
    }, []);

    // Arrow key navigation for edit mode
    useEffect(() => {
        if (!isEditMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEditMode) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setEditPosition(prev => ({
                        x: prev.x,
                        y: Math.min(H - 1, prev.y + 1)
                    }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setEditPosition(prev => ({
                        x: prev.x,
                        y: Math.max(0, prev.y - 1)
                    }));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setEditPosition(prev => ({
                        x: Math.max(0, prev.x - 1),
                        y: prev.y
                    }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setEditPosition(prev => ({
                        x: Math.min(W - 1, prev.x + 1),
                        y: prev.y
                    }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditMode, W, H]);

    // Keyboard controls removed per request to avoid double-handling; using right-click to rotate instead.

    const applyBeltToCell = (x: number, y: number) => {
        if (x < 0 || y < 0 || y >= gridCells.length || x >= gridCells[0].length) return;
        if (isEditMode) return; // Prevent placement in edit mode

        pushHistoryFromCurrent();
        setGridCells(prev => {
            const copy = prev.map(row => row.slice());
            const cell = copy[y][x];
            if (cell.type !== "blocked") {
                if (activeTool.kind === "sticker_checker" || activeTool.kind === "weight_scanner" ||
                    activeTool.kind === "serial_scanner" || activeTool.kind === "country_scanner") {
                    cell.type = "scanner";
                    cell.scanner = {kind: activeTool.kind, rotation: activeTool.rotation};
                    cell.belt = undefined; // Clear any existing belt
                } else {
                    cell.type = "conveyor";
                    cell.belt = {kind: activeTool.kind, rotation: activeTool.rotation};
                    cell.scanner = undefined; // Clear any existing scanner
                }
            }
            return copy;
        });
    };

    const rotateCell = (x: number, y: number) => {
        if (x < 0 || y < 0 || y >= gridCells.length || x >= gridCells[0].length) return;
        const now = Date.now();
        const key = `${x},${y}`;
        if (rotateGuardRef.current && rotateGuardRef.current.key === key && now - rotateGuardRef.current.ts < 150) {
            return;
        }
        rotateGuardRef.current = {key, ts: now};
        const cell = gridCells[y][x];
        if (cell && (cell.belt || cell.scanner)) {
            pushHistoryFromCurrent();
            setGridCells(prev => {
                const copy = prev.map(row => row.slice());
                const c = copy[y][x];
                if (c.belt) {
                    const next = ((c.belt.rotation + 45) % 360) as 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
                    c.belt = {...c.belt, rotation: next};
                } else if (c.scanner) {
                    const next = ((c.scanner.rotation + 45) % 360) as 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
                    c.scanner = {...c.scanner, rotation: next};
                }
                return copy;
            });
        } else {
            setActiveTool(t => ({...t, rotation: ((t.rotation + 90) % 360) as 0 | 90 | 180 | 270}));
        }
    };

    const mirrorCell = (x: number, y: number) => {
        if (x < 0 || y < 0 || y >= gridCells.length || x >= gridCells[0].length) return;
        const cell = gridCells[y][x];
        if (cell && cell.belt && (cell.belt.kind === "corner_cw" || cell.belt.kind === "corner_ccw")) {
            pushHistoryFromCurrent();
            setGridCells(prev => {
                const copy = prev.map(row => row.slice());
                const c = copy[y][x];
                if (c.belt && (c.belt.kind === "corner_cw" || c.belt.kind === "corner_ccw")) {
                    const nextKind = c.belt.kind === "corner_cw" ? "corner_ccw" : "corner_cw";
                    c.belt = {...c.belt, kind: nextKind};
                }
                return copy;
            });
        } else {
            setActiveTool(t => {
                if (t.kind === "corner_cw") return {...t, kind: "corner_ccw"};
                if (t.kind === "corner_ccw") return {...t, kind: "corner_cw"};
                return t;
            });
        }
    };

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
                            className="bg-blue-600 flex items-center justify-center rounded-sm"
                            style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                fontSize: `${Math.max(10, Math.round(cellSize * 0.5))}px`,
                                lineHeight: 1,
                            }}
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
                            className="bg-green-600 flex items-center justify-center rounded-sm"
                            style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                fontSize: `${Math.max(9, Math.round(cellSize * 0.3))}px`,
                                padding: `${Math.max(1, Math.round(cellSize * 0.1))}px`,
                                lineHeight: 1.1,
                                textAlign: "center",
                                wordBreak: "break-word",
                            }}
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
                        <GridCellView
                            key={`cell-${xR}-${yR}`}
                            cell={cell}
                            size={cellSize}
                            glowEffects={scannerGlows}
                            onLeftDown={() => {
                                setIsDrawing(true);
                                applyBeltToCell(configX, configY);
                            }}
                            onRightClick={() => rotateCell(configX, configY)}
                            onEnter={() => {
                                const h = {x: configX, y: configY};
                                hoveredRef.current = h;
                                setHovered(h);
                                if (isDrawing) applyBeltToCell(configX, configY);
                            }}
                            onLeave={() => {
                                hoveredRef.current = null;
                                setHovered(h => (h && h.x === configX && h.y === configY ? null : h));
                            }}
                            isEditMode={isEditMode}
                            isCurrentEditPosition={isEditMode && editPosition.x === configX && editPosition.y === configY}
                        />
                    );
                    continue;
                }

                // Invisible margin
                elements.push(
                    <div key={`margin-${xR}-${yR}`} style={{width: `${cellSize}px`, height: `${cellSize}px`}}/>
                );
            }
        }

        return elements;
    };

    return (
        <div className="w-full flex flex-col items-center gap-3">
            <div ref={containerRef} style={{width: "100%", maxWidth: "min(95vw, 1200px)", height: "70vh"}}
                 className="flex items-center justify-center">
                <div
                    className="grid gap-0.5 bg-gray-800 p-2 rounded-lg select-none"
                    style={{
                        gridTemplateColumns: `repeat(${W + 2}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${gridCells.length + 2}, ${cellSize}px)`,
                    }}
                    onMouseLeave={() => setIsDrawing(false)}
                >
                    {renderGrid()}
                </div>
            </div>
        </div>
    );
});

FactoryGrid.displayName = 'FactoryGrid';

export default FactoryGrid;
