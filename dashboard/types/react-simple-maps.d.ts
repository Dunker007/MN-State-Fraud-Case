declare module 'react-simple-maps' {
    import { ReactNode, CSSProperties } from 'react';

    export interface ProjectionConfig {
        scale?: number;
        center?: [number, number];
        rotate?: [number, number, number];
        parallels?: [number, number];
    }

    export interface ComposableMapProps {
        projection?: string;
        projectionConfig?: ProjectionConfig;
        width?: number;
        height?: number;
        className?: string;
        children?: ReactNode;
    }

    export interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        translateExtent?: [[number, number], [number, number]];
        onMoveStart?: (event: { coordinates: [number, number]; zoom: number }) => void;
        onMove?: (event: { coordinates: [number, number]; zoom: number; x: number; y: number; k: number }) => void;
        onMoveEnd?: (event: { coordinates: [number, number]; zoom: number }) => void;
        children?: ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object;
        children: (data: { geographies: GeographyData[] }) => ReactNode;
    }

    export interface GeographyData {
        id: string | number;
        rsmKey: string;
        properties: Record<string, unknown>;
        geometry: object;
    }

    export interface GeographyStyleObject {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        outline?: string;
        transition?: string;
        cursor?: string;
    }

    export interface GeographyProps {
        geography: GeographyData;
        onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void;
        onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void;
        onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
        style?: {
            default?: GeographyStyleObject;
            hover?: GeographyStyleObject;
            pressed?: GeographyStyleObject;
        };
    }

    export const ComposableMap: React.FC<ComposableMapProps>;
    export const ZoomableGroup: React.FC<ZoomableGroupProps>;
    export const Geographies: React.FC<GeographiesProps>;
    export const Geography: React.FC<GeographyProps>;
    export const Marker: React.FC<{ coordinates: [number, number]; children?: ReactNode }>;
    export const Annotation: React.FC<{ subject: [number, number]; dx?: number; dy?: number; children?: ReactNode }>;
    export const Graticule: React.FC<{ stroke?: string; strokeWidth?: number }>;
    export const Line: React.FC<{ from: [number, number]; to: [number, number]; stroke?: string; strokeWidth?: number }>;
    export const Sphere: React.FC<{ stroke?: string; strokeWidth?: number; fill?: string }>;
}
