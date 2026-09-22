import { createToolPage } from '../../components/common';
import { AmexCSCTool } from '../../components/payment';

export default createToolPage(AmexCSCTool, {
  seoKey: 'amexCsc',
  canonical: 'https://hsmkit.com/payments-card-validation-amex-cscs',
  toolName: 'AMEX CSC Calculator and Validator',
  toolCategory: 'FinanceApplication',
});
