import React from 'react';
import { 
  KeyOutlined, 
  LockOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined,
  ReadOutlined,
  HomeOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Translations } from './locales';

type MenuItem = Required<MenuProps>['items'][number];

// 创建菜单配置
export const createMenuItems = (t: Translations): MenuItem[] => [
  { 
    label: t.menu.pki || 'PKI', 
    key: 'pki', 
    icon: React.createElement(SafetyCertificateOutlined),
    children: [
      { label: t.menu.asn1Decoder || 'ASN.1 Decoder', key: 'pki-asn1' },
      { label: t.menu.sslCertificates || 'SSL Certificates', key: 'pki-ssl' },
    ]
  },
  { 
    label: t.menu.generic || 'Generic', 
    key: 'generic', 
    icon: React.createElement(ToolOutlined),
    children: [
      { label: t.menu.hashes || 'Hashes', key: 'generic-hashes' },
      { label: t.menu.characterEncoding || 'Character Encoding', key: 'generic-encoding' },
      { label: t.menu.bcd || 'BCD', key: 'generic-bcd' },
      { label: t.menu.checkDigits || 'Check Digits', key: 'generic-checkdigits' },
      { label: t.menu.base64 || 'Base64', key: 'generic-base64' },
      { label: t.menu.base94 || 'Base94', key: 'generic-base94' },
      { label: t.menu.messageParser || 'Message Parser', key: 'generic-message' },
      { label: t.menu.rsaDerPublicKey || 'RSA DER Public Key', key: 'generic-rsader' },
      { label: t.menu.uuid || 'UUID', key: 'generic-uuid' },
    ]
  },
  { 
    label: t.menu.cipher || 'Cipher', 
    key: 'cipher', 
    icon: React.createElement(LockOutlined),
    children: [
      { label: 'AES', key: 'cipher-aes' },
      { label: 'DES', key: 'cipher-des' },
      { label: 'RSA', key: 'cipher-rsa' },
      { label: 'ECC (ECDSA)', key: 'cipher-ecc' },
      { label: 'FPE', key: 'cipher-fpe' },
    ]
  },
  { 
    label: t.menu.keys || 'Keys', 
    key: 'keys', 
    icon: React.createElement(KeyOutlined),
    children: [
      { label: t.menu.keysDea || 'Keys DEA', key: 'keys-dea' },
      { label: t.menu.keyshareGenerator || 'Keyshare Generator', key: 'keys-keyshare' },
      { 
        label: t.menu.keysHsm || 'Keys HSM', 
        key: 'keys-hsm',
        children: [
          { label: t.menu.keysFuturex || 'Keys Futurex', key: 'keys-hsm-futurex' },
          { label: t.menu.keysAtalla || 'Keys Atalla', key: 'keys-hsm-atalla' },
          { label: t.menu.keysSafeNet || 'Keys SafeNet', key: 'keys-hsm-safenet' },
          { label: t.menu.keysThales || 'Keys Thales', key: 'keys-hsm-thales' },
        ]
      },
      { 
        label: t.menu.keyBlocks || 'Key Blocks', 
        key: 'keys-blocks',
        children: [
          { label: t.menu.thalesKeyBlock || 'Thales Key Block', key: 'keys-blocks-thales' },
          { label: t.menu.tr31KeyBlock || 'TR-31 Key Block', key: 'keys-blocks-tr31' },
        ]
      },
    ]
  },
  { 
    label: t.menu.payments || 'Payments', 
    key: 'payments', 
    icon: React.createElement(CreditCardOutlined),
    children: [
      { label: t.menu.as2805 || 'AS2805', key: 'payments-as2805' },
      { label: t.menu.bitmap || 'Bitmap', key: 'payments-bitmap' },
      { 
        label: t.menu.cardValidation || 'Card Validation', 
        key: 'payments-card-validation',
        children: [
          { label: t.menu.cvvs || 'CVVs', key: 'payments-card-validation-cvvs' },
          { label: t.menu.amexCscs || 'AMEX CSCs', key: 'payments-card-validation-amex-cscs' },
          { label: t.menu.mastercardCvc3 || 'MasterCard dynamic CVC3', key: 'payments-card-validation-mastercard-cvc3' },
        ]
      },
      { 
        label: t.menu.dukpt || 'DUKPT', 
        key: 'payments-dukpt',
        children: [
          { label: t.menu.dukptIso9797 || 'DUKPT (ISO 9797)', key: 'payments-dukpt-iso9797' },
          { label: t.menu.dukptAes || 'DUKPT (AES)', key: 'payments-dukpt-aes' },
        ]
      },
      { 
        label: t.menu.macAlgorithms || 'MAC Algorithms', 
        key: 'payments-mac-algorithms',
        children: [
          { label: t.menu.iso9797_1 || 'ISO/IEC 9797-1', key: 'payments-mac-iso9797-1' },
          { label: t.menu.ansix9 || 'ANSI X9.9 & X9.19', key: 'payments-mac-ansix9' },
          { label: t.menu.as2805_4_1 || 'AS2805.4.1', key: 'payments-mac-as2805' },
          { label: t.menu.tdesCbcMac || 'TDES CBC-MAC', key: 'payments-mac-tdes-cbc-mac' },
          { label: t.menu.hmac || 'HMAC', key: 'payments-mac-hmac' },
          { label: t.menu.cmac || 'CMAC', key: 'payments-mac-cmac' },
          { label: t.menu.retail || 'Retail', key: 'payments-mac-retail' },
        ]
      },
      { 
        label: t.menu.pinBlocks || 'PIN Blocks', 
        key: 'payments-pin-blocks',
        children: [
          { label: t.menu.pinBlocksGeneral || 'PIN Blocks General', key: 'payments-pin-blocks-general' },
          { label: t.menu.pinBlocksAes || 'PIN Blocks AES', key: 'payments-pin-blocks-aes' },
        ]
      },
      { label: t.menu.pinOffset || 'PIN Offset', key: 'payments-pin-offset' },
      { label: t.menu.pinPvv || 'PIN PVV', key: 'payments-pin-pvv' },
      { label: t.menu.visaCertificates || 'Visa Certificates', key: 'payments-visa-certificates' },
      { label: t.menu.zka || 'ZKA', key: 'payments-zka' },
    ]
  },
];

// 移动端菜单项（包含首页和指南）
export const createMobileMenuItems = (t: Translations): MenuItem[] => [
  { label: t.common.home || 'Home', key: 'home', icon: React.createElement(HomeOutlined) },
  ...createMenuItems(t),
  { label: t.guides?.title || 'Guides', key: 'guides', icon: React.createElement(ReadOutlined) },
];
