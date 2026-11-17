import { init as initJpegDecode } from '@jsquash/jpeg/decode';
import { init as initPngDecode } from '@jsquash/png/decode';
import { init as initWebpDecode } from '@jsquash/webp/decode';
import { init as initWebpEncode } from '@jsquash/webp/encode';
import { initResize } from '@jsquash/resize';

// @ts-expect-error wrangler bundles wasm default exports
import JPEG_DEC_WASM from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm';
// @ts-expect-error wrangler bundles wasm default exports
import PNG_DEC_WASM from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm';
// @ts-expect-error wrangler bundles wasm default exports
import WEBP_DEC_WASM from '@jsquash/webp/codec/dec/webp_dec.wasm';
// @ts-expect-error wrangler bundles wasm default exports
import WEBP_ENC_WASM from '@jsquash/webp/codec/enc/webp_enc_simd.wasm';
// @ts-expect-error wrangler bundles wasm default exports
import RESIZE_WASM from '@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm';

let ready: Promise<void> | null = null;

export function ensureJsquashReady(): Promise<void> {
  if (!ready) {
    ready = Promise.all([
      initJpegDecode(JPEG_DEC_WASM),
      initPngDecode(PNG_DEC_WASM),
      initWebpDecode(WEBP_DEC_WASM),
      initWebpEncode(WEBP_ENC_WASM),
      initResize(RESIZE_WASM)
    ]).then(() => undefined);
  }
  return ready;
}