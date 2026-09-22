import { createToolPage } from '../../components/common';
import { MastercardCVC3Tool } from '../../components/payment';

export default createToolPage(MastercardCVC3Tool, {
  seoKey: 'mastercardCvc3',
  canonical: 'https://hsmkit.com/payments-card-validation-mastercard-cvc3',
  toolName: 'Mastercard CVC3 Calculator',
  toolCategory: 'FinanceApplication',
});
