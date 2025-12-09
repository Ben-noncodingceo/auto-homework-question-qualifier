/**
 * Document Parser - Extracts text from PDF and Word documents
 * For Cloudflare Workers environment
 */

export class DocumentParser {
  /**
   * Parse document and extract text content
   */
  static async parseDocument(file: File): Promise<string> {
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
   * Parse PDF document using pdf-parse library
   * Note: In Workers environment, we may need to use a lighter alternative
   */
  private static async parsePDF(buffer: ArrayBuffer): Promise<string> {
    try {
      // Simple PDF text extraction for Workers
      // This is a basic implementation - for production, consider using
      // Cloudflare Workers AI for OCR or a specialized PDF parsing library

      const uint8Array = new Uint8Array(buffer);
      const text = this.extractTextFromPDFBuffer(uint8Array);

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF. The file may be image-based or corrupted.');
      }

      return text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Parse Word document
   */
  private static async parseWord(buffer: ArrayBuffer): Promise<string> {
    try {
      // For Word documents, we need to extract text from the XML structure
      // This is a simplified implementation
      const text = this.extractTextFromWordBuffer(new Uint8Array(buffer));

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in Word document.');
      }

      return text;
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
