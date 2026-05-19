import React from 'react';
import { ToolPage } from '../../components/common';
import PinBlockAESTool from '../../components/payment/PinBlockAESTool';

const PinBlockAESPage: React.FC = () => (
  <ToolPage
    seoKey="pinBlockAes"
    canonical="https://hsmkit.com/payments-pin-blocks-aes"
    toolName="AES PIN Block Format 4 Encryption/Decryption"
    toolCategory="FinanceApplication"
  >
    <PinBlockAESTool />
  </ToolPage>
);

export default PinBlockAESPage;
