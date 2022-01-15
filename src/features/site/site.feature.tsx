import React, { FC, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../..';
import { tick, hasFocusSelector, setHasFocus } from './site.slice';

const Site: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const hasFocus = useAppSelector(hasFocusSelector);

  const handleClick = () => dispatch(setHasFocus(true));

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (!hasFocus) return;
      dispatch(tick());
    }, 300);
    return () => clearInterval(heartbeat);
  });

  useEffect(() => {
    const onBlur = () => dispatch(setHasFocus(false));
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <>
      {children}
      {!hasFocus && <button onClick={handleClick}>Resume</button>}
    </>
  );
};

export default Site;
