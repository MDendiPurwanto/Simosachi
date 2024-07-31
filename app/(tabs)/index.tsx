import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Animated, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window'); // Get screen width

export default function HomeScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null); // Create a ref for the FlatList
  const [refreshing, setRefreshing] = useState(false);
  const [autoplay] = useState(true); // State for autoplay
  const [weather, setWeather] = useState(null); // State for weather data

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh (replace with your actual data fetching logic)
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // 2-second delay for demo
  }, []);

  const images = [
    require('./../../assets/src/dok1.jpg'),
    require('./../../assets/src/dok2.jpg'),
    require('./../../assets/src/dok3.jpg'),
    require('./../../assets/src/dok4.jpg'),
    require('./../../assets/src/dok5.jpg'),
    require('./../../assets/src/dok6.jpg'),
    require('./../../assets/src/kambing.jpg'),
    require('./../../assets/src/sapi.jpg'),
    require('./../../assets/src/kambing.jpg'),
    require('./../../assets/src/sachainchi.jpg'),
  ]; // Replace with your image URLs

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const renderItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <Image style={styles.carouselImage} source={item} />
    </View>
  );

  useEffect(() => {
    let autoplayInterval;

    if (autoplay) {
      autoplayInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        flatListRef.current.scrollToIndex({ index: nextIndex });
      }, 3000); // Change image every 3 seconds (adjust as needed)
    }

    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    };

  }, [autoplay, currentIndex, images.length]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=-6.8461&lon=108.2291&appid=1e7b2ba726e462e2db139c8f272d4dac&units=metric&lang=id`);
        setWeather(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Simosachi</Text>
      <Text style={styles.welcome}>Sistem Monitoring Fertigasi Sacha Inchi</Text>
     
      <ScrollView contentContainerStyle={styles.scrollViewContent}
       refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#508D4E']}
        />
      }>

      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>{`Cuaca in ${weather.name}`} {`${weather.weather[0].description}`}</Text>
          <Text style={styles.weatherText}>{`Suhu: ${weather.main.temp}°C`}</Text>
        </View>
      )}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef} // Attach the ref to the FlatList
          data={images}
          horizontal
          pagingEnabled
          snapToInterval={width}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          
        />
        <View style={styles.carouselNavigation}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color="white"
            style={styles.carouselIcon}
            onPress={() => {
              if (currentIndex > 0) {
                flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
              }
            }}
          />
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="white"
            style={styles.carouselIcon}
            onPress={() => {
              if (currentIndex < images.length - 1) {
                flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
              }
            }}
          />
        </View>
      </View>
        
        <View style={styles.grid}>
        
          <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => navigation.navigate('PupukKambing')} >
            <Image style={styles.gridImage} source={require('./../../assets/src/kambing.jpg')} />
            <Text style={styles.gridText}>Pupuk Kambing</Text>
          </TouchableOpacity>
       
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('PupukSapi')} >
            <Image style={styles.gridImage} source={require('./../../assets/src/sapi.jpg')} />
            <Text style={styles.gridText}>Pupuk Sapi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('PupukAyam')}>
            <Image style={styles.gridImage}  source={require('./../../assets/src/ayam.jpg')} />
            <Text style={styles.gridText}>Pupuk Ayam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('PupukSachaInchi')}>
            <Image style={styles.gridImage} source={require('./../../assets/src/sachainchi.jpg')} />
            <Text style={styles.gridText}>Pupuk Sacha Inchi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => navigation.navigate('PompaPenyiramanAir')}
          >
            <Text style={styles.navigationButtonText}>Pompa Penyiraman Air</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigation.navigate('Timbangan')}
              >
            <Text style={styles.navigationButtonText}>Timbang Hasil Panen</Text>
          </TouchableOpacity>
        </View>
         
      </ScrollView>
      </View> 
   
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#508D4E',
  },
  header: {
    fontSize: 30,
    marginTop:50,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
    scrollViewContent: {
      alignItems: 'center',
    },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    color: '#fff',
  },
 
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign:'center',
  },
  weatherContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  weatherText: {
    color: '#508D4E',
    fontSize: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  gridItem: {
    width: '45%',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#508D4E', // Optional: Add a background to buttons
    borderRadius: 10,
    overflow: 'hidden', // Clip the image to match the button's rounded corners
  },
  button:{
    backgroundColor: '#fff',
   
  },
  gridImage: {
    borderRadius:20,
    width: 150,
    height: 150,
  },
  gridText: {
    marginTop: 5,
    color: '#ffff',
  },
  carouselContainer: {
    height: 170, // Adjust height as needed
  },
  carouselItem: {
    width: width,
    alignItems: 'center',
  },
  carouselImage: {
    width: width - 40, // Add margin for better look
    height: 200, 
    resizeMode: 'cover',
    borderRadius: 10,
  },
  carouselNavigation: {
    position: 'absolute',
    bottom: 60, // Position at the bottom of the carousel
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  carouselIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Translucent background
    padding: 10,
    borderRadius: 20,
  },
  navigationButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 'auto',
    marginBottom:20,
    borderRadius: 10,
  },
  navigationButtonText: {
    color: '#508D4E',
    fontSize: 18,
    fontWeight: 'bold',
  },
});