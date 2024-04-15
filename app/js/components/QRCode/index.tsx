/**
 * @module index
 */

import { memo, useMemo } from 'react';

import { Image, ImageProps } from 'antd';
import { Alphanumeric, Byte, Encoder, EncoderOptions, Hanzi, Kanji, Numeric } from '@nuintun/qrcode';

export type Segment = Alphanumeric | Byte | Hanzi | Kanji | Numeric;

export interface QRCodeProps extends EncoderOptions, Omit<ImageProps, 'src'> {
  quietZone?: number;
  moduleSize?: number;
  background?: string;
  foreground?: string;
  segments: Segment | Segment[];
}

function hex2rgb(hex: string): [R: number, G: number, B: number] {
  const value = parseInt(hex.slice(1, 7), 16);

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export default memo(function QRCode({
  hints,
  level,
  encode,
  version,
  segments,
  quietZone,
  moduleSize,
  background = '#ffffff',
  foreground = '#000000',
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
