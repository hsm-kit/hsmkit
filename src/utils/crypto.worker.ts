import CryptoJS from 'crypto-js';

self.onmessage = function(e: MessageEvent) {
  const { id, type, payload } = e.data;
  
  try {
    let result: string;
    
    switch (type) {
      case 'hash': {
        const { algorithm, data, inputType } = payload;
        let wordArray: CryptoJS.lib.WordArray;
        
        if (inputType === 'hex') {
          wordArray = CryptoJS.enc.Hex.parse(data);
        } else {
          wordArray = CryptoJS.enc.Utf8.parse(data);
        }
        
        switch (algorithm) {
          case 'MD5':
            result = CryptoJS.MD5(wordArray).toString().toUpperCase();
            break;
          case 'SHA1':
            result = CryptoJS.SHA1(wordArray).toString().toUpperCase();
            break;
          case 'SHA256':
            result = CryptoJS.SHA256(wordArray).toString().toUpperCase();
            break;
          case 'SHA512':
            result = CryptoJS.SHA512(wordArray).toString().toUpperCase();
            break;
          case 'SHA3':
            result = CryptoJS.SHA3(wordArray).toString().toUpperCase();
            break;
          default:
            throw new Error('Unsupported algorithm: ' + algorithm);
        }
        break;
      }
      
      case 'aes-encrypt': {
        const { key, data, mode, iv, padding } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const dataWA = CryptoJS.enc.Hex.parse(data);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: (CryptoJS.mode as Record<string, unknown>)[mode] || CryptoJS.mode.ECB,
          padding: (CryptoJS.pad as Record<string, unknown>)[padding] || CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const encrypted = CryptoJS.AES.encrypt(dataWA, keyWA, config);
        result = encrypted.ciphertext.toString().toUpperCase();
        break;
      }
      
      case 'aes-decrypt': {
        const { key, data, mode, iv, padding } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: (CryptoJS.mode as Record<string, unknown>)[mode] || CryptoJS.mode.ECB,
          padding: (CryptoJS.pad as Record<string, unknown>)[padding] || CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(data)
        });
        
        const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, config);
        result = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
        break;
      }
      
      case 'des-encrypt': {
        const { key, data, mode, iv } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const dataWA = CryptoJS.enc.Hex.parse(data);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: (CryptoJS.mode as Record<string, unknown>)[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const encrypted = CryptoJS.TripleDES.encrypt(dataWA, keyWA, config);
        result = encrypted.ciphertext.toString().toUpperCase();
        break;
      }
      
      case 'des-decrypt': {
        const { key, data, mode, iv } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: (CryptoJS.mode as Record<string, unknown>)[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(data)
        });
        
        const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyWA, config);
        result = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
        break;
      }
      
      case 'kcv': {
        const { key, algorithm } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        
        if (algorithm === 'AES') {
          const zero = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
          const encrypted = CryptoJS.AES.encrypt(zero, keyWA, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          });
          result = encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
        } else {
          const zero = CryptoJS.enc.Hex.parse('0000000000000000');
          const encrypted = CryptoJS.TripleDES.encrypt(zero, keyWA, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          });
          result = encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
        }
        break;
      }
      
      default:
        throw new Error('Unknown operation type: ' + type);
    }
    
    self.postMessage({ id, success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ id, success: false, error: message });
  }
};
