import React, { FC } from 'react';
import styled from 'styled-components';
import { OrderModel } from './orders.slice';

interface Props {
  bids: OrderModel[];
  asks: OrderModel[];
}

const Row = styled.div`
  display: flex;
  position: relative;
  z-index: 0;
  text-align: right;
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
  flex: 0 0 33.3%;
`;

const OrderList = styled.div`
  flex: 1;
  text-align: right;
`;

const Container = styled.div`
  display: grid;

  grid-gap: 0em 0em;
  min-height: 200px;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 20px 1fr;

  @media only screen and (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 20px 1fr;
  }
`;

const Spread = styled.div`
  background: #404040;
  grid-area: 2 / 1 / 3 / 2;
  @media only screen and (min-width: 992px) {
    grid-area: 1 / 1 / 2 / 3;
  }
`;

const Bids = styled.div`
  background: green;
  grid-area: 3 / 1 / 4 / 2;
  @media only screen and (min-width: 992px) {
    grid-area: 2 / 1 / 3 / 2;

    ${Row} {
      flex-direction: row-reverse;
    }
  }
`;

const Asks = styled.div`
  background: salmon;
  grid-area: 1 / 1 / 2 / 2;
  @media only screen and (min-width: 992px) {
    grid-area: 2 / 2 / 3 / 3;
  }
`;

const Orders: FC<Props> = (props) => {
  const { bids, asks } = props;

  return (
    <Container>
      <Spread>Spread</Spread>
      <Bids>
        <Row>Bids</Row>
        <Row>
          <Cell>Price</Cell>
          <Cell>Size</Cell>
          <Cell>Total</Cell>
        </Row>
        {bids.map((bid) => (
          <Row>
            <Cell>{bid.price}</Cell>
            <Cell>Size</Cell>
            <Cell>Total</Cell>
          </Row>
        ))}
      </Bids>
      <Asks>
        <Row>Asks</Row>
        <Row>
          <Cell>Price</Cell>
          <Cell>Size</Cell>
          <Cell>Total</Cell>
        </Row>
        {asks.map((ask) => (
          <Row>
            <Cell>{ask.price}</Cell>
            <Cell>Size</Cell>
            <Cell>Total</Cell>
          </Row>
        ))}
      </Asks>
    </Container>
  );

  // return (
  //   <Container>
  //     <BidsList>
  //       <Row>
  //         <Cell>Total</Cell>
  //         <Cell>Size</Cell>
  //         <PriceCell>Price</PriceCell>
  //       </Row>
  //       {bids.map((bid) => (
  //         <Row key={bid.price}>
  //           <Cell>{bid.total}</Cell>
  //           <Cell>{bid.size}</Cell>
  //           <PriceCell>{bid.price}</PriceCell>
  //           <BidsBar style={{ transform: `scaleX(${bid.ratio})` }} />
  //         </Row>
  //       ))}
  //     </BidsList>
  //     <AsksList>
  //       <Row>
  //         <Cell>Total</Cell>
  //         <Cell>Size</Cell>
  //         <PriceCell>Price</PriceCell>
  //       </Row>
  //       {asks.map((bid) => (
  //         <Row key={bid.price}>
  //           <Cell>{bid.total}</Cell>
  //           <Cell>{bid.size}</Cell>
  //           <PriceCell>{bid.price}</PriceCell>
  //           <AsksBar style={{ transform: `scaleX(${bid.ratio})` }} />
  //         </Row>
  //       ))}
  //     </AsksList>
  //   </Container>
  // );
};

export default Orders;
