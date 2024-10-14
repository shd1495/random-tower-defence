// 토큰 연장하기 (setInterval 함수를 이용하여 특정 주기마다 연장요청)

/**
 * access token 체크 및 연장(갱신)하는 함수입니다.
 */
export function extendAccessToken() {
  const oldToken = localStorage.getItem('jwt');

  // fetch로 api 요청을 보내 토큰 연장하기
  fetch('/api/tokenextend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: oldToken,
    },
  })
    .then(async (response) => {
      const resData = await response.json();

      if (!response.ok) throw new Error(resData.message);
      const token = response.headers.get('Authorization');

      localStorage.setItem('jwt', token);

      console.log(resData.message);
    })
    .catch((error) => {
      console.error('토큰 연장 중 에러:', error);
      alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
      window.location.href = 'index.html';
    });
}
