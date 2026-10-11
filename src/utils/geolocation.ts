export type GeoErrorCode = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

export class GeoError extends Error {
  code: GeoErrorCode;
  constructor(code: GeoErrorCode) {
    super(code);
    this.code = code;
  }
}

// One-shot GPS/network position. Works in browsers and in the Android app (Capacitor's WebView
// asks for the location permission declared in AndroidManifest.xml). City-level accuracy is
// enough here, so it prefers a fast, low-power fix over high accuracy.
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new GeoError('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        reject(
          new GeoError(
            err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable'
          )
        ),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60_000 }
    );
  });
}
