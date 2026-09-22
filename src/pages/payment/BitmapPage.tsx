import { createToolPage } from '../../components/common';
import { BitmapTool } from '../../components/payment';

export default createToolPage(BitmapTool, {
  seoKey: 'bitmap',
  canonical: 'https://hsmkit.com/payments-bitmap',
  toolName: 'ISO8583 Bitmap Encoder/Decoder',
  toolCategory: 'FinanceApplication',
});
