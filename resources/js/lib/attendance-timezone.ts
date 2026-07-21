const indonesiaTimezoneLabels: Record<string, string> = {
    'Asia/Jakarta': 'WIB',
    'Asia/Pontianak': 'WIB',
    'Asia/Makassar': 'WITA',
    'Asia/Ujung_Pandang': 'WITA',
    'Asia/Jayapura': 'WIT',
};

export function browserTimezone(): string {
    if (typeof Intl === 'undefined') {
        return 'UTC';
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function effectiveTimezone(timezone: string | null | undefined): string {
    return timezone || browserTimezone();
}

export function timezoneLabel(timezone: string | null | undefined): string {
    const resolvedTimezone = effectiveTimezone(timezone);

    return indonesiaTimezoneLabels[resolvedTimezone] ?? resolvedTimezone;
}

export function formatAttendanceTime(
    value: string | null,
    timezone?: string | null,
): string {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    const resolvedTimezone = effectiveTimezone(timezone);
    const time = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: resolvedTimezone,
    }).format(date);

    return `${time} ${timezoneLabel(resolvedTimezone)}`;
}

export function toAttendanceDateTimeInput(
    value: string | null,
    timezone?: string | null,
): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: effectiveTimezone(timezone),
    })
        .formatToParts(date)
        .reduce<Record<string, string>>((result, part) => {
            if (part.type !== 'literal') {
                result[part.type] = part.value;
            }

            return result;
        }, {});

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
