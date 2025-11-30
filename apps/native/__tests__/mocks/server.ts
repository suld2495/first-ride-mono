import { createServer, Response } from 'miragejs';

interface JoinRequestBody {
  userId: string;
  nickname: string;
  password: string;
  job?: string;
}

export function makeServer({ environment = 'test' } = {}) {
  return createServer({
    environment,

    routes() {
      this.urlPrefix = 'http://localhost:3000';
      this.namespace = '';

      // 회원가입 API
      this.post('/auth/signup', (schema, request) => {
        const body = JSON.parse(request.requestBody) as JoinRequestBody;

        // 아이디 중복 시뮬레이션
        if (body.userId === 'duplicate') {
          return new Response(
            400,
            {},
            {
              error: {
                message: '아이디 중복',
                data: [
                  { field: 'userId', message: '이미 사용중인 아이디입니다.' },
                ],
              },
            },
          );
        }

        // 서버 에러 시뮬레이션
        if (body.userId === 'server-error') {
          return new Response(
            500,
            {},
            {
              error: {
                message: '서버 오류가 발생했습니다.',
              },
            },
          );
        }

        // 성공 응답
        return new Response(
          200,
          {},
          {
            data: null,
          },
        );
      });

      // passthrough for other requests
      this.passthrough();
    },
  });
}
