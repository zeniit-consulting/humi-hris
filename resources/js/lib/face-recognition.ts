let faceapiModule: typeof import('@vladmandic/face-api') | null = null;
let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

async function getFaceApi() {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!faceapiModule) {
        faceapiModule = await import('@vladmandic/face-api');
    }
    return faceapiModule;
}

/**
 * Load tiny face detector, face landmark 68 tiny, and face recognition models
 */
export async function loadFaceRecognitionModels(modelPath = '/models'): Promise<void> {
    if (typeof window === 'undefined') return;
    if (modelsLoaded) return;
    if (modelLoadingPromise) return modelLoadingPromise;

    modelLoadingPromise = (async () => {
        try {
            const faceapi = await getFaceApi();
            if (!faceapi) return;

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
                faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
            ]);
            modelsLoaded = true;
        } catch (error) {
            console.error('Failed to load face-api models:', error);
            throw error;
        } finally {
            modelLoadingPromise = null;
        }
    })();

    return modelLoadingPromise;
}

/**
 * Detect single face from an image element or canvas or video and return its 128-d descriptor
 */
export async function extractFaceDescriptor(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<{ descriptor: number[]; score: number } | null> {
    if (typeof window === 'undefined') return null;

    const faceapi = await getFaceApi();
    if (!faceapi) return null;

    await loadFaceRecognitionModels();

    const detection = await faceapi
        .detectSingleFace(
            input,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5,
            }),
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

    if (!detection) {
        return null;
    }

    return {
        descriptor: Array.from(detection.descriptor),
        score: detection.detection.score,
    };
}

/**
 * Calculate euclidean distance between two face descriptors.
 * Distance <= 0.5 typically indicates a strong match (~85%+ confidence).
 */
export function euclideanDistance(arr1: number[] | Float32Array, arr2: number[] | Float32Array): number {
    if (arr1.length !== arr2.length) {
        throw new Error('Descriptor lengths must match');
    }

    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
        const diff = arr1[i] - arr2[i];
        sum += diff * diff;
    }

    return Math.sqrt(sum);
}

/**
 * Compare two face descriptors and return match result
 */
export function matchFace(
    masterEmbedding: number[] | Float32Array,
    liveEmbedding: number[] | Float32Array,
    threshold = 0.5,
): { isMatch: boolean; distance: number; similarityPercent: number } {
    const distance = euclideanDistance(masterEmbedding, liveEmbedding);
    const similarityPercent = Math.max(0, Math.min(100, Math.round((1 - distance / 1.0) * 100)));

    return {
        isMatch: distance <= threshold,
        distance,
        similarityPercent,
    };
}
