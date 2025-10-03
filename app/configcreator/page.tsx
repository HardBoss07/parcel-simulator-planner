"use client";

import {useState} from "react";
import {FactoryConfig, Truck, Output} from "@/app/types/factory";

export default function ConfigCreator() {
    const [width, setWidth] = useState(40);
    const [height, setHeight] = useState(20);

    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [outputs, setOutputs] = useState<Output[]>([]);
    const [blocked, setBlocked] = useState<{ x: number; y: number }[]>([]);

    const [tool, setTool] = useState<"truck" | "output" | "blocked" | "eraser">("truck");
    const [outputTypes, setOutputTypes] = useState("Plane");

    const handleCellClick = (x: number, y: number, rightClick = false) => {
        if (tool === "eraser" || rightClick) {
            // remove any item at this cell
            setTrucks(trucks.filter((t) => !(t.x === x && t.y === y)));
            setOutputs(outputs.filter((o) => !(o.x === x && o.y === y)));
            setBlocked(blocked.filter((b) => !(b.x === x && b.y === y)));
            return;
        }

        if (tool === "truck") {
            if (!trucks.find((t) => t.x === x && t.y === y)) {
                setTrucks([...trucks, {x, y}]);
            }
        } else if (tool === "output") {
            if (!outputs.find((o) => o.x === x && o.y === y)) {
                setOutputs([...outputs, {x, y, types: outputTypes.split(",").map((s) => s.trim())}]);
            }
        } else if (tool === "blocked") {
            if (!blocked.find((b) => b.x === x && b.y === y)) {
                setBlocked([...blocked, {x, y}]);
            }
        }
    };

    const clearAll = () => {
        setTrucks([]);
        setOutputs([]);
        setBlocked([]);
    };

    const saveJSON = () => {
        const config: FactoryConfig = {width, height, trucks, outputs, blocked};
        const blob = new Blob([JSON.stringify(config, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `factory_config.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderGrid = () => {
        const rows = [];
        const visualWidth = width + 2;
        const visualHeight = height + 2;

        for (let yR = visualHeight - 1; yR >= 0; yR--) {
            const cols = [];
            for (let xR = 0; xR < visualWidth; xR++) {
                const configX = xR - 1; // -1 -> left margin
                const configY = yR - 1; // -1 -> bottom margin

                const isTruck = trucks.find((t) => t.x === configX && t.y === configY);
                const isOutput = outputs.find((o) => o.x === configX && o.y === configY);
                const isBlocked = blocked.find((b) => b.x === configX && b.y === configY);

                let bg = "bg-gray-700";
                let label = "";
                if (isTruck) {
                    bg = "bg-blue-600";
                    label = "T";
                } else if (isOutput) {
                    bg = "bg-green-600";
                    label = "O";
                } else if (isBlocked) {
                    bg = "bg-red-800";
                } else if (configX < 0 || configX >= width || configY < 0 || configY >= height) {
                    bg = "bg-gray-900"; // invisible margin
                }

                cols.push(
                    <div
                        key={`${xR}-${yR}`}
                        className={`w-8 h-8 m-0.5 rounded-sm flex items-center justify-center text-[10px] cursor-pointer ${bg}`}
                        title={`${configX},${configY}`}
                        onClick={() => handleCellClick(configX, configY)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleCellClick(configX, configY, true);
                        }}
                    >
                        {label}
                    </div>
                );
            }
            rows.push(
                <div key={yR} className="flex">
                    {cols}
                </div>
            );
        }

        return rows;
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">Factory Config Creator</h1>

            <div className="flex gap-4 items-center">
                <label>
                    Width:{" "}
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="text-black w-16"
                    />
                </label>
                <label>
                    Height:{" "}
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="text-black w-16"
                    />
                </label>
                <button onClick={saveJSON} className="bg-green-600 px-3 py-1 rounded">
                    Save JSON
                </button>
                <button onClick={clearAll} className="bg-red-600 px-3 py-1 rounded">
                    Clear All
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <button
                    className={`px-3 py-1 rounded ${tool === "truck" ? "bg-blue-600" : "bg-gray-700"}`}
                    onClick={() => setTool("truck")}
                >
                    Truck
                </button>
                <button
                    className={`px-3 py-1 rounded ${tool === "output" ? "bg-green-600" : "bg-gray-700"}`}
                    onClick={() => setTool("output")}
                >
                    Output
                </button>
                <input
                    type="text"
                    value={outputTypes}
                    onChange={(e) => setOutputTypes(e.target.value)}
                    placeholder="Output Types (comma)"
                    className="text-black px-2 py-1 rounded w-32"
                />
                <button
                    className={`px-3 py-1 rounded ${tool === "blocked" ? "bg-red-600" : "bg-gray-700"}`}
                    onClick={() => setTool("blocked")}
                >
                    Blocked
                </button>
                <button
                    className={`px-3 py-1 rounded ${tool === "eraser" ? "bg-gray-400" : "bg-gray-700"}`}
                    onClick={() => setTool("eraser")}
                >
                    Eraser
                </button>
            </div>

            <div>{renderGrid()}</div>
            <p className="text-gray-400 text-sm mt-2">Left click to place, right click to erase single cell.</p>
        </main>
    );
}
