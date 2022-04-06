import './App.scss';
import { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import _ from 'lodash';
import { WEAKNESS_DATA } from './constants';

import TypeBox from './components/typebox';

function App() {
  const [pokeInfoEvent, setPokeInfoEvent] = useState(null);
  const [pokeInfo, setPokeInfo] = useState({
    id: '',
    name: '',
    types: [],
    sprite: ''
  });

  const { 
    sendMessage,
    lastJsonMessage,
    lastMessage,
    readyState } = useWebSocket('ws://localhost:8080', {
    onOpen: () => console.log(`Connected to WebSocket Server`),
    onMessage: (e) => {
      if(e && e.data) {
        const message = e.data;
        setPokeInfoEvent(e);
      } 
    },
    onError: (event) => { console.error(event); },
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000
  });

  useEffect(() => {
    if(pokeInfoEvent && pokeInfoEvent.data) {
      const parsedPokeInfo = JSON.parse(pokeInfoEvent.data);
      setPokeInfo(parsedPokeInfo);
    }
  }, [pokeInfoEvent]);

  const { name, id, types, sprite } = pokeInfo;
  const mapTypes = () => {
    return _.map(types, (type) => <TypeBox key={type} type={type} />);
  }

  const getMoveEffects = (type) => {
    const keys = _.keys(WEAKNESS_DATA);
    const superEffect = []
    const halfEffect = []
    const normalEffect = []
    const noEffect = []

    let effects = {}
    _.forEach(keys, (key) => {
      const dataForType = WEAKNESS_DATA[key];
      const damage = dataForType[type];
      switch(damage) {
        case 2: 
          superEffect.push(key);
          break;
        case 1:
          normalEffect.push(key);
          break;
        case 0.5:
          halfEffect.push(key);
          break;
        default:
          noEffect.push(key);
      }
    });

    console.log({noEffect, normalEffect, halfEffect, superEffect, effects})
    return {
      noEffect,
      normalEffect,
      halfEffect,
      superEffect
    }
  }

  const getWeakness = () => {
    if(types.length > 1) {
      const combined = []
      _.forEach(types, (type) => combined.push(getMoveEffects(type)))
    }
  }

  return (
    <div className="App">
      <div className='pokedexContainer'>
        <div className='head'>
          <div className='pokedexBlueLens'>
            <div className='innerLens'></div>
          </div>
          <div className='coloredLights'>
            <div className='lightCircle'><div className='innerCircle redLight'></div></div>
            <div className='lightCircle'><div className='innerCircle yellowLight'></div></div>
            <div className='lightCircle'><div className='innerCircle greenLight'></div></div>
          </div>
        </div>
        <div className='pokedexBody'>
          <div className='pokedexScreen'>
            <div className='innerScreen'>
              <h3>{`${name.toUpperCase()} #${id}`}</h3>
              <div className='contentBlock'>
                <div className='leftContent'>
                  <div className='pokeSpriteContainer'>
                    <div className='innerSpriteBox'>
                      <img src={sprite} />
                    </div>
                  </div>
                </div>
                <div className='rightContent'>
                  <h4>TYPES</h4>
                  <div className='typesContainer'>
                    {mapTypes()}
                  </div>
                </div>
              </div>
              <div className='contentBlock'>
                {`WEAKNESS: ${getWeakness()}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
