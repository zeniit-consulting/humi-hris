import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef } from 'react';

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

type MapboxLocationMapProps = {
    center: MapCoordinates;
    zoom?: number;
    className?: string;
    locations?: MapLocation[];
    userLocation?: MapCoordinates | null;
    selectedLocation?: MapCoordinates | null;
    isUserPulsing?: boolean;
    onSelect?: (latitude: number, longitude: number) => void;
    autoCenter?: MapCoordinates | null;
};

const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

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

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: mapStyle,
            center: [
                initialCenterRef.current.longitude,
                initialCenterRef.current.latitude,
            ],
            zoom: initialZoomRef.current,
            attributionControl: false,
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

    return <div ref={containerRef} className={className} />;
}
