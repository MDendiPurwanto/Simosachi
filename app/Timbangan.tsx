import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, RefreshControl, Alert, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native'; 
const BASE_URL = 'https://simosachi.online/hasil_panen';
const REFRESH_INTERVAL = 60000; // 60 seconds in milliseconds


const Timbangan = () => {
    const [refreshing, setRefreshing] = useState(false);
    const webViewRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefreshEnabled] = useState(true);
  
    const handleWebViewError = (syntheticEvent) => {
      const errorDescription = syntheticEvent.nativeEvent.description || "Terjadi kesalahan saat memuat halaman. Periksa koneksi internet Anda.";
      Alert.alert("Error", errorDescription, [{ text: "OK" }]);
    };
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      Alert.alert("Memuat Ulang", "Sedang memuat ulang halaman...");
      webViewRef.current.reload();
    }, []);
  
    useFocusEffect(
      useCallback(() => {
        let refreshInterval;
        if (autoRefreshEnabled) {
          refreshInterval = setInterval(() => {
            webViewRef.current.reload();
            Alert.alert("Refresh Otomatis", "Halaman akan dimuat ulang setiap 1 menit");
          }, REFRESH_INTERVAL);
        }
        return () => {
          if (refreshInterval) {
            clearInterval(refreshInterval);
          }
        };
      }, [autoRefreshEnabled])
    ); 
  
    return (
        <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: BASE_URL }}
          onError={handleWebViewError}
          style={styles.webView}
          // ... (rest of WebView props)
          onLoadEnd={() => {
            setRefreshing(false);
            setIsLoading(false);
          }}
          cacheEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              enabled={!autoRefreshEnabled} // Disable manual refresh when auto-refresh is on
            />
          }
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" /> 
          </View>
        )}
  
      </View>
    );
};

export default Timbangan;


const styles = StyleSheet.create({
    container: {
      flex: 1,
     
    },
    webView: {
      flex: 1,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)' // Optional: Add a semi-transparent background
    },
  });
