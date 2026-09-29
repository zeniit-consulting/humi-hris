export type GeocodeResult = {
    latitude: number;
    longitude: number;
    displayName?: string;
};

/**
 * Forward geocodes an address string using Mapbox Geocoding API if token is configured,
 * with fallback to Nominatim (OpenStreetMap).
 */
export async function geocodeAddress(
    address: string,
): Promise<GeocodeResult | null> {
    const query = address.trim();
    if (!query) {
        return null;
    }

    const mapboxToken = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim();
    if (mapboxToken) {
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    query,
                )}.json?access_token=${mapboxToken}&limit=1`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (res.ok) {
                const data = (await res.json()) as {
                    features?: Array<{
                        center: [number, number];
                        place_name?: string;
                    }>;
                };

                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    if (Number.isFinite(lat) && Number.isFinite(lng)) {
                        return {
                            latitude: lat,
                            longitude: lng,
                            displayName: data.features[0].place_name,
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('Mapbox forward geocoding failed, trying fallback...', error);
        }
    }

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
                query,
            )}&limit=1`,
            {
                headers: {
                    Accept: 'application/json',
                },
            },
        );

        if (res.ok) {
            const data = (await res.json()) as Array<{
                lat: string;
                lon: string;
                display_name?: string;
            }>;

            if (Array.isArray(data) && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                if (Number.isFinite(lat) && Number.isFinite(lon)) {
                    return {
                        latitude: lat,
                        longitude: lon,
                        displayName: data[0].display_name,
                    };
                }
            }
        }
    } catch (error) {
        console.warn('Nominatim forward geocoding failed:', error);
    }

    return null;
}
