import { use, useEffect, useState } from "react";
import api from "../lib/axiosInstance";

export default function HealthCheckPage() {
  const [state, setState] = useState({loading: true});
   // 컴포넌트 로드 직후엔 로딩 중. 이후 data 또는 error를 채울 예정

  useEffect(() => {
    (async () => {
      // useEffect 콜백은 async를 직접 못 붙이므로 즉시실행함수(IIFE) 패턴 사용
      try {
        const { data } = await api.get('/health');
        // GET /api/health 호출. baseURL + '/health' → http://.../api/health
        setState({ loading: false, data });
        // 성공 시 로딩 끝 + 데이터 저장
      } catch (e) {
        setState({ loading: false, error: e.message });
        // 실패 시 로딩 끝 + 에러 메시지 저장
      }
    })();
  }, []); 

  if(state.loading) return <div>Loading...</div>;
  // 로딩 중일 때 표시할 내용(나중에 로딩 스피너 등으로 대체 가능)

  if(state.error) return <div>Error: {state.error}</div>;
  // 에러 발생 시 에러 메시지 표시

  return (
    <div>
      <h2>헬스체크</h2>
      <pre>{JSON.stringify(state.data, null, 2)}</pre>
      {/* JSON.stringify의 두 번째/세 번째 인자로 들여쓰기(2칸) → 가독성 */}
    </div>
  );
}
