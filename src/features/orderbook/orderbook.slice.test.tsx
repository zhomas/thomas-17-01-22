import reducer, { orderbookSelector, updateDelta } from './orderbook.slice';
import { OrdersState } from './orderbook.types';
import { tick } from '../../app/app.slice';

const getTestState = (): OrdersState => {
  return {
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
    queuedBids: [],
    queuedAsks: [],
    contract: 'PI_ETHUSD',
  };
};

it('adds an order the queue', () => {
  const result = reducer(
    getTestState(),
    updateDelta({ asks: [], bids: [{ price: 20, size: 1000 }] })
  );

  expect(result.queuedBids.length).toBe(1);
  expect(result.queuedBids[0].price).toBe(20);
  expect(result.queuedBids[0].size).toBe(1000);
});

it('flushes the queue', () => {
  const state: OrdersState = { ...getTestState(), queuedBids: [{ price: 20, size: 1000 }] };

  const result = reducer(state, tick());

  expect(result.queuedBids).toHaveLength(0);
  expect(result.bids.ids).toHaveLength(3);
});

it('derives the orderbook', () => {
  const orderBook = orderbookSelector({
    orderbook: getTestState(),
    site: {
      hasFocus: false,
    },
  });

  expect(orderBook.bids[0].price).toBe('10.00');
  expect(orderBook.bids[0].levelTotal).toBe(1);
  expect(orderBook.bids[0].level).toBe(1);

  expect(orderBook.bids[1].price).toBe('9.00');
  expect(orderBook.bids[1].levelTotal).toBe(2);
  expect(orderBook.bids[1].level).toBe(2);

  expect(orderBook.asks[0].price).toBe('4.00');
  expect(orderBook.asks[0].levelTotal).toBe(5);
  expect(orderBook.asks[0].level).toBe(1);

  expect(orderBook.asks[1].price).toBe('5.00');
  expect(orderBook.asks[1].levelTotal).toBe(7);
  expect(orderBook.asks[1].level).toBe(2);
});
