# react-native ESLint Local Rules

React Native 환경의 성능, 리스트 컴포넌트, Reanimated, 접근성 등에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [no-barrel-import](#no-barrel-import) | Metro 성능을 위해 `index.ts` 경유 barrel import를 금지한다 |
| [no-controlled-textinput](#no-controlled-textinput) | 단순 controlled `TextInput` 사용을 금지하고 uncontrolled/ref 패턴을 유도한다 |
| [no-flatlist-missing-get-item-layout](#no-flatlist-missing-get-item-layout) | 고정 높이 `FlashList`/`FlatList`에 `getItemLayout` prop을 강제한다 |
| [no-flatlist-missing-perf-props](#no-flatlist-missing-perf-props) | `FlashList`/`FlatList` 사용 시 핵심 성능 prop 누락을 금지한다 |
| [no-flatlist-use-flashlist](#no-flatlist-use-flashlist) | `FlatList`/`SectionList` 대신 `FlashList` 사용을 강제한다 |
| [no-heavy-func-in-animated-style](#no-heavy-func-in-animated-style) | `useAnimatedStyle` 안에서 무거운 연산을 금지한다 |
| [no-index-key-extractor](#no-index-key-extractor) | `keyExtractor`에서 `index` 기반 key 사용을 금지한다 |
| [no-inline-render-item](#no-inline-render-item) | `FlashList`/`FlatList`의 `renderItem`에 인라인 함수 직접 전달을 금지한다 |
| [no-reanimated-state-in-worklet](#no-reanimated-state-in-worklet) | Reanimated worklet 함수 안에서 React state 참조를 금지한다 |
| [no-reanimated-style-on-view](#no-reanimated-style-on-view) | `useAnimatedStyle` 결과는 Animated 컴포넌트에만 전달하도록 강제한다 |
| [no-scrollview-map-render](#no-scrollview-map-render) | `ScrollView` 안에서 `.map()`으로 리스트를 렌더링하는 것을 금지한다 |
| [no-textinput-value-defaultvalue](#no-textinput-value-defaultvalue) | `TextInput`에서 `value`와 `defaultValue`를 동시에 사용하는 것을 금지한다 |
| [require-accessible-label](#require-accessible-label) | `TouchableOpacity`, `Pressable`, `TouchableHighlight`에 `accessibilityLabel` 명시를 강제한다 |
| [require-flashlist-estimated-size](#require-flashlist-estimated-size) | `FlashList`에 `estimatedItemSize` prop 명시를 강제한다 |
| [require-flatlist-keyextractor](#require-flatlist-keyextractor) | `FlatList`/`SectionList`에 `keyExtractor` prop 명시를 강제한다 |
| [require-memo-for-list-item](#require-memo-for-list-item) | `FlatList`/`SectionList`의 `renderItem` 컴포넌트에 `React.memo` 적용을 강제한다 |
| [require-worklet-directive](#require-worklet-directive) | inline worklet 함수에 첫 줄 `'worklet'` 지시문을 강제한다 |

---

## no-barrel-import

### 개요

Metro 번들러는 `index.ts`를 경유하는 barrel import 시 해당 디렉토리의 모든 모듈을 번들에 포함할 수 있어 성능에 불리합니다. 파일을 직접 import하도록 강제합니다.

### Correct

```ts
// ✅ 파일 직접 import
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';

// ✅ 외부 패키지는 허용
import { Text } from 'tamagui';
```

### Incorrect

```ts
// ❌ index.ts 경유 barrel import
import { Button } from '@/components/ui/index';
// Error: barrel import(index.ts 경유)를 사용하지 마세요. Metro 번들러 성능에 불리합니다.

import { something } from '../components';
// Error: 파일을 직접 import하세요. (예: '@/components/ui/button')
```

---

## no-controlled-textinput

### 개요

`value` + `onChangeText={setState}` 형태의 단순 controlled `TextInput`은 RN에서 타이핑 지연을 유발합니다. `defaultValue` + `ref` 방식 또는 실시간 포맷팅이 필요한 경우에만 controlled를 사용하세요.

### Correct

```tsx
// ✅ uncontrolled — defaultValue + ref
<TextInput defaultValue="init" onChangeText={handleChange} />

// ✅ 실시간 포맷팅 처리 — onChangeText에서 가공 후 setState
const [text, setText] = useState('');
<TextInput value={text} onChangeText={(next) => setText(formatText(next))} />
```

### Incorrect

```tsx
// ❌ 단순 setState 전달
const [text, setText] = useState('');
<TextInput value={text} onChangeText={setText} />
// Error: 단순 controlled TextInput은 RN에서 타이핑 지연을 유발합니다.

// ❌ 화살표 함수로 감싸도 단순 passthrough
<TextInput value={text} onChangeText={(value) => { setText(value); }} />
// Error: defaultValue + ref 방식을 사용하거나 실시간 포맷팅이 필요한 경우만 controlled를 사용하세요.
```

---

## no-flatlist-missing-get-item-layout

### 개요

`estimatedItemSize`가 있는 `FlashList`/`FlatList`에는 `getItemLayout`을 추가하여 스크롤 성능을 향상시키도록 강제합니다. 아이템 높이가 고정인 경우 반드시 추가하세요.

### Correct

```tsx
// ✅ estimatedItemSize + getItemLayout 함께 사용
<FlashList
  estimatedItemSize={100}
  getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
/>
```

### Incorrect

```tsx
// ❌ estimatedItemSize만 있고 getItemLayout 없음
<FlashList estimatedItemSize={100} renderItem={renderItem} />
// Error: FlashList/FlatList에 getItemLayout을 추가하면 스크롤 성능이 향상됩니다.
```

---

## no-flatlist-missing-perf-props

### 개요

`FlashList`/`FlatList` 사용 시 핵심 성능 prop 3가지가 모두 있어야 합니다.

필수 prop: `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`

### Correct

```tsx
// ✅ 3가지 성능 prop 모두 명시
<FlashList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Incorrect

```tsx
// ❌ 성능 prop 누락
<FlashList renderItem={renderItem} />
// Error: FlashList/FlatList에 성능 prop이 누락되었습니다.
// 누락된 prop: removeClippedSubviews, maxToRenderPerBatch, windowSize
```

---

## no-flatlist-use-flashlist

### 개요

`react-native`에서 `FlatList` 또는 `SectionList`를 import하거나 JSX에서 사용하는 것을 금지합니다. `@shopify/flash-list`의 `FlashList`를 사용하세요.

### Correct

```tsx
// ✅ FlashList 사용
import { FlashList } from '@shopify/flash-list';
<FlashList data={items} />;
```

### Incorrect

```tsx
// ❌ react-native에서 FlatList import
import { FlatList } from 'react-native';
// Error: FlatList/SectionList 대신 @shopify/flash-list 의 FlashList를 사용하세요.

// ❌ SectionList JSX 사용
<SectionList sections={sections} />;
// Error: FlashList는 FlatList 대비 성능이 월등히 뛰어납니다.
```

---

## no-heavy-func-in-animated-style

### 개요

`useAnimatedStyle` 내부에서 다음 패턴을 금지합니다. UI thread를 블로킹하므로 `useDerivedValue`로 미리 계산하세요.

- `JSON.parse()` / `JSON.stringify()` 호출
- 메서드 체이닝 3단계 이상
- 외부 함수 호출 3회 이상

### Correct

```tsx
// ✅ 단순 shared value 참조
useAnimatedStyle(() => ({
  opacity: progress.value,
  transform: [{ scale: scale.value }],
}));

// ✅ useDerivedValue로 사전 계산
const computed = useDerivedValue(() => heavyCalc(progress.value));
useAnimatedStyle(() => ({ opacity: computed.value }));
```

### Incorrect

```tsx
// ❌ 3단계 이상 체이닝
useAnimatedStyle(() => {
  const result = items.filter(Boolean).map(String).reduce((a, b) => a + b, '');
  // Error: useAnimatedStyle 안에서 무거운 연산을 하지 마세요.
  return { opacity: result.length };
});

// ❌ JSON.parse 사용
useAnimatedStyle(() => {
  const parsed = JSON.parse(data); // Error
  return { opacity: parsed.value };
});
```

---

## no-index-key-extractor

### 개요

`FlashList`/`FlatList`의 `keyExtractor`에서 두 번째 파라미터(`index`)를 key로 반환하는 것을 금지합니다. 아이템 고유 id를 사용하세요.

### Correct

```tsx
// ✅ 아이템 고유 id 사용
<FlashList keyExtractor={(item) => item.id.toString()} />
```

### Incorrect

```tsx
// ❌ index를 key로 사용
<FlashList keyExtractor={(_, index) => index.toString()} />
// Error: keyExtractor에서 index를 key로 사용하지 마세요. 아이템 고유 id를 사용하세요.
```

---

## no-inline-render-item

### 개요

`FlashList`/`FlatList`의 `renderItem` prop에 화살표 함수나 함수 표현식을 인라인으로 직접 전달하는 것을 금지합니다. `useCallback`으로 감싼 외부 함수를 전달하세요.

### Correct

```tsx
// ✅ useCallback으로 감싼 외부 함수 사용
const renderItem = useCallback(({ item }) => <Item item={item} />, []);
<FlashList renderItem={renderItem} />;
```

### Incorrect

```tsx
// ❌ 인라인 화살표 함수
<FlashList renderItem={({ item }) => <Item item={item} />} />
// Error: FlashList/FlatList의 renderItem에 인라인 함수를 사용하지 마세요.
// useCallback으로 감싼 외부 함수를 전달하세요.
```

---

## no-reanimated-state-in-worklet

### 개요

`useAnimatedStyle`, `useDerivedValue` 등 Reanimated worklet 함수 내부에서 React `useState`/`useReducer`로 선언된 state를 직접 참조하는 것을 금지합니다. `useSharedValue`를 사용하세요.

### Correct

```tsx
// ✅ useSharedValue 사용
const progress = useSharedValue(0);
const style = useAnimatedStyle(() => ({ opacity: progress.value }));
```

### Incorrect

```tsx
// ❌ worklet 안에서 React state 참조
const [count, setCount] = useState(0);
const style = useAnimatedStyle(() => ({
  opacity: count > 0 ? 1 : 0, // Error: count는 React state
}));
// Error: worklet 함수 안에서 React state를 직접 참조하지 마세요. useSharedValue를 사용하세요.
```

---

## no-reanimated-style-on-view

### 개요

`useAnimatedStyle`의 결과를 일반 `View`, `Text` 등 non-Animated 컴포넌트의 `style` prop에 전달하는 것을 금지합니다. 반드시 `Animated.View`, `Animated.Text` 등 Animated 컴포넌트에만 전달하세요.

### Correct

```tsx
// ✅ Animated.View에 전달
const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 }));
<Animated.View style={animatedStyle} />;
```

### Incorrect

```tsx
// ❌ 일반 View에 전달
const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 }));
<View style={animatedStyle} />;
// Error: useAnimatedStyle 결과는 Animated.View, Animated.Text 등 Animated 컴포넌트에만 전달하세요.
```

---

## no-scrollview-map-render

### 개요

`ScrollView` 안에서 `.map()`으로 리스트를 렌더링하는 것을 금지합니다. 모든 아이템을 한 번에 렌더링하여 메모리와 성능이 저하됩니다. `FlashList`를 사용하세요.

### Correct

```tsx
// ✅ FlashList 사용
<FlashList data={items} renderItem={renderItem} estimatedItemSize={100} />;
```

### Incorrect

```tsx
// ❌ ScrollView 안에서 map 렌더링
<ScrollView>
  {items.map((item) => <Item key={item.id} item={item} />)}
</ScrollView>
// Error: ScrollView 안에서 .map()으로 리스트를 렌더링하지 마세요. FlashList를 사용하세요.
```

---

## no-textinput-value-defaultvalue

### 개요

`TextInput`에서 `value`와 `defaultValue`를 동시에 사용하는 것을 금지합니다. controlled(value + onChangeText) 또는 uncontrolled(defaultValue) 중 하나만 선택하세요.

### Correct

```tsx
// ✅ controlled 방식
<TextInput value={value} onChangeText={setValue} />;

// ✅ uncontrolled 방식
<TextInput defaultValue="init" />;
```

### Incorrect

```tsx
// ❌ value와 defaultValue 동시 사용
<TextInput value={value} defaultValue="init" onChangeText={setValue} />;
// Error: TextInput에서 value와 defaultValue를 동시에 사용하지 마세요.
```

---

## require-accessible-label

### 개요

`TouchableOpacity`, `Pressable`, `TouchableHighlight` 컴포넌트에 반드시 `accessibilityLabel` prop을 명시하도록 강제합니다. 스크린 리더 접근성을 보장합니다.

### Correct

```tsx
// ✅ accessibilityLabel 명시
<TouchableOpacity accessibilityLabel="로그인 버튼" onPress={handlePress} />
<Pressable accessibilityLabel="확인" onPress={handleConfirm} />
```

### Incorrect

```tsx
// ❌ accessibilityLabel 없음
<Pressable onPress={handlePress} />
// Error: TouchableOpacity/Pressable 에는 반드시 accessibilityLabel 을 명시하세요.

<TouchableOpacity onPress={handlePress} />
// Error: TouchableOpacity/Pressable 에는 반드시 accessibilityLabel 을 명시하세요.
```

---

## require-flashlist-estimated-size

### 개요

`FlashList` 컴포넌트에 `estimatedItemSize` prop을 반드시 명시하도록 강제합니다. FlashList 성능 최적화의 핵심 prop입니다.

### Correct

```tsx
// ✅ estimatedItemSize 명시
<FlashList data={items} renderItem={renderItem} estimatedItemSize={100} />;
```

### Incorrect

```tsx
// ❌ estimatedItemSize 없음
<FlashList data={items} renderItem={renderItem} />;
// Error: FlashList에는 반드시 estimatedItemSize prop을 명시하세요. (예: estimatedItemSize={100})
```

---

## require-flatlist-keyextractor

### 개요

`FlatList`와 `SectionList`에 `keyExtractor` prop을 반드시 명시하도록 강제합니다.

### Correct

```tsx
// ✅ keyExtractor 명시
<FlatList
  data={users}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <UserItem user={item} />}
/>
```

### Incorrect

```tsx
// ❌ keyExtractor 없음
<FlatList
  data={users}
  renderItem={({ item }) => <UserItem user={item} />}
/>
// Error: FlatList와 SectionList는 반드시 keyExtractor prop을 명시하세요.
```

---

## require-memo-for-list-item

### 개요

`FlatList`/`SectionList`의 `renderItem`에서 JSX를 반환하는 컴포넌트가 `React.memo`로 감싸져 있어야 합니다. 불필요한 리렌더를 방지합니다.

### Correct

```tsx
// ✅ React.memo로 감싼 컴포넌트 사용
const UserItem = React.memo(({ user }) => <View />);
<FlatList renderItem={({ item }) => <UserItem user={item} />} />;
```

### Incorrect

```tsx
// ❌ React.memo 없는 컴포넌트
<FlatList renderItem={({ item }) => <View>{item.name}</View>} />;
// Error: FlatList/SectionList 의 renderItem 컴포넌트는 React.memo 로 감싸세요.
```

---

## require-worklet-directive

### 개요

`runOnUI`, `scheduleOnUI`, `runOnJS`에 전달되는 인라인 함수에 반드시 첫 줄에 `'worklet'` 지시문이 있어야 합니다.

### Correct

```tsx
// ✅ 'worklet' 지시문 있음
runOnUI(() => {
  'worklet';
  progress.value = 1;
});
```

### Incorrect

```tsx
// ❌ 'worklet' 지시문 없음
scheduleOnUI(() => {
  progress.value = 1; // Error
});
// Error: worklet 함수에는 반드시 첫 줄에 'worklet' 지시문을 추가하세요.
```
