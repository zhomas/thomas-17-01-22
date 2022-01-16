import React from 'react';
import { render, screen } from '@testing-library/react';
import { orderbookSelector } from './orderbook.slice';

it('calculates the order book', () => {
  const orderBook = orderbookSelector({
    orderbook: {
      bids: {
        ids: ['a', 'b'],
        entities: {
          a: {
            price: 10,
            size: 1,
          },
          b: {
            price: 9,
            size: 1,
          },
        },
      },
      asks: {
        ids: ['a', 'b'],
        entities: {
          a: {
            price: 5,
            size: 2,
          },
          b: {
            price: 4,
            size: 5,
          },
        },
      },
      stashedBids: [],
      stashedAsks: [],
      contract: 'PI_ETHUSD',
    },
    site: {
      hasFocus: true,
    },
  });

  expect(orderBook.bids[0].displayPrice).toBe('10.00');
  expect(orderBook.bids[0].total).toBe(1);
  expect(orderBook.bids[0].level).toBe(1);

  expect(orderBook.bids[0].displayPrice).toBe('9.00');
  expect(orderBook.bids[1].total).toBe(2);
  expect(orderBook.bids[1].level).toBe(2);

  expect(orderBook.bids[0].displayPrice).toBe('4.00');
  expect(orderBook.asks[0].total).toBe(5);
  expect(orderBook.asks[0].level).toBe(1);

  expect(orderBook.asks[1].displayPrice).toBe('5.00');
  expect(orderBook.asks[1].total).toBe(7);
  expect(orderBook.asks[1].level).toBe(2);
});
