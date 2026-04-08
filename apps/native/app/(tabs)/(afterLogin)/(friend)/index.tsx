import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import FriendAddModal from '@/components/friend/friend-add-modal';
import FriendHeader from '@/components/friend/friend-header';
import FriendList from '@/components/friend/friend-list';
import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeView from '@/components/ui/theme-view';

const FriendPage = () => {
  const [page] = useState(1);
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSearch = () => {
    setKeyword(input);
  };

  return (
    <Container style={styles.container} noPadding>
      <Header />
      <FriendHeader />

      <ThemeView style={styles.innerContainer}>
        <ThemeView style={styles.addButtonContainer}>
          <Button
            title="친구 추가"
            variant="primary"
            size="sm"
            leftIcon={({ color }) => (
              <Ionicons name="people-outline" size={20} color={color} />
            )}
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
      </ThemeView>

      <FriendAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Container>
  );
};

export default FriendPage;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing.m,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.foundation.spacing.m,
  },
  addButton: {
    paddingHorizontal: theme.foundation.spacing.s,
  },
  searchContainer: {
    marginVertical: theme.foundation.spacing.m,
  },
  searchInput: {
    width: '100%',
  },
}));
