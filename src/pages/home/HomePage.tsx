import React, { useState, useMemo, useEffect } from 'react';
import { Card, Typography, Row, Col, Input, Tag, Button, Tooltip, Space, AutoComplete } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSearchOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  SecurityScanOutlined,
  NumberOutlined,
  SwapOutlined,
  FieldBinaryOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CodeOutlined,
  ReadOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  BlockOutlined,
  SplitCellsOutlined,
  CloudOutlined,
  DatabaseOutlined,
  InsuranceOutlined,
  ContainerOutlined,
  PartitionOutlined,
  ApiOutlined,
  ShoppingOutlined,
  InteractionOutlined,
  BarsOutlined,
  AppstoreAddOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { PageLayout } from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { useRecentTools } from '../../hooks/useRecentTools';
import seoContent from '../../locales/seo';

const { Title, Text, Paragraph } = Typography;

type Category = 'all' | 'symmetric' | 'asymmetric' | 'payment' | 'encoding' | 'hashing';
type ViewMode = 'grid' | 'list';

// Static tool configuration - moved outside component to prevent recreation on each render
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ToolConfig {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  path: string;
  color: string;
  category: Category;
  keywords: string[];
  difficulty: Difficulty;
}

const toolConfigs: ToolConfig[] = [
  // Symmetric Encryption
  { icon: <LockOutlined />, titleKey: 'aes', descKey: 'aes', path: '/aes-encryption', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'symmetric', keywords: ['aes', 'encryption', 'symmetric', 'block cipher', '128', '192', '256', 'cbc', 'ecb', 'ctr'], difficulty: 'intermediate' },
  { icon: <UnlockOutlined />, titleKey: 'des', descKey: 'des', path: '/des-encryption', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'symmetric', keywords: ['des', '3des', 'triple des', 'encryption', 'symmetric', 'block cipher'], difficulty: 'intermediate' },
  { icon: <InteractionOutlined />, titleKey: 'fpe', descKey: 'fpe', path: '/fpe-encryption', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'symmetric', keywords: ['fpe', 'format preserving', 'ff1', 'ff3', 'tokenization'], difficulty: 'intermediate' },
  // Asymmetric Encryption
  { icon: <SecurityScanOutlined />, titleKey: 'rsa', descKey: 'rsa', path: '/rsa-encryption', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'asymmetric', keywords: ['rsa', 'public key', 'private key', 'asymmetric', 'pkcs', 'oaep'], difficulty: 'intermediate' },
  { icon: <ApiOutlined />, titleKey: 'ecc', descKey: 'ecc', path: '/ecc-encryption', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'asymmetric', keywords: ['ecc', 'ecdsa', 'elliptic curve', 'secp256k1', 'signature', 'bitcoin'], difficulty: 'intermediate' },
  { icon: <SafetyOutlined />, titleKey: 'rsaDer', descKey: 'rsaDer', path: '/rsa-der-public-key', color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', category: 'asymmetric', keywords: ['rsa', 'der', 'asn1', 'public key', 'pem', 'modulus', 'exponent'], difficulty: 'intermediate' },
  { icon: <SafetyCertificateOutlined />, titleKey: 'sslCert', descKey: 'sslCert', path: '/ssl-certificates', color: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', category: 'asymmetric', keywords: ['ssl', 'certificate', 'x509', 'csr', 'pem', 'rsa', 'pki', 'self-signed', 'openssl'], difficulty: 'intermediate' },
  // Payment/Finance Tools
  { icon: <BlockOutlined />, titleKey: 'tr31', descKey: 'tr31', path: '/tr31-key-block', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', category: 'payment', keywords: ['tr31', 'key block', 'ansi', 'key management', 'hsm', 'payment'], difficulty: 'advanced' },
  { icon: <AppstoreAddOutlined />, titleKey: 'pinBlockGeneral', descKey: 'pinBlockGeneral', path: '/payments-pin-blocks-general', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'payment', keywords: ['pin block', 'iso 9564', 'format 0', 'format 1', 'format 2', 'format 3', 'format 4', 'encode', 'decode', 'general'], difficulty: 'intermediate' },
  { icon: <BarsOutlined />, titleKey: 'pinBlockAes', descKey: 'pinBlockAes', path: '/payments-pin-blocks-aes', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'payment', keywords: ['pin block', 'aes', 'format 4', 'iso 9564', 'encryption', 'aes-128', 'ecb'], difficulty: 'intermediate' },
  { icon: <CalculatorOutlined />, titleKey: 'pinOffset', descKey: 'pinOffset', path: '/payments-pin-offset', color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', category: 'payment', keywords: ['pin offset', 'ibm 3624', 'pin verification', 'decimalization', 'validation data', 'pvv'], difficulty: 'advanced' },
  { icon: <SecurityScanOutlined />, titleKey: 'pinPvv', descKey: 'pinPvv', path: '/payments-pin-pvv', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', category: 'payment', keywords: ['pin pvv', 'visa pvv', 'pin verification value', 'pdk', 'pvki', 'tsp', 'decimalization'], difficulty: 'advanced' },
  { icon: <SafetyCertificateOutlined />, titleKey: 'visaCertificates', descKey: 'visaCertificates', path: '/payments-visa-certificates', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', category: 'payment', keywords: ['visa', 'certificates', 'issuer certificate', 'ca key', 'vsdc', 'emv', 'certificate validation', 'rsa signature', 'ca v92', 'ca v94'], difficulty: 'advanced' },
  { icon: <KeyOutlined />, titleKey: 'keyGenerator', descKey: 'keyGenerator', path: '/keys-dea', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', category: 'payment', keywords: ['key generator', 'random', 'des', 'aes', 'key component', 'xor', 'keys dea'], difficulty: 'intermediate' },
  { icon: <SplitCellsOutlined />, titleKey: 'keyshareGenerator', descKey: 'keyshareGenerator', path: '/keyshare-generator', color: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', category: 'payment', keywords: ['keyshare', 'key share', 'key component', 'split', 'kcv', 'pin'], difficulty: 'advanced' },
  { icon: <CloudOutlined />, titleKey: 'futurexKeys', descKey: 'futurexKeys', path: '/futurex-keys', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'payment', keywords: ['futurex', 'hsm', 'key encryption', 'mfk', 'variant', 'key lookup'], difficulty: 'advanced' },
  { icon: <DatabaseOutlined />, titleKey: 'atallaKeys', descKey: 'atallaKeys', path: '/atalla-keys', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'payment', keywords: ['atalla', 'akb', 'hsm', 'key block', 'mfk', 'mac'], difficulty: 'advanced' },
  { icon: <InsuranceOutlined />, titleKey: 'safeNetKeys', descKey: 'safeNetKeys', path: '/safenet-keys', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'payment', keywords: ['safenet', 'hsm', 'key encryption', 'km key', 'variant', 'key lookup'], difficulty: 'advanced' },
  { icon: <ContainerOutlined />, titleKey: 'thalesKeys', descKey: 'thalesKeys', path: '/thales-keys', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'payment', keywords: ['thales', 'hsm', 'lmk', 'key encryption', 'variant', 'key lookup'], difficulty: 'advanced' },
  { icon: <PartitionOutlined />, titleKey: 'thalesKeyBlock', descKey: 'thalesKeyBlock', path: '/thales-key-block', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'payment', keywords: ['thales', 'key block', 'kbpk', 'encode', 'decode'], difficulty: 'advanced' },
  { icon: <AppstoreOutlined />, titleKey: 'bitmap', descKey: 'bitmap', path: '/payments-bitmap', color: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', category: 'payment', keywords: ['iso 8583', 'bitmap', 'payment message', 'field indicator', 'primary', 'secondary', 'financial', 'transaction'], difficulty: 'intermediate' },
  { icon: <CreditCardOutlined />, titleKey: 'cvv', descKey: 'cvv', path: '/payments-card-validation-cvvs', color: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', category: 'payment', keywords: ['cvv', 'cvc', 'icvv', 'cvv2', 'dcvv', 'card verification', 'cvk', 'payment security'], difficulty: 'intermediate' },
  { icon: <CreditCardOutlined />, titleKey: 'amexCsc', descKey: 'amexCsc', path: '/payments-card-validation-amex-cscs', color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', category: 'payment', keywords: ['amex', 'csc', 'american express', 'card security code', 'csc3', 'csc4', 'csc5'], difficulty: 'intermediate' },
  { icon: <CreditCardOutlined />, titleKey: 'mastercardCvc3', descKey: 'mastercardCvc3', path: '/payments-card-validation-mastercard-cvc3', color: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', category: 'payment', keywords: ['mastercard', 'cvc3', 'dynamic cvc', 'contactless', 'emv', 'imk', 'atc'], difficulty: 'intermediate' },
  { icon: <FileSearchOutlined />, titleKey: 'as2805', descKey: 'as2805', path: '/payments-as2805', color: 'linear-gradient(135deg, #ffd6a5 0%, #ffd666 100%)', category: 'payment', keywords: ['as2805', 'iso8583', 'payment', 'financial'], difficulty: 'advanced' },
  { icon: <SecurityScanOutlined />, titleKey: 'ansiMac', descKey: 'ansiMac', path: '/payments-mac-ansix9', color: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)', category: 'payment', keywords: ['ansi mac', 'x9.9', 'x9.19', 'wholesale mac', 'retail mac', 'des', '3des', 'financial mac', 'payment mac', 'message authentication'], difficulty: 'intermediate' },
  { icon: <SafetyCertificateOutlined />, titleKey: 'as2805Mac', descKey: 'as2805Mac', path: '/payments-mac-as2805', color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', category: 'payment', keywords: ['as2805 mac', 'australian mac', 'eftpos mac', 'as2805.4.1', 'method 1', 'method 2', 'des mac', '3des mac', 'payment mac', 'message authentication'], difficulty: 'intermediate' },
  { icon: <LockOutlined />, titleKey: 'tdesCbcMac', descKey: 'tdesCbcMac', path: '/payments-mac-tdes-cbc-mac', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'payment', keywords: ['tdes cbc-mac', 'triple des mac', '3des mac', 'cbc mode', 'iso 9797-1', 'padding', 'message authentication', 'payment mac', 'financial mac', 'pci dss', 'emv mac'], difficulty: 'intermediate' },
  { icon: <SafetyOutlined />, titleKey: 'hmac', descKey: 'hmac', path: '/payments-mac-hmac', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'payment', keywords: ['hmac', 'sha256', 'sha512', 'hash-based mac', 'rfc 2104', 'api authentication', 'jwt', 'webhook', 'message authentication', 'api security', 'oauth'], difficulty: 'intermediate' },
  { icon: <ThunderboltOutlined />, titleKey: 'cmac', descKey: 'cmac', path: '/payments-mac-cmac', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'payment', keywords: ['cmac', 'aes-cmac', 'tdes-cmac', '3des-cmac', 'cipher-based mac', 'nist sp 800-38b', 'message authentication', 'aes cmac 96', 'block cipher mac', 'payment mac', 'financial mac'], difficulty: 'intermediate' },
  { icon: <ShoppingOutlined />, titleKey: 'retailMac', descKey: 'retailMac', path: '/payments-mac-retail', color: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', category: 'payment', keywords: ['retail mac', 'des mac', '3des mac', 'iso 9797-1', 'method 2 padding', 'payment mac', 'financial mac', 'pos mac', 'atm security', '3des finalization'], difficulty: 'intermediate' },
  { icon: <SecurityScanOutlined />, titleKey: 'iso9797', descKey: 'iso9797', path: '/payments-mac-iso9797-1', color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', category: 'payment', keywords: ['iso 9797', 'iso 9797-1', 'mac', 'message authentication', 'des', '3des', 'cbc-mac', 'algorithm 1', 'algorithm 2', 'algorithm 3', 'padding method', 'financial mac'], difficulty: 'intermediate' },
  { icon: <BankOutlined />, titleKey: 'zka', descKey: 'zka', path: '/payments-zka', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'payment', keywords: ['zka', 'german banking', 'session key derivation', 'sk derivation', 'pin encryption', 'mac calculation', 'tdes', '3des', 'german payment standard', 'banking cryptography'], difficulty: 'advanced' },
  { icon: <ReadOutlined />, titleKey: 'messageParser', descKey: 'messageParser', path: '/message-parser', color: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', category: 'payment', keywords: ['message parser', 'ndc', 'wincor', 'iso 8583', 'atm', 'financial'], difficulty: 'intermediate' },
  { icon: <KeyOutlined />, titleKey: 'dukpt', descKey: 'dukpt', path: '/payments-dukpt-iso9797', color: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)', category: 'payment', keywords: ['dukpt', 'iso 9797', 'bdk', 'ipek', 'ksn', 'pek', 'pin', 'mac', 'pos', 'atm', 'key derivation'], difficulty: 'advanced' },
  { icon: <SafetyOutlined />, titleKey: 'dukptAes', descKey: 'dukptAes', path: '/payments-dukpt-aes', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'payment', keywords: ['dukpt', 'aes', 'aes-128', 'aes-192', 'aes-256', '2tdea', '3tdea', 'working key', 'bdk', 'ksn', 'pek', 'mac gen', 'dek'], difficulty: 'advanced' },
  // Encoding Tools
  { icon: <SwapOutlined />, titleKey: 'encoding', descKey: 'encoding', path: '/character-encoding', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', category: 'encoding', keywords: ['encoding', 'ascii', 'ebcdic', 'hex', 'binary', 'character'], difficulty: 'beginner' },
  { icon: <FieldBinaryOutlined />, titleKey: 'bcd', descKey: 'bcd', path: '/bcd', color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', category: 'encoding', keywords: ['bcd', 'binary coded decimal', 'packed', 'unpacked'], difficulty: 'beginner' },
  { icon: <FileTextOutlined />, titleKey: 'base64', descKey: 'base64', path: '/base64', color: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)', category: 'encoding', keywords: ['base64', 'encode', 'decode', 'binary', 'text'], difficulty: 'beginner' },
  { icon: <CodeOutlined />, titleKey: 'base94', descKey: 'base94', path: '/base94', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', category: 'encoding', keywords: ['base94', 'encode', 'decode', 'compact'], difficulty: 'beginner' },
  { icon: <FileSearchOutlined />, titleKey: 'asn1', descKey: 'asn1', path: '/asn1-parser', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'encoding', keywords: ['asn1', 'der', 'ber', 'x509', 'certificate', 'pkcs'], difficulty: 'beginner' },
  // Hashing Tools
  { icon: <NumberOutlined />, titleKey: 'hash', descKey: 'hash', path: '/hashes', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', category: 'hashing', keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'blake2', 'ripemd', 'checksum'], difficulty: 'beginner' },
  { icon: <CheckCircleOutlined />, titleKey: 'checkDigits', descKey: 'checkDigits', path: '/check-digits', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', category: 'hashing', keywords: ['check digit', 'luhn', 'mod 10', 'mod 9', 'credit card', 'validation'], difficulty: 'beginner' },
  { icon: <ThunderboltOutlined />, titleKey: 'uuid', descKey: 'uuid', path: '/uuid', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'hashing', keywords: ['uuid', 'guid', 'unique', 'identifier', 'v1', 'v4', 'v5'], difficulty: 'beginner' },
];

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
  isDark: boolean;
  viewMode: ViewMode;
  onClick?: () => void;
  difficulty?: Difficulty;
}

// 网格视图卡片
const GridCard: React.FC<Omit<ToolCardProps, 'viewMode'>> = ({ icon, title, description, path, color, isDark, onClick, difficulty }) => {
  const { t } = useLanguage();
  const difficultyLabel = difficulty === 'beginner' ? (t.common?.beginner || 'Beginner')
    : difficulty === 'intermediate' ? (t.common?.intermediate || 'Intermediate')
    : (t.common?.advanced || 'Advanced');

  return (
  <Link to={path} style={{ textDecoration: 'none' }} onClick={onClick}>
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 12,
        border: 'none',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        background: isDark ? '#1f1f1f' : '#fff',
      }}
      styles={{
        body: { padding: 24 }
      }}
    >
      <div style={{ 
        width: 56, 
        height: 56, 
        borderRadius: 12, 
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        fontSize: 24,
        color: '#fff'
      }}>
        {icon}
      </div>
      <Title level={5} style={{ marginBottom: 8, color: isDark ? '#e6e6e6' : '#1e293b' }}>{title}</Title>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>{description}</Text>
      {difficulty && (
        <div style={{ marginTop: 8 }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: 11,
            borderRadius: 4,
            background: difficulty === 'beginner' ? (isDark ? '#1a2e1a' : '#f0fdf4')
              : difficulty === 'intermediate' ? (isDark ? '#1a1e2e' : '#eff6ff')
              : (isDark ? '#2a1a1a' : '#fef2f2'),
            color: difficulty === 'beginner' ? (isDark ? '#4ade80' : '#16a34a')
              : difficulty === 'intermediate' ? (isDark ? '#60a5fa' : '#2563eb')
              : (isDark ? '#f87171' : '#dc2626'),
            border: `1px solid ${difficulty === 'beginner' ? (isDark ? '#274916' : '#bbf7d0')
              : difficulty === 'intermediate' ? (isDark ? '#1e3a5f' : '#bfdbfe')
              : (isDark ? '#58181c' : '#fecaca')}`,
          }}>
            {difficultyLabel}
          </span>
        </div>
      )}
    </Card>
  </Link>
  );
};

// 列表视图卡片 - 更紧凑
const ListCard: React.FC<Omit<ToolCardProps, 'viewMode'>> = ({ icon, title, path, color, isDark, onClick }) => (
  <Link to={path} style={{ textDecoration: 'none', display: 'block' }} onClick={onClick}>
    <Tooltip title={title} placement="top" mouseLeaveDelay={0}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 10,
          background: isDark ? '#1f1f1f' : '#fff',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)';
        }}
      >
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 8, 
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          color: '#fff',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <Text strong style={{ 
          color: isDark ? '#e6e6e6' : '#1e293b',
          fontSize: 14,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </Text>
      </div>
    </Tooltip>
  </Link>
);

const ToolCard: React.FC<ToolCardProps> = (props) => {
  if (props.viewMode === 'list') {
    return <ListCard {...props} />;
  }
  return <GridCard {...props} />;
};

const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const seo = seoContent[language]?.home || seoContent.en.home;
  const home = t.home;
  const { recentTools, addRecentTool, clearRecentTools } = useRecentTools();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Press / to focus search box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const input = document.querySelector('.ant-input-search input') as HTMLInputElement;
        if (input) input.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate tools with translations - only recalculates when language changes
  const tools = useMemo(() => 
    toolConfigs.map(config => ({
      icon: config.icon,
      title: (home.tools as Record<string, { title: string; description: string }>)[config.titleKey]?.title || config.titleKey,
      description: (home.tools as Record<string, { title: string; description: string }>)[config.descKey]?.description || '',
      path: config.path,
      color: config.color,
      category: config.category,
      keywords: config.keywords,
      difficulty: config.difficulty,
    })),
    [home.tools]
  );

  // 基于搜索词过滤的工具列表（用于计算分类计数）
  const searchFilteredTools = useMemo(() => {
    if (!searchTerm.trim()) {
      return tools;
    }
    const search = searchTerm.toLowerCase();
    // 难度关键词映射（支持多语言搜索）
    const difficultyKeywords: Record<string, Difficulty> = {
      'beginner': 'beginner', '入门': 'beginner', '初級': 'beginner', '초급': 'beginner', 'anfänger': 'beginner', 'débutant': 'beginner',
      'intermediate': 'intermediate', '进阶': 'intermediate', '中級': 'intermediate', '중급': 'intermediate', 'fortgesritten': 'intermediate', 'intermédiaire': 'intermediate',
      'advanced': 'advanced', '高级': 'advanced', '上級': 'advanced', '고급': 'advanced', 'experte': 'advanced', 'avancé': 'advanced',
    };
    return tools.filter(tool => {
      const matchTitle = tool.title.toLowerCase().includes(search);
      const matchDesc = tool.description.toLowerCase().includes(search);
      const matchKeywords = tool.keywords.some(kw => kw.includes(search));
      const matchDifficulty = tool.difficulty === (difficultyKeywords[search] as Difficulty);
      return matchTitle || matchDesc || matchKeywords || matchDifficulty;
    });
  }, [tools, searchTerm]);

  // 计算每个分类的工具数量（基于搜索结果）
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: searchFilteredTools.length,
      symmetric: 0,
      asymmetric: 0,
      payment: 0,
      encoding: 0,
      hashing: 0,
    };
    searchFilteredTools.forEach(tool => {
      counts[tool.category]++;
    });
    return counts;
  }, [searchFilteredTools]);

  // 计算每个难度的工具数量（基于搜索结果）
  const difficultyCounts = useMemo(() => {
    const counts: Record<Difficulty | 'all', number> = {
      all: searchFilteredTools.length,
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };
    searchFilteredTools.forEach(tool => {
      counts[tool.difficulty]++;
    });
    return counts;
  }, [searchFilteredTools]);

  // 计算有效的活动分类（当搜索导致当前分类计数为 0 时，自动使用 'all'）
  const effectiveCategory = useMemo(() => {
    if (activeCategory !== 'all' && categoryCounts[activeCategory] === 0) {
      return 'all';
    }
    return activeCategory;
  }, [activeCategory, categoryCounts]);

  // 过滤工具（分类 + 难度 + 搜索）
  const filteredTools = useMemo(() => {
    return searchFilteredTools.filter(tool => {
      // 分类过滤
      if (effectiveCategory !== 'all' && tool.category !== effectiveCategory) {
        return false;
      }
      // 难度过滤
      if (activeDifficulty !== 'all' && tool.difficulty !== activeDifficulty) {
        return false;
      }
      return true;
    });
  }, [searchFilteredTools, effectiveCategory, activeDifficulty]);

  // 搜索建议（模糊匹配）
  const searchOptions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    const search = searchTerm.toLowerCase();
    return tools
      .filter(tool => {
        const title = tool.title.toLowerCase();
        const desc = tool.description.toLowerCase();
        const kw = tool.keywords;
        return title.includes(search) || desc.includes(search) || kw.some(k => k.includes(search));
      })
      .slice(0, 8)
      .map(tool => ({
        value: tool.path,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: tool.color, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, flexShrink: 0,
            }}>
              {tool.icon}
            </div>
            <span style={{ fontSize: 14 }}>{tool.title}</span>
          </div>
        ),
      }));
  }, [searchTerm, tools]);

  // Early return if no SEO content
  if (!seo) {
    return null;
  }

  // 分类定义
  const categories: { key: Category; label: string; color: string }[] = [
    { key: 'all', label: home.categories.all, color: '#722ed1' },
    { key: 'symmetric', label: home.categories.symmetric, color: '#1677ff' },
    { key: 'asymmetric', label: home.categories.asymmetric, color: '#722ed1' },
    { key: 'payment', label: home.categories.payment, color: '#faad14' },
    { key: 'encoding', label: home.categories.encoding, color: '#13c2c2' },
    { key: 'hashing', label: home.categories.hashing, color: '#52c41a' },
  ];

  // 搜索并跳转
  const handleSearch = (value: string) => {
    if (value.trim()) {
      const search = value.toLowerCase().trim();
      const match = tools.find(tool => {
        const matchTitle = tool.title.toLowerCase().includes(search);
        const matchKeywords = tool.keywords.some(kw => kw.includes(search));
        return matchTitle || matchKeywords;
      });
      if (match) {
        addRecentTool({ path: match.path, title: match.title, color: match.color });
        navigate(match.path);
      }
    }
  };

  // 点击搜索建议
  const handleSelect = (value: string) => {
    const tool = tools.find(t => t.path === value);
    if (tool) {
      addRecentTool({ path: tool.path, title: tool.title, color: tool.color });
    }
    navigate(value);
    setSearchTerm('');
  };

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text, index) => (
            <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 12 }}>
              • {text}
            </Paragraph>
          ))}
        </div>
      }
    >
      {/* Hero Section with Search */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48,
        padding: '48px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: '#fff'
      }}>
        <Title level={1} style={{ color: '#fff', marginBottom: 16, fontSize: 'clamp(28px, 5vw, 42px)' }}>
          HSM Kit
        </Title>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, marginBottom: 24 }}>
          {home.heroTitle}
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.85)', 
          fontSize: 16, 
          maxWidth: 700, 
          margin: '0 auto 32px',
          lineHeight: 1.8
        }}>
          {home.heroDescription}
        </Paragraph>
        
        {/* Search Bar with AutoComplete */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          <AutoComplete
            options={searchOptions}
            onSearch={setSearchTerm}
            onSelect={handleSelect}
            value={searchTerm}
            onChange={setSearchTerm}
            style={{ width: '100%' }}
            popupMatchSelectWidth={true}
          >
            <Input.Search
              placeholder={home.searchPlaceholder}
              size="large"
              enterButton={<SearchOutlined style={{ fontSize: 18 }} />}
              allowClear
              onSearch={handleSearch}
            />
          </AutoComplete>
        </div>
        {/* Keyboard shortcut hint */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 12,
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
        }}>
          <kbd style={{
            display: 'inline-block',
            padding: '2px 6px',
            fontSize: 11,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'monospace',
          }}>/</kbd>
          {' '}to search
        </div>
      </div>

      {/* Recently Used - compact inline */}
      {recentTools.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#999', flexShrink: 0 }}>
            🕐 {home.recentlyUsed || 'Recently Used'}:
          </Text>
          {recentTools.map(tool => (
            <Link key={tool.path} to={tool.path} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 12,
                background: isDark ? '#262626' : '#f5f5f5',
                fontSize: 12, color: isDark ? '#ccc' : '#555',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: tool.color, flexShrink: 0,
                }} />
                {tool.title}
              </span>
            </Link>
          ))}
          <Button
            type="text"
            size="small"
            onClick={clearRecentTools}
            style={{ fontSize: 11, color: isDark ? '#666' : '#bbb', padding: '0 4px', minWidth: 'auto' }}
          >
            ✕
          </Button>
        </div>
      )}

      {/* Combined Filters: Category + Difficulty */}
      <div 
        className="home-filter-panel"
        style={{ 
          marginBottom: 32, 
          padding: '16px 20px',
          borderRadius: 12,
          background: isDark ? '#1a1a1a' : '#f8f9fb',
          border: `1px solid ${isDark ? '#262626' : '#f0f0f0'}`,
        }}
      >
        {/* Category row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <Text className="filter-label" style={{ fontSize: 11, color: isDark ? '#666' : '#999', width: 52, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Type
          </Text>
          {categories.map(cat => {
            const count = categoryCounts[cat.key];
            const isDisabled = count === 0 && cat.key !== 'all';
            const isActive = effectiveCategory === cat.key;
            return (
              <Tag
                key={cat.key}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-pressed={isActive}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && setActiveCategory(cat.key)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                    e.preventDefault();
                    setActiveCategory(cat.key);
                  }
                }}
                style={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  padding: '3px 12px',
                  fontSize: 12,
                  borderRadius: 12,
                  border: isActive ? 'none' : `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
                  background: isDisabled
                    ? 'transparent'
                    : isActive ? cat.color : 'transparent',
                  color: isDisabled
                    ? (isDark ? '#444' : '#ccc')
                    : isActive ? '#fff' : (isDark ? '#aaa' : '#666'),
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'all 0.15s',
                  lineHeight: 1.6,
                }}
              >
                {cat.label} ({count})
              </Tag>
            );
          })}
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: isDark ? '#262626' : '#eee', margin: '0 0 12px 0' }} />
        {/* Difficulty row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text className="filter-label" style={{ fontSize: 11, color: isDark ? '#666' : '#999', width: 52, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Level
          </Text>
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => {
            const count = difficultyCounts[level];
            const isActive = activeDifficulty === level;
            const isDisabled = count === 0 && level !== 'all';
            const label = level === 'all' ? (home.difficultyAll || 'All')
              : level === 'beginner' ? (t.common?.beginner || 'Beginner')
              : level === 'intermediate' ? (t.common?.intermediate || 'Intermediate')
              : (t.common?.advanced || 'Advanced');
            const color = level === 'all' ? '#722ed1'
              : level === 'beginner' ? '#16a34a'
              : level === 'intermediate' ? '#2563eb'
              : '#dc2626';
            return (
              <Tag
                key={level}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-pressed={isActive}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && setActiveDifficulty(level)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                    e.preventDefault();
                    setActiveDifficulty(level);
                  }
                }}
                style={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  padding: '3px 12px',
                  fontSize: 12,
                  borderRadius: 12,
                  border: isActive ? 'none' : `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
                  background: isDisabled
                    ? 'transparent'
                    : isActive ? color : 'transparent',
                  color: isDisabled
                    ? (isDark ? '#444' : '#ccc')
                    : isActive ? '#fff' : (isDark ? '#aaa' : '#666'),
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'all 0.15s',
                  lineHeight: 1.6,
                }}
              >
                {label} ({count})
              </Tag>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0, color: isDark ? '#e6e6e6' : '#1e293b' }}>
          🔧 {home.availableTools}
          {effectiveCategory !== 'all' && (
            <span style={{ 
              fontSize: '0.7em', 
              fontWeight: 400, 
              marginLeft: 8,
              color: isDark ? '#8c8c8c' : '#8c8c8c'
            }}>
              — {categories.find(c => c.key === effectiveCategory)?.label}
            </span>
          )}
        </Title>
        <Space.Compact>
          <Tooltip title={home.gridView} mouseLeaveDelay={0}>
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreAddOutlined />}
              onClick={() => setViewMode('grid')}
              aria-label={home.gridView || 'Grid view'}
            />
          </Tooltip>
          <Tooltip title={home.listView} mouseLeaveDelay={0}>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<BarsOutlined />}
              onClick={() => setViewMode('list')}
              aria-label={home.listView || 'List view'}
            />
          </Tooltip>
        </Space.Compact>
      </div>
      
      {viewMode === 'grid' ? (
        <Row gutter={[24, 24]}>
          {filteredTools.map((tool, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={index}>
              <ToolCard
                {...tool}
                isDark={isDark}
                viewMode={viewMode}
                onClick={() => addRecentTool({ path: tool.path, title: tool.title, color: tool.color })}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 12]}>
          {filteredTools.map((tool, index) => (
            <Col xs={12} sm={8} md={6} lg={4} xl={4} key={index}>
              <ToolCard
                {...tool}
                isDark={isDark}
                viewMode={viewMode}
                onClick={() => addRecentTool({ path: tool.path, title: tool.title, color: tool.color })}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          background: isDark ? '#1f1f1f' : '#fafafa',
          borderRadius: 12 
        }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {t.common.noResults || 'No tools found. Try a different search term.'}
          </Text>
        </div>
      )}

      {/* Features Section */}
      <div style={{ marginTop: 48 }}>
        <Title level={3} style={{ marginBottom: 24, color: isDark ? '#e6e6e6' : '#1e293b' }}>
          ✨ {home.whyChoose}
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%', background: isDark ? '#1a3a1a' : '#f0fdf4', border: 'none' }}>
              <Title level={5} style={{ color: isDark ? '#52c41a' : '#166534' }}>🔒 {home.features.clientSide.title}</Title>
              <Text style={{ color: isDark ? '#73d13d' : '#166534' }}>
                {home.features.clientSide.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%', background: isDark ? '#111d3a' : '#eff6ff', border: 'none' }}>
              <Title level={5} style={{ color: isDark ? '#1890ff' : '#1e40af' }}>🆓 {home.features.free.title}</Title>
              <Text style={{ color: isDark ? '#40a9ff' : '#1e40af' }}>
                {home.features.free.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%', background: isDark ? '#3a2a11' : '#fef3c7', border: 'none' }}>
              <Title level={5} style={{ color: isDark ? '#faad14' : '#92400e' }}>💼 {home.features.paymentReady.title}</Title>
              <Text style={{ color: isDark ? '#ffc53d' : '#92400e' }}>
                {home.features.paymentReady.description}
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default HomePage;
