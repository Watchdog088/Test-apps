import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MatchAnimation = ({ visible, onClose, onSendMessage, onKeepDating }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const leftLinkAnim = useRef(new Animated.Value(-150)).current;
  const rightLinkAnim = useRef(new Animated.Value(150)).current;
  const leftRotateAnim = useRef(new Animated.Value(-45)).current;
  const rightRotateAnim = useRef(new Animated.Value(45)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  
  const [sparkles] = useState([1, 2, 3, 4, 5, 6].map(() => useRef(new Animated.Value(0)).current));

  useEffect(() => {
    if (visible) {
      startAnimation();
      
      // Auto-close after 8 seconds
      const autoCloseTimeout = setTimeout(() => {
        handleKeepDating();
      }, 8000);

      return () => clearTimeout(autoCloseTimeout);
    }
  }, [visible]);

  const startAnimation = () => {
    // Step 1: Show modal with fade and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 2: Animate chain links coming together (after 500ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(leftLinkAnim, {
          toValue: -15,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightLinkAnim, {
          toValue: 15,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(leftRotateAnim, {
          toValue: -15,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightRotateAnim, {
          toValue: 15,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Step 3: Show "It's a Lynk!" text (after 1500ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(textAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(textScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Step 4: Animate sparkles (after 2000ms)
    setTimeout(() => {
      sparkles.forEach((sparkle, index) => {
        setTimeout(() => {
          Animated.sequence([
            Animated.spring(sparkle, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(sparkle, {
                  toValue: 0.8,
                  duration: 1000,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle, {
                  toValue: 1,
                  duration: 1000,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]).start();
        }, index * 200);
      });
    }, 2000);

    // Step 5: Show action buttons (after 3000ms)
    setTimeout(() => {
      Animated.spring(buttonsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const handleSendMessage = () => {
    hideAnimation(() => {
      onSendMessage && onSendMessage();
    });
  };

  const handleKeepDating = () => {
    hideAnimation(() => {
      onKeepDating && onKeepDating();
    });
  };

  const hideAnimation = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      leftLinkAnim.setValue(-150);
      rightLinkAnim.setValue(150);
      leftRotateAnim.setValue(-45);
      rightRotateAnim.setValue(45);
      textAnim.setValue(0);
      textScaleAnim.setValue(0.5);
      buttonsAnim.setValue(0);
      sparkles.forEach(sparkle => sparkle.setValue(0));
      
      onClose && onClose();
      callback && callback();
    });
  };

  const sparklePositions = [
    { top: 10, left: 20 },
    { top: 0, left: 80 },
    { top: 15, left: 140 },
    { top: 30, left: 40 },
    { top: 25, left: 100 },
    { top: 35, left: 160 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleKeepDating}
    >
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.95)', 'rgba(139, 92, 246, 0.95)', 'rgba(236, 72, 153, 0.95)']}
        style={styles.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Chain Links Animation */}
          <View style={styles.chainLinksContainer}>
            <Animated.Text
              style={[
                styles.chainLink,
                styles.leftLink,
                {
                  transform: [
                    { translateX: leftLinkAnim },
                    { rotate: leftRotateAnim.interpolate({
                        inputRange: [-45, 15],
                        outputRange: ['-45deg', '-15deg'],
                      })},
                  ],
                },
              ]}
            >
              🔗
            </Animated.Text>
            <Animated.Text
              style={[
                styles.chainLink,
                styles.rightLink,
                {
                  transform: [
                    { translateX: rightLinkAnim },
                    { rotate: rightRotateAnim.interpolate({
                        inputRange: [45, -15],
                        outputRange: ['45deg', '15deg'],
                      })},
                  ],
                },
              ]}
            >
              🔗
            </Animated.Text>
          </View>

          {/* Match Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textAnim,
                transform: [
                  { scale: textScaleAnim },
                  { translateY: textAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })},
                ],
              },
            ]}
          >
            <Text style={styles.matchTitle}>It's a Lynk!</Text>
            <Text style={styles.matchSubtitle}>You and this person liked each other</Text>
            
            {/* Sparkles */}
            <View style={styles.sparklesContainer}>
              {sparkles.map((sparkle, index) => (
                <Animated.Text
                  key={index}
                  style={[
                    styles.sparkle,
                    {
                      ...sparklePositions[index],
                      opacity: sparkle,
                      transform: [
                        { scale: sparkle },
                        { rotate: sparkle.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })},
                      ],
                    },
                  ]}
                >
                  ✨
                </Animated.Text>
              ))}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsAnim,
                transform: [
                  { translateY: buttonsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })},
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.sendMessageButton]}
              onPress={handleSendMessage}
              activeOpacity={0.8}
            >
              <Text style={styles.sendMessageText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.keepDatingButton]}
              onPress={handleKeepDating}
              activeOpacity={0.8}
            >
              <Text style={styles.keepDatingText}>Keep Dating</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
  },
  container: {
    alignItems: 'center',
    maxWidth: width * 0.9,
    width: '100%',
  },
  chainLinksContainer: {
    height: 120,
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  chainLink: {
    position: 'absolute',
    fontSize: 60,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  leftLink: {
    left: '50%',
    marginLeft: -30,
  },
  rightLink: {
    right: '50%',
    marginRight: -30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  matchTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  matchSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sparklesContainer: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 60,
    left: -100,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendMessageButton: {
    backgroundColor: '#10b981',
  },
  sendMessageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keepDatingButton: {
    backgroundColor: '#ffffff',
  },
  keepDatingText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchAnimation;
