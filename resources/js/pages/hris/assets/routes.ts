const baseUrl = '/hris/assets';

export const index = {
    url: () => baseUrl,
};

export const store = {
    url: () => baseUrl,
};

export const update = {
    url: (assetId: number) => `${baseUrl}/${assetId}`,
};

export const destroy = {
    url: (assetId: number) => `${baseUrl}/${assetId}`,
};

export const procurementRequests = {
    url: () => `${baseUrl}/procurement-requests`,
};

export const storeProcurementRequest = {
    url: () => `${baseUrl}/procurement-requests`,
};

export const updateProcurementRequestStatus = {
    url: (requestId: number) => `${baseUrl}/procurement-requests/${requestId}/status`,
};
