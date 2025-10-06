"use client";

import {useState, useRef} from "react";
import FactoryGrid, {FactoryGridRef} from "@/app/components/FactoryGrid";
import ToolSidebar from "@/app/components/ToolSidebar";
import Toolbar from "@/app/components/Toolbar";
import {FactoryConfig} from "@/app/types/factory";
import configData from "./factory_config.json";

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

export default function Home() {
    const tierFiveConfig: FactoryConfig = configData as FactoryConfig;

    const [activeTool, setActiveTool] = useState<{ kind: ToolKind; rotation: Rotation }>({
        kind: "straight",
        rotation: 0
    });

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editPosition, setEditPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const factoryGridRef = useRef<FactoryGridRef>(null);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <ToolSidebar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
            />
            <main className="flex-1 flex flex-col">
                <div className="bg-gray-800 border-b border-gray-700 p-4">
                    <h1 className="text-2xl font-bold mb-4">Parcel Factory Planner</h1>
                    <Toolbar
                        activeTool={activeTool}
                        setActiveTool={setActiveTool}
                        onClear={() => factoryGridRef.current?.onClear()}
                        onUndo={() => factoryGridRef.current?.onUndo()}
                        canUndo={factoryGridRef.current?.canUndo || false}
                        onSaveJSON={() => factoryGridRef.current?.onSaveJSON()}
                        onImportJSON={() => factoryGridRef.current?.onImportJSON()}
                        isEditMode={isEditMode}
                        onToggleEditMode={() => setIsEditMode(!isEditMode)}
                    />
                </div>
                <div className="flex-1 flex justify-center">
                    <FactoryGrid
                        ref={factoryGridRef}
                        config={tierFiveConfig}
                        activeTool={activeTool}
                        setActiveTool={setActiveTool}
                        isEditMode={isEditMode}
                        editPosition={editPosition}
                        setEditPosition={setEditPosition}
                    />
                </div>
            </main>
        </div>
    );
}
