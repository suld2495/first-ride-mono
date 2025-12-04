import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import ThemeView from '@/components/common/ThemeView';
import FriendAddModal from '@/components/friend/FriendAddModal';
import FriendHeader from '@/components/friend/FriendHeader';
import FriendList from '@/components/friend/FriendList';
import Container from '@/components/layout/Container';
import { COLORS } from '@/theme/colors';

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
        <ThemeView style={styles.addButtonContainer}>
          <Button
            title="친구 추가"
            variant="primary"
            size="sm"
            leftIcon={
              <Ionicons name="people-outline" size={20} color={COLORS.white} />
            }
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </ThemeView>

        <ThemeView style={styles.searchContainer}>
          <Input
            value={input}
            placeholder="이름을 입력해주세요."
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            fullWidth
          />
        </ThemeView>
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
