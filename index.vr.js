import React from 'react';
import {
  AppRegistry,
  asset,
  Pano,
  Text,
  NativeModules,
  VrButton,
  View,
} from 'react-vr';

export default class WelcomeToVR extends React.Component {
  constructor (props) {
    super(props)
    const urlSearch = {}
    NativeModules.Location.search.substr(1).split('&').forEach((str) => {
      const [key, value] = str.split('=')
      urlSearch[key] = value
    })
    if (!!urlSearch.code) this.requestAccessToken(urlSearch.code)
    this.state = {
      logined: false
    }
  }

  requestAccessToken (code) {
    const formdata = new FormData()
    formdata.append('client_id', 'b38c32eeb069fcc9007e7639518ac7f72c716a5b2e84999b775f5cb5df378f8f')
    formdata.append('client_secret', 'abbee252cdcfbb6f4701a034d423a6b07cea9d9fc4269e36be2d5a64c513b19b')
    formdata.append('redirect_uri', 'http://localhost:8081/vr/index.html')
    formdata.append('code', code)
    formdata.append('grant_type', 'authorization_code')
    fetch('https://api.gyazo.com/oauth/token', {
      method: 'POST',
      credentials: 'include',
      body: formdata,
      cors: true
    })
    .then(res => res.json())
    .then((res) => {
      localStorage.setItem('accessToken', res.access_token)
    })
  }

  render() {
    return (
      <View>
        <Pano source={asset('chess-world.jpg')}/>
        <VrButton
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
      </View>
    );
  }
};

AppRegistry.registerComponent('WelcomeToVR', () => WelcomeToVR);
