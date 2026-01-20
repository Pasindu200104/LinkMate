import { LinearGradient } from "expo-linear-gradient";
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
import { FontAwesome6 } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { router, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";

export default function home() {
  const [getChatArray, setChatArray] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const [getUser, setUser] = useState("");

  const link = process.env.EXPO_PUBLIC_URL;

  const linkmate = require("../assets/images/linkmate.png");
  const chat = require("../assets/images/user.png");
  const status = require("../assets/images/status.png");
  const call = require("../assets/images/call.png");
  const msg = require("../assets/images/chat.png");
  const nomsg = require("../assets/images/msg.png");

  const otherUserImg = require("../assets/images/chat.png");

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
    async function fetchData() {
      try {
        let userJson = await AsyncStorage.getItem("user");
        let user = JSON.parse(userJson);
        setUser(user);

        let response = await fetch(
          "http://" + link + ":8080/linkmate/ChatList?id=" + user.id
        );

        if (response.ok) {
          let json = await response.json();
          let chatArray = json.other_User_Chat_Array;

          // console.log(chatArray);

          const filteredChatArray = chatArray.filter(
            (chat) => chat.message !== "Say Hello to your friend"
          );
          setChatArray(filteredChatArray);
        } else {
          console.error("etch fails:", response.status);
          Alert.alert(
            "Error",
            "Failed to fetch data from server" + response.status
          );
        }
      } catch (error) {
        console.error("Error occurred:", error);
        Alert.alert("Error", "Something went Wrong:" + error.message);
      }
    }
    fetchData();
    interval = setInterval(() => {
      fetchData();
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

  return (
    <LinearGradient colors={["green", "black"]} style={styles.view1}>
      <StatusBar hidden={true} />

      {/* header */}
      <View style={styles.view2}>
        <View style={styles.view3}>
          <Image style={styles.image1} source={linkmate} />
        </View>
        <View style={styles.view3_1}>
          <View style={styles.view15}>
            <Pressable
              onPress={() => {
                router.push("/userProfile");
              }}
            >
              <View style={styles.view14}>
                <Image source={"http://" +
                          link +
                          ":8080/linkmate/userImg/" +
                          getUser.mobile +
                          ".png"} contentFit="cover" style={styles.image4} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Chat */}
      {getChatArray.length == 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={nomsg} contentFit="contain" style={styles.image5} />
          <Text style={styles.emptyText}>"Start a New Conversation"</Text>
        </View>
      ) : (
        <View style={styles.view16}>
          <FlashList
            data={getChatArray}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  router.push({ pathname: "/chat", params: item });
                }}
              >
                <View style={styles.view4}>
                  <View
                    style={
                      item.otherUserStatus == 1 ? styles.view5_1 : styles.view5_2
                    }
                  >
                    {item.other_User_Img_Found ? (
                      <Image
                        source={
                          "http://" +
                          link +
                          ":8080/linkmate/userImg/" +
                          item.otherUserMobile +
                          ".png"
                        }
                        contentFit="cover"
                        style={styles.image2}
                      />
                    ) : (
                      <Text style={styles.text4}>{item.user_name_letters}</Text>
                    )}
                  </View>
                  <View style={styles.view6}>
                    <View style={styles.view7}>
                      <Text style={styles.text1} numberOfLines={1}>
                        {item.otherUserName}
                      </Text>
                      <Text style={styles.text2} numberOfLines={1}>
                        {item.message}
                      </Text>
                    </View>
                    <View style={styles.view8}>
                      <Text style={styles.text3}>{item.dateTime}</Text>
                      <Text style={styles.text3}>
                        <FontAwesome6
                          name={"check"}
                          size={18}
                          color={item.chat_status_id == 1 ? "black" : "#33CC00"}
                        />
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
            estimatedItemSize={200}
          />
        </View>
      )}

      {/* Floting button */}
      <View style={styles.view12}>
        <View style={styles.view13}>
          <Pressable
            onPress={() => {
              router.push("/allChats");
            }}
          >
            <Image source={msg} contentFit="cover" style={styles.image3} />
          </Pressable>
        </View>
      </View>

      {/* footer */}
      <View style={styles.view11}>
        <View style={styles.view9}>
          <View style={styles.view10}>
            <Pressable
              onPress={() => {
                router.replace("/home");
              }}
            >
              <Image source={chat} contentFit="cover" style={styles.image3} />
              <Text style={styles.text2}>Chats</Text>
            </Pressable>
          </View>
          <View style={styles.view10}>
            <Pressable
              onPress={() => {
                router.replace("/status");
              }}
            >
              <Image source={status} contentFit="cover" style={styles.image3} />
              <Text style={styles.text2}>Story</Text>
            </Pressable>
          </View>
          <View style={styles.view10}>
            <Image source={call} contentFit="cover" style={styles.image3} />
            <Text style={styles.text2}>Call</Text>
          </View>
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
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
    justifyContent: "center",
    columnGap: 10,
  },
  view3: {
    flex: 1,
  },
  view3_1: {
    flex: 1,
    alignItems: "flex-end",
  },
  view4: {
    flexDirection: "row",
    backgroundColor: "#3d8624",
    marginVertical: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  view5_1: {
    backgroundColor: "white",
    borderRadius: 100,
    width: 65,
    height: 65,
    borderColor: "#33CC00",
    borderWidth: 3,
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
    borderWidth: 3,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
  },
  view6: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 10,
  },
  view7: {
    flexDirection: "column",
    width: "65%",
  },
  view8: {
    justifyContent: "center",
    rowGap: 10,
    width: "20%",
  },
  view9: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  view10: {
    alignItems: "center",
  },
  view11: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#33CC00",
    paddingVertical: 5,
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
  },
  view12: {
    height: "100%",
    position: "absolute",
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  view13: {
    backgroundColor: "#33CC00",
    padding: 10,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  view14: {
    flex: 1,
  },
  view15: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#33CC00",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  view16: {
    height: "80%",
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
  },
  // input1: {
  //   height: 45,
  //   paddingStart: 15,
  //   fontSize: 20,
  //   backgroundColor: "#33CC00",
  //   borderRadius: 20,
  //   color: "white",
  // },
  image1: {
    width: 150,
    height: 50,
  },
  image2: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  image3: {
    width: 30,
    height: 30,
    borderRadius: 100,
    alignSelf: "center",
  },
  image4: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  image5: {
    width: 250,
    height: 250,
    borderRadius: 150,
    marginVertical: 30,
    marginTop: 200,
  },
  emptyContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    color: "white",
    fontFamily: "Poppins-Bold",
  },
});
