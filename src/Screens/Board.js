import React from "react";
import {
  SafeAreaView,
  View,
  PanResponder,
  StyleSheet,
  ImageBackground,
  Button,
} from "react-native";
import Svg, { Path, G } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import Pen from "../tools/pen";
import Point from "../tools/point";

export default class Board extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPoints: [],
      previousStrokes: this.props.strokes || [],
      newStroke: [],
      pen: new Pen(),
      imageUrl: null,
    };
    this.imagePermission();
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs),
    });
    const rewind = props.rewind || function () {};
    const clear = props.clear || function () {};
    this._clientEvents = {
      rewind: rewind(this.rewind),
      clear: clear(this.clear),
    };
  }

  imagePermission = async () => {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }
  };

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      this.setState({ imageUrl: result.uri });
    }
  };

  rewind = () => {
    if (
      this.state.currentPoints.length > 0 ||
      this.state.previousStrokes.length < 1
    )
      return;
    let strokes = this.state.previousStrokes;
    strokes.pop();

    this.state.pen.rewindStroke();

    this.setState(
      {
        previousStrokes: [...strokes],
        currentPoints: [],
      },
      () => {
        this._onChangeStrokes([...strokes]);
      }
    );
  };

  clear = () => {
    this.setState(
      {
        previousStrokes: [],
        currentPoints: [],
        newStroke: [],
      },
      () => {
        this._onChangeStrokes([]);
      }
    );

    this.state.pen.clear();
  };

  onTouch(evt) {
    let x, y, timestamp;
    [x, y, timestamp] = [
      evt.nativeEvent.locationX,
      evt.nativeEvent.locationY,
      evt.nativeEvent.timestamp,
    ];
    let newPoint = new Point(x, y, timestamp);
    let newCurrentPoints = this.state.currentPoints;
    newCurrentPoints.push(newPoint);

    this.setState({
      previousStrokes: this.state.previousStrokes,
      currentPoints: newCurrentPoints,
    });
  }

  onResponderGrant(evt) {
    this.onTouch(evt);
  }

  onResponderMove(evt) {
    this.onTouch(evt);
  }

  onResponderRelease() {
    let strokes = this.state.previousStrokes;
    if (this.state.currentPoints.length < 1) return;

    let points = this.state.currentPoints;
    if (points.length === 1) {
      let p = points[0];
      let distance = parseInt(Math.sqrt(this.props.strokeWidth || 4) / 2);
      points.push(new Point(p.x + distance, p.y + distance, p.time));
    }

    let newElement = {
      type: "Path",
      attributes: {
        d: this.state.pen.pointsToSvg(points),
        stroke: this.props.color || "#000000",
        strokeWidth: this.props.strokeWidth || 4,
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    };

    this.state.pen.addStroke(points);

    this.setState(
      {
        previousStrokes: [...this.state.previousStrokes, newElement],
        currentPoints: [],
      },
      () => {
        this._onChangeStrokes(this.state.previousStrokes);
      }
    );
  }

  _onChangeStrokes = (strokes) => {
    if (this.props.onChangeStrokes) {
      this.props.onChangeStrokes(strokes);
    }
  };

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
      <SafeAreaView
        onLayout={this._onLayoutContainer}
        style={[styles.drawContainer]}
      >
        <View style={styles.buttonGroup}>
          <Button
            title="Upload"
            onPress={() => this.pickImage()}
            color={"black"}
          />
          <Button
            title="rewind"
            onPress={() => this.rewind()}
            color={"black"}
          />
          <Button title="clear" onPress={() => this.clear()} color={"black"} />
          <Button
            title="export"
            onPress={() =>
              this.props.navigation.navigate("FinalResult", {
                drawData: this.state,
              })
            }
            color={"black"}
          />
        </View>
        <ImageBackground
          source={{ uri: this.state.imageUrl }}
          style={styles.svgContainer}
          {...this._panResponder.panHandlers}
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
      </SafeAreaView>
    );
  }
}

let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
  },
  svgContainer: {
    flexGrow: 1,
  },
  drawSurface: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: "row",
    alignSelf: "center",
  },
});
