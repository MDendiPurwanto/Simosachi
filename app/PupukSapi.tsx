import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, RefreshControl, Alert, Vibration } from 'react-native';


export default function PupukSapi() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupukData/pupukSapi.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setData(data);
        setIsLoading(false);
        console.log('Data from Firebase Pupuk Sapi:', data);
         // Check soil moisture after fetching data
       if (data.kelembapan !== undefined && data.kelembapan > 50) {
        Alert.alert('Perhatian!', 'Tanah kering, mohon segera siram tanaman!');
        Vibration.vibrate(); // Trigger vibration when alert is shown
      }
      } catch (error) {
        setIsLoading(false);
        setError('Error fetching data: ' + error.message);
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupukData/pupukSapi.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
      setRefreshing(false);
      console.log('Data from Firebase:', data);
      
    } catch (error) {
      setRefreshing(false);
      setError('Error fetching data: ' + error.message);
      console.error(error);
    }
  };

  const togglePompa = async () => {
    try {
      const newPompaValue = !data.pompa;
      await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupukData/pupukSapi/pompa.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPompaValue),
      });

      // Optimistically update the UI
      setData(prevData => ({ ...prevData, pompa: newPompaValue }));
    } catch (err) {
      console.error('Error updating data:', err);
      setError('Failed to toggle pump.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Monitoring Pupuk Sapi</Text>
      <Image
        source={require('./../assets/src/sapi.jpg')}
        style={styles.image}
      />
  
      {isLoading ? (
        <ActivityIndicator size="large" color="white" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {/* Data Rows */}
          <View style={styles.row}>
            <Text style={styles.label}>Kelembapan Tanah:</Text>
            <Text style={styles.value}>{data.kelembapan || '--'}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status Tanah:</Text>
            <Text style={styles.value}>
              {data.kelembapan !== undefined ? (
                data.kelembapan > 70
                  ? 'Kering'
                  : data.kelembapan > 30
                  ? 'Lembab'
                  : 'Basah'
              ) : (
                '--'
              )}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nitrogen (N):</Text>
            <Text style={styles.value}>{data.nitrogen || '--'} mg/kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fosfor (P):</Text>
            <Text style={styles.value}>{data.fospor || '--'} mg/kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kalium (K):</Text>
            <Text style={styles.value}>{data.kalium || '--'} mg/kg</Text>
          </View>
          <View style={styles.row}>
          <Text style={styles.label}>Suhu Tanah:</Text>
          <Text style={styles.value}>
            {data.suhu ? data.suhu.toFixed(2) : '--'} °C
          </Text>
        </View>
  
          {/* Pompa Control */}
          <View style={styles.pompaContainer}>
            <Text style={styles.label_button}>Pompa Pupuk Sapi</Text>
            <TouchableOpacity style={[styles.button, data.pompa && styles.buttonOn]} onPress={togglePompa}>
              <Text style={styles.buttonText}>{data.pompa ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#508D4E',
    alignItems: 'center',
  },
  header: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    paddingBottom:10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  label_button :{
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    paddingBottom: 10,
  },
  value: {
    fontSize: 22,
    color: 'white',
  },
  pompaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#C80036',
    padding: 15,
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  buttonOn: {
    backgroundColor: '#00FF00',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  image: {
    width: 300, // Adjust width as needed
    height: 200, // Adjust height as needed
    resizeMode: 'contain', // or 'cover', 'stretch', etc.
    marginBottom: 30, // Add some spacing below the image
  },
});
