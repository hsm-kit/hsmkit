import React, { useState, useEffect } from 'react';
import { Card, Button, message, Typography, Upload, Divider, Input, Select, Space, Alert, Checkbox } from 'antd';
import { FileSearchOutlined, UploadOutlined, CloseCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 预加载 asn1js 模块 - 立即开始加载，不阻塞渲染
let ASN1: any, Hex: any, Base64: any, Defs: any;
let asn1LoadPromise: Promise<boolean> | null = null;

const preloadASN1 = () => {
  if (asn1LoadPromise) return asn1LoadPromise;
  
  asn1LoadPromise = Promise.all([
    // @ts-ignore
    import('../../lib/asn1js/asn1.js'),
    // @ts-ignore
    import('../../lib/asn1js/hex.js'),
    // @ts-ignore
    import('../../lib/asn1js/base64.js'),
    // @ts-ignore
    import('../../lib/asn1js/defs.js'),
  ]).then(([asn1Module, hexModule, base64Module, defsModule]) => {
    ASN1 = asn1Module.ASN1;
    Hex = hexModule.Hex;
    Base64 = base64Module.Base64;
    Defs = defsModule.Defs;
    return true;
  }).catch(err => {
    console.error('Failed to load asn1js:', err);
    return false;
  });
  
  return asn1LoadPromise;
};

// 立即开始预加载（模块加载时就开始）
preloadASN1();

interface ASN1Node {
  typeName: string;
  fieldName?: string;
  offset: number;
  header: number;
  length: number;
  content?: string;
  children?: ASN1Node[];
  isConstructed: boolean;
  rawData: Uint8Array;
}

const ASN1Parser: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ASN1Node | null>(null);
  const [hexData, setHexData] = useState('');
  const [error, setError] = useState('');
  const [hoveredNode, setHoveredNode] = useState<ASN1Node | null>(null);
  const [definitions, setDefinitions] = useState<Array<{label: string; value: string}>>([]);
  const [selectedDef, setSelectedDef] = useState('');
  const [asn1Loaded, setAsn1Loaded] = useState(false);
  const [withHexDump, setWithHexDump] = useState(true);
  const [trimBigChunks, setTrimBigChunks] = useState(true);
  const [withDefinitions, setWithDefinitions] = useState(true);
  const [asn1Object, setAsn1Object] = useState<any>(null);

  useEffect(() => {
    // 等待预加载完成
    preloadASN1().then(loaded => {
      setAsn1Loaded(loaded);
      if (loaded && Defs && Defs.commonTypes) {
        const allDefs = Defs.commonTypes.map((type: any) => ({
          label: type.description,
          value: type.description
        }));
        setDefinitions([...allDefs, { label: 'no definition', value: 'none' }]);
      }
    });
  }, []);

  const convertASN1ToNode = (asn1: any): ASN1Node => {
    const node: ASN1Node = {
      typeName: asn1.typeName().replace(/_/g, ' '),
      offset: asn1.stream.pos,
      header: asn1.header,
      length: Math.abs(asn1.length),
      isConstructed: asn1.tag.tagConstructed || false,
      rawData: new Uint8Array(0),
    };

    // 添加字段名(来自 RFC 定义)
    if (asn1.def) {
      if (asn1.def.id) {
        node.fieldName = asn1.def.id;
      } else if (asn1.def.name && asn1.def.name !== node.typeName) {
        node.fieldName = asn1.def.name;
      }
    }

    // 获取原始数据
    try {
      const start = asn1.stream.pos;
      const end = start + asn1.header + Math.abs(asn1.length);
      node.rawData = asn1.stream.enc.slice(start, end);
    } catch (e) {
      console.error('Failed to extract raw data:', e);
    }

    // 获取内容
    try {
      const content = asn1.content(640); // 80 * 8
      if (content !== null) {
        node.content = content;
      }
    } catch (e) {
      node.content = 'Cannot decode: ' + e;
    }

    // 递归处理子节点
    if (asn1.sub !== null && asn1.sub.length > 0) {
      node.children = asn1.sub.map((sub: any) => convertASN1ToNode(sub));
    }

    return node;
  };

  const handleParse = async () => {
    setError('');
    setParsedData(null);
    setHexData('');

    if (!asn1Loaded) {
      setError(t.asn1.loadError);
      return;
    }

    if (!input.trim()) {
      setError(t.asn1.inputRequired);
      return;
    }

    try {
      let cleanInput = input.trim();
      let hexString = '';
      
      // 处理 PEM 格式
      if (cleanInput.includes('-----BEGIN')) {
        const base64 = cleanInput
          .replace(/-----BEGIN[^-]+-----/, '')
          .replace(/-----END[^-]+-----/, '')
          .replace(/\s/g, '');
        cleanInput = base64;
      } else {
        cleanInput = cleanInput.replace(/\s+/g, '');
      }

      // 解码数据
      let derBytes: Uint8Array;
      const reHex = /^[0-9A-Fa-f]+$/;
      
      if (reHex.test(cleanInput)) {
        hexString = cleanInput.toUpperCase();
        derBytes = Hex.decode(cleanInput);
      } else {
        derBytes = Base64.unarmor(cleanInput);
        // 将字节数组转换为 hex 字符串
        hexString = Array.from(derBytes).map(b => 
          b.toString(16).padStart(2, '0').toUpperCase()
        ).join('');
      }

      setHexData(hexString);

      // 解析 ASN.1 (ASN1.decode 接受 Uint8Array 或字符串)
      const asn1 = ASN1.decode(derBytes, 0);
      setAsn1Object(asn1);
      
      // 尝试匹配 RFC 定义
      if (withDefinitions && Defs && Defs.commonTypes) {
        const types = Defs.commonTypes
          .map((type: any) => {
            const stats = Defs.match(asn1, type);
            return { 
              type, 
              match: stats.recognized / stats.total,
              label: `${(stats.recognized / stats.total * 100).toFixed(1)}% ${type.description}`,
              value: type.description
            };
          })
          .sort((a: any, b: any) => b.match - a.match);
        
        // 更新定义列表(带匹配度)
        setDefinitions([...types, { label: 'no definition', value: 'none' }]);
        
        // 自动选择最佳匹配
        if (types.length > 0 && types[0].match > 0.5) {
          setSelectedDef(types[0].value);
          Defs.match(asn1, types[0].type);
        }
      }

      // 转换为 React 节点
      const rootNode = convertASN1ToNode(asn1);
      setParsedData(rootNode);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t.asn1.parseError);
      console.error('Parse error:', err);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setInput(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : '文件读取失败');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleDefinitionChange = (value: string) => {
    setSelectedDef(value);
    
    // 重新应用定义
    if (asn1Object && withDefinitions && Defs && Defs.commonTypes) {
      if (value === 'none') {
        Defs.match(asn1Object, null);
      } else {
        const selectedType = Defs.commonTypes.find((t: any) => t.description === value);
        if (selectedType) {
          Defs.match(asn1Object, selectedType);
        }
      }
      
      // 重新转换节点
      const rootNode = convertASN1ToNode(asn1Object);
      setParsedData(rootNode);
    }
  };

  const handleCopy = (node: ASN1Node, type: string) => {
    let text = '';
    if (type === 'hex') {
      text = Array.from(node.rawData).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
    } else if (type === 'value') {
      text = node.content || '';
    }
    navigator.clipboard.writeText(text);
    message.success(t.asn1.copied);
  };

  const renderHexDump = () => {
    if (!hexData || !withHexDump) return null;

    const bytes = hexData.match(/.{2}/g) || [];
    const hoveredRange = hoveredNode ? {
      start: hoveredNode.offset,
      end: hoveredNode.offset + hoveredNode.header + hoveredNode.length
    } : null;

    // 将字节数组按16字节一行分组
    const lines: string[][] = [];
    for (let i = 0; i < bytes.length; i += 16) {
      lines.push(bytes.slice(i, i + 16));
    }

    return (
      <div style={{ 
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
        fontSize: '11px', 
        lineHeight: '1.6',
        letterSpacing: '-0.3px'
      }}>
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
                      padding: '1px 0',
                      borderRadius: 2,
                      color: isInRange ? '#1677ff' : '#666',
                      cursor: 'pointer'
                    }}
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
    );
  };

  const renderNode = (node: ASN1Node, level: number = 0, isLast: boolean = true, prefix: string = ''): React.ReactNode => {
    const isHovered = hoveredNode === node;
    const hasChildren = node.children && node.children.length > 0;
    
    // 树形连接线
    const connector = level === 0 ? '' : (isLast ? '└─ ' : '├─ ');
    const childPrefix = level === 0 ? '' : prefix + (isLast ? '   ' : '│  ');

    return (
      <div key={`${node.offset}-${level}`} style={{ marginBottom: 1 }}>
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '12px',
            lineHeight: '1.5'
          }}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* 头部 */}
          <div 
            style={{ 
              padding: '1px 4px',
              background: isHovered ? '#e6f7ff' : 'transparent',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* 树形前缀 */}
            <span style={{ color: '#ccc', whiteSpace: 'pre' }}>{prefix}{connector}</span>
            {node.fieldName && (
              <span style={{ color: '#000', fontWeight: 600, marginRight: 6 }}>
                {node.fieldName}
              </span>
            )}
            <span style={{ color: '#1677ff', fontWeight: 600 }}>{node.typeName}</span>
            {hasChildren && (
              <span style={{ color: '#999', marginLeft: 6 }}>({node.children!.length} elem)</span>
            )}
            {node.content && (
              <span style={{ color: '#666', marginLeft: 6 }}>
                {node.content}
              </span>
            )}
          </div>
          
          {/* 悬停时显示详细信息 */}
          {isHovered && (
            <div 
              style={{ 
                position: 'absolute',
                zIndex: 10,
                top: '1.4em',
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
                maxWidth: '600px'
              }}
            >
              <div><strong>{t.asn1.offset}:</strong> {node.offset}</div>
              <div><strong>{t.asn1.length}:</strong> {node.header}+{node.length}</div>
              {node.isConstructed && (
                <div style={{ fontStyle: 'italic', color: '#999' }}>({t.asn1.constructed})</div>
              )}
              
              {/* 复制按钮 */}
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(node, 'hex');
                  }}
                >
                  {t.asn1.copyHex || '复制Hex'}
                </Button>
                {node.content && (
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(node, 'value');
                    }}
                  >
                    {t.asn1.copyValue || '复制值'}
                  </Button>
                )}
              </div>
              
              {node.content && (
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
                    {node.content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 递归渲染子节点 */}
        {hasChildren && node.children!.map((child, index) => 
          renderNode(child, level + 1, index === node.children!.length - 1, childPrefix)
        )}
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

          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 12, flexWrap: 'wrap', paddingLeft: 4 }}>
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              accept=".der,.cer,.crt,.pem,.p7b,.p7c,.key"
            >
              <Button icon={<UploadOutlined />} size="large">
                {t.asn1.uploadFile}
              </Button>
            </Upload>
            
            <Button 
              type="primary"
              icon={<FileSearchOutlined />}
              onClick={handleParse}
              loading={!asn1Loaded}
              size="large"
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
                  setAsn1Object(null);
                  setSelectedDef('');
                  // 重新加载初始定义列表
                  if (Defs && Defs.commonTypes) {
                    const allDefs = Defs.commonTypes.map((type: any) => ({
                      label: type.description,
                      value: type.description
                    }));
                    setDefinitions([...allDefs, { label: 'no definition', value: 'none' }]);
                  }
                }}
                size="large"
              >
                {t.asn1.clear}
              </Button>
            )}
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.asn1.structureDefinition}
            </Text>
            <Select
              value={selectedDef}
              onChange={handleDefinitionChange}
              options={definitions}
              style={{ width: '100%', maxWidth: 400 }}
              placeholder={t.asn1.selectDefinition}
              disabled={!parsedData}
            />
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
          )}
        </Space>

        {parsedData && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: withHexDump ? '1fr 320px' : '100%', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                  {t.asn1.parsedResult}
                </Text>
                <div style={{ 
                  background: '#fafafa', 
                  padding: 16, 
                  borderRadius: 8, 
                  border: '1px solid #e1e4e8',
                  maxHeight: 600,
                  overflowY: 'auto',
                  overflowX: 'auto'
                }}>
                  {renderNode(parsedData)}
                </div>
              </div>

              {withHexDump && hexData && (
                <div style={{ minWidth: 0 }}>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>
                    {t.asn1.hexDump}
                  </Text>
                  <div style={{ 
                    background: '#fafafa', 
                    padding: 12, 
                    borderRadius: 8, 
                    border: '1px solid #e1e4e8',
                    maxHeight: 600,
                    overflowY: 'auto',
                    overflowX: 'auto'
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

export default ASN1Parser;
