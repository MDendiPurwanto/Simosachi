import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Monitoring = () => {
  const navigation = useNavigation();

  const pupukData = [
    {
      name: 'Pupuk Kambing',
      image: require('./../../assets/src/kambing.jpg'), // Correct require statement
      screenName: 'PupukKambing',
    },
    {
      name: 'Pupuk Sapi',
      image: require('./../../assets/src/sapi.jpg'), // Correct require statement
      screenName: 'PupukSapi',
    },
    {
      name: 'Pupuk Ayam',
      image: require('./../../assets/src/ayam.jpg'), // Correct require statement
      screenName: 'PupukAyam',
    },
    {
      name: 'Pupuk Sacha Inchi',
      image: require('./../../assets/src/sachainchi.jpg'), // Correct require statement
      screenName: 'PupukSachaInchi',
    },
  ];

  const renderGridItem = (item) => (
    <TouchableOpacity
      key={item.name}
      style={styles.gridItem}
      onPress={() => navigation.navigate(item.screenName)}
    >
      <Image style={styles.gridImage} source={item.image} />
      <Text style={styles.gridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Simosachi</Text>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.welcome}>Monitoring Sistem Fertigasi Sacha Inchi</Text>
          {/* Navigation Button */}
             <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigation.navigate('PompaPenyiramanAir')}
              >
            <Text style={styles.navigationButtonText}>Pompa Penyiraman Air</Text>
          </TouchableOpacity>
        {/* Grid of Pupuk Items */}
        <Text style={styles.subjudul}>Dibawah ini adalah untuk memonitoring setiap tanaman sacha inchi dengan pemupukan berbeda-beda</Text>
        <View style={styles.grid}>
          {pupukData.map(renderGridItem)}
        </View>

      
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#508D4E',
  },
  header: {
    fontSize: 30,
    marginTop: 80,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  carouselImage: {
    width: 350,
    height: 200,
    marginHorizontal: 10,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginBottom: 40,
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    fontSize: 10,
  },
  gridItem: {
    width: '45%',
    alignItems: 'center',
    marginVertical: 10,
  },
  gridImage: {
    borderRadius: 20,
    width: 150,
    height: 150,
  },
  gridText: {
    marginTop: 5,
    color: '#fff',
    fontSize: 18,
  },
  navigationButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: -20,
    marginBottom:20,
    borderRadius: 10,
  },
  navigationButtonText: {
    color: '#508D4E',
    fontSize: 18,
    fontWeight: 'bold',
  },

  subjudul:{
    fontSize: 15,
    fontWeight:'heavy',
    color: '#fff',
    textAlign: "center"
  }
});

export default Monitoring;
