import React from 'react'
import {
  Image,
  Box,
  View
} from 'react-vr';

const translates = [
// X,  Y,  Z
  [-6, 3, -10],
  [-8, 3, 3],
  [0, 3, 10],
  [8, 3, -3]
]

export default class ImagesView extends React.Component {
  constructor (props) {
    super(props)
    let imageSlices = []
    for (let i = 0; i <= 90; i += 10) {
      imageSlices.push(
        this.props.images.slice(i, i + 10)
      )
    }
    this.state = {
      imageSlices
    }
  }

  render () {
    return (
      <View style={{
        top: this.props.index * 10 * -1,
        height: 10,
        width: 1,
        transform: [
          {translate: translates[this.props.index]},
          {rotateY: (this.props.index * 90) + 'deg'}
        ]
      }}>
        {
          this.state.imageSlices.map((slice, index) => {
            return <View key={`${this.props.index}-${index}`} style={{
              flex: 1,
              flexDirection: 'row',
              width: 6,
              alignItems: 'stretch'
            }}>
              {
                slice.map((image) => {
                  return (
                    /*
                    <Image
                      key={image.image_id}
                      source={{uri: image.thumb_url}}
                      style={{width: 1, height: 1}}
                    />
                    */
                    <Box
                      dimWidth={1}
                      dimDepth={1}
                      dimHeight={1}
                      key={image.image_id}
                      texture={{uri: image.thumb_url}}
                      style={{width: 1, height: 1, margin: 0.1}}
                    />
                  )
                })
              }
            </View>
          })
        }
      </View>
    )
  }
}
