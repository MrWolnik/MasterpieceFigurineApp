import { describe, expect, it } from 'vitest';
import { emptyOrder } from './orderSchema';
import { orderFormData, orderSubject } from './submitOrder';
import type { Order } from './orderSchema';

const figurine: Order = {
  ...emptyOrder({ name: 'Anna', email: 'anna@example.com', description: 'x'.repeat(20) }),
  kind: 'figurine',
  consent: true,
};

describe('orderSubject', () => {
  it('names the order kind and the client', () => {
    expect(orderSubject({ kind: 'painting', name: 'Anna' })).toBe('[Obraz] Nowe zgłoszenie – Anna');
    expect(orderSubject({ kind: 'figurine', name: 'Jan' })).toBe('[Figurka] Nowe zgłoszenie – Jan');
  });
});

describe('orderFormData', () => {
  it('sends the form name, kind and subject, without painting fields for a figurine', () => {
    const data = orderFormData(figurine);

    expect(data.get('form-name')).toBe('order');
    expect(data.get('kind')).toBe('figurine');
    expect(data.get('subject')).toBe('[Figurka] Nowe zgłoszenie – Anna');
    expect(data.has('dimensions')).toBe(false);
    expect(data.has('technique')).toBe(false);
  });

  it('sends painting fields and the photo', () => {
    const files = [new File(['b'], 'b.gif', { type: 'image/gif' })];
    const data = orderFormData({
      ...figurine,
      kind: 'painting',
      dimensions: '50 × 70 cm',
      technique: 'oil',
      files,
    });

    expect(data.get('dimensions')).toBe('50 × 70 cm');
    expect(data.get('technique')).toBe('oil');
    expect((data.get('photo') as File).name).toBe('b.gif');
  });
});
