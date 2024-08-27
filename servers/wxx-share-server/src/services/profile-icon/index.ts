import sharp from 'sharp'
import { readFileSync } from 'node:fs'


interface IconsInfo {
  type: string
  version: string
  data: {
    [key: number]: {
      id: number
      image: {
        x: number
        y: number
        w: number
        h: number
      }
    }
  }
}

const PngBuffer = readFileSync(
  'C:\\Users\\cdlfg\\Desktop\\lol-icons\\profileicon0.png'
)

const iconMap = JSON.parse(readFileSync(
  'C:\\Users\\cdlfg\\Desktop\\lol-icons\\profileicon.json',
  "utf-8"
)) as IconsInfo

const cache: Map<number, Buffer> = new Map

export const getIcon = async (id: number) => {
  const exist = iconMap.data[id]
  if (exist === undefined) return null

  const result = cache.get(id) ?? null

  if (result === null) {
    const buf = await sharp(PngBuffer)
      .png()
      .extract({
        left: exist.image.x,
        top: exist.image.y,
        width: exist.image.w,
        height: exist.image.h,
      })
      .toBuffer()
      .catch(reason => {
        console.error(reason)
        return null
      })

    if (buf !== null) {
      cache.set(id, buf)
      return buf
    }
  }

  return result
}
