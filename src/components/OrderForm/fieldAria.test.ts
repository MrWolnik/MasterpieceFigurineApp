import { describe, expect, it } from 'vitest';
import { fieldAria } from './fieldAria';

describe('fieldAria', () => {
  it('describes nothing for a plain field', () => {
    expect(fieldAria('name')).toEqual({
      aria: {
        id: 'name',
        'aria-required': undefined,
        'aria-invalid': false,
        'aria-describedby': undefined,
      },
      hintId: undefined,
      errorId: undefined,
    });
  });

  it('points at the error first, then the hint', () => {
    const { aria, hintId, errorId } = fieldAria('phone', {
      required: true,
      hint: 'Optional',
      error: 'form.errors.phone',
    });

    expect(hintId).toBe('phone-hint');
    expect(errorId).toBe('phone-error');
    expect(aria).toMatchObject({
      'aria-required': true,
      'aria-invalid': true,
      'aria-describedby': 'phone-error phone-hint',
    });
  });

  it('marks a field invalid only while it has an error', () => {
    expect(fieldAria('email', { hint: 'We reply here' }).aria).toMatchObject({
      'aria-invalid': false,
      'aria-describedby': 'email-hint',
    });
  });
});
