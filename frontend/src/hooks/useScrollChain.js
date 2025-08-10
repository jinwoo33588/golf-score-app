import { useEffect } from 'react';

function getScrollableAncestor(el) {
  let node = el?.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    const canScrollY = /(auto|scroll)/.test(style.overflowY);
    if (canScrollY && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement; // window 스크롤러
}

export default function useScrollChain(innerRef, outerRef) {
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const outerEl = outerRef?.current || getScrollableAncestor(inner);
    const docEl = document.scrollingElement || document.documentElement;
    const isWindowScroller = outerEl === docEl;

    const scrollOuterBy = (dy) => {
      if (!dy) return;
      if (isWindowScroller) window.scrollBy({ top: dy, behavior: 'auto' });
      else outerEl.scrollTop += dy;
    };

    const atEdges = () => {
      const { scrollTop, scrollHeight, clientHeight } = inner;
      const eps = 2; // 오차 허용
      const top = scrollTop <= eps;
      const bottom = scrollTop + clientHeight >= scrollHeight - eps;
      const noScroll = scrollHeight <= clientHeight + eps;
      return { top, bottom, noScroll };
    };

    const normalizeDeltaY = (e) => {
      if (e.deltaMode === 1) return e.deltaY * 16;   // line → px
      if (e.deltaMode === 2) return e.deltaY * 100;  // page → px
      return e.deltaY;                                // px
    };

    const onWheel = (e) => {
      const dy = normalizeDeltaY(e);
      const { top, bottom, noScroll } = atEdges();

      // 내부에 스크롤이 없거나, 에지에서 더 스크롤하면 바깥으로
      if (noScroll || (dy < 0 && top) || (dy > 0 && bottom)) {
        e.preventDefault();
        scrollOuterBy(dy);
      }
      // 그 외엔 내부 기본 스크롤
    };

    // 모바일 터치
    let startY = null;
    const onTouchStart = (e) => { startY = e.touches?.[0]?.clientY ?? null; };
    const onTouchMove = (e) => {
      if (startY == null) return;
      const y = e.touches?.[0]?.clientY ?? startY;
      const dy = startY - y; // 양수: 아래로
      const { top, bottom, noScroll } = atEdges();
      if (noScroll || (dy < 0 && top) || (dy > 0 && bottom)) {
        e.preventDefault();           // overscroll-behavior: contain 이어도 강제 전달
        scrollOuterBy(dy);
      }
    };
    const onTouchEnd = () => { startY = null; };

    // 키보드 스크롤(PageUp/Down, Space, Arrow)
    const onKeyDown = (e) => {
      const key = e.key;
      let dy = 0;
      const step = 40;
      const page = inner.clientHeight * 0.9;

      if (key === 'PageDown') dy = page;
      else if (key === 'PageUp') dy = -page;
      else if (key === ' ') dy = e.shiftKey ? -page : page;
      else if (key === 'ArrowDown') dy = step;
      else if (key === 'ArrowUp') dy = -step;
      else return;

      const { top, bottom, noScroll } = atEdges();
      if (noScroll || (dy < 0 && top) || (dy > 0 && bottom)) {
        e.preventDefault();
        scrollOuterBy(dy);
      }
    };

    // 캡처 단계에서 잡아 중간 방해 회피 + wheel은 passive:false 필수
    inner.addEventListener('wheel', onWheel, { passive: false, capture: true });
    inner.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    inner.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    inner.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    inner.addEventListener('keydown', onKeyDown, { passive: false, capture: true });

    return () => {
      inner.removeEventListener('wheel', onWheel, { capture: true });
      inner.removeEventListener('touchstart', onTouchStart, { capture: true });
      inner.removeEventListener('touchmove', onTouchMove, { capture: true });
      inner.removeEventListener('touchend', onTouchEnd, { capture: true });
      inner.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [innerRef, outerRef]);
}
