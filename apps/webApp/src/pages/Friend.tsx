import IconButton from "@/components/common/button/IconButton";
import DarkMode from "@/components/common/DarkMode";
import Input from "@/components/common/input/Input";
import Paragraph from "@/components/common/paragraph/Paragraph";
import FriendList from "@/components/friend/FriendList";
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
    <div className="px-5 pt-3">
      <div className="flex justify-between">
        <Paragraph variant="h3">친구 리스트</Paragraph>
        <DarkMode />
      </div>

      <div className="flex justify-end mt-5">
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
    </div>
  )
};

export default FriendPage;