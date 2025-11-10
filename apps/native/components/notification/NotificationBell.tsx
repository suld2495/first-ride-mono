import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeView from '../common/ThemeView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';
import ThemeText from '../common/ThemeText';

export interface Notification {
  title: string;
  createdAt?: string | Date;
}

interface NotificationBellProps<T extends Notification> {
  list: T[];
  onClick?: (item: T, index: number) => void;
  renderItem: (item: T) => React.ReactNode;
}

const NotificationBell = <T extends Notification>({
  list,
  onClick,
  renderItem,
}: NotificationBellProps<T>) => {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <>
      <Pressable
        style={styles.bellButton}
        onPress={() => {
          setVisible(true);
        }}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={COLORS[colorScheme].text}
        />
        {list.length > 0 && (
          <View style={styles.badge}>
            <ThemeText
              lightColor={'#ffffff'}
              darkColor={'#ffffff'}
              style={styles.badgeText}
            >
              {list.length}
            </ThemeText>
          </View>
        )}
      </Pressable>

      <Modal
        visible={visible && list.length > 0}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemeView style={styles.modalContent}>
              <FlatList
                data={list}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <Pressable
                    style={styles.notificationItem}
                    onPress={() => {
                      setVisible(false);
                      onClick?.(item, index);
                    }}
                  >
                    {renderItem(item)}
                  </Pressable>
                )}
              />
            </ThemeView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default NotificationBell;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    bellButton: {
      position: 'relative',
      padding: 4,
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 15,
      height: 15,
      borderRadius: 7.5,
      backgroundColor: COLORS[colorScheme].error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: 10,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 60,
      paddingRight: 20,
    },
    modalContainer: {
      width: 250,
    },
    modalContent: {
      borderRadius: 8,
      padding: 8,
      maxHeight: 400,
    },
    notificationItem: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS[colorScheme].border,
    },
  });
