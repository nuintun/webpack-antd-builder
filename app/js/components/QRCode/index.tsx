/**
 * @module index
 */

import { memo, useMemo } from 'react';
import { Image, ImageProps } from 'antd';
import { Alphanumeric, Byte, Encoder, EncoderOptions, Hanzi, Kanji, Numeric } from '@nuintun/qrcode';

type HEX = `#${string}`;

type Segment = Alphanumeric | Byte | Hanzi | Kanji | Numeric;

const SHORT_HEX_RE = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;

function hex2rgb(hex: HEX): [R: number, G: number, B: number] {
  hex = hex.replace(SHORT_HEX_RE, (_match, r, g, b, a = '') => {
    return `#${r + r + g + g + b + b + a + a}`;
  }) as HEX;

  const value = parseInt(hex.slice(1, 7), 16);

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export interface QRCodeProps extends EncoderOptions, Omit<ImageProps, 'src'> {
  background?: HEX;
  foreground?: HEX;
  quietZone?: number;
  moduleSize?: number;
  segments: Segment | Segment[];
}

export default memo(function QRCode({
  hints,
  level,
  encode,
  version,
  segments,
  quietZone,
  moduleSize,
  background = '#fff',
  foreground = '#000',
  ...props
}: QRCodeProps) {
  const src = useMemo(() => {
    segments = Array.isArray(segments) ? segments : [segments];

    const encoder = new Encoder({ hints, level, encode, version });

    return encoder.encode(...segments).toDataURL(moduleSize, {
      margin: quietZone,
      background: hex2rgb(background),
      foreground: hex2rgb(foreground)
    });
  }, [hints, level, encode, version, segments, quietZone, moduleSize, background, foreground]);

  return <Image {...props} src={src} />;
});
