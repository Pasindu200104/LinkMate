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
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { router, SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";

export default function home() {
  const [getChatArray, setChatArray] = useState([]);
  const [getChatArrayFilterd, setChatArrayFilterd] = useState([]);
  const [getSearch, setSearch] = useState("");

  const link = process.env.EXPO_PUBLIC_URL;

  const linkmate = require("../assets/images/linkmate.png");
  const chat = require("../assets/images/user.png");
  const status = require("../assets/images/status.png");
  const call = require("../assets/images/call.png");
  const msg = require("../assets/images/chat.png");
  const otherUserImg = require("../assets/images/chat.png");

  const [loaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        let userJson = await AsyncStorage.getItem("user");
        let user = JSON.parse(userJson);
        let response = await fetch(
          "http://"+link+":8080/linkmate/ChatList?id=" + user.id
        );
        if (response.ok) {
          let json = await response.json();
          let chatArray = json.other_User_Chat_Array;

          // console.log(chatArray);
          setChatArray(chatArray);
          setChatArrayFilterd(chatArray);
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
    const search = typeof getSearch === 'string' ? getSearch.toLowerCase() : '';

    const filterd = getChatArray.filter((chat) => {
      return chat.otherUserName && 
        typeof chat.otherUserName === "string" &&
        chat.otherUserName.toLowerCase().includes(search);
  
    });
    setChatArrayFilterd(filterd);
  }, [getSearch, getChatArray]);

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
          <Text style={styles.text4}>Select Contacts</Text>
        </View>
      </View>
      <View style={styles.input1}>
        <TextInput
          style={styles.input2}
          placeholder="Search"
          placeholderTextColor={"white"}
          onChangeText={(text) => setSearch(text)}
        />
        <FontAwesome name={"search"} size={18} color={"white"} />
      </View>

      {/* Chat */}
      <View style={styles.view16}>
        <FlashList
          data={getChatArrayFilterd}
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
                        "http://"+link+":8080/linkmate/userImg/" +
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
            <Text style={styles.text2}>call</Text>
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
    height: "72%",
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
  input1: {
    height: 50,
    borderWidth: 1,
    padding: 15,
    borderRadius: 50,
    borderStyle: "solid",
    borderColor: "white",
    fontSize: 18,
    color: "white",
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    columnGap: 15,
    alignItems: "center",
  },
  input2: {
    height: 40,
    width: "90%",
    borderStyle: "solid",
    borderColor: "white",
    fontSize: 18,
    color: "white",
  },
});
