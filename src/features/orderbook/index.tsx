import React, { useEffect } from 'react';
import { useAppSelector } from '../..';
import { useOrderbookData } from './orderbook.hooks';
import { hasFocusSelector } from '../../app/app.slice';
import { orderbookSelector } from './orderbook.slice';
import './orderbook.scss';

interface Props {
  heading: string;
}

const Orderbook: React.FC<Props> = ({ heading }) => {
  const { start, stop, switchCurrency } = useOrderbookData();
  const hasFocus = useAppSelector(hasFocusSelector);
  const orderbook = useAppSelector(orderbookSelector);

  useEffect(() => {
    const fn = hasFocus ? start : stop;
    fn();
  }, [hasFocus, start, stop]);

  if (orderbook.status === 'loading') {
    return <span>Loading...</span>;
  }

  return (
    <>
      <div className="orderbook">
        <div className="orderbook__heading">{heading}</div>
        <div className="orderbook__spread">
          Spread: {orderbook.spread} ({orderbook.spreadPercent}%)
        </div>
        <div className="orderbook__bids">
          <div className="orderbook__row orderbook__row--heading">
            <span className="orderbook__cell">Price</span>
            <span className="orderbook__cell">Size</span>
            <span className="orderbook__cell">Total</span>
          </div>
          <div className="orderbook__data">
            {orderbook.bids.map((bid) => (
              <div className="orderbook__row" key={bid.level}>
                <span className="orderbook__cell orderbook__cell--price">{bid.price}</span>
                <span className="orderbook__cell">{bid.size}</span>
                <span className="orderbook__cell">{bid.total}</span>
                <span
                  className="orderbook__depth-graph orderbook__depth-graph--bids"
                  style={{ transform: `scaleX(${orderbook.getRatio(bid)})` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="orderbook__asks">
          <div className="orderbook__row orderbook__row--heading">
            <span className="orderbook__cell">Price</span>
            <span className="orderbook__cell">Size</span>
            <span className="orderbook__cell">Total</span>
          </div>
          <div className="orderbook__data">
            {orderbook.asks.map((ask) => (
              <div className="orderbook__row" key={ask.level}>
                <span className="orderbook__cell orderbook__cell--price">{ask.price}</span>
                <span className="orderbook__cell">{ask.size}</span>
                <span className="orderbook__cell">{ask.total}</span>
                <span
                  className="orderbook__depth-graph orderbook__depth-graph--asks"
                  style={{ transform: `scaleX(${orderbook.getRatio(ask)})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={switchCurrency}>Switch Currency</button>
    </>
  );
};

export default Orderbook;
