import React, { FC } from 'react';
import styled from 'styled-components';
import { OrderBook, OrderModel } from './orders.slice';

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
  transform-origin: left;
`;

const BidsBar = styled(RatioBar)`
  background: #084800;
  @media only screen and (min-width: 992px) {
    transform-origin: right;
  }
`;

const AsksBar = styled(RatioBar)`
  background: red;
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

const DataSet = styled.div`
  display: flex;
  flex-direction: column;
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

  ${DataSet} {
    flex-direction: column-reverse;
  }

  @media only screen and (min-width: 992px) {
    grid-area: 2 / 2 / 3 / 3;

    ${DataSet} {
      flex-direction: column;
    }
  }
`;

const Orders: FC<OrderBook> = (props) => {
  const { bids, asks, maxTotal } = props;

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
        <DataSet>
          {bids.map((bid) => (
            <Row>
              <Cell>{bid.price}</Cell>
              <Cell>{bid.size}</Cell>
              <Cell>{bid.total}</Cell>
              <BidsBar style={{ transform: `scaleX(${bid.total / maxTotal})` }} />
            </Row>
          ))}
        </DataSet>
      </Bids>
      <Asks>
        <Row>Asks</Row>
        <Row>
          <Cell>Price</Cell>
          <Cell>Size</Cell>
          <Cell>Total</Cell>
        </Row>
        <DataSet>
          {asks.map((ask) => (
            <Row>
              <Cell>{ask.price}</Cell>
              <Cell>{ask.size}</Cell>
              <Cell>{ask.total}</Cell>
              <AsksBar style={{ transform: `scaleX(${ask.total / maxTotal})` }} />
            </Row>
          ))}
        </DataSet>
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
