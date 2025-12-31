/**
 * 将 SVG favicon 转换为 PNG 格式
 * Google 搜索结果需要 PNG 格式的 favicon
 * 
 * 运行: node scripts/generate-favicon-png.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [48, 192, 512];
const svgPath = path.join(__dirname, '../public/favicon.svg');
const publicDir = path.join(__dirname, '../public');

async function generatePNGs() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `favicon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated favicon-${size}.png`);
  }
  
  // 也生成 apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');
  
  console.log('\n完成！请更新 index.html 添加 PNG favicon 引用。');
}

generatePNGs().catch(console.error);

