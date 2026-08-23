export type UpdateMottoRequest = {
  motto: null | string;
};

export interface FriendCodeStatusResponse {
  friendCode: string;
  friendCodeParticipated: boolean;
}

export type ApplyFriendCodeRequest = {
  friendCode: string;
};

export interface ApplyFriendCodeResponse extends FriendCodeStatusResponse {
  rewardedExp: number;
  referrerNickname: string;
  message: string;
}
