// Source: client/components/common/NumberPicker.jsx
import React, { useState, useRef, useEffect, memo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 80;

// Utilisation de memo pour éviter les re-rendus inutiles
const NumberPicker = memo(({ 
  minValue = 1, 
  maxValue = 99, 
  initialValue = 5,
  onConfirm,
  visible = false
}) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const scrollViewRef = useRef(null);
  
  // Générer la liste complète des nombres
  const numbers = React.useMemo(() => 
    Array.from(
      { length: maxValue - minValue + 1 },
      (_, i) => minValue + i
    ), [minValue, maxValue]);
  
  // Réinitialiser la valeur et scroll à la position initiale quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      setSelectedValue(initialValue);
      
      // Scroll à la position initiale avec un léger délai pour s'assurer que le ScrollView est monté
      setTimeout(() => {
        if (scrollViewRef.current) {
          const scrollToIndex = initialValue - minValue;
          scrollViewRef.current.scrollTo({
            y: scrollToIndex * ITEM_HEIGHT,
            animated: false
          });
        }
      }, 50);
    }
  }, [visible, initialValue, minValue]);
  
  // Gérer le scroll et mettre à jour la valeur sélectionnée
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    
    if (index >= 0 && index < numbers.length) {
      const newValue = numbers[index];
      setSelectedValue(newValue);
    }
  };
  
  const handleConfirm = React.useCallback(() => {
    if (onConfirm) {
      onConfirm(selectedValue);
    }
  }, [onConfirm, selectedValue]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerContent}>            
            {/* Le conteneur de surbrillance est maintenant parfaitement centré */}
            <View style={styles.selectionHighlightContainer}>
              <View style={styles.selectionHighlight} />
            </View>
            
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScroll}
              contentContainerStyle={styles.scrollContent}
              scrollEventThrottle={16}
            >
              {/* Padding haut pour centrer les valeurs */}
              <View style={{height: ITEM_HEIGHT * 2}} />
              
              {numbers.map((num) => (
                <View key={num} style={styles.numberItem}>
                  <Text style={[
                    styles.numberText,
                    selectedValue === num && styles.selectedNumberText
                  ]}>
                    {num}
                  </Text>
                </View>
              ))}
              
              {/* Padding bas pour centrer les valeurs */}
              <View style={{height: ITEM_HEIGHT * 2}} />
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: width * 0.8,
    height: 400,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  pickerContent: {
    flex: 1,
    position: 'relative',
  },
  selectionHighlightContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 10,
  },
  selectionHighlight: {
    height: ITEM_HEIGHT,
    width: '90%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 64, // Ajustement parfait selon vos tests
  },
  scrollContent: {
    alignItems: 'center',
  },
  numberItem: {
    height: ITEM_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 40,
    color: COLORS.textSecondary,
    fontWeight: '300',
    textAlign: 'center',
  },
  selectedNumberText: {
    fontSize: 48,
    color: COLORS.primary,
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSize.subtitle,
    fontWeight: '500',
    letterSpacing: 1,
  }
});

export default NumberPicker;