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
   * Extract text from PDF buffer (basic implementation)
   * This extracts text between stream markers
   */
  private static extractTextFromPDFBuffer(buffer: Uint8Array): string {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(buffer);

    const texts: string[] = [];

    // Look for text between BT (Begin Text) and ET (End Text) markers
    const btPattern = /BT\s+(.*?)\s+ET/gs;
    const matches = content.matchAll(btPattern);

    for (const match of matches) {
      const textContent = match[1];
      // Extract text from Tj or TJ operators
      const tjPattern = /\((.*?)\)\s*Tj/g;
      const tjMatches = textContent.matchAll(tjPattern);

      for (const tjMatch of tjMatches) {
        const text = tjMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\([()])/g, '$1');

        if (text.trim()) {
          texts.push(text);
        }
      }
    }

    return texts.join(' ').trim();
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
