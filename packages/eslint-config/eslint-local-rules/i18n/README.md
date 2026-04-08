# i18n ESLint Local Rules

국제화(i18n) 및 사용자 노출 문자열 관리에 적용되는 로컬 ESLint 규칙 모음입니다.

---

## 규칙 목록

| 규칙 | 설명 |
|------|------|
| [no-user-facing-literal-string](#no-user-facing-literal-string) | 사용자에게 직접 노출되는 UI 문자열의 하드코딩을 금지한다 |

---

## no-user-facing-literal-string

### 개요

사용자에게 직접 노출되는 UI 문자열을 리터럴로 하드코딩하는 것을 금지합니다. 번역 함수 `t(...)` 또는 상수/변수를 사용하세요.

감지 대상:
- `Text` 컴포넌트의 JSX 텍스트 자식 노드
- `Text` 컴포넌트의 JSXExpressionContainer 문자열 리터럴
- `title`, `label`, `placeholder`, `accessibilityLabel` prop에 직접 전달된 문자열 리터럴
- `Alert.alert()` 인자의 문자열 리터럴

### Correct

```tsx
// ✅ 번역 함수 사용
import { useTranslation } from 'react-i18next';

function LoginScreen() {
  const { t } = useTranslation();
  return (
    <View>
      <Text>{t('login.title')}</Text>
      <TextInput placeholder={t('login.emailPlaceholder')} />
    </View>
  );
}

// ✅ 상수 변수 사용
const WELCOME_MESSAGE = '환영합니다';
<Text>{WELCOME_MESSAGE}</Text>

// ✅ Alert에 번역 함수 사용
Alert.alert(t('common.error'), t('errors.networkError'));
```

### Incorrect

```tsx
// ❌ Text 컴포넌트에 문자열 직접 작성
<Text>로그인</Text>
// Error: 사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.

// ❌ JSXExpressionContainer로 문자열 리터럴 전달
<Text>{'회원가입'}</Text>
// Error: 사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.

// ❌ placeholder에 문자열 리터럴 직접 전달
<TextInput placeholder="이메일을 입력하세요" />
// Error: 사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.

// ❌ accessibilityLabel에 문자열 리터럴 직접 전달
<Pressable accessibilityLabel="로그인 버튼" onPress={handleLogin} />
// Error: 사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.

// ❌ Alert.alert에 문자열 리터럴 직접 전달
Alert.alert('오류', '네트워크 연결을 확인하세요.');
// Error: 사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.
```
