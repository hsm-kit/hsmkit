import { createToolPage } from '../../components/common';
import PinOffsetTool from '../../components/payment/PinOffsetTool';

export default createToolPage(PinOffsetTool, {
  seoKey: 'pinOffset',
  canonical: 'https://hsmkit.com/payments-pin-offset',
  toolName: 'PIN Offset Calculator (IBM 3624 Method)',
  toolCategory: 'FinanceApplication',
});
