import React, { FC } from 'react';
import styled from 'styled-components';
import { OrderModel } from './orders.slice';

interface Props {
  bids: OrderModel[];
  asks: OrderModel[];
}

const Container = styled.div`
  background: black;
  color: #fff;
  display: flex;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 0;
  padding: 2px 0;
`;

const RatioBar = styled.div`
  position: absolute;
  display: block;
  content: '';
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  z-index: -1;
`;

const BidsBar = styled(RatioBar)`
  background: #6c0000;
  transform-origin: right;
`;

const AsksBar = styled(RatioBar)`
  background: #084800;
  transform-origin: left;
`;

const Cell = styled.span`
  flex-basis: 25%;
`;

const OrderList = styled.div`
  flex: 1;
  text-align: right;
`;

const BidsList = styled(OrderList)`
  ${Row} {
    flex-direction: row;
  }
`;

const AsksList = styled(OrderList)`
  ${Row} {
    flex-direction: row-reverse;
  }
`;

const Orders: FC<Props> = (props) => {
  const { bids, asks } = props;

  return (
    <Container>
      <BidsList>
        <Row>
          <Cell>Total</Cell>
          <Cell>Size</Cell>
          <Cell>Price</Cell>
        </Row>
        {bids.map((bid) => (
          <Row key={bid.price}>
            <Cell>{bid.total}</Cell>
            <Cell>{bid.size}</Cell>
            <Cell>{bid.price}</Cell>
            <BidsBar style={{ transform: `scaleX(${bid.ratio})` }} />
          </Row>
        ))}
      </BidsList>
      <AsksList>
        <Row>
          <Cell>Total</Cell>
          <Cell>Size</Cell>
          <Cell>Price</Cell>
        </Row>
        {asks.map((bid) => (
          <Row key={bid.price}>
            <Cell>{bid.total}</Cell>
            <Cell>{bid.size}</Cell>
            <Cell>{bid.price}</Cell>
            <AsksBar style={{ transform: `scaleX(${bid.ratio})` }} />
          </Row>
        ))}
      </AsksList>
    </Container>
  );
};

export default Orders;
