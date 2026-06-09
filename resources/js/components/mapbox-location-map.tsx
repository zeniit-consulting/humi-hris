import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';

export type MapLocation = {
    id?: string;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
};

export type MapCoordinates = {
    latitude: number;
    longitude: number;
};

export type MapRouteLine = {
    id: string;
    color?: string;
    coordinates: MapCoordinates[];
};

type MapboxLocationMapProps = {
    center: MapCoordinates;
    zoom?: number;
    className?: string;
    locations?: MapLocation[];
    routeLines?: MapRouteLine[];
    userLocation?: MapCoordinates | null;
    selectedLocation?: MapCoordinates | null;
    isUserPulsing?: boolean;
    onSelect?: (latitude: number, longitude: number) => void;
    autoCenter?: MapCoordinates | null;
};

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

const tileAttribution = '';

const mapStyle: mapboxgl.Style = {
    version: 8,
    sources: {
        cartoVoyager: {
            type: 'raster',
            tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: tileAttribution,
        },
    },
    layers: [
        {
            id: 'carto-voyager',
            type: 'raster',
            source: 'cartoVoyager',
            minzoom: 0,
            maxzoom: 20,
        },
    ],
};

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

const createMarkerElement = (
    variant: 'office' | 'user' | 'selected',
    isPulsing = false,
) => {
    const marker = document.createElement('div');
    marker.className = [
        'mapbox-location-marker',
        `mapbox-location-marker-${variant}`,
        isPulsing ? 'mapbox-location-marker-pulse' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return marker;
};

const createCirclePolygon = (
    center: MapCoordinates,
    radiusMeters: number,
    points = 96,
) => {
    const coordinates: Array<[number, number]> = [];
    const earthRadius = 6371000;
    const latitude = (center.latitude * Math.PI) / 180;
    const longitude = (center.longitude * Math.PI) / 180;
    const angularDistance = radiusMeters / earthRadius;

    for (let index = 0; index <= points; index += 1) {
        const bearing = (index * 2 * Math.PI) / points;
        const pointLatitude = Math.asin(
            Math.sin(latitude) * Math.cos(angularDistance) +
                Math.cos(latitude) *
                    Math.sin(angularDistance) *
                    Math.cos(bearing),
        );
        const pointLongitude =
            longitude +
            Math.atan2(
                Math.sin(bearing) *
                    Math.sin(angularDistance) *
                    Math.cos(latitude),
                Math.cos(angularDistance) -
                    Math.sin(latitude) * Math.sin(pointLatitude),
            );

        coordinates.push([
            (pointLongitude * 180) / Math.PI,
            (pointLatitude * 180) / Math.PI,
        ]);
    }

    return coordinates;
};

export function MapboxLocationMap({
    center,
    zoom = 16,
    className = 'h-full w-full',
    locations = [],
    routeLines = [],
    userLocation = null,
    selectedLocation = null,
    isUserPulsing = false,
    onSelect,
    autoCenter = null,
}: MapboxLocationMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const onSelectRef = useRef(onSelect);
    const initialCenterRef = useRef(center);
    const initialZoomRef = useRef(zoom);
    const [mapError, setMapError] = useState<string | null>(
        mapboxAccessToken
            ? null
            : 'Mapbox access token belum dikonfigurasi.',
    );
    const circleData = useMemo<GeoJSON.FeatureCollection>(() => {
        return {
            type: 'FeatureCollection',
            features: locations
                .filter((location) => location.radiusMeters)
                .map((location) => ({
                    type: 'Feature',
                    properties: {
                        id:
                            location.id ??
                            `${location.name}-${location.latitude}-${location.longitude}`,
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            createCirclePolygon(
                                {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                },
                                location.radiusMeters ?? 0,
                            ),
                        ],
                    },
                })),
        };
    }, [locations]);
    const initialCircleDataRef = useRef(circleData);
    const routeLineData = useMemo<GeoJSON.FeatureCollection>(() => {
        return {
            type: 'FeatureCollection',
            features: routeLines
                .filter((line) => line.coordinates.length >= 2)
                .map((line) => ({
                    type: 'Feature',
                    properties: {
                        id: line.id,
                        color: line.color ?? '#006069',
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: line.coordinates.map((coordinate) => [
                            coordinate.longitude,
                            coordinate.latitude,
                        ]),
                    },
                })),
        };
    }, [routeLines]);
    const initialRouteLineDataRef = useRef(routeLineData);

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        if (!mapboxAccessToken || !containerRef.current || mapRef.current) {
            return;
        }

        mapboxgl.accessToken = mapboxAccessToken;

        let map: mapboxgl.Map;

        try {
            map = new mapboxgl.Map({
                container: containerRef.current,
                style: mapStyle,
                center: [
                    initialCenterRef.current.longitude,
                    initialCenterRef.current.latitude,
                ],
                zoom: initialZoomRef.current,
                attributionControl: false,
            });
        } catch (error) {
            setMapError(
                error instanceof Error
                    ? error.message
                    : 'Map gagal dimuat.',
            );

            return;
        }

        map.on('error', (event) => {
            if (event.error) {
                setMapError(event.error.message);
            }
        });

        map.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            'bottom-right',
        );
        map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            'bottom-left',
        );

        map.on('load', () => {
            map.addSource('attendance-radius', {
                type: 'geojson',
                data: initialCircleDataRef.current,
            });
            map.addLayer({
                id: 'attendance-radius-fill',
                type: 'fill',
                source: 'attendance-radius',
                paint: {
                    'fill-color': '#14b8a6',
                    'fill-opacity': 0.16,
                },
            });
            map.addLayer({
                id: 'attendance-radius-line',
                type: 'line',
                source: 'attendance-radius',
                paint: {
                    'line-color': '#0f766e',
                    'line-width': 2,
                    'line-opacity': 0.86,
                },
            });
            map.addSource('visit-route-lines', {
                type: 'geojson',
                data: initialRouteLineDataRef.current,
            });
            map.addLayer({
                id: 'visit-route-lines',
                type: 'line',
                source: 'visit-route-lines',
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': 4,
                    'line-opacity': 0.9,
                },
            });
        });

        map.on('click', (event) => {
            onSelectRef.current?.(event.lngLat.lat, event.lngLat.lng);
        });

        mapRef.current = map;

        return () => {
            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const updateSource = () => {
            const source = map.getSource(
                'attendance-radius',
            ) as mapboxgl.GeoJSONSource | null;
            source?.setData(circleData);
        };

        if (map.isStyleLoaded()) {
            updateSource();
        } else {
            map.once('load', updateSource);
        }
    }, [circleData]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const updateSource = () => {
            const source = map.getSource(
                'visit-route-lines',
            ) as mapboxgl.GeoJSONSource | null;
            source?.setData(routeLineData);
        };

        if (map.isStyleLoaded()) {
            updateSource();
        } else {
            map.once('load', updateSource);
        }
    }, [routeLineData]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        locations.forEach((location) => {
            const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
                `<div class="mapbox-location-popup"><strong>${escapeHtml(
                    location.name,
                )}</strong><span>${escapeHtml(
                    location.address ?? 'Lokasi absensi',
                )}</span>${
                    location.radiusMeters
                        ? `<small>Radius: ${location.radiusMeters} m</small>`
                        : ''
                }</div>`,
            );

            const marker = new mapboxgl.Marker({
                element: createMarkerElement('office'),
                anchor: 'center',
            })
                .setLngLat([location.longitude, location.latitude])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        });

        if (userLocation) {
            const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
                `<div class="mapbox-location-popup"><strong>Posisi Anda</strong><span>${userLocation.latitude.toFixed(
                    6,
                )}, ${userLocation.longitude.toFixed(6)}</span></div>`,
            );
            const marker = new mapboxgl.Marker({
                element: createMarkerElement('user', isUserPulsing),
                anchor: 'center',
            })
                .setLngLat([userLocation.longitude, userLocation.latitude])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        }

        if (selectedLocation) {
            const marker = new mapboxgl.Marker({
                element: createMarkerElement('selected'),
                anchor: 'center',
            })
                .setLngLat([
                    selectedLocation.longitude,
                    selectedLocation.latitude,
                ])
                .addTo(map);

            markersRef.current.push(marker);
        }
    }, [isUserPulsing, locations, selectedLocation, userLocation]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map || !autoCenter) {
            return;
        }

        map.flyTo({
            center: [autoCenter.longitude, autoCenter.latitude],
            zoom: Math.max(map.getZoom(), 16),
            duration: 800,
            essential: true,
        });
    }, [autoCenter]);

    return (
        <div className={className}>
            {mapError ? (
                <div className="flex h-full min-h-48 items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-sm font-medium text-amber-900">
                    {mapError}
                </div>
            ) : (
                <div ref={containerRef} className="h-full w-full" />
            )}
        </div>
    );
}
