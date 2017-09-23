import React from 'react';
import querystring from 'querystring';
import {
  AppRegistry,
  AsyncStorage,
  asset,
  Pano,
  Text,
  Image,
  Box,
  NativeModules,
  Scene,
  VrButton,
  View,
} from 'react-vr';
import ImagesView from './component/ImagesView'

const LEFT = 'LEFT'
const RIGHT = 'RIGHT'
const UP = 'UP'
const DOWN = 'DOWN'
const A_BUTTON = 'A_BUTTON'
const B_BUTTON = 'B_BUTTON'
const X_BUTTON = 'X_BUTTON'
const Y_BUTTON = 'Y_BUTTON'
const L_BUTTON = 'L_BUTTON'
const ZL_BUTTON = 'ZL_BUTTON'
const R_BUTTON = 'R_BUTTON'
const ZR_BUTTON = 'ZR_BUTTON'
const PLUS_BUTTON = 'PLUS_BUTTON'
const MINUS_BUTTON = 'MINUS_BUTTON'
const HOME_BUTTON = 'HOME_BUTTON'
const SHARE_BUTTON = 'SHARE_BUTTON'
const L3_BUTTON = 'L3_BUTTON'
const R3_BUTTON = 'R3_BUTTON'

const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter')

export default class WelcomeToVR extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      images: [],
      cameraX: 0,
      cameraY: 0,
      cameraZ: 0,
      boxRotate: 0
    }
    this.nextState = {
      cameraX: 0,
      cameraY: 0,
      cameraZ: 0,
      boxRotate: 0
    }
    this.detectMode()
  }

  async detectMode () {
    const urlSearch = {}
    const accessToken = await AsyncStorage.getItem('accessToken')
    if (accessToken) {
      return this.setState({accessToken})
    }
    NativeModules.Location.search.substr(1).split('&').forEach((str) => {
      const [key, value] = str.split('=')
      urlSearch[key] = value
    })
    const {code} = urlSearch
    if (!!code) {
      this.requestAccessToken(code)
    }
  }

  requestAccessToken (code) {
    const params = new URLSearchParams(`code=${code}`)
    fetch('http://localhost:8085/token', {
      method: 'POST',
      credentials: 'include',
      body: querystring.stringify({code: code}),
      cors: true
    })
    .then(res => res.json())
    .then((res) => {
      const accessToken = res.access_token
      AsyncStorage.setItem('accessToken', accessToken)
      this.setState({accessToken})
    })
  }

  axisMoveInfo (event) {
    const AXIS_L_HORIZONTAL_INDEX = 0
    const AXIS_L_VERTICAL_INDEX = 1
    const AXIS_R_HORIZONTAL_INDEX = 2
    const AXIS_R_VERTICAL_INDEX = 3
    const AXIS_MOVE_DIRECTION = [
      [LEFT, RIGHT], [UP, DOWN]
    ]
    return {
      eventType: event.eventType,
      keyName: event.axis <= 1 ? 'LEFT_STICK' : 'RIGHT_STICK',
      direction: AXIS_MOVE_DIRECTION[event.axis % 2][+(event.axis >= 0)],
      rawEvent: event
    }
  }

  buttonInfo (event) {
    const KEYMAP = [
      B_BUTTON, A_BUTTON, Y_BUTTON, X_BUTTON,
      L_BUTTON, R_BUTTON, ZL_BUTTON, ZR_BUTTON,
      MINUS_BUTTON, PLUS_BUTTON,
      L3_BUTTON, R3_BUTTON,
      HOME_BUTTON, SHARE_BUTTON
    ]
    return {
      eventType: event.eventType,
      keyName: KEYMAP[event.button],
      rawEvent: event
    }
  }

  componentDidMount () {
    this.checkGamePad()
    this.fetchGamePad()
    RCTDeviceEventEmitter.addListener('onReceivedInputEvent', (event) => {
      if (!(event.type === 'GamepadInputEvent' && event.gamepad === 0)) return
      let eventInfo
      if (event.eventType === 'axismove') eventInfo = this.axisMoveInfo(event)
      if (['keydown', 'keyup'].includes(event.eventType)) eventInfo = this.buttonInfo(event)
      if (!eventInfo) return
      if (eventInfo.keyName === 'LEFT_STICK') {
        let value = eventInfo.rawEvent.value
        // なんかSwitchのProコンは値が揺れる
        if (Math.abs(value) < 0.2) return
        value = value / 5
        if ([UP, DOWN].includes(eventInfo.direction)) {
          this.setNextState({
            cameraZ: this.state.cameraZ + value
          })
        } else if ([LEFT, RIGHT].includes(eventInfo.direction)) {
          this.setNextState({
            cameraX: this.state.cameraX + value
          })
        }
      }
      if (eventInfo.keyName === ZL_BUTTON) {
        this.setNextState({
          boxRotate: this.state.boxRotate - 1
        })
      }
      if (eventInfo.keyName === ZR_BUTTON) {
        this.setNextState({
          boxRotate: this.state.boxRotate + 1
        })
      }
    })
    RCTDeviceEventEmitter.addListener('controllerConnected', () => {
      this.checkGamePad()
    })
  }

  async componentDidUpdate () {
    if (this.state.images.length > 0) return
    for (let i = 1; i <= 4; i++) {
      const res = await fetch(`https://api.gyazo.com/api/images?per_page=100&page=${i}&access_token=${this.state.accessToken}`)
      const json = await res.json()
      let t = Array.from(this.state.images)
      t.push(json)
      this.setState({images: Array.from(t)})
    }
  }

  setNextState (nextState) {
    this.nextState = Object.assign(this.nextState, nextState)
  }

  fetchGamePad = () => {
    const showImages = this.state.accessToken && this.state.images && this.state.images.length > 0
    if (showImages) this.setState(this.nextState)
    requestAnimationFrame(this.fetchGamePad)
  }

  async checkGamePad () {
    const controllers = await NativeModules.ControllerInfo.getControllers()
    const controller = controllers[0]
    this.setState({controller})
  }

  render() {
    const showImages = this.state.accessToken && this.state.images && this.state.images.length > 0
    return (
      <View>
        <Pano source={asset('chess-world.jpg')}/>
        <Scene style={{
          transform: [{translate: [this.state.cameraX, this.state.cameraY, this.state.cameraZ]}]
        }} />
        {
          showImages
          ? this.state.images.map((images, index) => <ImagesView rotation={this.state.boxRotate} images={images} index={index} key={`ImagesView${index}`} />)
          : <VrButton
              style={{
                transform: [{translate: [0, 0, -1]}],
                backgroundColor: "#1122aa",
                height: 0.29,
                margin: 0.01
              }}
              onClick={() => {
                const gyazoOauthAuthorizePath = 'https://gyazo.com/oauth/authorize'
                const requestUrl = gyazoOauthAuthorizePath
                  + '?client_id=b38c32eeb069fcc9007e7639518ac7f72c716a5b2e84999b775f5cb5df378f8f'
                  + '&redirect_uri=' + encodeURIComponent('http://localhost:8081/vr/index.html')
                  + '&response_type=code'
                NativeModules.LinkingManager.openURL(requestUrl)
              }}
            >
              <Text>Login with Gyazo</Text>
            </VrButton>
        }
      </View>
    )
  }
};

AppRegistry.registerComponent('WelcomeToVR', () => WelcomeToVR);
