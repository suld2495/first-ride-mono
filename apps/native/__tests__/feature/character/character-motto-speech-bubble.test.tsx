import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import CharacterMottoSpeechBubble from '@/feature/character/character-motto-speech-bubble';

describe('CharacterMottoSpeechBubble', () => {
  it('내 말풍선에는 수정 버튼을 표시하고 수정 동작을 실행한다', () => {
    const onEdit = jest.fn();
    const screen = render(
      <CharacterMottoSpeechBubble
        isMine
        message="오늘도 전진"
        onEdit={onEdit}
        testID="my-motto-speech-bubble"
      />,
    );

    expect(
      screen.getByTestId('character-motto-speech-bubble-edit-icon'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '한마디 수정' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('친구 말풍선에는 수정 버튼을 표시하지 않는다', () => {
    const screen = render(
      <CharacterMottoSpeechBubble
        isMine={false}
        message="함께 성장하기"
        testID="friend-motto-speech-bubble"
      />,
    );

    expect(screen.queryByRole('button', { name: '한마디 수정' })).toBeNull();
    expect(
      screen.queryByTestId('character-motto-speech-bubble-edit-icon'),
    ).toBeNull();
  });

  it('옵션을 생략하면 수정할 수 없는 친구 말풍선으로 표시한다', () => {
    const screen = render(<CharacterMottoSpeechBubble message="기본 한마디" />);

    expect(
      screen.getByTestId('character-motto-speech-bubble'),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('character-motto-speech-bubble-content-container'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('한마디 수정')).toBeNull();
  });

  it('주체와 관계없이 공통 말풍선 너비 설정을 사용한다', () => {
    const myScreen = render(
      <CharacterMottoSpeechBubble
        isMine
        message="내 한마디"
        onEdit={jest.fn()}
        testID="my-motto-speech-bubble"
      />,
    );
    const friendScreen = render(
      <CharacterMottoSpeechBubble
        isMine={false}
        message="친구 한마디"
        testID="friend-motto-speech-bubble"
      />,
    );
    const myStyle = StyleSheet.flatten(
      myScreen.getByTestId('my-motto-speech-bubble-content-container').props
        .style,
    );
    const friendStyle = StyleSheet.flatten(
      friendScreen.getByTestId('friend-motto-speech-bubble-content-container')
        .props.style,
    );
    const myWrapperStyle = StyleSheet.flatten(
      myScreen.getByTestId('my-motto-speech-bubble').props.style,
    );
    const friendWrapperStyle = StyleSheet.flatten(
      friendScreen.getByTestId('friend-motto-speech-bubble').props.style,
    );
    const myContentWrapperStyle = StyleSheet.flatten(
      myScreen.getByTestId('my-motto-speech-bubble-content').props.style,
    );
    const friendContentWrapperStyle = StyleSheet.flatten(
      friendScreen.getByTestId('friend-motto-speech-bubble-content').props
        .style,
    );

    expect(myStyle).toEqual(
      expect.objectContaining({
        minWidth: 96,
        maxWidth: expect.any(Number),
      }),
    );
    expect(friendStyle).toEqual(
      expect.objectContaining({
        minWidth: myStyle.minWidth,
        maxWidth: myStyle.maxWidth,
      }),
    );
    expect(myWrapperStyle).toEqual(
      expect.objectContaining({
        width: myStyle.maxWidth,
      }),
    );
    expect(myWrapperStyle).not.toHaveProperty('left');
    expect(myWrapperStyle).not.toHaveProperty('transform');
    expect(friendWrapperStyle).toEqual(
      expect.objectContaining({
        width: friendStyle.maxWidth,
      }),
    );
    expect(friendWrapperStyle).not.toHaveProperty('left');
    expect(friendWrapperStyle).not.toHaveProperty('transform');
    expect(myContentWrapperStyle).toEqual(
      expect.objectContaining({
        alignItems: 'center',
        width: '100%',
      }),
    );
    expect(friendContentWrapperStyle).toEqual(
      expect.objectContaining({
        alignItems: 'center',
        width: '100%',
      }),
    );
  });
});
