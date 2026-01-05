import { describe, it, expect } from 'vitest';
import { extractTextFromHtml, extractTitle } from '../../src/services/fetcher.js';

describe('fetcher utilities', () => {
  describe('extractTextFromHtml', () => {
    it('should extract text from simple HTML', () => {
      const html = '<p>Hello World</p>';
      const text = extractTextFromHtml(html);
      expect(text).toBe('Hello World');
    });

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const text = extractTextFromHtml(html);
      expect(text).not.toContain('alert');
      expect(text).toContain('Hello');
      expect(text).toContain('World');
    });

    it('should remove style tags', () => {
      const html = '<style>.foo { color: red }</style><p>Content</p>';
      const text = extractTextFromHtml(html);
      expect(text).not.toContain('color');
      expect(text).toBe('Content');
    });

    it('should prefer article content', () => {
      const html = '<nav>Menu</nav><article>Main content here</article><footer>Footer</footer>';
      const text = extractTextFromHtml(html);
      expect(text).toContain('Main content here');
    });

    it('should handle empty input', () => {
      expect(extractTextFromHtml('')).toBe('');
    });

    it('should collapse whitespace', () => {
      const html = '<p>Hello    \n\n\t   World</p>';
      const text = extractTextFromHtml(html);
      expect(text).toBe('Hello World');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>Unclosed <b>tags and stuff';
      const text = extractTextFromHtml(html);
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('extractTitle', () => {
    it('should extract title from title tag', () => {
      const html = '<html><head><title>Page Title</title></head><body></body></html>';
      expect(extractTitle(html)).toBe('Page Title');
    });

    it('should extract title from h1 if no title tag', () => {
      const html = '<html><body><h1>Heading Title</h1><p>Content</p></body></html>';
      expect(extractTitle(html)).toBe('Heading Title');
    });

    it('should extract title from og:title meta', () => {
      const html = '<html><head><meta property="og:title" content="OG Title"></head></html>';
      expect(extractTitle(html)).toBe('OG Title');
    });

    it('should handle missing title', () => {
      const html = '<html><body><p>No title here</p></body></html>';
      expect(extractTitle(html)).toBeUndefined();
    });

    it('should trim whitespace', () => {
      const html = '<title>  Padded Title  </title>';
      expect(extractTitle(html)).toBe('Padded Title');
    });
  });
});
