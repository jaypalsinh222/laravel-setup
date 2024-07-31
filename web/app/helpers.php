<?php

use Illuminate\Support\Str;

if (!function_exists('ip_check')) {
    /**
     * Cirkle custom check ip of the user.
     *
     * @return bool
     */
    function ip_check(): bool
    {
        if (Str::contains(request()->server('HTTP_CF_CONNECTING_IP'), config('constants.debug_ip_ipv4'))
            || Str::contains(request()->server('HTTP_CF_CONNECTING_IP'), config('constants.debug_ip_ipv6'))
            || Str::contains(request()->ip(), config('constants.debug_ip_ipv6'))
            || Str::contains(request()->ip(), config('constants.debug_ip_ipv4'))
            || Str::contains(request()->ip(), '127.0.0.1')
        )
            return true;
        else
            return false;
    }
}

if (!function_exists('cs_dump')) {
    /**
     * Cirkle custom dump function for debug enables for particular IP address which is located on (.env) file.
     *
     * @param ...$vars - pass (,)comma seperated multiple variable
     * @return bool|void
     */
    function cs_dump(...$vars)
    {
        if (ip_check())
            return dump(...$vars);
        else
            return true;
    }
}

if (!function_exists('cs_dd')) {
    /**
     * Cirkle custom die and dump function for debug enable for particular IP address which is located on (.env) file.
     *
     * @param ...$vars - pass (,)comma seperated multiple variable
     * @return bool|void
     */
    function cs_dd(...$vars)
    {
        if (ip_check())
            return dd(...$vars);
        else
            return true;
    }
}
