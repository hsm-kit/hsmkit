import { lazy } from 'react';

// 懒加载所有页面 - 减少首屏 JS 体积
// PKI Tools
export const HomePage = lazy(() => import('./pages/home/HomePage'));
export const ASN1Page = lazy(() => import('./pages/pki/ASN1Page'));
export const SSLCertificatesPage = lazy(() => import('./pages/pki/SSLCertificatesPage'));

// Cipher Tools
export const AESPage = lazy(() => import('./pages/cipher/AESPage'));
export const DESPage = lazy(() => import('./pages/cipher/DESPage'));
export const RSAPage = lazy(() => import('./pages/cipher/RSAPage'));
export const ECCPage = lazy(() => import('./pages/cipher/ECCPage'));
export const FPEPage = lazy(() => import('./pages/cipher/FPEPage'));

// Key Management
export const KeyGeneratorPage = lazy(() => import('./pages/keys/KeyGeneratorPage'));
export const TR31Page = lazy(() => import('./pages/keys/TR31Page'));
export const KeysharePage = lazy(() => import('./pages/keys/KeysharePage'));
export const FuturexKeysPage = lazy(() => import('./pages/keys/FuturexKeysPage'));
export const AtallaKeysPage = lazy(() => import('./pages/keys/AtallaKeysPage'));
export const SafeNetKeysPage = lazy(() => import('./pages/keys/SafeNetKeysPage'));
export const ThalesKeysPage = lazy(() => import('./pages/keys/ThalesKeysPage'));
export const ThalesKeyBlockPage = lazy(() => import('./pages/keys/ThalesKeyBlockPage'));

// Payment
export const AS2805Page = lazy(() => import('./pages/payment/AS2805Page'));
export const BitmapPage = lazy(() => import('./pages/payment/BitmapPage'));
export const CVVPage = lazy(() => import('./pages/payment/CVVPage'));
export const AmexCSCPage = lazy(() => import('./pages/payment/AmexCSCPage'));
export const MastercardCVC3Page = lazy(() => import('./pages/payment/MastercardCVC3Page'));
export const DUKPTPage = lazy(() => import('./pages/payment/DUKPTPage'));
export const DUKPTAESPage = lazy(() => import('./pages/payment/DUKPTAESPage'));

// MAC Tools
export const ISO9797Page = lazy(() => import('./pages/payment/ISO9797Page'));
export const ANSIMACPage = lazy(() => import('./pages/payment/ANSIMACPage'));
export const AS2805MACPage = lazy(() => import('./pages/payment/AS2805MACPage'));
export const TDESCBCMACPage = lazy(() => import('./pages/payment/TDESCBCMACPage'));
export const HMACPage = lazy(() => import('./pages/payment/HMACPage'));
export const CMACPage = lazy(() => import('./pages/payment/CMACPage'));
export const RetailMACPage = lazy(() => import('./pages/payment/RetailMACPage'));

// PIN Block Tools
export const PinBlockGeneralPage = lazy(() => import('./pages/payment/PinBlockGeneralPage'));
export const PinBlockAESPage = lazy(() => import('./pages/payment/PinBlockAESPage'));
export const PinOffsetPage = lazy(() => import('./pages/payment/PinOffsetPage'));
export const PinPVVPage = lazy(() => import('./pages/payment/PinPVVPage'));

// VISA Tools
export const VISACertificatesPage = lazy(() => import('./pages/payment/VISACertificatesPage'));

// ZKA Tools
export const ZKAPage = lazy(() => import('./pages/payment/ZKAPage'));

// Generic Tools
export const HashPage = lazy(() => import('./pages/generic/HashPage'));
export const CharacterEncodingPage = lazy(() => import('./pages/generic/CharacterEncodingPage'));
export const BCDPage = lazy(() => import('./pages/generic/BCDPage'));
export const CheckDigitsPage = lazy(() => import('./pages/generic/CheckDigitsPage'));
export const Base64Page = lazy(() => import('./pages/generic/Base64Page'));
export const Base94Page = lazy(() => import('./pages/generic/Base94Page'));
export const MessageParserPage = lazy(() => import('./pages/generic/MessageParserPage'));
export const RSADerPublicKeyPage = lazy(() => import('./pages/generic/RSADerPublicKeyPage'));
export const UUIDPage = lazy(() => import('./pages/generic/UUIDPage'));

// Legal Pages
export const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
export const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage'));
export const DisclaimerPage = lazy(() => import('./pages/legal/DisclaimerPage'));

// Guides Pages
export const GuidesListPage = lazy(() => import('./pages/guides/GuidesListPage'));
export const GuideDetailPage = lazy(() => import('./pages/guides/GuideDetailPage'));
