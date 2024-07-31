import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';

const PompaPenyiramanAir = () => {
  const [isWatering, setIsWatering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [nextWateringTime, setNextWateringTime] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [wateringDuration, setWateringDuration] = useState(1); // Default to 1 minute

  const firebaseBaseUrl = 'https://simosachi-kambing-default-rtdb.firebaseio.com/PompaPenyiramanAir';
  const firebasePompaUrl = `${firebaseBaseUrl}/pompa.json`;
  const firebaseTimeUrl = `${firebaseBaseUrl}/WaktuPenyiraman.json`;
  const firebaseModeUrl = `${firebaseBaseUrl}/Mode.json`;

  const wateringIntervalRef = useRef(null);

  const scheduleWatering = useCallback((waktuPenyiraman) => {
    clearInterval(wateringIntervalRef.current);

    const now = new Date();

    // Set scheduled times: 7:00 AM, 12:00 PM, and 5:00 PM
    const scheduleTimes = [
      { hours: 7, minutes: 0 },
      { hours: 12, minutes: 0 },
      { hours: 17, minutes: 0 }
    ];

    let targetTime = null;
    for (let i = 0; i < scheduleTimes.length; i++) {
      const schedule = scheduleTimes[i];
      targetTime = new Date(now);
      targetTime.setHours(schedule.hours, schedule.minutes, 0, 0);

      if (targetTime > now) {
        break; // Use the first upcoming time
      }
    }

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1); // Schedule for next day if all times are in the past
    }

    const timeUntilWatering = targetTime - now;

    setNextWateringTime(targetTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }));

    wateringIntervalRef.current = setTimeout(async () => {
      if (!isWatering) {
        try {
          await handleStartWatering();
          Alert.alert('Penyiraman Otomatis', 'Penyiraman otomatis telah dimulai.');
        } catch (error) {
          console.error('Error starting automatic watering:', error);
          Alert.alert('Error', 'Terjadi kesalahan saat memulai penyiraman otomatis.');
        }
      }
    }, timeUntilWatering);
  }, [isWatering]);

  const fetchData = useCallback(async () => {
    try {
      const [pompaResponse, timeResponse, modeResponse] = await Promise.all([
        fetch(firebasePompaUrl),
        fetch(firebaseTimeUrl),
        fetch(firebaseModeUrl),
      ]);

      const [pompaData, timeData, modeData] = await Promise.all([
        pompaResponse.json(),
        timeResponse.json(),
        modeResponse.json(),
      ]);

      setIsWatering(pompaData);
      setManualMode(modeData === 'manual');
      scheduleWatering(timeData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Terjadi kesalahan saat mengambil data dari Firebase.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [firebasePompaUrl, firebaseTimeUrl, firebaseModeUrl, scheduleWatering]);

  useEffect(() => {
    fetchData();

    const initialFetchInterval = setInterval(fetchData, 24 * 60 * 60 * 1000); // Fetch every 24 hours

    return () => {
      clearInterval(initialFetchInterval);
      clearInterval(wateringIntervalRef.current);
    };
  }, [fetchData]);

  const handleStartWatering = async () => {
    try {
      await fetch(firebasePompaUrl, {
        method: 'PUT',
        body: JSON.stringify(true)
      });
      setIsWatering(true);
      console.log('Watering command sent to Firebase.');

      setTimeout(async () => {
        await handleStopWatering();
        Alert.alert('Penyiraman Selesai', `Penyiraman selama ${wateringDuration} menit telah selesai.`);
      }, wateringDuration * 60 * 1000);
    } catch (error) {
      console.error('Error starting watering:', error);
      setError('Terjadi kesalahan saat mengirim perintah penyiraman.');
    }
  };

  const handleStopWatering = async () => {
    try {
      await fetch(firebasePompaUrl, {
        method: 'PUT',
        body: JSON.stringify(false)
      });
      setIsWatering(false);
      console.log('Stop watering command sent to Firebase.');
    } catch (error) {
      console.error('Error stopping watering:', error);
      setError('Terjadi kesalahan saat mengirim perintah penghentian penyiraman.');
    }
  };

  const toggleMode = async () => {
    const newMode = manualMode ? 'automatic' : 'manual';
    try {
      await fetch(firebaseModeUrl, {
        method: 'PUT',
        body: JSON.stringify(newMode),
      });
      setManualMode(!manualMode);
      console.log('Mode change command sent to Firebase.');
    } catch (error) {
      console.error('Error toggling mode:', error);
      setError('Terjadi kesalahan saat mengubah mode.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
        <Text style={styles.header}>Pompa Penyiraman Air</Text>
          <Text style={styles.description}>
            Silahkan Menyalakan Pompa Penyiraman Air untuk menyiraman Tanaman Sacha Inchi
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text> // Display error message
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, isWatering && styles.stopButton]}
                onPress={isWatering ? handleStopWatering : handleStartWatering}
              >
                <Text style={styles.buttonText}>
                  {isWatering ? 'Stop Penyiraman' : 'Mulai Penyiraman'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, manualMode && styles.manualButton]}
                onPress={toggleMode}
              >
                <Text style={styles.buttonText}>
                  {manualMode ? 'Pindah ke Otomatis' : 'Pindah ke Manual'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && (
            <>
              <Text style={styles.durationText}>Pilih Durasi Penyiraman:</Text>
              <View style={styles.durationContainer}>
                {[1, 5, 10, 15].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      wateringDuration === duration && styles.selectedDurationButton,
                    ]}
                    onPress={() => setWateringDuration(duration)}
                  >
                    <Text style={styles.buttonText}>{duration} Menit</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {!isLoading && !error && nextWateringTime && (
            <Text style={styles.nextWateringText}>
              Penyiraman otomatis selanjutnya pada: {nextWateringTime} WIB
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#508D4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 50,
    color: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  stopButton: {
    backgroundColor: 'red',
  },
  manualButton: {
    backgroundColor: '#FFA500', // Orange color for manual mode
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  durationText: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  durationButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedDurationButton: {
    backgroundColor: '#FFD700', // Highlight selected duration
  },
  nextWateringText: {
    fontSize: 15,
    color: '#fff',
    marginTop: 10,
  },
});

export default PompaPenyiramanAir;
