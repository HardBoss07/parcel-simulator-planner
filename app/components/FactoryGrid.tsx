"use client";

import {JSX, useEffect, useMemo, useRef, useState} from "react";
import {FactoryConfig, GridCell, FactoryPlan} from "@/app/types/factory";
import BeltIcon from "@/app/components/icons/BeltIcon";
import Toolbar from "@/app/components/Toolbar";
import GridCellView from "@/app/components/GridCellView";
import {deepCloneGrid} from "@/app/utils/gridState";

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
    const [activeTool, setActiveTool] = useState<
        {
            kind: "straight" | "corner_cw" | "corner_ccw" | "loader" | "unloader";
            rotation: 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315
        }
    >({kind: "straight", rotation: 0});
    const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null);
    const hoveredRef = useRef<{ x: number; y: number } | null>(null);
    const rotateGuardRef = useRef<{ key: string; ts: number } | null>(null);

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

    useEffect(() => {
        const up = () => setIsDrawing(false);
        window.addEventListener("mouseup", up);
        return () => window.removeEventListener("mouseup", up);
    }, []);

    // Keyboard controls removed per request to avoid double-handling; using right-click to rotate instead.

    const applyBeltToCell = (x: number, y: number) => {
        if (x < 0 || y < 0 || y >= gridCells.length || x >= gridCells[0].length) return;
        pushHistoryFromCurrent();
        setGridCells(prev => {
            const copy = prev.map(row => row.slice());
            const cell = copy[y][x];
            if (cell.type !== "blocked") {
                cell.type = "conveyor";
                cell.belt = {kind: activeTool.kind, rotation: activeTool.rotation};
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
        if (cell && cell.belt) {
            pushHistoryFromCurrent();
            setGridCells(prev => {
                const copy = prev.map(row => row.slice());
                const c = copy[y][x];
                if (c.belt) {
                    const next = ((c.belt.rotation + 45) % 360) as 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
                    c.belt = {...c.belt, rotation: next};
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
            <Toolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onClear={() => {
                    pushHistoryFromCurrent();
                    setGridCells(prev => prev.map(row => row.map(c => ({
                        ...c,
                        type: c.type === "blocked" ? "blocked" : "empty",
                        belt: undefined
                    }))));
                }}
                onUndo={undo}
                canUndo={history.length > 0}
                onSaveJSON={saveJSON}
                onImportJSON={importJSON}
            />
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
}
