import { createToolPage } from '../../components/common';
import { ISO9797Tool } from '../../components/payment';

export default createToolPage(ISO9797Tool, {
  seoKey: 'iso9797Mac',
  canonical: 'https://hsmkit.com/payments-mac-iso9797-1',
  toolName: 'ISO 9797-1 MAC Calculator',
  toolCategory: 'SecurityApplication',
});
