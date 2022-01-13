import React from 'react';
import { render, screen } from '@testing-library/react';
import { orderbookSelector } from './orders.slice';

it('calculates the order book', () => {
  const orderBook = orderbookSelector({
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
    contract: 'PI_ETHUSD',
  });

  expect(orderBook.bids[0].price).toBe(10);
  expect(orderBook.bids[0].total).toBe(1);
  expect(orderBook.bids[0].level).toBe(1);

  expect(orderBook.bids[1].price).toBe(9);
  expect(orderBook.bids[1].total).toBe(2);
  expect(orderBook.bids[1].level).toBe(2);

  expect(orderBook.asks[0].price).toBe(4);
  expect(orderBook.asks[0].total).toBe(5);
  expect(orderBook.asks[0].level).toBe(1);

  expect(orderBook.asks[1].price).toBe(5);
  expect(orderBook.asks[1].total).toBe(7);
  expect(orderBook.asks[1].level).toBe(2);
});