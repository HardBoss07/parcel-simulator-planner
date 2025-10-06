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
    onClear: () => void;
    onUndo: () => void;
    canUndo: boolean;
    onSaveJSON: () => void;
    onImportJSON: () => void;
    isEditMode: boolean;
    onToggleEditMode: () => void;
};

export default function Toolbar({
                                    activeTool,
                                    setActiveTool,
                                    onClear,
                                    onUndo,
                                    canUndo,
                                    onSaveJSON,
                                    onImportJSON,
                                    isEditMode,
                                    onToggleEditMode
                                }: Props) {
    const btn = (isActive: boolean) => `px-3 py-1 rounded border ${isActive ? "bg-blue-600 border-blue-500" : "bg-gray-800 border-gray-700"}`;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button className="px-3 py-1 rounded border bg-green-600 border-green-500 text-white"
                    onClick={onSaveJSON}>Save JSON
            </button>
            <button className="px-3 py-1 rounded border bg-blue-600 border-blue-500 text-white"
                    onClick={onImportJSON}>Import JSON
            </button>

            <div className="mx-2 w-px h-5 bg-gray-700"/>

            <button className={`px-3 py-1 rounded border text-white ${isEditMode ? "bg-orange-600 border-orange-500" : "bg-purple-600 border-purple-500"}`}
                    onClick={onToggleEditMode}>
                {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
            </button>

            <div className="mx-2 w-px h-5 bg-gray-700"/>

            <button
                className="px-3 py-1 rounded border bg-gray-800 border-gray-700"
                onClick={() => setActiveTool(t => ({...t, rotation: ((t.rotation + 90) % 360) as Rotation}))}
                title="Rotate tool"
            >Rotate 90°
            </button>
            <button
                className="px-3 py-1 rounded border bg-gray-800 border-gray-700"
                onClick={() => setActiveTool(t => (t.kind === "corner_cw" ? {
                    ...t,
                    kind: "corner_ccw"
                } : t.kind === "corner_ccw" ? {...t, kind: "corner_cw"} : t))}
                title="Mirror tool"
            >Mirror
            </button>

            <div className="mx-2 w-px h-5 bg-gray-700"/>

            <button className="px-3 py-1 rounded border bg-red-700 border-red-600" onClick={onClear}>Clear</button>
            <button className="px-3 py-1 rounded border bg-gray-800 border-gray-700" onClick={onUndo}
                    disabled={!canUndo}>Undo
            </button>
        </div>
    );
}



