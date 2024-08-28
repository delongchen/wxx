import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { LolProfileIconDir } from '../../config';

interface IconsInfo {
  type: string;
  version: string;
  data: {
    [key: number]: {
      id: number;
      image: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
    };
  };
}

const PngBuffer = readFileSync(path.join(LolProfileIconDir, 'profileicon0.png'));

const iconMap = JSON.parse(
  readFileSync(path.join(LolProfileIconDir, 'profileicon.json'), 'utf-8'),
) as IconsInfo;

const cache: Map<number, Buffer> = new Map();

export const getIcon = async (id: number) => {
  const exist = iconMap.data[id];
  if (exist === undefined) return null;

  const result = cache.get(id) ?? null;

  if (result === null) {
    const { x, y, w, h } = exist.image;

    const buf = await sharp(PngBuffer)
      .png()
      .extract({
        left: x,
        top: y,
        width: w,
        height: h,
      })
      .toBuffer()
      .catch(() => null);

    if (buf !== null) {
      cache.set(id, buf);
      return buf;
    }
  }

  return result;
};
