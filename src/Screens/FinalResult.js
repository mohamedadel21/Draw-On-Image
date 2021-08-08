import React from "react";
import { SafeAreaView, StyleSheet, ImageBackground } from "react-native";
import Svg, { Path, G } from "react-native-svg";

export default class Board extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPoints: this.props.route.params.drawData.currentPoints,
      previousStrokes: this.props.route.params.drawData.previousStrokes || [],
      newStroke: this.props.route.params.drawData.newStroke,
      pen: this.props.route.params.drawData.pen,
      imageUrl: this.props.route.params.drawData.imageUrl,
    };
  }

  _onLayoutContainer = (e) => {
    this.state.pen.setOffset(e.nativeEvent.layout);
    this._layout = e.nativeEvent.layout;
  };

  _renderSvgElement = (e, tracker) => {
    if (e.type === "Path") {
      return <Path {...e.attributes} key={tracker} />;
    }

    return null;
  };

  render() {
    return (
      <SafeAreaView style={[styles.drawContainer]}>
        <ImageBackground
          source={{ uri: this.state.imageUrl }}
          style={styles.svgContainer}
          onLayout={this._onLayoutContainer}
          resizeMode="cover"
        >
          <Svg style={styles.drawSurface}>
            <G>
              {this.state.previousStrokes.map((stroke, index) => {
                return this._renderSvgElement(stroke, index);
              })}
              <Path
                key={this.state.previousStrokes.length}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke={this.props.color || "#000000"}
                strokeWidth={this.props.strokeWidth || 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          </Svg>
        </ImageBackground>
        <ImageBackground
          resizeMode="cover"
          source={{ uri: this.state.imageUrl }}
          style={styles.svgContainer}
        />
      </SafeAreaView>
    );
  }
}

let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  svgContainer: {
    flex: 2,
  },
  drawSurface: {
    flex: 1,
  },
});
