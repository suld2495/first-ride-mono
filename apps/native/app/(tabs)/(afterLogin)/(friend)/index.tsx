import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Container from '@/components/layout/Container';
import FriendHeader from '@/components/friend/FriendHeader';
import FriendList from '@/components/friend/FriendList';
import ThemeTextInput from '@/components/common/ThemeTextInput';
import Button from '@/components/common/Button';
import { COLORS } from '@/theme/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import FriendAddModal from '@/components/friend/FriendAddModal';

const FriendPage = () => {
  const [page] = useState(1);
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const styles = createStyles();

  const handleSearch = () => {
    setKeyword(input);
  };

  return (
    <Container style={styles.container}>
      <FriendHeader />

      <Container>
        <View style={styles.addButtonContainer}>
          <Button
            title="친구 추가"
            variant="primary"
            size="small"
            icon={
              <Ionicons
                name="people-outline"
                size={20}
                color={COLORS.white}
              />
            }
            iconGap={8}
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </View>

        <View style={styles.searchContainer}>
          <ThemeTextInput
            value={input}
            placeholder="이름을 입력해주세요."
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        <FriendList page={page} keyword={keyword} />
      </Container>

      <FriendAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Container>
  );
};

export default FriendPage;

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    addButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    addButton: {
      paddingHorizontal: 12,
    },
    searchContainer: {
      marginTop: 12,
      marginBottom: 12,
    },
    searchInput: {
      width: '100%',
    },
  });
