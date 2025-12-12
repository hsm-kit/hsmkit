import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, message, Typography, Upload, Dropdown, Divider, Input, Select, Space, Alert, Checkbox } from 'antd';
import { FileSearchOutlined, UploadOutlined, CopyOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import * as asn1js from 'asn1js';
import { fromBER } from 'asn1js';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ParsedNode {
  fieldName?: string;
  type: string;
  length: number;
  value?: string;
  children?: ParsedNode[];
  offset: number;
  totalLength: number;
  isConstructed: boolean;
  valueHex: string;
  rawData: Uint8Array;
}

const ASN1Analyzer: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedNode | null>(null);
  const [hexData, setHexData] = useState('');
  const [error, setError] = useState('');
  const [hoveredNode, setHoveredNode] = useState<ParsedNode | null>(null);
  const [withHexDump, setWithHexDump] = useState(true);
  const [trimBigChunks, setTrimBigChunks] = useState(true);
  const [withDefinitions, setWithDefinitions] = useState(true);
  const [loadExample, setLoadExample] = useState('pkcs7-der');
  const [definition, setDefinition] = useState('');
  const [dynamicDefinitions, setDynamicDefinitions] = useState<Array<{label: string; value: string; score: number}>>([]);
  const prevInputRef = useRef('');

  // 检测粘贴内容，自动检测结构类型并生成definitions
  useEffect(() => {
    const wasEmpty = !prevInputRef.current || prevInputRef.current.trim() === '';
    const isNotEmpty = input && input.trim() !== '';
    
    // 如果从空变为有内容（粘贴或上传），自动解析并检测结构类型
    if (wasEmpty && isNotEmpty && input.trim().length > 10) {
      // 延迟一下，避免频繁解析
      const timer = setTimeout(() => {
        try {
          let cleanInput = input.trim();
          
          // 处理PEM格式
          if (input.includes('-----BEGIN')) {
            const base64 = input
              .replace(/-----BEGIN[^-]+-----/, '')
              .replace(/-----END[^-]+-----/, '')
              .replace(/\s/g, '');
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            cleanInput = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
          } else {
            cleanInput = cleanInput.replace(/\s+/g, '');
            // 如果是Base64，转换为hex
            if (/^[A-Za-z0-9+/]+=*$/.test(cleanInput) && cleanInput.length > 20 && !/^[0-9A-Fa-f]+$/.test(cleanInput)) {
              try {
                const binary = atob(cleanInput);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                cleanInput = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
              } catch {}
            }
          }
          
          if (/^[0-9A-Fa-f]+$/.test(cleanInput) && cleanInput.length % 2 === 0) {
            const bytes = new Uint8Array(cleanInput.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
            try {
              const asn1Obj = parseASN1Buffer(bytes);
              if (asn1Obj) {
                const tempParsed = convertToNode(asn1Obj, 0, bytes, 0);
                addFieldNames(tempParsed, 'root');
                const detectedDefinitions = detectStructure(tempParsed);
                setDynamicDefinitions(detectedDefinitions);
                
                // 自动选择最高匹配度的定义
                if (detectedDefinitions.length > 0 && detectedDefinitions[0].value !== 'none') {
                  setDefinition(detectedDefinitions[0].value);
                }
              }
            } catch (err) {
              // 忽略自动解析错误
            }
          }
        } catch (err) {
          // 忽略解析错误，等用户点击decode
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    prevInputRef.current = input;
  }, [input]);

  const examples = [
    { label: 'PKCS#7/CMS attached signature (DER)', value: 'pkcs7-der' },
    { label: 'PKCS#7/CMS attached signature (BER)', value: 'pkcs7-ber' },
    { label: 'PKCS#7/CMS detached signature (old)', value: 'pkcs7-detached' },
    { label: 'PKCS#7/CMS encrypted with password', value: 'pkcs7-encrypted' },
    { label: "X.509 certificate: Let's Encrypt X3", value: 'x509-le' },
    { label: 'X.509 certificate: ed25519 (RFC 8410)', value: 'x509-ed25519' },
    { label: 'PKCS#1 RSA key (RFC 8017)', value: 'pkcs1' },
    { label: 'PKCS#8 RSA key (RFC 5208)', value: 'pkcs8' },
    { label: 'PKCS#10 certification request (RFC 2986)', value: 'pkcs10' },
    { label: 'CRL example (RFC 5280)', value: 'crl' },
    { label: 'CMP PKI message (RFC 4210)', value: 'cmp' },
    { label: 'LDAP message (RFC 4511)', value: 'ldap' },
    { label: 'TimeStamp request (RFC 3161)', value: 'timestamp' },
  ];

  const allDefinitions = [
    { label: 'X.509 certificate', value: 'x509', detector: detectX509Certificate },
    { label: 'X.509 certificate revocation list', value: 'x509-crl', detector: detectX509CRL },
    { label: 'X.509 public key info', value: 'x509-pubkey', detector: detectX509PublicKeyInfo },
    { label: 'PKCS#1 RSA private key', value: 'pkcs1-rsa', detector: detectPKCS1RSA },
    { label: 'PKCS#8 private key', value: 'pkcs8', detector: detectPKCS8 },
    { label: 'PKCS#8 encrypted private key', value: 'pkcs8-encrypted', detector: detectPKCS8Encrypted },
    { label: 'PKCS#10 certification request', value: 'pkcs10', detector: detectPKCS10 },
    { label: 'CMS / PKCS#7 envelope', value: 'cms', detector: detectCMS },
    { label: 'CMP PKI Message', value: 'cmp', detector: detectCMP },
    { label: 'LDAP Message', value: 'ldap', detector: detectLDAP },
    { label: 'Time Stamp Request', value: 'timestamp', detector: detectTimeStampRequest },
  ];

  // 检测函数
  function detectPKCS1RSA(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 9) {
      if (node.children[0].type === 'INTEGER') {
        return 100;
      }
    }
    return 0;
  }

  function detectPKCS8(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 3) {
      if (node.children[0].type === 'INTEGER' && node.children[1].type === 'SEQUENCE') {
        if (node.children[2].type === 'OCTET STRING') {
          return 100;
        }
      }
    }
    return 0;
  }

  function detectPKCS8Encrypted(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 2) {
      if (node.children[0].type === 'SEQUENCE' && node.children[1].type === 'OCTET STRING') {
        return 100;
      }
    }
    return 0;
  }

  function detectX509Certificate(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
      const tbs = node.children[0];
      const sigAlg = node.children[1];
      const sigVal = node.children[2];
      
      if (tbs.type === 'SEQUENCE' && sigAlg.type === 'SEQUENCE' && sigVal.type === 'BIT STRING') {
        if (tbs.children && tbs.children.length >= 6) {
          // 检查是否有version, serialNumber, signature, issuer, validity, subject
          let score = 0;
          if (tbs.children[0].type === '[0]' || tbs.children[0].type === 'INTEGER') score += 16.7;
          if (tbs.children[1].type === 'INTEGER') score += 16.7;
          if (tbs.children[2].type === 'SEQUENCE') score += 16.7;
          if (tbs.children[3].type === 'SEQUENCE') score += 16.7;
          if (tbs.children[4].type === 'SEQUENCE') score += 16.7;
          if (tbs.children[5].type === 'SEQUENCE') score += 16.7;
          return score;
        }
      }
    }
    return 0;
  }

  function detectX509CRL(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
      const tbs = node.children[0];
      const sigAlg = node.children[1];
      const sigVal = node.children[2];
      
      // CRL 的典型结构：tbsCertList (SEQUENCE) + signatureAlgorithm (SEQUENCE) + signatureValue (BIT STRING)
      if (tbs.type === 'SEQUENCE' && sigAlg.type === 'SEQUENCE' && sigVal.type === 'BIT STRING') {
        if (tbs.children && tbs.children.length >= 3) {
          let score = 0;
          // 检查是否有signature (AlgorithmIdentifier), issuer (Name), thisUpdate (Time)
          if (tbs.children[0].type === 'SEQUENCE') score += 30; // signature algorithm
          if (tbs.children[1].type === 'SEQUENCE') score += 30; // issuer (Name)
          if (tbs.children[2].type === 'UTCTime' || tbs.children[2].type === 'GeneralizedTime') score += 30; // thisUpdate
          if (tbs.children[3] && (tbs.children[3].type === 'UTCTime' || tbs.children[3].type === 'GeneralizedTime')) score += 5; // nextUpdate (optional)
          if (tbs.children[4] && tbs.children[4].type === 'SEQUENCE' && tbs.children[4].isConstructed) score += 5; // revokedCertificates (optional)
          // CRL 的分数应该很高（至少 90），确保优先于 CMP
          return Math.max(score, 90); // 确保 CRL 的分数足够高
        }
      }
    }
    return 0;
  }

  function detectX509PublicKeyInfo(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 2) {
      if (node.children[0].type === 'SEQUENCE' && node.children[1].type === 'BIT STRING') {
        return 100;
      }
    }
    return 0;
  }

  function detectPKCS10(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
      if (node.children[0].type === 'SEQUENCE' && node.children[1].type === 'SEQUENCE' && node.children[2].type === 'BIT STRING') {
        return 100;
      }
    }
    return 0;
  }

  function detectCMS(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 1) {
      if (node.children[0].type === 'OBJECT IDENTIFIER') {
        return 100;
      }
    }
    return 0;
  }

  function detectCMP(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 2) {
      if (node.children[0].type === 'SEQUENCE' && node.children[1].type === 'SEQUENCE') {
        return 50;
      }
    }
    return 0;
  }

  function detectLDAP(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 2) {
      if (node.children[0].type === 'INTEGER' && node.children[1].type === 'SEQUENCE') {
        return 100;
      }
    }
    return 0;
  }

  function detectTimeStampRequest(node: ParsedNode): number {
    if (node.type === 'SEQUENCE' && node.children && node.children.length >= 2) {
      if (node.children[0].type === 'INTEGER' && node.children[1].type === 'SEQUENCE') {
        return 50;
      }
    }
    return 0;
  }

  // 改进的匹配函数：递归匹配并统计（参考asn1js的Defs.match逻辑）
  const matchStructure = (node: ParsedNode, expectedStructure: (node: ParsedNode, depth: number) => boolean, stats: {total: number; recognized: number} = {total: 0, recognized: 0}, depth: number = 0): {total: number; recognized: number} => {
    stats.total++;
    
    // 检测当前节点是否匹配期望的结构
    if (expectedStructure(node, depth)) {
      stats.recognized++;
    }
    
    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        matchStructure(child, expectedStructure, stats, depth + 1);
      }
    }
    
    return stats;
  };

  // 为每个定义创建结构检查函数
  const createStructureChecker = (defValue: string): (node: ParsedNode, depth: number) => boolean => {
    switch (defValue) {
      case 'pkcs1-rsa':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length === 9 && node.children[0].type === 'INTEGER';
          }
          return true; // 子节点都算匹配
        };
      case 'pkcs8':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length >= 3 && 
                   node.children[0].type === 'INTEGER' && 
                   node.children[1].type === 'SEQUENCE' &&
                   node.children[2].type === 'OCTET STRING';
          }
          return true;
        };
      case 'pkcs8-encrypted':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length >= 2 &&
                   node.children[0].type === 'SEQUENCE' &&
                   node.children[1].type === 'OCTET STRING';
          }
          return true;
        };
      case 'x509':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length === 3 &&
                   node.children[0].type === 'SEQUENCE' &&
                   node.children[1].type === 'SEQUENCE' &&
                   node.children[2].type === 'BIT STRING';
          }
          if (depth === 1 && node.fieldName === 'tbsCertificate') {
            return node.children && node.children.length >= 6;
          }
          return true;
        };
      case 'x509-crl':
        return (node, depth) => {
          if (depth === 0) {
            // CRL 根节点：SEQUENCE with 3 children (tbsCertList, signatureAlgorithm, signatureValue)
            return node.type === 'SEQUENCE' && node.children?.length === 3 &&
                   node.children[0].type === 'SEQUENCE' &&
                   node.children[1].type === 'SEQUENCE' &&
                   node.children[2].type === 'BIT STRING';
          }
          if (depth === 1) {
            // tbsCertList 应该有 signature, issuer, thisUpdate 等
            const tbs = node.children?.[0] || node;
            if (tbs.type === 'SEQUENCE' && tbs.children && tbs.children.length >= 3) {
              // 检查是否有 signature (SEQUENCE), issuer (SEQUENCE), thisUpdate (Time)
              return tbs.children[0].type === 'SEQUENCE' && 
                     tbs.children[1].type === 'SEQUENCE' &&
                     (tbs.children[2].type === 'UTCTime' || tbs.children[2].type === 'GeneralizedTime');
            }
          }
          return true;
        };
      case 'x509-pubkey':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length === 2 &&
                   node.children[0].type === 'SEQUENCE' &&
                   node.children[1].type === 'BIT STRING';
          }
          return true;
        };
      case 'pkcs10':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length === 3 &&
                   node.children[0].type === 'SEQUENCE' &&
                   node.children[1].type === 'SEQUENCE' &&
                   node.children[2].type === 'BIT STRING';
          }
          return true;
        };
      case 'cms':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length >= 1 &&
                   node.children[0].type === 'OBJECT IDENTIFIER';
          }
          return true;
        };
      case 'cmp':
        return (node, depth) => {
          if (depth === 0) {
            // CMP 结构更复杂，需要更严格的检查
            // CMP PKI Message 通常是 SEQUENCE，第一个子节点是 SEQUENCE (header)，第二个也是 SEQUENCE (body)
            // 但 CRL 也有类似结构，所以需要更严格的检查
            if (node.type === 'SEQUENCE' && node.children?.length >= 2 &&
                node.children[0].type === 'SEQUENCE' &&
                node.children[1].type === 'SEQUENCE') {
              // 检查第三个子节点，CRL 有 BIT STRING，CMP 通常没有或不同
              if (node.children.length === 3 && node.children[2].type === 'BIT STRING') {
                // 这更像是 CRL，返回 false
                return false;
              }
              // CMP 的第一个 SEQUENCE (header) 通常包含 pvno (INTEGER)
              if (node.children[0].children && node.children[0].children.length > 0) {
                const firstChild = node.children[0].children[0];
                if (firstChild.type === 'INTEGER') {
                  return true; // 可能是 CMP
                }
              }
            }
          }
          return false; // 默认不匹配，避免误识别
        };
      case 'ldap':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length >= 2 &&
                   node.children[0].type === 'INTEGER' &&
                   node.children[1].type === 'SEQUENCE';
          }
          return true;
        };
      case 'timestamp':
        return (node, depth) => {
          if (depth === 0) {
            return node.type === 'SEQUENCE' && node.children?.length >= 2 &&
                   node.children[0].type === 'INTEGER' &&
                   node.children[1].type === 'SEQUENCE';
          }
          return true;
        };
      default:
        return () => false;
    }
  };

  // 检测ASN.1结构类型并计算匹配度（改进版：优先使用专门的检测函数）
  const detectStructure = (node: ParsedNode): Array<{label: string; value: string; score: number}> => {
    const results: Array<{label: string; value: string; score: number}> = [];
    
    // 首先使用专门的检测函数（更准确）
    for (const def of allDefinitions) {
      if (def.detector) {
        const score = def.detector(node);
        if (score > 0) {
          results.push({
            label: `${score.toFixed(1)}% ${def.label}`,
            value: def.value,
            score: score
          });
        }
      }
    }
    
    // 如果专门检测函数没有结果，使用通用检查器
    if (results.length === 0) {
      for (const def of allDefinitions) {
        const checker = createStructureChecker(def.value);
        const stats = matchStructure(node, checker, {total: 0, recognized: 0}, 0);
        
        // 计算匹配度百分比
        const matchRatio = stats.total > 0 ? (stats.recognized / stats.total) * 100 : 0;
        
        if (matchRatio > 0) {
          results.push({
            label: `${matchRatio.toFixed(1)}% ${def.label}`,
            value: def.value,
            score: matchRatio
          });
        }
      }
    }
    
    // 按匹配度降序排序
    results.sort((a, b) => b.score - a.score);
    
    // 添加"no definition"选项
    results.push({ label: 'no definition', value: 'none', score: 0 });
    
    return results;
  };

  // 辅助函数：统一解析ASN1对象
  const parseASN1Buffer = (bytes: Uint8Array): any => {
    try {
      const asn1Result = fromBER(bytes.buffer);
      if (asn1Result.offset === -1) {
        throw new Error('Failed to parse ASN.1 structure');
      }
      return asn1Result.result;
    } catch (err) {
      throw err;
    }
  };

  const parseASN1 = (data: Uint8Array): ParsedNode | null => {
    try {
      const asn1Obj = parseASN1Buffer(data);
      if (!asn1Obj) {
        throw new Error('ASN.1 result is null or undefined');
      }
      
      const rootNode = convertToNode(asn1Obj, 0, data, 0);
      
      // 根据loadExample和definition添加字段名
      applyDefinitionWithFormat(rootNode);
      
      return rootNode;
    } catch (err) {
      throw err;
    }
  };

  const applyDefinitionWithFormat = (node: ParsedNode, format?: string) => {
    const actualFormat = format || definition || loadExample;
    
    if (!actualFormat || actualFormat === 'none') {
      // 如果都没有选择，使用自动识别
      addFieldNames(node, 'root');
      return;
    }

    // 根据选择的格式添加字段名
    if (actualFormat === 'pkcs1-rsa' || actualFormat === 'pkcs1') {
      if (node.type === 'SEQUENCE' && node.children && node.children.length === 9) {
        node.fieldName = 'RSAPrivateKey';
        const fieldNames = ['version', 'modulus', 'publicExponent', 'privateExponent', 'prime1', 'prime2', 'exponent1', 'exponent2', 'coefficient'];
        node.children.forEach((child, index) => {
          if (index < fieldNames.length) {
            child.fieldName = fieldNames[index];
          }
        });
      }
    } else if (actualFormat === 'x509' || actualFormat === 'x509-le' || actualFormat === 'x509-ed25519') {
      if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
        node.fieldName = 'Certificate';
        if (node.children[0].type === 'SEQUENCE') {
          node.children[0].fieldName = 'tbsCertificate';
          if (node.children[0].children) {
            const tbs = node.children[0].children;
            if (tbs.length > 0 && tbs[0].type === '[0]') tbs[0].fieldName = 'version';
            if (tbs.length > 1 && tbs[1].type === 'INTEGER') tbs[1].fieldName = 'serialNumber';
            if (tbs.length > 2 && tbs[2].type === 'SEQUENCE') tbs[2].fieldName = 'signature';
            if (tbs.length > 3 && tbs[3].type === 'SEQUENCE') tbs[3].fieldName = 'issuer';
            if (tbs.length > 4 && tbs[4].type === 'SEQUENCE') tbs[4].fieldName = 'validity';
            if (tbs.length > 5 && tbs[5].type === 'SEQUENCE') tbs[5].fieldName = 'subject';
            if (tbs.length > 6 && tbs[6].type === 'SEQUENCE') tbs[6].fieldName = 'subjectPublicKeyInfo';
          }
        }
        if (node.children[1].type === 'SEQUENCE') {
          node.children[1].fieldName = 'signatureAlgorithm';
        }
        if (node.children[2].type === 'BIT STRING') {
          node.children[2].fieldName = 'signatureValue';
        }
      }
    } else if (actualFormat === 'pkcs8' || actualFormat === 'pkcs8-encrypted') {
      if (node.type === 'SEQUENCE' && node.children && node.children.length >= 3) {
        node.fieldName = 'PrivateKeyInfo';
        node.children[0].fieldName = 'version';
        if (node.children[1].type === 'SEQUENCE') {
          node.children[1].fieldName = 'privateKeyAlgorithm';
        }
        if (node.children[2].type === 'OCTET STRING') {
          node.children[2].fieldName = 'privateKey';
        }
      }
    } else if (actualFormat === 'pkcs7-der' || actualFormat === 'pkcs7-ber' || actualFormat === 'pkcs7-detached' || actualFormat === 'pkcs7-encrypted' || actualFormat === 'cms') {
      if (node.type === 'SEQUENCE' && node.children) {
        node.fieldName = 'ContentInfo';
        if (node.children[0] && node.children[0].type === 'OBJECT IDENTIFIER') {
          node.children[0].fieldName = 'contentType';
        }
        if (node.children[1]) {
          node.children[1].fieldName = 'content';
        }
      }
    } else if (actualFormat === 'pkcs10') {
      if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
        node.fieldName = 'CertificationRequest';
        if (node.children[0].type === 'SEQUENCE') {
          node.children[0].fieldName = 'certificationRequestInfo';
        }
        if (node.children[1].type === 'SEQUENCE') {
          node.children[1].fieldName = 'signatureAlgorithm';
        }
        if (node.children[2].type === 'BIT STRING') {
          node.children[2].fieldName = 'signature';
        }
      }
    } else if (actualFormat === 'crl' || actualFormat === 'x509-crl') {
      if (node.type === 'SEQUENCE' && node.children && node.children.length === 3) {
        node.fieldName = 'CertificateList';
        if (node.children[0].type === 'SEQUENCE') {
          node.children[0].fieldName = 'tbsCertList';
          // 解析tbsCertList内部字段
          if (node.children[0].children) {
            const tbs = node.children[0].children;
            let index = 0;
            
            // version (可选，通常是第一个，类型为[0])
            if (tbs[index] && (tbs[index].type === '[0]' || tbs[index].type === 'INTEGER')) {
              tbs[index].fieldName = 'version';
              index++;
            }
            
            // signature (AlgorithmIdentifier)
            if (tbs[index] && tbs[index].type === 'SEQUENCE') {
              tbs[index].fieldName = 'signature';
              // 递归处理AlgorithmIdentifier
              if (tbs[index].children && tbs[index].children.length >= 1) {
                if (tbs[index].children[0].type === 'OBJECT IDENTIFIER') {
                  tbs[index].children[0].fieldName = 'algorithm';
                }
                // 处理可选的 parameters
                if (tbs[index].children.length > 1) {
                  tbs[index].children[1].fieldName = 'parameters';
                }
              }
              index++;
            }
            
            // issuer (Name - rdnSequence)
            if (tbs[index] && tbs[index].type === 'SEQUENCE') {
              tbs[index].fieldName = 'issuer';
              // 递归处理Name结构（rdnSequence）
              if (tbs[index].children) {
                tbs[index].children.forEach((rdn: ParsedNode, rdnIndex: number) => {
                  if (rdn.type === 'SET' && rdn.children) {
                    rdn.fieldName = `RelativeDistinguishedName[${rdnIndex}]`;
                    rdn.children.forEach((ava: ParsedNode, avaIndex: number) => {
                      if (ava.type === 'SEQUENCE' && ava.children && ava.children.length >= 2) {
                        ava.fieldName = `AttributeTypeAndValue[${avaIndex}]`;
                        if (ava.children[0].type === 'OBJECT IDENTIFIER') {
                          ava.children[0].fieldName = 'type';
                        }
                        if (ava.children[1]) {
                          ava.children[1].fieldName = 'value';
                        }
                      }
                    });
                  }
                });
              }
              index++;
            }
            
            // thisUpdate (Time)
            if (tbs[index] && (tbs[index].type === 'UTCTime' || tbs[index].type === 'GeneralizedTime')) {
              tbs[index].fieldName = 'thisUpdate';
              index++;
            }
            
            // nextUpdate (Time, 可选)
            if (tbs[index] && (tbs[index].type === 'UTCTime' || tbs[index].type === 'GeneralizedTime')) {
              tbs[index].fieldName = 'nextUpdate';
              index++;
            }
            
            // revokedCertificates (SEQUENCE OF RevokedCertificate, 可选)
            if (tbs[index] && tbs[index].type === 'SEQUENCE' && tbs[index].isConstructed) {
              tbs[index].fieldName = 'revokedCertificates';
              // 递归处理revokedCertificates中的每个RevokedCertificate
              if (tbs[index].children) {
                tbs[index].children.forEach((revokedCert: ParsedNode, certIndex: number) => {
                  if (revokedCert.type === 'SEQUENCE' && revokedCert.children) {
                    revokedCert.fieldName = `RevokedCertificate[${certIndex}]`;
                    if (revokedCert.children[0] && revokedCert.children[0].type === 'INTEGER') {
                      revokedCert.children[0].fieldName = 'userCertificate';
                    }
                    if (revokedCert.children[1] && revokedCert.children[1].type === 'UTCTime' || revokedCert.children[1].type === 'GeneralizedTime') {
                      revokedCert.children[1].fieldName = 'revocationDate';
                    }
                    if (revokedCert.children[2] && revokedCert.children[2].type === 'SEQUENCE') {
                      revokedCert.children[2].fieldName = 'crlEntryExtensions';
                    }
                  }
                });
              }
              index++;
            }
            
            // crlExtensions ([0] EXPLICIT Extensions, 可选)
            if (tbs[index] && tbs[index].type === '[0]') {
              tbs[index].fieldName = 'crlExtensions';
              // 递归处理Extensions
              if (tbs[index].children && tbs[index].children[0] && tbs[index].children[0].type === 'SEQUENCE') {
                tbs[index].children[0].fieldName = 'Extensions';
                if (tbs[index].children[0].children) {
                  tbs[index].children[0].children.forEach((ext: ParsedNode, extIndex: number) => {
                    if (ext.type === 'SEQUENCE' && ext.children && ext.children.length >= 2) {
                      ext.fieldName = `Extension[${extIndex}]`;
                      if (ext.children[0].type === 'OBJECT IDENTIFIER') {
                        ext.children[0].fieldName = 'extnID';
                      }
                      if (ext.children[1].type === 'OCTET STRING') {
                        ext.children[1].fieldName = 'extnValue';
                        // 递归解析 extnValue 的内容（可能是嵌套的 ASN.1 结构）
                        if (ext.children[1].children && ext.children[1].children.length > 0) {
                          // extnValue 是 OCTET STRING，但可能包含编码的 ASN.1 结构
                          // 这里我们已经在 convertToNode 中处理了，所以只需要确保字段名正确
                        }
                      }
                    }
                  });
                }
              }
            }
          }
        }
        if (node.children[1].type === 'SEQUENCE') {
          node.children[1].fieldName = 'signatureAlgorithm';
          // 递归处理AlgorithmIdentifier
          if (node.children[1].children && node.children[1].children.length >= 1) {
            if (node.children[1].children[0].type === 'OBJECT IDENTIFIER') {
              node.children[1].children[0].fieldName = 'algorithm';
            }
            // 处理可选的 parameters
            if (node.children[1].children.length > 1) {
              node.children[1].children[1].fieldName = 'parameters';
            }
          }
        }
        if (node.children[2].type === 'BIT STRING') {
          node.children[2].fieldName = 'signatureValue';
        }
      }
    } else {
      // 其他格式，使用自动识别
      addFieldNames(node, 'root');
    }
    
    // 递归处理所有子节点，确保字段名应用到所有层级
    if (node.children) {
      node.children.forEach(child => {
        // 如果子节点还没有字段名，尝试根据上下文推断
        if (!child.fieldName && child.type === 'SEQUENCE' && child.children) {
          // 可以在这里添加更多的自动推断逻辑
        }
        // 递归应用定义（但避免重复处理已处理的节点）
        // 注意：这里不递归调用 applyDefinitionWithFormat，因为我们已经处理了主要结构
        // 如果需要，可以在这里添加通用的递归处理逻辑
      });
    }
  };

  const addFieldNames = (node: ParsedNode, context: string = 'root') => {
    if (!node.children) return;

    // PKCS#1 RSA Private Key
    if (node.type === 'SEQUENCE' && node.children.length === 9 && node.children[0].type === 'INTEGER') {
      node.fieldName = 'RSAPrivateKey';
      const fieldNames = ['version', 'modulus', 'publicExponent', 'privateExponent', 'prime1', 'prime2', 'exponent1', 'exponent2', 'coefficient'];
      node.children.forEach((child, index) => {
        if (index < fieldNames.length) {
          child.fieldName = fieldNames[index];
        }
      });
      return;
    }

    // X.509 Certificate
    if (node.type === 'SEQUENCE' && node.children.length === 3 && context === 'root') {
      node.fieldName = 'Certificate';
      if (node.children[0].type === 'SEQUENCE') {
        node.children[0].fieldName = 'tbsCertificate';
        if (node.children[0].children) {
          const tbs = node.children[0].children;
          if (tbs[0].type === '[0]') tbs[0].fieldName = 'version';
          if (tbs[1].type === 'INTEGER') tbs[1].fieldName = 'serialNumber';
          if (tbs[2].type === 'SEQUENCE') tbs[2].fieldName = 'signature';
          if (tbs[3].type === 'SEQUENCE') tbs[3].fieldName = 'issuer';
          if (tbs[4].type === 'SEQUENCE') tbs[4].fieldName = 'validity';
          if (tbs[5].type === 'SEQUENCE') tbs[5].fieldName = 'subject';
          if (tbs[6].type === 'SEQUENCE') tbs[6].fieldName = 'subjectPublicKeyInfo';
        }
      }
      if (node.children[1].type === 'SEQUENCE') {
        node.children[1].fieldName = 'signatureAlgorithm';
      }
        if (node.children[2].type === 'BIT STRING') {
          node.children[2].fieldName = 'signatureValue';
        }
    }

    // PKCS#8
    if (node.type === 'SEQUENCE' && node.children.length === 3 && node.children[0].type === 'INTEGER') {
      node.fieldName = 'PrivateKeyInfo';
      node.children[0].fieldName = 'version';
      if (node.children[1].type === 'SEQUENCE') {
        node.children[1].fieldName = 'privateKeyAlgorithm';
      }
      if (node.children[2].type === 'OCTET STRING') {
        node.children[2].fieldName = 'privateKey';
      }
    }

    // CRL (Certificate Revocation List)
    if (node.type === 'SEQUENCE' && node.children && node.children.length === 3 && context === 'root') {
      const tbs = node.children[0];
      const sigAlg = node.children[1];
      const sigVal = node.children[2];
      
      // 检查是否符合CRL结构：tbsCertList + signatureAlgorithm + signatureValue
      if (tbs && tbs.type === 'SEQUENCE' && sigAlg && sigAlg.type === 'SEQUENCE' && sigVal && sigVal.type === 'BIT STRING') {
        node.fieldName = 'CertificateList';
        tbs.fieldName = 'tbsCertList';
        sigAlg.fieldName = 'signatureAlgorithm';
        sigVal.fieldName = 'signatureValue';
        
        // 解析tbsCertList内部字段
        if (tbs.children) {
          const tbsChildren = tbs.children;
          let index = 0;
          
          // version (可选)
          if (tbsChildren[index] && (tbsChildren[index].type === '[0]' || tbsChildren[index].type === 'INTEGER')) {
            tbsChildren[index].fieldName = 'version';
            index++;
          }
          
          // signature
          if (tbsChildren[index] && tbsChildren[index].type === 'SEQUENCE') {
            tbsChildren[index].fieldName = 'signature';
            index++;
          }
          
          // issuer
          if (tbsChildren[index] && tbsChildren[index].type === 'SEQUENCE') {
            tbsChildren[index].fieldName = 'issuer';
            index++;
          }
          
          // thisUpdate
          if (tbsChildren[index] && (tbsChildren[index].type === 'UTCTime' || tbsChildren[index].type === 'GeneralizedTime')) {
            tbsChildren[index].fieldName = 'thisUpdate';
            index++;
          }
          
          // nextUpdate (可选)
          if (tbsChildren[index] && (tbsChildren[index].type === 'UTCTime' || tbsChildren[index].type === 'GeneralizedTime')) {
            tbsChildren[index].fieldName = 'nextUpdate';
            index++;
          }
          
          // revokedCertificates (可选)
          if (tbsChildren[index] && tbsChildren[index].type === 'SEQUENCE' && tbsChildren[index].isConstructed) {
            tbsChildren[index].fieldName = 'revokedCertificates';
            if (tbsChildren[index].children) {
              tbsChildren[index].children.forEach((revokedCert: ParsedNode, certIndex: number) => {
                if (revokedCert.type === 'SEQUENCE' && revokedCert.children) {
                  revokedCert.fieldName = `RevokedCertificate[${certIndex}]`;
                  if (revokedCert.children[0] && revokedCert.children[0].type === 'INTEGER') {
                    revokedCert.children[0].fieldName = 'userCertificate';
                  }
                  if (revokedCert.children[1] && (revokedCert.children[1].type === 'UTCTime' || revokedCert.children[1].type === 'GeneralizedTime')) {
                    revokedCert.children[1].fieldName = 'revocationDate';
                  }
                  if (revokedCert.children[2] && revokedCert.children[2].type === 'SEQUENCE') {
                    revokedCert.children[2].fieldName = 'crlEntryExtensions';
                  }
                }
              });
            }
            index++;
          }
          
          // crlExtensions (可选)
          if (tbsChildren[index] && tbsChildren[index].type === '[0]') {
            tbsChildren[index].fieldName = 'crlExtensions';
          }
        }
        
        return; // CRL已处理，不需要递归
      }
    }

    // Recursively add field names
    node.children.forEach(child => addFieldNames(child, 'nested'));
  };


  // 从asn1js对象提取内容值（参考asn1js的content方法）
  const extractContent = (obj: any, maxLength: number = Infinity): string | null => {
    if (!obj) return null;
    
    try {
      // asn1js 3.x 使用 idBlock 而不是 tag
      const idBlock = obj.idBlock;
      if (!idBlock) return null;
      
      const tagNumber = idBlock.tagNumber;
      const isConstructed = idBlock.isConstructed || (obj.valueBlock && Array.isArray(obj.valueBlock.value));
      const valueBlock = obj.valueBlock;
      
      // 检查是否是Universal类型
      const isUniversal = idBlock.tagClass === 0;
      
      if (!isUniversal) {
        // 非Universal类型：如果有子节点数组，返回元素数量；否则返回字节数和内容
        if (isConstructed && valueBlock?.value && Array.isArray(valueBlock.value)) {
          return `(${valueBlock.value.length} elem)`;
        }
        if (valueBlock?.valueHexView) {
          const valueBytes = new Uint8Array(valueBlock.valueHexView);
          const len = valueBytes.length;
          try {
            const str = new TextDecoder('utf-8', { fatal: false }).decode(valueBytes);
            return `(${len} byte)\n${str.length > maxLength ? str.substring(0, maxLength) + '…' : str}`;
          } catch {
            return `(${len} byte)`;
          }
        }
        return null;
      }
      
      if (!valueBlock?.valueHexView) return null;
      const valueBytes = new Uint8Array(valueBlock.valueHexView);
      const len = valueBytes.length;
      
      switch (tagNumber) {
        case 0x01: // BOOLEAN
          if (len !== 1) return 'invalid length ' + len;
          return valueBytes[0] === 0 ? 'false' : 'true';
          
        case 0x02: // INTEGER
          if (len < 1) return 'invalid length ' + len;
          // 解析整数
          let neg = valueBytes[0] > 127;
          let pad = neg ? 255 : 0;
          let start = 0;
          while (start < len && valueBytes[start] === pad) start++;
          if (start === len) return neg ? '-1' : '0';
          
          // 大整数显示bit长度
          let result = '';
          if (len - start > 4) {
            let bitLen = (len - start) * 8;
            let firstByte = valueBytes[start];
            while (((firstByte ^ pad) & 0x80) === 0 && bitLen > 0) {
              firstByte <<= 1;
              bitLen--;
            }
            result = `(${bitLen} bit)\n`;
          }
          
          // 解析整数值
          let value = neg ? valueBytes[start] - 256 : valueBytes[start];
          for (let i = start + 1; i < len; i++) {
            value = value * 256 + (neg ? valueBytes[i] - 256 : valueBytes[i]);
          }
          return result + value.toString();
          
        case 0x03: // BIT STRING
          if (len < 1) return null;
          const unusedBits = valueBytes[0];
          let bitStr = '';
          for (let i = 1; i < len; i++) {
            let b = valueBytes[i];
            let skip = (i === len - 1) ? unusedBits : 0;
            for (let j = 7; j >= skip; j--) {
              bitStr += ((b >> j) & 1) ? '1' : '0';
            }
            if (bitStr.length > maxLength) {
              bitStr = bitStr.substring(0, maxLength) + '…';
              break;
            }
          }
          const bitLen = ((len - 1) << 3) - unusedBits;
          return `(${bitLen} bit)\n${bitStr}`;
          
        case 0x04: // OCTET STRING
          if (isConstructed && obj.valueBlock?.value && Array.isArray(obj.valueBlock.value)) {
            return `(${len} byte)\n...`;
          }
          // 尝试解析为UTF-8字符串
          try {
            const str = new TextDecoder('utf-8', { fatal: true }).decode(valueBytes);
            // 检查是否可打印
            if (/^[\x20-\x7E\t\n\r]*$/.test(str)) {
              return `(${len} byte)\n${str.length > maxLength ? str.substring(0, maxLength) + '…' : str}`;
            }
          } catch {}
          return `(${len} byte)`;
          
        case 0x06: // OBJECT IDENTIFIER
          if (len < 1) return 'invalid length ' + len;
          // 解析OID
          let oidStr = '';
          let n = 0;
          let bits = 0;
          for (let i = 0; i < len; i++) {
            let v = valueBytes[i];
            n = n * 128 + (v & 0x7F);
            bits += 7;
            if (!(v & 0x80)) {
              if (oidStr === '') {
                if (n < 80) {
                  oidStr = (n < 40 ? '0' : '1') + '.' + (n - (n < 40 ? 0 : 40));
                } else {
                  oidStr = '2.' + (n - 80);
                }
              } else {
                oidStr += '.' + n;
              }
              if (oidStr.length > maxLength) {
                return oidStr.substring(0, maxLength) + '…';
              }
              n = 0;
              bits = 0;
            }
          }
          return oidStr;
          
        case 0x0A: // ENUMERATED
          return extractContent({ ...obj, tag: { ...obj.tag, tagNumber: 0x02 } }, maxLength);
          
        case 0x10: // SEQUENCE
        case 0x11: // SET
          if (isConstructed && obj.valueBlock?.value && Array.isArray(obj.valueBlock.value)) {
            return `(${obj.valueBlock.value.length} elem)`;
          }
          return '(no elem)';
          
        case 0x0C: // UTF8String
        case 0x12: // NumericString
        case 0x13: // PrintableString
        case 0x16: // IA5String
        case 0x1A: // VisibleString
          try {
            const str = new TextDecoder('utf-8').decode(valueBytes);
            return str.length > maxLength ? str.substring(0, maxLength) + '…' : str;
          } catch {
            return null;
          }
          
        case 0x17: // UTCTime
        case 0x18: // GeneralizedTime
          try {
            const str = new TextDecoder('ascii').decode(valueBytes);
            // 解析时间格式 YYMMDDHHmmss[Z] 或 YYYYMMDDHHmmss[Z]
            const isShort = tagNumber === 0x17;
            const match = str.match(isShort 
              ? /^(\d{2})(\d{2})(\d{2})(\d{2})(?:(\d{2})(?:(\d{2}))?)?(Z|[-+]\d{4})?$/
              : /^(\d{4})(\d{2})(\d{2})(\d{2})(?:(\d{2})(?:(\d{2}))?)?(Z|[-+]\d{4})?$/
            );
            if (match) {
              let year = parseInt(match[1]);
              if (isShort) {
                year += year < 70 ? 2000 : 1900;
              }
              let timeStr = `${year}-${match[2]}-${match[3]} ${match[4]}`;
              if (match[5]) {
                timeStr += `:${match[5]}`;
                if (match[6]) {
                  timeStr += `:${match[6]}`;
                }
              }
              if (match[7]) {
                timeStr += match[7] === 'Z' ? ' UTC' : ` ${match[7]}`;
              }
              return timeStr;
            }
            return str;
          } catch {
            return null;
          }
          
        default:
          return null;
      }
    } catch (e) {
      return 'Cannot decode: ' + e;
    }
  };

  const convertToNode = (obj: any, currentOffset: number, fullData: Uint8Array, depth: number): ParsedNode => {
    // asn1js 3.x 版本的结构：BaseBlock 有 idBlock, lenBlock, valueBlock
    if (!obj) {
      throw new Error('obj is null or undefined');
    }
    
    // 获取偏移量 - 使用 valueBeforeDecodeView 来找到在 fullData 中的位置
    let offset = currentOffset;
    if (depth === 0 && obj.valueBeforeDecodeView && obj.valueBeforeDecodeView.length > 0) {
      // 对于根节点，尝试从 valueBeforeDecodeView 找到位置
      const searchLen = Math.min(obj.valueBeforeDecodeView.length, 20);
      for (let i = 0; i <= Math.min(fullData.length - searchLen, 200); i++) {
        let match = true;
        for (let j = 0; j < searchLen; j++) {
          if (fullData[i + j] !== obj.valueBeforeDecodeView[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          offset = i;
          break;
        }
      }
    }
    
    // 获取 header 长度 - idBlock + lenBlock
    const idBlockLen = obj.idBlock?.blockLength || 1;
    const lenBlockLen = obj.lenBlock?.blockLength || 1;
    const header = idBlockLen + lenBlockLen;
    
    // 获取内容长度 - lenBlock.value 或 blockLength - header
    let length = 0;
    if (obj.lenBlock && typeof obj.lenBlock.value === 'number') {
      length = Math.abs(obj.lenBlock.value);
    } else if (obj.blockLength && typeof obj.blockLength === 'number') {
      length = Math.max(0, obj.blockLength - header);
    }
    
    // 检查是否是构造类型（Sequence, Set等）
    // asn1js 3.x 中，构造类型的 valueBlock.value 是子节点数组
    const isConstructed = obj.idBlock?.isConstructed === true || (obj.valueBlock && Array.isArray(obj.valueBlock.value));
    
    // 处理子元素 - 递归处理所有子节点
    let children: ParsedNode[] | undefined = undefined;
    let childOffset = offset + header;
    
    // 检查是否有子节点：valueBlock.value 是数组（构造类型）
    // 对于构造类型（SEQUENCE, SET等），valueBlock.value 包含子节点数组
    // 对于某些类型（如 OCTET STRING, BIT STRING），即使 isConstructed 为 true，valueBlock.value 也可能是数组
    if (obj.valueBlock) {
      // 检查 valueBlock.value 是否是数组（构造类型）
      if (Array.isArray(obj.valueBlock.value) && obj.valueBlock.value.length > 0) {
        children = [];
        for (let i = 0; i < obj.valueBlock.value.length; i++) {
          const child = obj.valueBlock.value[i];
          try {
            // 调试：打印子节点信息
            if (depth < 2 && i < 3) {
              console.log(`Child ${i} at depth ${depth}:`, {
                constructor: child?.constructor?.name,
                idBlock: child?.idBlock ? {
                  tagClass: child.idBlock.tagClass,
                  tagNumber: child.idBlock.tagNumber,
                  isConstructed: child.idBlock.isConstructed
                } : null,
                hasValueBlock: !!child?.valueBlock,
                valueBlockValueType: Array.isArray(child?.valueBlock?.value) ? 'array' : typeof child?.valueBlock?.value,
                valueBlockValueLength: Array.isArray(child?.valueBlock?.value) ? child.valueBlock.value.length : 'N/A'
              });
            }
            
            const childNode = convertToNode(child, childOffset, fullData, depth + 1);
            children.push(childNode);
            // 更新下一个子节点的偏移量
            childOffset = childNode.offset + childNode.totalLength;
          } catch (err) {
            console.error(`Error converting child ${i} at depth ${depth}:`, err, child);
            // 返回一个错误节点而不是抛出异常
            children.push({
              type: 'ERROR',
              length: 0,
              offset: childOffset,
              totalLength: 0,
              isConstructed: false,
              valueHex: '',
              rawData: new Uint8Array(0),
              value: `Error: ${err instanceof Error ? err.message : String(err)}`
            });
          }
        }
        
        // 如果length是0或计算错误，尝试从最后一个子节点重新计算
        if (length === 0 && children.length > 0) {
          const lastChild = children[children.length - 1];
          if (lastChild && lastChild.offset !== undefined && lastChild.totalLength !== undefined) {
            const calculatedEnd = lastChild.offset + lastChild.totalLength;
            length = Math.max(0, calculatedEnd - (offset + header));
          }
        }
      }
    }
    
    const totalLen = header + length;
    
    // 提取原始数据（确保不超出数组边界）
    const endOffset = Math.min(offset + totalLen, fullData.length);
    const nodeData = fullData.slice(offset, endOffset);
    
    const node: ParsedNode = {
      type: getTypeName(obj),
      length: length,
      offset: offset,
      totalLength: totalLen,
      isConstructed: isConstructed,
      valueHex: '',
      rawData: nodeData,
      children: children
    };

    // 提取hex值 - 使用valueBlock.valueHexView
    if (obj.valueBlock?.valueHexView) {
      const hexArray = Array.from(new Uint8Array(obj.valueBlock.valueHexView));
      node.valueHex = hexArray.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    }

    // 使用extractContent提取可读值（参考asn1js的content方法）
    try {
      const content = extractContent(obj, trimBigChunks ? 80 : Infinity);
      if (content !== null) {
        node.value = content;
      }
    } catch (e) {
      // 如果提取内容失败，不设置value
      node.value = undefined;
    }

    return node;
  };

  const getTypeName = (obj: any): string => {
    // asn1js 3.x 版本：优先使用 idBlock.tagNumber，避免显示内部类名
    if (!obj) {
      return 'UNKNOWN';
    }
    
    // 优先使用 idBlock 来确定类型（更准确，避免显示内部类名）
    if (obj.idBlock) {
      const tagClass = obj.idBlock.tagClass;
      const tagNumber = obj.idBlock.tagNumber;
      
      if (tagClass === 0) { // Universal
        switch (tagNumber) {
          case 0x00: return 'EOC';
          case 0x01: return 'BOOLEAN';
          case 0x02: return 'INTEGER';
          case 0x03: return 'BIT STRING';
          case 0x04: return 'OCTET STRING';
          case 0x05: return 'NULL';
          case 0x06: return 'OBJECT IDENTIFIER';
          case 0x07: return 'ObjectDescriptor';
          case 0x08: return 'EXTERNAL';
          case 0x09: return 'REAL';
          case 0x0A: return 'ENUMERATED';
          case 0x0B: return 'EMBEDDED PDV';
          case 0x0C: return 'UTF8String';
          case 0x0D: return 'RELATIVE-OID';
          case 0x10: return 'SEQUENCE';
          case 0x11: return 'SET';
          case 0x12: return 'NumericString';
          case 0x13: return 'PrintableString';
          case 0x14: return 'TeletexString';
          case 0x15: return 'VideotexString';
          case 0x16: return 'IA5String';
          case 0x17: return 'UTCTime';
          case 0x18: return 'GeneralizedTime';
          case 0x19: return 'GraphicString';
          case 0x1A: return 'VisibleString';
          case 0x1B: return 'GeneralString';
          case 0x1C: return 'UniversalString';
          case 0x1E: return 'BMPString';
          default: return 'Universal_' + tagNumber.toString();
        }
      } else if (tagClass === 1) {
        // Application 类标签 - 使用 [APPLICATION n] 格式，更清晰
        return '[APPLICATION ' + tagNumber.toString() + ']';
      } else if (tagClass === 2) {
        return '[' + tagNumber.toString() + ']'; // Context
      } else if (tagClass === 3) {
        return 'Private_' + tagNumber.toString();
      }
    }
    
    // 如果 idBlock 不存在，尝试使用构造函数名（但过滤掉内部类名）
    const constructorName = obj.constructor?.name;
    if (constructorName) {
      // 过滤掉以 Local 开头的内部类名
      if (constructorName.startsWith('Local')) {
        // 尝试从父类获取名称
        const proto = Object.getPrototypeOf(obj);
        if (proto && proto.constructor && proto.constructor.name) {
          const parentName = proto.constructor.name;
          const nameMap: Record<string, string> = {
            'Sequence': 'SEQUENCE',
            'Set': 'SET',
            'Integer': 'INTEGER',
            'BitString': 'BIT STRING',
            'OctetString': 'OCTET STRING',
            'ObjectIdentifier': 'OBJECT IDENTIFIER',
            'Utf8String': 'UTF8String',
            'PrintableString': 'PrintableString',
            'Null': 'NULL',
            'Boolean': 'BOOLEAN',
            'Enumerated': 'ENUMERATED',
            'GeneralizedTime': 'GeneralizedTime',
            'UTCTime': 'UTCTime',
            'IA5String': 'IA5String',
            'BMPString': 'BMPString',
            'UniversalString': 'UniversalString',
            'Constructed': 'CONSTRUCTED',
          };
          if (nameMap[parentName]) {
            return nameMap[parentName];
          }
        }
        // 如果无法确定，返回通用类型
        return 'CONSTRUCTED';
      }
      
      const nameMap: Record<string, string> = {
        'Sequence': 'SEQUENCE',
        'Set': 'SET',
        'Integer': 'INTEGER',
        'BitString': 'BIT STRING',
        'OctetString': 'OCTET STRING',
        'ObjectIdentifier': 'OBJECT IDENTIFIER',
        'Utf8String': 'UTF8String',
        'PrintableString': 'PrintableString',
        'Null': 'NULL',
        'Boolean': 'BOOLEAN',
        'Enumerated': 'ENUMERATED',
        'GeneralizedTime': 'GeneralizedTime',
        'UTCTime': 'UTCTime',
        'IA5String': 'IA5String',
        'BMPString': 'BMPString',
        'UniversalString': 'UniversalString',
        'Constructed': 'CONSTRUCTED',
      };
      if (nameMap[constructorName]) {
        return nameMap[constructorName];
      }
    }
    
    
    return constructorName || 'UNKNOWN';
  };

  const handleParse = () => {
    setError('');
    setParsedData(null);
    setHexData('');

    try {
      let cleanInput = input.trim();
      
      // 优先检测PEM格式
      if (input.includes('-----BEGIN')) {
        const base64 = input
          .replace(/-----BEGIN[^-]+-----/, '')
          .replace(/-----END[^-]+-----/, '')
          .replace(/\s/g, '');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        cleanInput = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // 移除所有空格和换行
        cleanInput = cleanInput.replace(/\s+/g, '');
        
        // 优先检测hex格式（只包含0-9A-Fa-f）
        if (/^[0-9A-Fa-f]+$/.test(cleanInput)) {
          // 已经是hex格式，直接使用
          // cleanInput保持不变
        } 
        // 如果不是hex，尝试Base64
        else if (/^[A-Za-z0-9+/]+=*$/.test(cleanInput) && cleanInput.length > 20) {
          try {
            const binary = atob(cleanInput);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            cleanInput = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
          } catch {
            throw new Error('Invalid input format');
          }
        } else {
          throw new Error('Invalid input format');
        }
      }

      // 最终验证：必须是有效的hex字符串
      if (!/^[0-9A-Fa-f]+$/.test(cleanInput)) {
        throw new Error('Invalid hex input');
      }
      
      // 验证hex长度必须是偶数
      if (cleanInput.length % 2 !== 0) {
        throw new Error('Hex string length must be even');
      }

      const bytes = new Uint8Array(cleanInput.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // 解析ASN.1结构
      const asn1Obj = parseASN1Buffer(bytes);
      
      if (!asn1Obj) {
        throw new Error('ASN.1 result is null or undefined');
      }
      
      // 转换节点结构
      let tempParsed: ParsedNode;
      try {
        // 调试：检查根对象结构
        console.log('Root ASN1 object structure:', {
          constructor: asn1Obj.constructor?.name,
          idBlock: asn1Obj.idBlock ? {
            tagClass: asn1Obj.idBlock.tagClass,
            tagNumber: asn1Obj.idBlock.tagNumber,
            isConstructed: asn1Obj.idBlock.isConstructed,
            blockLength: asn1Obj.idBlock.blockLength
          } : null,
          lenBlock: asn1Obj.lenBlock ? {
            value: asn1Obj.lenBlock.value,
            blockLength: asn1Obj.lenBlock.blockLength
          } : null,
          blockLength: asn1Obj.blockLength,
          hasValueBlock: !!asn1Obj.valueBlock,
          valueBlockType: Array.isArray(asn1Obj.valueBlock?.value) ? 'array' : typeof asn1Obj.valueBlock?.value,
          valueBlockLength: Array.isArray(asn1Obj.valueBlock?.value) ? asn1Obj.valueBlock.value.length : 'N/A',
          valueBlockValue: asn1Obj.valueBlock?.value
        });
        
        tempParsed = convertToNode(asn1Obj, 0, bytes, 0);
        
        console.log('Converted root node:', {
          type: tempParsed.type,
          offset: tempParsed.offset,
          length: tempParsed.length,
          totalLength: tempParsed.totalLength,
          childrenCount: tempParsed.children?.length || 0,
          firstChild: tempParsed.children?.[0] ? {
            type: tempParsed.children[0].type,
            fieldName: tempParsed.children[0].fieldName,
            childrenCount: tempParsed.children[0].children?.length || 0
          } : null
        });
      } catch (err) {
        console.error('convertToNode error:', err, 'asn1Obj:', asn1Obj);
        throw new Error('Failed to convert ASN.1 structure: ' + (err instanceof Error ? err.message : String(err)));
      }
      
      // 先应用自动识别字段名（用于更好的匹配）
      addFieldNames(tempParsed, 'root');
      
      // 检测结构类型并生成动态definitions
      let detectedDefinitions: Array<{label: string; value: string; score: number}> = [];
      try {
        detectedDefinitions = detectStructure(tempParsed);
      } catch (err) {
        console.error('Failed to detect structure:', err);
      }
      setDynamicDefinitions(detectedDefinitions);
      
      // 自动选择最高匹配度的定义
      let selectedDefinition = '';
      if (detectedDefinitions.length > 0 && detectedDefinitions[0].value !== 'none') {
        selectedDefinition = detectedDefinitions[0].value;
        setDefinition(selectedDefinition);
      } else {
        setDefinition('');
      }
      
      // 使用选中的definition重新解析并应用字段名
      let rootNode: ParsedNode;
      try {
        rootNode = convertToNode(asn1Obj, 0, bytes, 0);
        applyDefinitionWithFormat(rootNode, selectedDefinition);
      } catch (err) {
        throw new Error('Failed to apply definition: ' + (err instanceof Error ? err.message : String(err)));
      }
      
      setParsedData(rootNode);
      setHexData(cleanInput.toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setInput(text);
        // 如果没有选择definitions，默认选择PKCS#1 RSA Private key
        if (!definition) {
          setDefinition('pkcs1-rsa');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'File read failed');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const renderTree = (node: ParsedNode, level: number = 0): React.ReactNode => {
    const isHovered = hoveredNode === node;
    
    const copyMenuItems = [
      { 
        key: 'hex', 
        label: t.asn1.copyHexDump,
        onClick: () => handleCopy('hex', node)
      },
      { 
        key: 'base64', 
        label: t.asn1.copyBase64,
        onClick: () => handleCopy('base64', node)
      },
      { 
        key: 'subtree', 
        label: t.asn1.copySubtree,
        onClick: () => handleCopy('subtree', node)
      },
      { 
        key: 'value', 
        label: t.asn1.copyValue,
        onClick: () => handleCopy('value', node)
      }
    ];

    const handleCopy = (key: string, node: ParsedNode) => {
      try {
        let text = '';
        if (key === 'hex') {
          if (!node.rawData || node.rawData.length === 0) {
            message.error('No data to copy');
            return;
          }
          text = Array.from(node.rawData).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
        } else if (key === 'base64') {
          if (!node.rawData || node.rawData.length === 0) {
            message.error('No data to copy');
            return;
          }
          const binary = String.fromCharCode(...Array.from(node.rawData));
          text = btoa(binary);
        } else if (key === 'subtree') {
          // 创建一个可序列化的副本，移除循环引用
          const serializableNode = {
            type: node.type,
            fieldName: node.fieldName,
            length: node.length,
            offset: node.offset,
            totalLength: node.totalLength,
            isConstructed: node.isConstructed,
            value: node.value,
            valueHex: node.valueHex,
            children: node.children ? node.children.map(child => ({
              type: child.type,
              fieldName: child.fieldName,
              length: child.length,
              offset: child.offset,
              value: child.value
            })) : undefined
          };
          text = JSON.stringify(serializableNode, null, 2);
        } else if (key === 'value') {
          if (node.value) {
            text = node.value;
          } else if (node.rawData && node.rawData.length > 0) {
            text = Array.from(node.rawData).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
          } else {
            message.error('No value to copy');
            return;
          }
        }
        
        if (!text) {
          message.error('No content to copy');
          return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
          message.success(t.common.copied);
        }).catch(err => {
          console.error('Copy failed:', err);
          message.error('Copy failed');
        });
      } catch (err) {
        console.error('Copy error:', err);
        message.error('Copy failed: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    // 计算header长度（tag + length字段）
    const headerLen = node.totalLength - node.length;
    const elementInfo = node.children 
      ? `(${node.children.length} elem)` 
      : '';

    // 处理值显示，支持省略和展开（参考asn1js的content预览逻辑）
    let displayValue = node.value || '';
    const maxPreviewLength = 80;
    const shouldTruncate = displayValue.length > maxPreviewLength;
    const previewValue = shouldTruncate ? displayValue.substring(0, maxPreviewLength) + '…' : displayValue;

    return (
      <div key={node.offset} style={{ marginLeft: level * 16, marginBottom: 2 }}>
        <div
          style={{
            position: 'relative',
            cursor: 'context-menu',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            userSelect: 'none'
          }}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <Dropdown
            menu={{
              items: copyMenuItems
            }}
            trigger={['contextMenu']}
          >
            {/* 头部：字段名和类型（参考asn1js的head部分） */}
            <div 
              className="asn1-node-head"
              style={{ 
                padding: '2px 8px',
                background: isHovered ? '#e6f7ff' : 'transparent',
                borderRadius: 4,
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}
            >
              {node.fieldName && (
                <span style={{ color: '#000', fontWeight: 600, marginRight: 8 }}>
                  {node.fieldName}
                </span>
              )}
              <span style={{ color: '#1677ff', fontWeight: 600 }}>{node.type}</span>
              {elementInfo && (
                <span style={{ color: '#999', marginLeft: 8 }}>{elementInfo}</span>
              )}
              {/* 内容预览（参考asn1js的preview部分） */}
              {previewValue && (
                <span style={{ color: '#666', marginLeft: 8 }}>
                  {previewValue.split('\n').map((line, i) => (
                    i === 0 ? line : <span key={i} style={{ color: '#999' }}> | {line}</span>
                  ))}
                </span>
              )}
            </div>
          </Dropdown>
          
          {/* 详细信息（参考asn1js的value div部分）- 默认隐藏，鼠标悬停时显示 */}
          {isHovered && (
              <div 
                className="asn1-node-value"
                style={{ 
                  position: 'absolute',
                  zIndex: 10,
                  top: '1.2em',
                  left: '30px',
                  background: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: '8px 12px',
                  fontSize: '12px', 
                  color: '#666',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  maxWidth: '600px',
                  pointerEvents: 'none'
                }}
              >
                <div><strong>{t.asn1.offset}:</strong> {node.offset}</div>
                <div><strong>{t.asn1.length}:</strong> {headerLen}+{node.length}</div>
                {node.isConstructed && (
                  <div style={{ fontStyle: 'italic', color: '#999' }}>({t.asn1.constructed})</div>
                )}
                {node.value && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>{t.asn1.value}:</div>
                    <div style={{ 
                      padding: '6px 8px', 
                      background: '#f5f5f5', 
                      borderRadius: 4,
                      wordBreak: 'break-all',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }}>
                      {displayValue}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dropdown>
        {node.children?.map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  const renderHexDump = () => {
    if (!hexData) return null;

    const bytes = hexData.match(/.{2}/g) || [];
    const hoveredRange = hoveredNode ? {
      start: hoveredNode.offset,
      end: hoveredNode.offset + hoveredNode.totalLength
    } : null;

    // 将字节数组按16字节一行分组
    const lines: string[][] = [];
    for (let i = 0; i < bytes.length; i += 16) {
      lines.push(bytes.slice(i, i + 16));
    }

    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
        fontSize: '13px', 
        lineHeight: '1.8'
      }}>
        <div style={{ textAlign: 'left' }}>
          {lines.map((line, lineIndex) => {
            const lineStartIndex = lineIndex * 16;
            return (
              <div key={lineIndex} style={{ whiteSpace: 'nowrap' }}>
                {line.map((byte, byteIndexInLine) => {
                  const index = lineStartIndex + byteIndexInLine;
                  const isInRange = hoveredRange && index >= hoveredRange.start && index < hoveredRange.end;
                  
                  return (
                    <span
                      key={index}
                      style={{
                        background: isInRange ? '#e6f7ff' : 'transparent',
                        padding: '2px 1px',
                        borderRadius: 2,
                        color: isInRange ? '#1677ff' : '#000',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => {
                        // 查找包含此字节的最内层节点
                        const findDeepestNode = (node: ParsedNode): ParsedNode | null => {
                          if (index >= node.offset && index < node.offset + node.totalLength) {
                            if (node.children) {
                              for (const child of node.children) {
                                const found = findDeepestNode(child);
                                if (found) return found;
                              }
                            }
                            return node;
                          }
                          return null;
                        };
                        if (parsedData) {
                          const found = findDeepestNode(parsedData);
                          if (found) setHoveredNode(found);
                        }
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {byte}
                      {byteIndexInLine < line.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          {t.asn1.title}
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.asn1.description}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.asn1.inputLabel}
            </Text>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.asn1.inputPlaceholder}
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          <Space wrap>
            <Checkbox checked={withHexDump} onChange={e => setWithHexDump(e.target.checked)}>
              {t.asn1.withHexDump}
            </Checkbox>
            <Checkbox checked={trimBigChunks} onChange={e => setTrimBigChunks(e.target.checked)}>
              {t.asn1.trimBigChunks}
            </Checkbox>
            <Checkbox checked={withDefinitions} onChange={e => setWithDefinitions(e.target.checked)}>
              {t.asn1.withDefinitions}
            </Checkbox>
          </Space>

          <Space wrap>
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept=".der,.cer,.crt,.pem,.p7b,.p7c,.key"
            >
              <Button icon={<UploadOutlined />}>
                {t.asn1.uploadFile}
              </Button>
            </Upload>
            
            <Button 
              type="primary"
              icon={<FileSearchOutlined />}
              onClick={handleParse}
            >
              {t.asn1.parse}
            </Button>

            {(parsedData || error) && (
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setParsedData(null);
                  setHexData('');
                  setError('');
                  setInput('');
                }}
              >
                {t.asn1.clear}
              </Button>
            )}
          </Space>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Load examples:
              </Text>
              <Select
                value={loadExample}
                onChange={setLoadExample}
                options={examples}
                placeholder="Select format type..."
                style={{ width: '100%' }}
                allowClear
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.asn1.structureDefinition}
              </Text>
              <Select
                value={definition}
                onChange={(val) => {
                  const newDefinition = val || '';
                  setDefinition(newDefinition);
                  // 重新解析以应用新的definition
                  if (parsedData && hexData) {
                    const bytes = new Uint8Array(hexData.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
                    try {
                      const asn1Obj = parseASN1Buffer(bytes);
                      if (asn1Obj) {
                        const rootNode = convertToNode(asn1Obj, 0, bytes, 0);
                        applyDefinitionWithFormat(rootNode, newDefinition);
                        setParsedData(rootNode);
                      }
                    } catch (err) {
                      console.error('Failed to reparse:', err);
                    }
                  }
                }}
                options={dynamicDefinitions.length > 0 ? dynamicDefinitions.map(d => ({ label: d.label, value: d.value })) : [{ label: 'no definition', value: 'none' }]}
                placeholder={t.asn1.selectDefinition}
                style={{ width: '100%' }}
                allowClear
              />
            </div>
          </div>
        </Space>

        {error && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <Alert message={error} type="error" showIcon />
          </>
        )}

        {parsedData && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: withHexDump ? '60% 40%' : '100%', gap: 16 }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                  {t.asn1.parsedResult}
                </Text>
                <div style={{ 
                  background: '#fafafa', 
                  padding: 16, 
                  borderRadius: 8, 
                  border: '1px solid #e1e4e8',
                  maxHeight: 600,
                  overflowX: 'auto',
                  overflowY: 'auto'
                }}>
                  {renderTree(parsedData)}
                </div>
              </div>

              {withHexDump && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>
                    {t.asn1.hexDump}
                  </Text>
                  <div style={{ 
                    background: '#fafafa', 
                    padding: 16, 
                    borderRadius: 8, 
                    border: '1px solid #e1e4e8',
                    maxHeight: 600,
                    overflow: 'auto'
                  }}>
                    {renderHexDump()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ASN1Analyzer;
