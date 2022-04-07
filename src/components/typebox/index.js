import React from 'react';
import { TYPE_COLOR } from '../../constants';
import './styles.scss';

const TypeBox = ({type}) => {
  console.log(type)
  return (
    <div className='typeBox' style={{ background: TYPE_COLOR[type]}}>
      {type}
    </div>
  )
}

export default TypeBox;