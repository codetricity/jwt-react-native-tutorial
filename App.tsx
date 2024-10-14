import 'react-native-gesture-handler'; // This should be at the very top of the file
import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, Text, StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ScrollView } from 'react-native-gesture-handler';


const Stack = createStackNavigator();

const LoginScreen = ({ navigation }) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://image360.oppget.com/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          await AsyncStorage.setItem('accessToken', data.access);
          await AsyncStorage.setItem('refreshToken', data.refresh);
          console.log('Access token saved successfully:', data.access);

          // Navigate to the Home screen
          navigation.navigate('Home');
        } else {
          setErrorMessage('No access token found');
        }
      } else {
        const data = await response.json();
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred: ' + error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
};

const HomeScreen = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (!accessToken) {
            throw new Error('No access token found');
          }
          const response = await fetch('https://image360.oppget.com/api/user-photo/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const responseData = await response.json();
          setData(responseData);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

    const handleDelete = async (id) => {
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (!accessToken) {
            throw new Error('No access token found');
          }
    
          const response = await fetch(`https://image360.oppget.com/api/${id}/delete/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to delete item');
          }
    
          // Refresh the data after deletion
          fetchData(); // Re-fetch data to see the updated list
        } catch (error) {
          setError(error.message);
        }
      };

    useEffect(() => {

      fetchData();
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
      return <Text style={styles.error}>Error: {error}</Text>;
    }

    return (
        <ScrollView style={styles.container}>
          {data.length > 0 ? (
            data.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                {/* Assuming the data item has 'id', 'name', and 'description' properties */}
                <Image
                source={{ uri: item.image }} // Replace with the correct field name for your image URL
                style={styles.image}
                resizeMode="cover"
                />
                <Text style={styles.itemText}>ID: {item.id}</Text>
                <Text style={styles.itemText}>Name: {item.name}</Text>
                <Text style={styles.itemText}>Description: {item.description}</Text>
                <Text style={styles.itemText}>Attribution: {item.attribution}</Text>
                <Text style={styles.itemText}>License Link: {item.license_link}</Text>
                <Text style={styles.itemText}>Date Taken: {item.date_taken}</Text>
                <Text style={styles.itemText}>Camera Model: {item.camera_model}</Text>
                <Text style={styles.itemText}>Category: {item.category}</Text>
                <Text style={styles.itemText}>Order: {item.order}</Text>

                <Text style={styles.itemText}>Image: {item.image}</Text>
                <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
              </View>
            ))
          ) : (
            <Text>No data available</Text>
          )}
        </ScrollView>
      );
    };


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default App;
