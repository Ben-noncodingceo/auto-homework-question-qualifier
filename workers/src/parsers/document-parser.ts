/**
 * Document Parser - Extracts text and images from PDF and Word documents
 * For Cloudflare Workers environment with multimodal AI support
 */

import { DocumentContent, ExtractedImage } from '../types';

export class DocumentParser {
  /**
   * Parse document and extract text and image content
   */
  static async parseDocument(file: File): Promise<DocumentContent> {
    const arrayBuffer = await file.arrayBuffer();
    const filename = file.name.toLowerCase();

    if (filename.endsWith('.pdf')) {
      return this.parsePDF(arrayBuffer);
    } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
      return this.parseWord(arrayBuffer);
    } else {
      throw new Error('Unsupported file format. Only PDF and Word documents are supported.');
    }
  }

  /**
   * Parse PDF document and extract both text and images
   * Enhanced for multimodal AI processing
   */
  private static async parsePDF(buffer: ArrayBuffer): Promise<DocumentContent> {
    try {
      const uint8Array = new Uint8Array(buffer);

      // Extract text using multiple strategies
      const text = this.extractTextFromPDFBuffer(uint8Array);

      // Extract images from PDF
      const images = this.extractImagesFromPDF(uint8Array);

      if ((!text || text.trim().length === 0) && images.length === 0) {
        throw new Error('No text or image content found in PDF. The file may be corrupted.');
      }

      return {
        text: text || '',
        images: images
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Parse Word document and extract both text and images
   */
  private static async parseWord(buffer: ArrayBuffer): Promise<DocumentContent> {
    try {
      const uint8Array = new Uint8Array(buffer);

      // Extract text from Word XML structure
      const text = this.extractTextFromWordBuffer(uint8Array);

      // Extract images from Word document
      const images = this.extractImagesFromWord(uint8Array);

      if ((!text || text.trim().length === 0) && images.length === 0) {
        throw new Error('No text or image content found in Word document.');
      }

      return {
        text: text || '',
        images: images
      };
    } catch (error) {
      throw new Error(`Failed to parse Word document: ${error}`);
    }
  }

  /**
   * Extract text from PDF buffer (enhanced implementation)
   * This extracts text from various PDF operators and encodings
   */
  private static extractTextFromPDFBuffer(buffer: Uint8Array): string {
    // Try multiple encodings to handle different PDF formats
    const encodings = ['utf-8', 'latin1', 'windows-1252'];
    let bestResult = '';
    let maxTextLength = 0;

    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false });
        const content = decoder.decode(buffer);
        const extractedText = this.extractTextWithMultipleStrategies(content);

        if (extractedText.length > maxTextLength) {
          maxTextLength = extractedText.length;
          bestResult = extractedText;
        }
      } catch (e) {
        // Continue with next encoding
        continue;
      }
    }

    return bestResult;
  }

  /**
   * Extract text using multiple PDF parsing strategies
   */
  private static extractTextWithMultipleStrategies(content: string): string {
    const texts: string[] = [];

    // Strategy 1: Extract from BT/ET blocks with Tj operator
    const tjTexts = this.extractWithTjOperator(content);
    texts.push(...tjTexts);

    // Strategy 2: Extract from TJ array operator
    const tjArrayTexts = this.extractWithTJOperator(content);
    texts.push(...tjArrayTexts);

    // Strategy 3: Extract from stream objects
    const streamTexts = this.extractFromStreams(content);
    texts.push(...streamTexts);

    // Strategy 4: Extract text in parentheses (fallback)
    const parenTexts = this.extractParenthesisText(content);
    texts.push(...parenTexts);

    // Remove duplicates and join
    const uniqueTexts = [...new Set(texts.filter(t => t.trim().length > 0))];
    return uniqueTexts.join(' ').trim();
  }

  /**
   * Extract text using Tj operator
   */
  private static extractWithTjOperator(content: string): string[] {
    const texts: string[] = [];
    const btPattern = /BT\s+(.*?)\s+ET/gs;
    const matches = content.matchAll(btPattern);

    for (const match of matches) {
      const textContent = match[1];
      const tjPattern = /\((.*?)\)\s*Tj/g;
      const tjMatches = textContent.matchAll(tjPattern);

      for (const tjMatch of tjMatches) {
        const text = this.decodeTextString(tjMatch[1]);
        if (text.trim()) {
          texts.push(text);
        }
      }
    }

    return texts;
  }

  /**
   * Extract text using TJ (array) operator
   */
  private static extractWithTJOperator(content: string): string[] {
    const texts: string[] = [];
    const tjPattern = /\[(.*?)\]\s*TJ/gs;
    const matches = content.matchAll(tjPattern);

    for (const match of matches) {
      const arrayContent = match[1];
      // Extract strings from array
      const stringPattern = /\((.*?)\)/g;
      const stringMatches = arrayContent.matchAll(stringPattern);

      for (const stringMatch of stringMatches) {
        const text = this.decodeTextString(stringMatch[1]);
        if (text.trim()) {
          texts.push(text);
        }
      }
    }

    return texts;
  }

  /**
   * Extract text from PDF stream objects
   */
  private static extractFromStreams(content: string): string[] {
    const texts: string[] = [];
    const streamPattern = /stream\s+(.*?)\s+endstream/gs;
    const matches = content.matchAll(streamPattern);

    for (const match of matches) {
      const streamContent = match[1];
      // Look for readable text in streams
      const readablePattern = /[\u0020-\u007E\u4e00-\u9fa5]{3,}/g;
      const readableMatches = streamContent.matchAll(readablePattern);

      for (const readableMatch of readableMatches) {
        const text = readableMatch[0].trim();
        if (text.length > 3) {
          texts.push(text);
        }
      }
    }

    return texts;
  }

  /**
   * Extract all text in parentheses (fallback strategy)
   */
  private static extractParenthesisText(content: string): string[] {
    const texts: string[] = [];
    const parenPattern = /\(([^)]{3,})\)/g;
    const matches = content.matchAll(parenPattern);

    for (const match of matches) {
      const text = this.decodeTextString(match[1]);
      // Only include text with actual readable content
      if (text.trim().length > 2 && /[\u0020-\u007E\u4e00-\u9fa5]/.test(text)) {
        texts.push(text);
      }
    }

    return texts;
  }

  /**
   * Decode PDF text string with escape sequences
   */
  private static decodeTextString(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .replace(/\\([()])/g, '$1')
      .replace(/\\([0-7]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .trim();
  }

  /**
   * Extract text from Word (.docx) buffer
   * Simplified implementation - extracts from document.xml
   */
  private static extractTextFromWordBuffer(buffer: Uint8Array): string {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(buffer);

    // Extract text between <w:t> tags (Word XML text elements)
    const textPattern = /<w:t[^>]*>(.*?)<\/w:t>/gs;
    const matches = content.matchAll(textPattern);

    const texts: string[] = [];
    for (const match of matches) {
      const text = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      if (text.trim()) {
        texts.push(text);
      }
    }

    return texts.join(' ').trim();
  }

  /**
   * Extract images from PDF buffer
   * Looks for JPEG and PNG images embedded in PDF
   */
  private static extractImagesFromPDF(buffer: Uint8Array): ExtractedImage[] {
    const images: ExtractedImage[] = [];
    const decoder = new TextDecoder('latin1', { fatal: false });
    const content = decoder.decode(buffer);

    let imageIndex = 0;

    // Strategy 1: Find JPEG images (starts with FF D8 FF, ends with FF D9)
    const jpegStartMarker = '\xFF\xD8\xFF';
    const jpegEndMarker = '\xFF\xD9';

    let pos = 0;
    while ((pos = content.indexOf(jpegStartMarker, pos)) !== -1) {
      const endPos = content.indexOf(jpegEndMarker, pos);
      if (endPos !== -1) {
        const imageData = content.substring(pos, endPos + 2);
        const base64 = this.arrayBufferToBase64(new TextEncoder().encode(imageData));

        images.push({
          data: base64,
          mimeType: 'image/jpeg',
          index: imageIndex++
        });

        pos = endPos + 2;
      } else {
        break;
      }
    }

    // Strategy 2: Find PNG images (starts with 89 50 4E 47, contains IEND)
    const pngStartMarker = '\x89PNG';
    const pngEndMarker = 'IEND';

    pos = 0;
    while ((pos = content.indexOf(pngStartMarker, pos)) !== -1) {
      const endPos = content.indexOf(pngEndMarker, pos);
      if (endPos !== -1) {
        const imageData = content.substring(pos, endPos + 8); // IEND + 4 bytes CRC
        const base64 = this.arrayBufferToBase64(new TextEncoder().encode(imageData));

        images.push({
          data: base64,
          mimeType: 'image/png',
          index: imageIndex++
        });

        pos = endPos + 8;
      } else {
        break;
      }
    }

    return images;
  }

  /**
   * Extract images from Word (.docx) buffer
   * Word files are ZIP archives containing media files
   */
  private static extractImagesFromWord(buffer: Uint8Array): ExtractedImage[] {
    const images: ExtractedImage[] = [];

    // Word documents are ZIP files, we look for image files in the ZIP structure
    // This is a simplified implementation
    const decoder = new TextDecoder('latin1', { fatal: false });
    const content = decoder.decode(buffer);

    let imageIndex = 0;

    // Look for JPEG images
    const jpegStartMarker = '\xFF\xD8\xFF';
    const jpegEndMarker = '\xFF\xD9';

    let pos = 0;
    while ((pos = content.indexOf(jpegStartMarker, pos)) !== -1) {
      const endPos = content.indexOf(jpegEndMarker, pos);
      if (endPos !== -1) {
        const imageData = content.substring(pos, endPos + 2);
        const base64 = this.arrayBufferToBase64(new TextEncoder().encode(imageData));

        images.push({
          data: base64,
          mimeType: 'image/jpeg',
          index: imageIndex++
        });

        pos = endPos + 2;
      } else {
        break;
      }
    }

    // Look for PNG images
    const pngStartMarker = '\x89PNG';
    const pngEndMarker = 'IEND';

    pos = 0;
    while ((pos = content.indexOf(pngStartMarker, pos)) !== -1) {
      const endPos = content.indexOf(pngEndMarker, pos);
      if (endPos !== -1) {
        const imageData = content.substring(pos, endPos + 8);
        const base64 = this.arrayBufferToBase64(new TextEncoder().encode(imageData));

        images.push({
          data: base64,
          mimeType: 'image/png',
          index: imageIndex++
        });

        pos = endPos + 8;
      } else {
        break;
      }
    }

    return images;
  }

  /**
   * Convert Uint8Array to base64 string
   */
  private static arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  /**
   * Validate if the extracted text contains valid content
   */
  static validateContent(text: string): boolean {
    if (!text || text.trim().length < 10) {
      return false;
    }

    // Check if text contains some Chinese characters or Latin letters
    const hasValidChars = /[\u4e00-\u9fa5a-zA-Z]/.test(text);

    return hasValidChars;
  }
}
