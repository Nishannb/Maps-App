import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View, TextInput, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [apiKey, setApiKey] = useState('H0uu0ERanurZYJc3P4sOojfqajfGoGgo');

  useEffect(() => {
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('No permission to get location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(location);
      console.log('Location:', location)
    };
    getPermissions();
  }, []);

  const showAddress = async () => {
    try {
      const apiURL = `https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${address}`;
      const response = await axios.get(apiURL);
      const results = response.data.results[0].locations[0].latLng;
      console.log('Coordinates:', results);


      if (results && results.lat && results.lng) {
        setCoordinates(results);

      } else {
        console.error('Problems with coordinates:', results);
        Alert.alert('Problems with coordinates', 'Received a wrong coordinates from API.');
      }

      Keyboard.dismiss();

    } catch (error) {
      console.error('Error fetching coordinates:', error);
      console.log('API response:', error.response);
      Alert.alert('Error fetching coordinates', 'Could not find the coordinates for the entered address.');
    }
  };

  

  const initial = {
    latitude: coordinates ? coordinates.lat : 0,
    longitude: coordinates ? coordinates.lng : 0,
    latitudeDelta: 0.0322,
    longitudeDelta: 0.0221
  };



  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initial}
        region={initial}
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
      </MapView>
      <TextInput style={styles.input}
        onChangeText={(text) => setAddress(text)}
        value={address}
        placeholder='Address'
      />
      <TouchableOpacity style={styles.button} onPress={showAddress} >
        <Text style={styles.text}>Show address</Text>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'navy',
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  input: {
    width: 300,
    height: 50,
    textAlign: 'center',
    borderColor: 'beige',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'beige',
    fontSize: 20,
    marginTop: 10,

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

  }
});