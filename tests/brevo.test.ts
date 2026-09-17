import { describe, it, expect } from 'vitest';
import { 
  parseAndDeduplicateEmails, 
  generateLuxuryEmailHtml,
  getBrevoConfig 
} from '../src/lib/brevo';

describe('Brevo Email Suite', () => {
  it('correctly parses, cleans, and deduplicates emails from mixed text input', () => {
    const rawInput = `
      vip1@manila-wine.com
      vip2@manila-wine.com, vip3@manila-wine.com; VIP1@MANILA-WINE.COM
      "John Doe" <vip4@manila-wine.com>
      invalid-email-address
      vip2@manila-wine.com
      another.valid+collector@domain.co.uk
    `;

    const result = parseAndDeduplicateEmails(rawInput);

    expect(result.valid).toEqual([
      'vip1@manila-wine.com',
      'vip2@manila-wine.com',
      'vip3@manila-wine.com',
      'vip4@manila-wine.com',
      'another.valid+collector@domain.co.uk',
    ]);
    expect(result.invalid).toContain('invalid-email-address');
    expect(result.duplicatesCount).toBe(2); // VIP1 uppercase duplicate + vip2 duplicate
  });

  it('handles empty input gracefully', () => {
    const result = parseAndDeduplicateEmails('');
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.duplicatesCount).toBe(0);
  });

  it('generates luxury HTML email with required brand links, CTA, and compliance footer', () => {
    const html = generateLuxuryEmailHtml({
      subject: 'Custom VIP Invitation',
      headline: 'A Historic Opportunity',
      ctaText: 'CAST YOUR VOTE NOW',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Custom VIP Invitation');
    expect(html).toContain('A Historic Opportunity');
    expect(html).toContain('CAST YOUR VOTE NOW');
    expect(html).toContain('Manila Wine');
    expect(html).toContain('Strictly Limited to 100 Bottles');
    expect(html).toContain('Treasures of the Philippines');
    expect(html).toContain('Enjoy Responsibly');
    expect(html).toContain('{{ unsubscribe }}');
  });

  it('correctly loads default configuration', () => {
    const config = getBrevoConfig();
    expect(config.senderEmail).toBe('contact@manila-wine.com');
    expect(config.senderName).toBe('MANILA WINE');
  });
});
