import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { SplashScreen, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import {
  Alert,
  AppState,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";

export default function chat() {
  const link = process.env.EXPO_PUBLIC_URL;

  const item = useLocalSearchParams();
  //   console.log(item);
  const [getChatArray, setChatArray] = useState([]);
  const [getChatText, setChatText] = useState("");
  const [getUser, setUser] = useState("");

  const [appState, setAppState] = useState(AppState.currentState);

  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  });
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        changeUserState(2); // Offline
        console.log("offline");
      } else if (nextAppState === "active") {
        changeUserState(1); // Online
        console.log("online");
      }
      setAppState(nextAppState);
    };

    const changeUserState = async (state) => {
      
      try {
        let response = await fetch(
          "http://" +
            link +
            ":8080/linkmate/Status?userId=" +
            getUser.id +
            "&status=" +
            state
        );
        if (response.ok) {
          let json = await response.json();
          console.log(json);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [appState, getUser]);

  useEffect(() => {
    async function fetchChat() {
      let userJson = await AsyncStorage.getItem("user");
      let user = JSON.parse(userJson);
      setUser(user);
      // console.log(user);
      let response = await fetch(
        "http://" +
          link +
          ":8080/linkmate/LoadChats?user_id=" +
          user.id +
          "&other_user_id=" +
          item.otherUserId
      );
      if (response.ok) {
        let chats = await response.json();
        let chatArray = chats.chatArray;
        console.log(chatArray);
        setChatArray(chatArray);
      }
    }
    fetchChat();
    interval = setInterval(() => {
      fetchChat();
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const call = require("../assets/images/call.png");
  return (
    <LinearGradient colors={["green", "black"]} style={styles.view1}>
      <StatusBar hidden={true} />
      {/* header */}
      <View style={styles.view4}>
        <View style={item.otherUserStatus == 1 ? styles.view5_1 : styles.view5_2}>
          {item.other_User_Img_Found ? (
            <Image
              source={{
                uri:
                  "http://" +
                  link +
                  ":8080/linkmate/userImg/" +
                  item.otherUserMobile +
                  ".png",
              }}
              contentFit="cover"
              style={styles.image2}
            />
          ) : (
            <Text style={styles.text3}>{item.user_name_letters}</Text>
          )}
        </View>
        <View style={styles.view6}>
          <View style={styles.view7}>
            <Text style={styles.text1} numberOfLines={1}>
              {item.otherUserName}
            </Text>
            <Text style={styles.text2} numberOfLines={1}>
              {item.otherUserStatus == 1 ? "Online" : "Offline"}
            </Text>
          </View>
          <View style={styles.view8}>
            <Image source={call} contentFit="contain" style={styles.image1} />
          </View>
        </View>
      </View>

      {/* chat */}
      <View style={styles.view15}>
        <FlashList
          data={getChatArray}
          renderItem={({ item }) => (
            <View
              style={item.side == "right" ? styles.view16_1 : styles.view16_2}
            >
              {item.isImage ? (
                        <Image
                        source={item.message}
                        contentFit="cover"
                        style={styles.image3}
                      />
              ) : (
                <Text style={styles.text2}>{item.message}</Text>
              )}
              <View style={styles.view17}>
                <Text style={styles.text4}>{item.date_time}</Text>
                <FontAwesome
                  name={"check"}
                  size={14}
                  color={item.chat_status_id == 1 ? "green" : "white"}
                />
              </View>
            </View>
          )}
          estimatedItemSize={200}
        />
      </View>

      {/* footer */}
      <View style={styles.view11}>
        <View style={styles.view9}>
          <View style={styles.view13}>
            <View style={styles.view10}>
              <Pressable
                onPress={async () => {
                  const pickFile = await DocumentPicker.getDocumentAsync({
                    type: ["image/jpeg","image/jpg", "image/png"],
                  });

                  if (pickFile.type == "cancel") {
                    return;
                  }
                  console.log(pickFile.assets[0].uri);
                  const formData = new FormData();
                  formData.append("user_id", getUser.id);
                  formData.append("other_user_id", item.otherUserId);
                  formData.append("file", {
                    uri: pickFile.assets[0].uri,
                    name: pickFile.assets[0].name,
                    type: pickFile.assets[0].mimeType,
                  });

                  const response = await fetch(
                    "http://" + link + ":8080/linkmate/SendFile",
                    {
                      method: "POST",
                      body: formData,
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );

                  if (response.ok) {
                    let jsonResponse = await response.json();
                    console.log(jsonResponse);
                    if (jsonResponse.success) {
                      Alert.alert("Success", "File send Successfully.");
                    } else {
                      Alert.alert("Error", jsonResponse.message);
                    }
                  } else {
                    Alert.alert("Error", "File Upload Failed");
                  }
                }}
              >
                <FontAwesome name={"paperclip"} size={30} color="white" />
              </Pressable>
            </View>
            <View style={styles.view12}>
              <TextInput
                style={styles.input1}
                placeholder="Message"
                placeholderTextColor="white"
                onChangeText={(text) => {
                  setChatText(text);
                }}
                value={getChatText}
              />
            </View>
          </View>
          <Pressable
            style={styles.press1}
            onPress={async () => {
              if (getChatText.length == 0) {
                Alert.alert("Error", "Please Enter your Message");
              } else {
                let userJson = await AsyncStorage.getItem("user");
                let user = JSON.parse(userJson);
                let response = await fetch(
                  "http://" +
                    link +
                    ":8080/linkmate/SendChats?user_id=" +
                    user.id +
                    "&other_user_id=" +
                    item.otherUserId +
                    "&message=" +
                    getChatText
                );

                if (response.ok) {
                  let json = await response.json();
                  if (json.success) {
                    console.log("Message Send");
                    setChatText("");
                  }
                }
              }
            }}
          >
            <View style={styles.view10}>
              <FontAwesome name={"paper-plane"} size={30} color="white" />
            </View>
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
  view4: {
    flexDirection: "row",
    backgroundColor: "#3d8624",
    marginVertical: 5,
    columnGap: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  view5_1: {
    backgroundColor: "white",
    borderRadius: 100,
    width: 65,
    height: 65,
    borderColor: "#33CC00",
    borderWidth: 5,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
  },
  view5_2: {
    backgroundColor: "white",
    borderRadius: 100,
    width: 65,
    height: 65,
    borderColor: "black",
    borderWidth: 5,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
  },
  view6: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 55,
    flex: 1,
  },
  view7: {
    flexDirection: "column",
  },
  view8: {
    alignItems: "flex-end",
    justifyContent: "center",
    // rowGap: 10,
  },
  view9: {
    flexDirection: "row",
    columnGap: 10,
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: "absolute",
  },
  view10: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  view11: {
    flex: 1,
    justifyContent: "flex-end",
  },
  view12: {
    flex: 7,
  },
  view13: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#33CC00",
    borderRadius: 20,
    padding: 5,
  },
  view14: {
    flex: 1,
    backgroundColor: "#33CC00",
    borderRadius: 20,
    padding: 5,
    position: "absolute",
  },
  view15: {
    height: "78%",
    marginVertical: 3,
  },
  view16_1: {
    backgroundColor: "#33CC00",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  view16_2: {
    backgroundColor: "#3F3F3F",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  view17: {
    flexDirection: "row",
    alignSelf: "flex-end",
    columnGap: 10,
    justifyContent: "center",
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
    fontSize: 25,
    fontFamily: "Poppins-Bold",
  },
  text4: {
    fontSize: 14,
    color: "white",
    fontFamily: "Poppins-Light",
  },
  image1: {
    width: 40,
    height: 40,
  },
  image2: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  image3: {
    width:200,
    height: 200,
  },
  input1: {
    height: 45,
    width: "100%",
    paddingStart: 15,
    fontSize: 20,
    color: "white",
  },
  press1: {
    backgroundColor: "#33CC00",
    padding: 10,
    borderRadius: 10,
  },
});
