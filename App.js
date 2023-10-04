import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, TextInput, PanResponder, TouchableOpacity, Text, Alert, Keyboard} from 'react-native';
import {EXPO_PUBLIC_API_KEY} from "@env"
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { MotiView } from '@motify/components';
import { Easing } from 'react-native-reanimated';


export default function App() {
  
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [apiKey, setApiKey] = useState(EXPO_PUBLIC_API_KEY);
  const[ touched, setTouched ] = useState([0,0])
  const [animationKey, setAnimationKey] = useState(1);

  // Getting permission from user
  useEffect(() => {
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('No permission to get location');
        return;
      }

      // Identifying the current location of user 
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      }
      setLocation(newLocation);
      // console.log('Location:', newLocation.lat)
    };
    getPermissions();
  }, []);

  const showAddress = async () => {
    try {
      const apiURL = `https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${address}`;
      const response = await axios.get(apiURL);
      const results = response.data.results[0].locations[0].latLng;
      // console.log('Coordinates:', results);

      if (results && results.lat && results.lng) {
        setCoordinates(results);

      } else {
        // console.error('Problems with coordinates:', results);
        Alert.alert('Problems with coordinates', 'Received a wrong coordinates from API.');
      }

      Keyboard.dismiss();

    } catch (error) {
      // console.error('Error fetching coordinates:', error);
      // console.log('API response:', error.response);
      Alert.alert('Error fetching coordinates', 'Could not find the coordinates for the entered address.');
    }
  };

  const handlerLongClick = (e) => {
    //handler for Long Click
    // console.log('NX',e.nativeEvent.locationX)
    // console.log('NY',e.nativeEvent.locationY)
    setTouched([e.nativeEvent.locationX - 50, e.nativeEvent.locationY -50])
    setAnimationKey(1);
    // Start the Coupon Fetch Trigger from here
  };

  const handlePressOut =(e) =>{
    setTouched([0,0])
  }

  return (
    <>
    <View style={[styles.box, {flexDirection: 'row', height: '10%', alignItems: 'center', justifyContent: 'center'}]}>
      <TextInput style={styles.input}
          onChangeText={(text) => setAddress(text)}
          value={address}
          placeholder='&#128269;  Address'
          onSubmitEditing={showAddress}
        />
        
     </View>
    
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onLongPress={handlerLongClick} onPressOut={handlePressOut} style={{ 
        width: '100%',
        height: '100%', 
        backgroundColor: 'transparent'
      }}>
     
     {location && <MapView
        style={styles.map}
        region={{
          latitude: coordinates? coordinates.lat : location.lat,
          longitude: coordinates? coordinates.lng :location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        scrollDuringRotateOrZoomEnabled={false}
        showsUserLocation={true}
      >
        {coordinates && (
          <Marker
            coordinate={{
              latitude: coordinates.lat,
              longitude: coordinates.lng,
            }}
          />
        )}
      </MapView>} 
      
        
        {touched[0] !== 0 && touched[1] !== 0 && <View style={[styles.dot, styles.touchBox, {alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}]}>
          { [...Array(5).keys()].map((index)=> {
            return (
              <MotiView
                key={index}
                from={{ opacity: 0.5, scale: 1 }} 
                animate={{ opacity: 0, scale: 4 }}
                transition={{
                  type: 'timing',
                  duration: 2000,
                  easing: Easing.out(Easing.ease),
                  delay: index * 400,
                  loop: true,
                  repeatReverse: false
                }}
                style={[ styles.dot, { position: 'absolute', top: touched[1] , left: touched[0] }]} 
              />
            )
          }) }
        </View>}
        </TouchableOpacity>
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  input: {
    width: '100%',
    height: 50,
    textAlign: 'center',
    borderColor: 'beige',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 15,
    marginTop: 30,
    color: 'grey',
    textAlign: 'left',
    paddingLeft: 20,
    shadowColor: 'grey', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 4, 
    elevation: 5, 
  },
  button: {
    width: 190,
    height: 50,
    backgroundColor: 'darkgreen',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 25,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  text: {
    textAlign: 'center',
    marginTop: 7,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',

  },
  dot:{
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'white'
  },
  innerDot: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  box: {
    position: 'absolute',
    top: 0,
    left: '5%',
    right: '5%',
    width: '90%',
    zIndex: 1,
  },
  touchBox: {
    position: 'absolute',
    top: 0,
  }
});