export const normalizeDigitInput = (value: string): string =>
    value.replace(/[^\d]/g, '');

export const formatThousandDigits = (
    value: string | number | null | undefined,
): string => {
    const digits = normalizeDigitInput(String(value ?? ''));

    if (!digits) {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(Number(digits));
};
