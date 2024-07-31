import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, RefreshControl, Alert, Vibration } from 'react-native';

export default function PupukSachaInchi() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupuk/pupukSachaInchi.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setData(data);
        setIsLoading(false);
        console.log('Data from Firebase Pupuk Sacha Inchi:', data);

        // Check soil moisture after fetching data
        if (data.kelembapan !== undefined && data.kelembapan > 70) {
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
      const response = await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupuk/pupukSachaInchi.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
      setRefreshing(false);
      console.log('Data from Firebase:', data);

      showMoistureInfoAlert(); 
    } catch (error) {
      setRefreshing(false);
      setError('Error fetching data: ' + error.message);
      console.error(error);
    }
  };

  const togglePompa = async () => {
    try {
      const newPompaValue = !data.pompa;
      await fetch('https://simosachi-kambing-default-rtdb.firebaseio.com/pupuk/pupukSachaInchi/pompa.json', {
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

  const showMoistureInfoAlert = () => {
    Alert.alert(
      "Informasi Kelembapan Tanah",
      "Basah: 0 - 40%\nLembab: 40 - 70%\nKering: 70 - 100%",
      [{ text: "OK" }]
    );
  };



  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Monitoring Pupuk Sacha Inchi</Text>
      <Image
        source={require('./../assets/src/sachainchi.jpg')}
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
            <Text style={styles.value}>{data.suhu ? data.suhu.toFixed(2) : '--'} °C</Text>
          </View>

          {/* Pompa Control */}
          <View style={styles.pompaContainer}>
            <Text style={styles.label_button}>Pompa Pupuk Sacha Inchi</Text>
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
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },
});
