import { useState } from "react";
import { Button, StyleSheet, View, Text } from "react-native";

export default function Component1( props) {
  const [getName, setName] = useState(props.fname+" "+props.lname);

  return (
    <View style={styles.view1}>
      <Text style={StyleSheet.text1}>{getName}</Text>
      <Button
        title={"Change"}
        onPress={() => {
          setName("Name");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  view1: {
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center",
  },
  text1: {
    color: "red",
    fontSize: 20,
  },
});
