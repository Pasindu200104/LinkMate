import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { router, SplashScreen } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const mainImagePath = require("../assets/images/user.png");

export default function profile() {
  const [getUser, setUser] = useState("");
  const [getFirstName, setFirstName] = useState("");
  const [getLastName, setLastName] = useState("");
  const [getPassword, setPassword] = useState("");
  const [getImage, setImage] = useState("");

  const link = process.env.EXPO_PUBLIC_URL;

  const mn = require("../assets/images/mn.png");
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  });

  const logOut = async () => {
    try {
      router.replace("/");
      await AsyncStorage.removeItem("user");
      console.log("logout success");
    } catch (e) {
      console.log("Error", e);
    }
  };
  useEffect(() => {
    async function userData() {
      let userJson = await AsyncStorage.getItem("user");
      let user = JSON.parse(userJson);
      setUser(user);
      console.log(user);
    }
    userData();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <LinearGradient colors={["green", "black"]} style={styles.view1}>
      <StatusBar hidden={true} />
      <View style={styles.view2}>
        <View style={styles.view3}>
          <Pressable
            onPress={async () => {
              let result = await ImagePicker.launchImageLibraryAsync({});
              if (!result.canceled) {
                setImage(result.assets[0].uri);
              }
            }}
            style={styles.avatar1}
          >
            {getImage ? (
              <Image
                source={getImage}
                contentFit="cover"
                style={styles.image1}
              />
            ) : (
              <Image
                source={
                  "http://" +
                  link +
                  ":8080/linkmate/userImg/" +
                  getUser.mobile +
                  ".png"
                }
                contentFit="cover"
                style={styles.image1}
              />
            )}
          </Pressable>
        </View>
        <View style={styles.view3}>
          <Text style={styles.text1}>
            {getUser.first_name} {getUser.last_name}
          </Text>
        </View>
        <View style={styles.view3}>
          <Text style={styles.text2}>{getUser.mobile}</Text>
        </View>
        <View style={styles.view3}>
          <Pressable
            style={styles.press1}
            onPress={() => {
              logOut();
            }}
          >
            <Text style={styles.text2}>LogOut</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.view6}>
        <Text style={styles.text1}>Update Profile Details</Text>
      </View>
      <View style={styles.view4}>
        <View style={styles.view5}>
          <Text style={styles.text2}>First Name</Text>
          <TextInput
            style={styles.input1}
            placeholder={getUser.first_name}
            placeholderTextColor={"white"}
            onChangeText={(text) => {
              setFirstName(text);
            }}
          />
        </View>
        <View style={styles.view5}>
          <Text style={styles.text2}>Last Name</Text>
          <TextInput
            style={styles.input1}
            placeholder={getUser.last_name}
            placeholderTextColor={"white"}
            onChangeText={(text) => {
              setLastName(text);
            }}
          />
        </View>
        <View style={styles.view5}>
          <Text style={styles.text2}>Password</Text>
          <TextInput
            style={styles.input1}
            secureTextEntry={true}
            placeholder={getUser.password}
            placeholderTextColor={"white"}
            onChangeText={(text) => {
              setPassword(text);
            }}
          />
        </View>
        <View style={styles.view3}>
          <Pressable
            style={styles.press2}
            onPress={async () => {

              let form = new FormData();
              form.append("fname", getFirstName);
              form.append("lname", getLastName);
              form.append("password", getPassword);
              form.append("mobile", getUser.mobile);
              if (getImage) {
                form.append("userImg", {
                  uri: getImage,
                  name: "userImg",
                  type: "image/png",
                });
              }

              let response = await fetch(
                "http://" + link + ":8080/linkmate/UpdateUser",
                {
                  method: "POST",
                  body: form,
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              if (response.ok) {
                let results = await response.json();
                console.log(results);

                if (results.success) {
                  let user = results.user;
                  await AsyncStorage.setItem("user", JSON.stringify(user));
                  Alert.alert("Message", "Profile Update Successfull");
                  router.replace("/userProfile");
                } else {
                  Alert.alert("Error", results.message);
                }
              }
            }}
          >
            <Text style={styles.text2}>Update</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  view1: {
    flex: 1,
  },
  view2: {
    flexDirection: "column",
    rowGap: 10,
    marginTop: 50,
  },
  view3: {
    alignItems: "center",
  },
  view4: {
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: "column",
    rowGap: 15,
  },
  view5: {
    rowGap: 5,
  },
  view6: {
    alignItems: "center",
    marginTop: 30,
  },
  text1: {
    fontSize: 20,
    color: "white",
    fontFamily: "Poppins-Bold",
  },
  text2: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins-Light",
  },
  text3: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "white",
  },
  text4: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    color: "white",
  },
  image1: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: "#33CC00",
  },
  press1: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "black",
    borderRadius: 50,
  },
  press2: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#33CC00",
    borderRadius: 50,
  },
  input1: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    padding: 10,
    borderRadius: 50,
    borderStyle: "solid",
    borderColor: "white",
    // backgroundColor:"#33CC00",
    fontSize: 16,
    color: "white",
  },
});
