import React, { FC } from 'react';
import styled from 'styled-components';
import { obSelector, OrderBook, OrderModel } from './orders.slice';
import { connect, ConnectedProps } from 'react-redux';

import { AppState } from '../..';

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

  @media only screen and (min-width: 768px) {
    border-bottom: 1px solid #232b38;
  }
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
  background: #123534;
  @media only screen and (min-width: 768px) {
    transform-origin: right;
  }
`;

const AsksBar = styled(RatioBar)`
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
  grid-template-rows: fit-content 20px fit-content;

  @media only screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: fit-content 1fr;
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
  grid-area: 2 / 1 / 3 / 2;
  color: #474d5a;

  @media only screen and (min-width: 768px) {
    grid-area: 1 / 1 / 2 / 3;
    border-bottom: 1px solid #232b38;
  }
`;

const Bids = styled.div`
  grid-area: 3 / 1 / 4 / 2;

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
  grid-area: 1 / 1 / 2 / 2;

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

type Props = ConnectedProps<typeof connector>;

const Orders: FC<Props> = ({ orderbook }) => {
  const { bids, asks, spread, spreadPercent, getRatio } = orderbook;

  console.log('render');

  return (
    <Container>
      <Spread>
        Spread: {spread} ({spreadPercent}%)
      </Spread>
      <Bids>
        <HeadingRow>
          <Cell>Price</Cell>
          <Cell>Size</Cell>
          <Cell>Total</Cell>
        </HeadingRow>
        <DataSet>
          {bids.map((bid) => (
            <Row key={bid.level}>
              <CellPrice>{bid.displayPrice}</CellPrice>
              <Cell>{bid.displaySize}</Cell>
              <Cell>{bid.displayTotal}</Cell>
              <BidsBar style={{ transform: `scaleX(${getRatio(bid)})` }} />
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
          {asks.map((ask) => (
            <Row key={ask.level}>
              <CellPrice>{ask.displayPrice}</CellPrice>
              <Cell>{ask.displaySize}</Cell>
              <Cell>{ask.displayTotal}</Cell>
              <AsksBar style={{ transform: `scaleX(${getRatio(ask)})` }} />
            </Row>
          ))}
        </DataSet>
      </Asks>
    </Container>
  );
};

const mapState = (state: AppState) => {
  return {
    orderbook: obSelector(state),
  };
};

const connector = connect(mapState);

export default connector(Orders);
