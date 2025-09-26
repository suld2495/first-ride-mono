import IconButton from "@/components/common/button/IconButton";
import Input from "@/components/common/input/Input";
import FriendList from "@/components/friend/FriendList";
import Container from "@/layouts/common/Container";
import FriendHeader from "@/layouts/friend/FriendHeader";
import { ModalName, useModalStore } from "@/store/modal.store";
import { IconFriends } from "@tabler/icons-react";
import { useState } from "react";

const FriendPage = () => {
  const [page] = useState(1);
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const showModal = useModalStore((state) => state.show);

  const handleSerach = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }

    setKeyword(input);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <FriendHeader />

      <Container>
        <div className="flex justify-end">
          <IconButton 
            className="px-2"
            size="small" 
            icon={<IconFriends size={20} />}
            onClick={() => showModal(ModalName.FRIEND_ADD)}
          >
            친구 추가
          </IconButton>
        </div>

        <div className="mt-3 mb-3">
          <Input 
            className="w-full"
            value={input} 
            placeholder="이름을 입력해주세요."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleSerach}
          />
        </div>
        <FriendList page={page} keyword={keyword} />
      </Container>
    </div>
  )
};

export default FriendPage;