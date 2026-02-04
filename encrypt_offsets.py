#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AES Encryption Tool for Server-Side Offset Protection
يقوم بتشفير ملف offsets.json قبل رفعه على السيرفر
"""

import json
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import sys

# نفس المفتاح المستخدم في الكود
AES_KEY = b'ST_FAMILY_2026_KEY_SECURE_256BIT'  # 32 bytes

def encrypt_json(json_file, output_file):
    """تشفير ملف JSON باستخدام AES-256"""
    try:
        # قراءة الملف
        with open(json_file, 'r', encoding='utf-8') as f:
            json_data = f.read()
        
        # إنشاء cipher
        cipher = AES.new(AES_KEY, AES.MODE_ECB)
        
        # تشفير البيانات
        encrypted_data = cipher.encrypt(pad(json_data.encode('utf-8'), AES.block_size))
        
        # تحويل إلى Base64
        encrypted_base64 = base64.b64encode(encrypted_data).decode('utf-8')
        
        # حفظ الملف المشفر
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(encrypted_base64)
        
        print(f"✅ File encrypted successfully!")
        print(f"📁 Input: {json_file}")
        print(f"📁 Output: {output_file}")
        print(f"📊 Size: {len(encrypted_base64)} bytes")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def decrypt_json(encrypted_file):
    """فك تشفير ملف للاختبار"""
    try:
        with open(encrypted_file, 'r', encoding='utf-8') as f:
            encrypted_base64 = f.read()
        
        encrypted_data = base64.b64decode(encrypted_base64)
        
        cipher = AES.new(AES_KEY, AES.MODE_ECB)
        decrypted_data = unpad(cipher.decrypt(encrypted_data), AES.block_size)
        
        json_data = json.loads(decrypted_data.decode('utf-8'))
        
        print("✅ Decryption successful!")
        print("📋 Decrypted content:")
        print(json.dumps(json_data, indent=2))
        
    except Exception as e:
        print(f"❌ Decryption error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Encrypt: python encrypt_offsets.py offsets.json")
        print("  Decrypt: python encrypt_offsets.py offsets_encrypted.txt --decrypt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if "--decrypt" in sys.argv:
        decrypt_json(input_file)
    else:
        output_file = "offsets_encrypted.txt"
        encrypt_json(input_file, output_file)
