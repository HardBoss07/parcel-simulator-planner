"use client";

import React from "react";

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
    activeTool: { kind: ToolKind; rotation: Rotation };
    setActiveTool: (updater: (t: { kind: ToolKind; rotation: Rotation }) => {
        kind: ToolKind;
        rotation: Rotation
    }) => void;
};

export default function ToolSidebar({activeTool, setActiveTool}: Props) {
    const sidebarBtn = (isActive: boolean) => `w-full px-3 py-2 rounded border text-left ${isActive ? "bg-blue-600 border-blue-500" : "bg-gray-800 border-gray-700 hover:bg-gray-700"}`;

    const conveyorTools = [
        {kind: "straight" as const, label: "Straight Belt"},
        {kind: "corner_cw" as const, label: "Corner CW"},
        {kind: "corner_ccw" as const, label: "Corner CCW"},
    ];

    const scannerTools = [
        {kind: "sticker_checker" as const, label: "Sticker Checker (SC)"},
        {kind: "weight_scanner" as const, label: "Weight Scanner (WS)"},
        {kind: "serial_scanner" as const, label: "Serial Scanner (SN)"},
        {kind: "country_scanner" as const, label: "Country Scanner (CS)"},
    ];

    const loaderTools = [
        {kind: "loader" as const, label: "Loader"},
        {kind: "unloader" as const, label: "Unloader"},
    ];

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto h-full">
            <h2 className="text-white text-lg font-semibold mb-4">Tools</h2>

            {/* Conveyor Belts */}
            <div className="mb-6">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Conveyor Belts</h3>
                <div className="space-y-1">
                    {conveyorTools.map((tool) => (
                        <button
                            key={tool.kind}
                            className={sidebarBtn(activeTool.kind === tool.kind)}
                            onClick={() => setActiveTool(t => ({...t, kind: tool.kind}))}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loaders/Unloaders */}
            <div className="mb-6">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Loaders & Unloaders</h3>
                <div className="space-y-1">
                    {loaderTools.map((tool) => (
                        <button
                            key={tool.kind}
                            className={sidebarBtn(activeTool.kind === tool.kind)}
                            onClick={() => setActiveTool(t => ({...t, kind: tool.kind}))}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scanners */}
            <div className="mb-6">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Scanners</h3>
                <div className="space-y-1">
                    {scannerTools.map((tool) => (
                        <button
                            key={tool.kind}
                            className={sidebarBtn(activeTool.kind === tool.kind)}
                            onClick={() => setActiveTool(t => ({...t, kind: tool.kind}))}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
