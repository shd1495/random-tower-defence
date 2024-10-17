/**
 * 리프레쉬 토큰 체크 및 엑세스 토큰 연장(갱신)하는 함수입니다.
 */
export function extendAccessToken() {
  fetch('/api/tokenextend', {
    method: 'POST',
    credentials: 'include', // 쿠키를 포함한 요청
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(resData.message);
      const resData = await response.json();
      localStorage.setItem('jwt', resData.token);
      console.log(resData.message);
    })
    .catch((error) => {
      console.error('엑세스 토큰 갱신 중 에러:', error);
      alert('리프레쉬 토큰이 만료되었습니다. 다시 로그인해 주세요');
      window.location.href = 'index.html';
    });
}
