# 처음 클론 받은 뒤 AI로 앱 실행 방법을 안내할 때 기준이 되는 문서

이 문서는 `first-ride-mono` 저장소를 처음 받은 사람이, AI에게 "이 앱 실행하려면 뭘 설치해야 해?", "처음부터 실행 순서 알려줘", "iOS 시뮬레이터는 어떻게 열어?"라고 물었을 때 기준으로 삼는 안내 문서다.

문서 목적은 아래 3가지를 한 번에 설명할 수 있게 만드는 것이다.

- 무엇을 설치해야 하는지
- 프로젝트 준비가 끝난 뒤 어떤 순서로 앱을 실행하는지
- `pnpm dev` 실행 뒤 최종적으로 iOS 시뮬레이터를 어떻게 여는지

## 1. 먼저 설치해야 하는 것

이 저장소를 로컬에서 실행하려면 아래 항목이 필요하다.

- `Node.js` 22 이상
- `pnpm` 10.11.1
- iOS 실행이 필요하면 `Xcode`

`package.json` 기준 패키지 매니저는 `pnpm@10.11.1`이다.

iOS 시뮬레이터까지 열어보려면 macOS 환경과 Xcode 설치가 필요하다. Xcode가 없으면 `pnpm dev`는 실행할 수 있어도 iOS 시뮬레이터를 띄울 수 없다.

### macOS에서 설치하는 방법

#### 1-1. Homebrew가 없다면 먼저 설치

macOS에서 `Node.js`, `pnpm` 설치를 가장 쉽게 관리하려면 `Homebrew`를 먼저 설치하는 것이 편하다.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치가 끝나면 터미널을 다시 열거나, 설치 과정에서 안내한 `eval` 명령을 실행해 `brew`가 인식되는지 확인한다.

```bash
brew --version
```

#### 1-2. Node.js 22 설치

아래 명령으로 `Node.js 22`를 설치한다.

```bash
brew install node@22
```

설치 후 현재 셸에서 바로 쓰려면 아래 명령을 실행한다.

```bash
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

인텔 맥이라면 경로가 다를 수 있다. 그런 경우 아래 경로를 사용한다.

```bash
echo 'export PATH="/usr/local/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

설치 확인:

```bash
node -v
```

출력된 버전이 `v22.x.x` 형태면 된다.

#### 1-3. pnpm 10.11.1 설치

`pnpm`은 `corepack`으로 설치하는 방법을 권장한다. Node.js를 설치하면 보통 `corepack`이 함께 제공된다.

```bash
corepack enable
corepack prepare pnpm@10.11.1 --activate
```

설치 확인:

```bash
pnpm -v
```

출력된 버전이 `10.11.1`이면 된다.

#### 1-4. Xcode 설치

`Xcode`는 App Store에서 설치하는 것이 가장 일반적이다.

1. macOS에서 App Store를 연다.
2. `Xcode`를 검색한다.
3. `Xcode`를 설치한다.
4. 설치가 끝나면 한 번 실행해서 추가 구성 요소 설치를 완료한다.

설치 후 아래 명령으로 개발자 도구 경로가 연결되어 있는지 확인한다.

```bash
xcode-select -p
```

필요하면 아래 명령으로 Xcode 경로를 지정한다.

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

iOS 시뮬레이터 사용 전에는 라이선스나 추가 구성 요소 설치가 남아 있을 수 있으니, Xcode를 한 번 직접 열어 초기 설정을 끝내는 것이 안전하다.

## 2. 저장소 받기

```bash
git clone <repo-url>
cd first-ride-mono
```

## 3. 의존성 설치

루트 디렉토리에서 아래 명령을 실행한다.

```bash
pnpm install
```

이 단계가 끝나야 워크스페이스 패키지와 Expo 앱이 함께 연결된다.

## 4. Native 앱 환경변수 준비

Native 앱은 아래 환경변수를 사용한다.

- `EXPO_PUBLIC_VITE_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`
- `KAKAO_NATIVE_APP_KEY`

특히 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`가 없으면 앱 초기화 시 에러가 발생한다.

팀에서 공유한 값을 받아 `apps/native/.env` 파일에 넣어준다. 파일이 없다면 직접 생성한다.

예시:

```env
EXPO_PUBLIC_VITE_BASE_URL=http://localhost:8080
EXPO_PUBLIC_SUPABASE_URL=<supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=<kakao-native-app-key>
KAKAO_NATIVE_APP_KEY=<kakao-native-app-key>
```

## 5. 앱 실행 후 iOS 시뮬레이터 열기

Native 앱을 실행하려면 루트에서 아래 명령을 실행한다.

```bash
pnpm dev
```

이 명령은 `@repo/types`, `@repo/shared`, `apps/native`를 함께 watch 모드로 실행한다.

명령이 실행되면 Expo Dev Server가 뜨고, 터미널에서 조작 가능한 메뉴가 보인다.

### iOS 시뮬레이터 여는 순서

1. `pnpm dev`를 실행한다.
2. Expo 메뉴가 나타나면 키보드에서 `i`를 한 번 누른다.
3. 그러면 터미널이 `Interact` 상태로 전환된다.
4. `Interact` 상태에서 다시 `i`를 한 번 더 누른다.
5. 그러면 iOS 시뮬레이터가 열린다.

즉, 이 저장소에서는 `pnpm dev` 이후 바로 시뮬레이터가 열리는 것이 아니라, 메뉴 진입용 `i` 한 번과 시뮬레이터 실행용 `i` 한 번이 필요하다.

### Expo 메뉴에서 자주 쓰는 키

- `i`: iOS 시뮬레이터 열기
- `a`: Android 에뮬레이터 열기
- `w`: 웹 실행

## 6. 문제가 생기면 먼저 확인할 항목

- `pnpm install`이 루트에서 정상 완료되었는지 확인
- `apps/native/.env` 파일이 준비되었는지 확인
- `apps/native/.env`에 Supabase, Kakao, API Base URL 값이 들어갔는지 확인
- macOS에서 Xcode가 설치되어 있는지 확인
- Expo 실행 중 오류가 나면 `pnpm dev`를 다시 실행해서 상태를 다시 확인

## 7. AI가 사용자에게 안내할 때 추천하는 요약 흐름

AI가 이 저장소의 실행 방법을 안내할 때는 아래 흐름으로 설명하면 된다.

1. `Node.js 22 이상`, `pnpm 10.11.1`, `Xcode`가 필요한지 먼저 안내한다.
2. 저장소 루트에서 `pnpm install`을 실행하라고 안내한다.
3. `apps/native/.env`를 만들고 필요한 환경변수를 넣으라고 안내한다.
4. `pnpm dev`를 실행한 뒤 Expo 메뉴에서 `i`를 누르고, `Interact` 상태가 되면 다시 `i`를 눌러 iOS 시뮬레이터를 열라고 안내한다.
