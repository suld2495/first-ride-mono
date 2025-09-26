import DarkMode from "@/components/common/DarkMode";
import Paragraph from "@/components/common/paragraph/Paragraph";
import { IconBellPlus } from "@tabler/icons-react";
import Header from "../common/Header";
import { useAcceptFriendRequestMutation, useFetchFriendRequestsQuery, useRejectFriendRequestMutation } from "@repo/shared/hooks/useFriend";
import { useState } from "react";
import { getFormatDate } from "@repo/shared/utils";
import { useShowModal } from "@/hooks/useModal";
import Button from "@/components/common/button/Button";

const FriendHeader = () => {
  const [page] = useState(1);
  const [show, setShow] = useShowModal(false);
  const { data: list } = useFetchFriendRequestsQuery(page);
  const acceptFriendMutation = useAcceptFriendRequestMutation();
  const rejectFriendRequestMutation = useRejectFriendRequestMutation();

  const handleClick = (e: React.MouseEvent) => {
    setShow(true);
    e.stopPropagation();
  };

  const handleAccpet = async (id: number) => {
    try {
      await acceptFriendMutation.mutateAsync(id);
      alert('추가 되었습니다.');
    } catch {}
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequestMutation.mutateAsync(id);
      alert('거절 되었습니다.');
    } catch {}
  };

  if (!list) {
    return null;
  }

  return (
    <Header>
      <Paragraph variant="h3">친구 리스트</Paragraph>
      <div className="flex gap-3 items-center">
        <div
          className="relative text-primary-color dark:text-white cursor-pointer flex "
          onClick={handleClick}
        >
          <IconBellPlus stroke={2} />
          {list.length > 0 && (
            <span className="absolute -top-1 -right-1 w-[15px] h-[15px] leading-3 text-center rounded-full bg-red-400 text-[10px] text-white">
              {list.length}
            </span>
          )}
        </div>
        <DarkMode />
      </div>
      {show && !!list.length && (
        <div className="absolute z-10 top-12 right-11">
          <div className="fixed z-1 w-full h-full top-0 left-0"></div>
          <ul className="alert relative z-2 w-[200px] p-2 border-[1px] border-gray-300 rounded-sm bg-white dark:bg-primary-color shadow-lg dark:shadow-middle dark:shadow-gray-600/80">
            {list.map(
              ({ id, senderNickname, createdAt }) => (
                <li key={id}>
                  <div
                    className={`flex flex-col p-2 border-b-[1px] border-gray-200 rounded-sm`}
                  >
                    <div className="flex justify-between">
                      <Paragraph className="text-gray-600 font-semibold">
                        {senderNickname}
                      </Paragraph>
                      <div className="flex gap-2">
                        <Button 
                          size="very-small" 
                          className="px-2 dark:bg-blue-400 dark:hover:bg-blue-500"
                          onClick={() => handleAccpet(id)}
                        >
                          추가
                        </Button>
                        <Button 
                          size="very-small" 
                          className="px-2 dark:bg-red-500 dark:hover:bg-red-600"
                          onClick={() => handleReject(id)}
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[12px] text-gray-500 dark:text-gray-300">
                      <span>{getFormatDate(createdAt)}</span>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </Header>
  )
};

export default FriendHeader;
