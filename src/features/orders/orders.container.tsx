import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AppDispatch, useAppSelector } from '../..';
import StyledOrders from './orders.main';
import { useOrderbookData } from './useOrderbookData';
import { hasFocusSelector } from '../site/site.slice';

type ReduxProps = ConnectedProps<typeof connector>;

type Props = ReduxProps;

const OrdersContainer: React.FC<Props> = () => {
  const { start, stop, switchCurrency } = useOrderbookData();
  const hasFocus = useAppSelector(hasFocusSelector);

  useEffect(() => {
    const fn = hasFocus ? start : stop;
    fn();
  }, [hasFocus]);

  return (
    <>
      <StyledOrders />
      <button onClick={switchCurrency}> Switch Currency </button>
    </>
  );
};

const mapDispatch = (dispatch: AppDispatch) => ({
  refresh: () => {},
});

const connector = connect(undefined, mapDispatch);

export default connector(OrdersContainer);
