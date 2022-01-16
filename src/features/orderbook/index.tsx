import React, { useEffect } from 'react';
import { useAppSelector } from '../..';
import { useOrderbookData } from './useOrderbookData';
import { hasFocusSelector } from '../../app/app.slice';
import { orderbookSelector } from './orderbook.slice';
import StyledOrderbook from './orderbook.component';

interface Props {}

const Orderbook: React.FC<Props> = () => {
  const { start, stop, switchCurrency } = useOrderbookData();
  const hasFocus = useAppSelector(hasFocusSelector);
  const orderbook = useAppSelector(orderbookSelector);

  useEffect(() => {
    const fn = hasFocus ? start : stop;
    fn();
  }, [hasFocus]);

  console.log('render');

  return (
    <>
      <StyledOrderbook heading={'Order Book'} orderbook={orderbook} />
      <button onClick={switchCurrency}> Switch Currency </button>
    </>
  );
};

export default Orderbook;
