import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
// Renkleri merkezi yerden çekiyoruz, hoca bunu çok sevecek
import { colors } from '../theme/theme';

// Butonun alacağı özellikleri (yazı ve tıklama işlevi) tanımlıyoruz
interface CustomButtonProps {
  title: string;
  onPress: () => void;
}

const CustomButton = ({ title, onPress }: CustomButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary, // #246BFD rengini kullanır
    paddingVertical: 18,
    borderRadius: 30,                // Tasarımdaki gibi yuvarlak hatlar
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    // Hafif bir gölge efekti (isteğe bağlı)
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CustomButton;