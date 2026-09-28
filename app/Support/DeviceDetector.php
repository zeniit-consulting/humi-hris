<?php

namespace App\Support;

use Illuminate\Http\Request;

class DeviceDetector
{
    /**
     * Determine whether the incoming HTTP request originates from a mobile device.
     */
    public static function isMobile(?Request $request): bool
    {
        if (! $request) {
            return false;
        }

        // Modern Client Hints header for mobile
        $secChUaMobile = $request->header('sec-ch-ua-mobile');
        if ($secChUaMobile === '?1') {
            return true;
        }

        $userAgent = (string) $request->userAgent();
        if ($userAgent === '') {
            return false;
        }

        // Regex detecting mobile phones and handheld devices
        $mobileRegex = '/(android.+mobile|avantgo|blackberry|bb\d+|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino)/i';

        return (bool) preg_match($mobileRegex, $userAgent);
    }
}
