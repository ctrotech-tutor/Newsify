import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Assuming you have db exported from firebaseConfig

const CLOUD_NAME = "diyehz4kw";
const UPLOAD_PRESET = "Newsify";

export const uploadProfilePicture = async (userId) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    const fileUri = result.assets[0].uri;
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result.secure_url) {
        // Save to AsyncStorage
        await AsyncStorage.setItem('@profile_image', result.secure_url);

        // Save to Firestore
        if (userId) {
          await setDoc(doc(db, 'users', userId), {
            photoURL: result.secure_url
          }, { merge: true });
        }
        return result.secure_url;
      } else {
        console.error('Cloudinary upload failed:', result);
        return null;
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  }
  return null;
};

