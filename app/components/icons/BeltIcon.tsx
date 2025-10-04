"use client";

import React from "react";

type BeltKind = "straight" | "corner_cw" | "corner_ccw" | "loader" | "unloader";

type Props = {
    kind: BeltKind;
    rotation?: 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
    size: number;
    className?: string;
};

function mapKindToSrc(kind: BeltKind): string {
    switch (kind) {
        case "straight":
            return "/icons/straight.svg";
        case "corner_cw":
            return "/icons/corner_clockwise.svg";
        case "corner_ccw":
            return "/icons/corner_counterclockwise.svg";
        case "loader":
            return "/icons/loader_icon.svg";
        case "unloader":
            return "/icons/unloader_icon.svg";
        default:
            return "/icons/straight.svg";
    }
}

export default function BeltIcon({kind, rotation = 0, size, className}: Props) {
    const src = mapKindToSrc(kind);
    return (
        <img
            src={src}
            alt={kind}
            width={size}
            height={size}
            className={className}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
                pointerEvents: "none",
                userSelect: "none",
                display: "block",
            }}
        />
    );
}


