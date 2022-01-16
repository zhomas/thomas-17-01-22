import React, { useEffect } from 'react';
import styled from 'styled-components';
import { OrderBook } from './orderbook.types';

const Row = styled.div`
  display: flex;
  position: relative;
  z-index: 0;
  text-align: right;
  padding-right: 10vw;
  padding-top: 3px;
  padding-bottom: 3px;
`;

const HeadingRow = styled(Row)`
  text-transform: uppercase;
  color: #474d5a;
  font-weight: 600;

  @media only screen and (min-width: 768px) {
    border-bottom: 1px solid #232b38;
  }
`;

const DepthGraph = styled.div`
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

const DepthGraphBids = styled(DepthGraph)`
  background: #123534;
  @media only screen and (min-width: 768px) {
    transform-origin: right;
  }
`;

const DepthGraphAsks = styled(DepthGraph)`
  background: #3d1e28;
`;

const Cell = styled.span`
  flex: 0 0 33.3%;
`;

const CellPrice = styled(Cell)`
  font-weight: 600;
`;

const Container = styled.div`
  display: grid;
  background: #111827;
  grid-gap: 0em 0em;
  min-height: 200px;
  grid-template-columns: 1fr;
  margin-bottom: 12px;
  grid-template-rows: fit-content(20px) minmax(380px, 1fr) fit-content(20px) minmax(380px, 1fr);

  @media only screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: fit-content(20px) minmax(380px, 1fr);
  }
`;

const DataSet = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 400;
`;

const Spread = styled.div`
  padding: 5px;
  grid-area: 3 / 1 / 4 / 2;
  color: #474d5a;
  text-align: center;

  @media only screen and (min-width: 768px) {
    grid-area: 1 / 1 / 2 / 3;
    border-bottom: 1px solid #232b38;
  }
`;

const Bids = styled.div`
  grid-area: 4 / 1 / 5 / 2;

  ${HeadingRow} {
    display: none;
  }

  ${CellPrice} {
    color: #6ec877;
  }

  @media only screen and (min-width: 768px) {
    grid-area: 2 / 1 / 3 / 2;

    ${HeadingRow} {
      display: flex;
    }

    ${Row} {
      flex-direction: row-reverse;
    }
  }
`;

const Asks = styled.div`
  grid-area: 2 / 1 / 3 / 2;

  ${DataSet} {
    flex-direction: column-reverse;
  }

  ${CellPrice} {
    color: #e2444d;
  }

  @media only screen and (min-width: 768px) {
    grid-area: 2 / 2 / 3 / 3;

    ${DataSet} {
      flex-direction: column;
    }
  }
`;

const Heading = styled.div`
  padding: 5px 10px;
  grid-area: 1 / 1 / 2 / 2;
  border-bottom: 1px solid #232b38;
  font-size: 14px;

  @media only screen and (min-width: 768px) {
    grid-area: 1 / 1 / 2 / 3;
  }
`;

interface Props {
  heading: string;
  orderbook: OrderBook;
}

const Orderbook: React.FC<Props> = ({ heading, orderbook }) => (
  <Container>
    <Heading>{heading}</Heading>
    <Spread>
      Spread: {orderbook.spread} ({orderbook.spreadPercent}%)
    </Spread>
    <Bids>
      <HeadingRow>
        <Cell>Price</Cell>
        <Cell>Size</Cell>
        <Cell>Total</Cell>
      </HeadingRow>
      <DataSet>
        {orderbook.bids.map((bid) => (
          <Row key={bid.level}>
            <CellPrice>{bid.displayPrice}</CellPrice>
            <Cell>{bid.displaySize}</Cell>
            <Cell>{bid.displayTotal}</Cell>
            <DepthGraphBids style={{ transform: `scaleX(${orderbook.getRatio(bid)})` }} />
          </Row>
        ))}
      </DataSet>
    </Bids>
    <Asks>
      <HeadingRow>
        <Cell>Price</Cell>
        <Cell>Size</Cell>
        <Cell>Total</Cell>
      </HeadingRow>
      <DataSet>
        {orderbook.asks.map((ask) => (
          <Row key={ask.level}>
            <CellPrice>{ask.displayPrice}</CellPrice>
            <Cell>{ask.displaySize}</Cell>
            <Cell>{ask.displayTotal}</Cell>
            <DepthGraphAsks style={{ transform: `scaleX(${orderbook.getRatio(ask)})` }} />
          </Row>
        ))}
      </DataSet>
    </Asks>
  </Container>
);

export default Orderbook;
