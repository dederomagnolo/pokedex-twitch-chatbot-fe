import './App.scss';
import './font/pokemon_classic.ttf'; 
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

  const [spriteBlink, setSpriteBlink] = useState(pokeInfo.sprite)

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

  const { name, id, types, sprite, spriteShiny } = pokeInfo;

  // useEffect(() => {
  //   setTimeout(() => {
  //     setSpriteBlink(spriteBlink === sprite && spriteShiny ? spriteShiny : sprite)
  //   }, 2000)
  // }, [spriteBlink])

  const mapTypes = (types) => {
    return _.map(types, (type) => <TypeBox key={type} type={type} />);
  }

  const getTypeEffectivenessByTypes = () => {
    const type = types[0]
    let mergedTypeEffects = {}
    const keys = _.keys(WEAKNESS_DATA);

    if(types && types.length) {
      const type2 = types.length > 1 ? types[1] : null
      _.forEach(keys, (key) => {
        const dataByTypeKey = WEAKNESS_DATA[key];
        const combinedPoints = type2 ? dataByTypeKey[type] * dataByTypeKey[type2] : dataByTypeKey[type] 
        mergedTypeEffects = {
          ...mergedTypeEffects,
          [key]: combinedPoints
        }
      })
      return mergedTypeEffects;
    }
  }

  const mapEffectivenessInfos = () => {
    const effectivenessByTypes = getTypeEffectivenessByTypes()
    const weaknessArray = []
    const resistanceArray = []
    const immuneArray = []

    _.forEach(effectivenessByTypes, (value, key) => {
      if (value === 2) {
        weaknessArray.push(key)
      }

      if (value < 1) {
        resistanceArray.push(key)
      }

      if (value === 0) {
        immuneArray.push(key)
      }
    })

    return {
      weaknessArray,
      resistanceArray,
      immuneArray
    }
  }
  const mappedEffectivenessInfos = mapEffectivenessInfos()

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
            <div className='pokedexScreenLights'>
              <div className='miniCircle redLight'></div>
              <div className='miniCircle redLight'></div>
            </div>
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
                  <h4>TYPE</h4>
                  <div className='typesContainer'>
                    {mapTypes(types)}
                  </div>
                </div>
              </div>
              <div className='contentBlock effectivenessBlock'>
                WEAKNESS: 
                <div className='effectivenessContent'>
                  {mapTypes(mappedEffectivenessInfos.weaknessArray)}
                </div> 
              </div>
              <div className='contentBlock effectivenessBlock'>
                RESISTANCE: 
                <div className='effectivenessContent'>
                  {mapTypes(mappedEffectivenessInfos.resistanceArray)}
                </div>
              </div>
              <div className='contentBlock effectivenessBlock'>
                IMMUNE: 
                <div className='effectivenessContent'>
                  {mapTypes(mappedEffectivenessInfos.immuneArray)}
                </div>
              </div>
            </div>
          </div>
          <div className='screenCurvedPart'>
            <div className='lines'>
              <div className='line'></div>
              <div className='line'></div>
              <div className='line'></div>
            </div>
          </div>
          {/* <div className='bottomContainer'>
            <div className='bottomButtons'>
              <div className='circularButton'></div>
              <div className='flatButtons'>
                <div className='flatButton greenLight'></div>
                <div className='flatButton redLight'></div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;
