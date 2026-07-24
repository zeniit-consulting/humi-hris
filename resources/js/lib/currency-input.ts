export const normalizeDigitInput = (value: string): string =>
    value.replace(/[^\d]/g, '');

export const normalizeStoredCurrencyValue = (
    value: string | number | null | undefined,
): string => {
    const raw = String(value ?? '').trim();

    if (/^\d+\.\d{2}$/.test(raw)) {
        return raw.split('.')[0] ?? '';
    }

    return normalizeDigitInput(raw);
};

export const formatThousandDigits = (
    value: string | number | null | undefined,
): string => {
    const digits = normalizeStoredCurrencyValue(value);

    if (!digits) {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(Number(digits));
};
