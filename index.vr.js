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
  VrButton,
  View,
} from 'react-vr';
import ImagesView from './component/ImagesView'

export default class WelcomeToVR extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      images: []
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

  render() {
    const showImages = this.state.accessToken && this.state.images && this.state.images.length > 0
    return (
      <View>
        <Pano source={asset('chess-world.jpg')}/>
        {
          showImages
          ? this.state.images.map((images, index) => <ImagesView images={images} index={index} key={`ImagesView${index}`} />)
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
