import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR: width (4), height (4), depth (1), colorType (1: RGBA=6), comp(0), filter(0), interlace(0)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const dstOffset = rowOffset + 1 + x * 4;
      scanlines[dstOffset] = rgbaBuffer[srcOffset];
      scanlines[dstOffset + 1] = rgbaBuffer[srcOffset + 1];
      scanlines[dstOffset + 2] = rgbaBuffer[srcOffset + 2];
      scanlines[dstOffset + 3] = rgbaBuffer[srcOffset + 3];
    }
  }

  const idatData = zlib.deflateSync(scanlines);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// 32x32 Cursor Canvas
const W = 32;
const H = 32;
const rgba = Buffer.alloc(W * H * 4); // all 0 (transparent)

// Palette:
const _ = [0, 0, 0, 0];           // Transparent
const B = [46, 26, 14, 255];       // Outline (#2e1a0e)
const O = [255, 174, 87, 255];     // Neko Main Orange (#ffae57)
const L = [255, 218, 150, 255];    // Highlight (#ffda96)
const D = [217, 124, 38, 255];     // Toast / Shadow (#d97c26)
const W_ = [255, 255, 255, 255];   // Eye sparkle white (#ffffff)
const E = [35, 20, 10, 255];       // Eye pupil (#23140a)

// Plump cute 8-bit fish cracker pointing top-left (mouth at x=2, y=2)
const art = [
  "   BBB                          ",
  "  BLLLB                         ",
  " BLEWLLB                        ",
  " BLLLLLLB                       ",
  " BLLOOOOOB         BB           ",
  "  BLOOOOOOB       BOOB          ",
  "  BOOOOOOOOB     BOOOB          ",
  "   BOOOOOOOOB   BOOOB           ",
  "   BOOOOOOOOOB BOOOB            ",
  "    BOOOOOOOOOBBODB             ",
  "     BOOOOOOOOBODBB             ",
  "     BODDDDDDDBBODBB            ",
  "      BODDDDDDDDODDB            ",
  "       BODDDDDDDDDDB            ",
  "        BODDDDDDDDDB            ",
  "         BBBBBBBBB              ",
  "                                ",
  "                                "
];

for (let y = 0; y < art.length; y++) {
  const line = art[y];
  for (let x = 0; x < line.length; x++) {
    const ch = line[x];
    let col = _;
    if (ch === 'B') col = B;
    else if (ch === 'O') col = O;
    else if (ch === 'L') col = L;
    else if (ch === 'D') col = D;
    else if (ch === 'W') col = W_;
    else if (ch === 'E') col = E;

    const idx = (y * W + x) * 4;
    rgba[idx] = col[0];
    rgba[idx + 1] = col[1];
    rgba[idx + 2] = col[2];
    rgba[idx + 3] = col[3];
  }
}

const png = createPNG(W, H, rgba);
fs.writeFileSync('public/oneko/treat.png', png);
console.log('Created public/oneko/treat.png (size:', png.length, 'bytes)');
