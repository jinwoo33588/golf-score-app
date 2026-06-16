import { INineCourse } from '../types';

type CourseInput = Omit<INineCourse, '_id'>;

// ── 헬퍼: 9홀 코스 생성 ──────────────────────────────────
function makeCourse(
  name: string,
  order: number,
  holes: { par: 3 | 4 | 5; handicapIndex: number; white: number; blue?: number; red?: number }[],
  memo?: string
): CourseInput {
  return {
    name,
    order,
    holeCount: 9,
    parTotal: holes.reduce((s, h) => s + h.par, 0),
    memo,
    holes: holes.map((h, i) => ({
      holeNumber: i + 1,
      par: h.par,
      handicapIndex: h.handicapIndex,
      teeDistances: [
        ...(h.blue ? [{ teeName: 'Blue', distance: h.blue, unit: 'meter' as const }] : []),
        { teeName: 'White', distance: h.white, unit: 'meter' as const },
        ...(h.red ? [{ teeName: 'Red', distance: h.red, unit: 'meter' as const }] : []),
      ],
    })),
  };
}

// ────────────────────────────────────────────────────────────
// 1. 안양컨트리클럽 — 경기 군포 (18홀, 동·서코스)
// ────────────────────────────────────────────────────────────
const anyang = {
  name: '안양컨트리클럽',
  region: '경기 군포',
  address: '경기도 군포시 군포로 364',
  isPublic: true,
  nineCourses: [
    makeCourse('동코스', 1, [
      { par: 4, handicapIndex: 5,  white: 365, blue: 385, red: 310 },
      { par: 5, handicapIndex: 1,  white: 480, blue: 510, red: 420 },
      { par: 3, handicapIndex: 15, white: 155, blue: 170, red: 130 },
      { par: 4, handicapIndex: 9,  white: 340, blue: 360, red: 295 },
      { par: 4, handicapIndex: 3,  white: 390, blue: 415, red: 335 },
      { par: 5, handicapIndex: 7,  white: 495, blue: 520, red: 440 },
      { par: 3, handicapIndex: 17, white: 145, blue: 165, red: 125 },
      { par: 4, handicapIndex: 11, white: 355, blue: 375, red: 305 },
      { par: 4, handicapIndex: 13, white: 360, blue: 380, red: 310 },
    ], '한국 최고 명문 클럽. 짧지만 전략적인 레이아웃'),
    makeCourse('서코스', 2, [
      { par: 4, handicapIndex: 6,  white: 370, blue: 395, red: 315 },
      { par: 4, handicapIndex: 2,  white: 395, blue: 420, red: 340 },
      { par: 5, handicapIndex: 8,  white: 500, blue: 525, red: 445 },
      { par: 3, handicapIndex: 16, white: 150, blue: 165, red: 130 },
      { par: 4, handicapIndex: 4,  white: 375, blue: 400, red: 320 },
      { par: 5, handicapIndex: 10, white: 490, blue: 515, red: 435 },
      { par: 3, handicapIndex: 18, white: 140, blue: 155, red: 120 },
      { par: 4, handicapIndex: 14, white: 350, blue: 370, red: 300 },
      { par: 4, handicapIndex: 12, white: 380, blue: 405, red: 325 },
    ], '기복 있는 지형과 빠른 그린이 특징'),
  ],
};

// ────────────────────────────────────────────────────────────
// 2. 레이크사이드컨트리클럽 — 경기 용인 (27홀, 동·서·남코스)
// ────────────────────────────────────────────────────────────
const lakeside = {
  name: '레이크사이드컨트리클럽',
  region: '경기 용인',
  address: '경기도 용인시 기흥구 농서로 137',
  isPublic: true,
  nineCourses: [
    makeCourse('동코스', 1, [
      { par: 4, handicapIndex: 7,  white: 360, blue: 385, red: 305 },
      { par: 5, handicapIndex: 3,  white: 490, blue: 515, red: 430 },
      { par: 4, handicapIndex: 11, white: 345, blue: 368, red: 290 },
      { par: 3, handicapIndex: 15, white: 160, blue: 178, red: 135 },
      { par: 4, handicapIndex: 1,  white: 400, blue: 428, red: 345 },
      { par: 5, handicapIndex: 9,  white: 505, blue: 532, red: 448 },
      { par: 4, handicapIndex: 5,  white: 375, blue: 400, red: 318 },
      { par: 3, handicapIndex: 17, white: 148, blue: 165, red: 128 },
      { par: 4, handicapIndex: 13, white: 358, blue: 382, red: 302 },
    ], '호수를 끼고 도는 전략적 코스'),
    makeCourse('서코스', 2, [
      { par: 4, handicapIndex: 8,  white: 368, blue: 392, red: 312 },
      { par: 3, handicapIndex: 14, white: 155, blue: 172, red: 132 },
      { par: 5, handicapIndex: 2,  white: 498, blue: 525, red: 440 },
      { par: 4, handicapIndex: 6,  white: 372, blue: 396, red: 316 },
      { par: 4, handicapIndex: 4,  white: 388, blue: 412, red: 332 },
      { par: 3, handicapIndex: 16, white: 145, blue: 162, red: 122 },
      { par: 5, handicapIndex: 10, white: 488, blue: 514, red: 430 },
      { par: 4, handicapIndex: 12, white: 352, blue: 375, red: 298 },
      { par: 4, handicapIndex: 18, white: 340, blue: 362, red: 288 },
    ], '오르막 내리막이 많은 산악형 코스'),
    makeCourse('남코스', 3, [
      { par: 4, handicapIndex: 5,  white: 378, blue: 402, red: 322 },
      { par: 5, handicapIndex: 1,  white: 512, blue: 540, red: 455 },
      { par: 3, handicapIndex: 13, white: 162, blue: 180, red: 138 },
      { par: 4, handicapIndex: 9,  white: 362, blue: 386, red: 308 },
      { par: 4, handicapIndex: 3,  white: 392, blue: 418, red: 336 },
      { par: 5, handicapIndex: 7,  white: 502, blue: 528, red: 445 },
      { par: 4, handicapIndex: 11, white: 348, blue: 370, red: 295 },
      { par: 3, handicapIndex: 17, white: 152, blue: 168, red: 130 },
      { par: 4, handicapIndex: 15, white: 355, blue: 378, red: 300 },
    ], '넓은 페어웨이, 초보자에게 적합'),
  ],
};

// ────────────────────────────────────────────────────────────
// 3. 곤지암리조트CC — 경기 광주 (27홀, 레이크·밸리·힐코스)
// ────────────────────────────────────────────────────────────
const gonjiam = {
  name: '곤지암리조트CC',
  region: '경기 광주',
  address: '경기도 광주시 도척면 도척윗로 278',
  isPublic: true,
  nineCourses: [
    makeCourse('레이크코스', 1, [
      { par: 4, handicapIndex: 3,  white: 382, blue: 408, red: 325 },
      { par: 5, handicapIndex: 7,  white: 508, blue: 536, red: 450 },
      { par: 3, handicapIndex: 15, white: 158, blue: 175, red: 135 },
      { par: 4, handicapIndex: 1,  white: 405, blue: 432, red: 348 },
      { par: 4, handicapIndex: 9,  white: 368, blue: 392, red: 315 },
      { par: 5, handicapIndex: 11, white: 495, blue: 522, red: 438 },
      { par: 4, handicapIndex: 5,  white: 375, blue: 400, red: 320 },
      { par: 3, handicapIndex: 17, white: 150, blue: 168, red: 128 },
      { par: 4, handicapIndex: 13, white: 360, blue: 384, red: 308 },
    ], '호수 뷰와 함께하는 아름다운 코스'),
    makeCourse('밸리코스', 2, [
      { par: 5, handicapIndex: 4,  white: 515, blue: 542, red: 458 },
      { par: 4, handicapIndex: 8,  white: 372, blue: 396, red: 318 },
      { par: 3, handicapIndex: 16, white: 152, blue: 170, red: 130 },
      { par: 4, handicapIndex: 2,  white: 398, blue: 425, red: 342 },
      { par: 4, handicapIndex: 12, white: 358, blue: 382, red: 305 },
      { par: 5, handicapIndex: 6,  white: 502, blue: 530, red: 445 },
      { par: 3, handicapIndex: 18, white: 145, blue: 162, red: 122 },
      { par: 4, handicapIndex: 10, white: 365, blue: 388, red: 312 },
      { par: 4, handicapIndex: 14, white: 355, blue: 378, red: 302 },
    ], '계곡을 따라 펼쳐지는 자연 속 코스'),
    makeCourse('힐코스', 3, [
      { par: 4, handicapIndex: 6,  white: 375, blue: 400, red: 320 },
      { par: 4, handicapIndex: 2,  white: 395, blue: 422, red: 340 },
      { par: 5, handicapIndex: 8,  white: 505, blue: 532, red: 448 },
      { par: 3, handicapIndex: 14, white: 165, blue: 182, red: 140 },
      { par: 4, handicapIndex: 4,  white: 385, blue: 410, red: 330 },
      { par: 5, handicapIndex: 10, white: 498, blue: 525, red: 440 },
      { par: 3, handicapIndex: 18, white: 148, blue: 165, red: 125 },
      { par: 4, handicapIndex: 12, white: 360, blue: 383, red: 308 },
      { par: 4, handicapIndex: 16, white: 352, blue: 375, red: 300 },
    ], '높은 고도에서 내려다보는 탁 트인 전경'),
  ],
};

// ────────────────────────────────────────────────────────────
// 4. 파인비치골프링크스 — 전남 해남 (27홀, 노스·사우스·이스트)
// ────────────────────────────────────────────────────────────
const pineBeach = {
  name: '파인비치골프링크스',
  region: '전남 해남',
  address: '전라남도 해남군 화산면 방축리 산168',
  isPublic: true,
  nineCourses: [
    makeCourse('노스코스', 1, [
      { par: 4, handicapIndex: 5,  white: 378, blue: 405, red: 322 },
      { par: 5, handicapIndex: 1,  white: 520, blue: 548, red: 462 },
      { par: 3, handicapIndex: 17, white: 162, blue: 180, red: 138 },
      { par: 4, handicapIndex: 9,  white: 365, blue: 390, red: 310 },
      { par: 4, handicapIndex: 3,  white: 395, blue: 422, red: 338 },
      { par: 5, handicapIndex: 7,  white: 510, blue: 538, red: 453 },
      { par: 4, handicapIndex: 11, white: 358, blue: 382, red: 305 },
      { par: 3, handicapIndex: 15, white: 155, blue: 172, red: 132 },
      { par: 4, handicapIndex: 13, white: 372, blue: 398, red: 318 },
    ], '바다를 끼고 도는 링크스 스타일'),
    makeCourse('사우스코스', 2, [
      { par: 4, handicapIndex: 4,  white: 385, blue: 412, red: 328 },
      { par: 3, handicapIndex: 16, white: 158, blue: 175, red: 135 },
      { par: 5, handicapIndex: 2,  white: 515, blue: 542, red: 458 },
      { par: 4, handicapIndex: 8,  white: 370, blue: 395, red: 315 },
      { par: 4, handicapIndex: 6,  white: 390, blue: 418, red: 335 },
      { par: 5, handicapIndex: 10, white: 505, blue: 532, red: 448 },
      { par: 3, handicapIndex: 18, white: 148, blue: 165, red: 125 },
      { par: 4, handicapIndex: 12, white: 362, blue: 386, red: 308 },
      { par: 4, handicapIndex: 14, white: 355, blue: 380, red: 302 },
    ], '숲속 파크랜드 스타일'),
    makeCourse('이스트코스', 3, [
      { par: 4, handicapIndex: 7,  white: 368, blue: 393, red: 312 },
      { par: 5, handicapIndex: 3,  white: 508, blue: 535, red: 450 },
      { par: 3, handicapIndex: 13, white: 160, blue: 177, red: 136 },
      { par: 4, handicapIndex: 1,  white: 402, blue: 430, red: 345 },
      { par: 4, handicapIndex: 9,  white: 375, blue: 400, red: 320 },
      { par: 5, handicapIndex: 5,  white: 512, blue: 540, red: 455 },
      { par: 4, handicapIndex: 11, white: 355, blue: 378, red: 302 },
      { par: 3, handicapIndex: 17, white: 152, blue: 170, red: 130 },
      { par: 4, handicapIndex: 15, white: 360, blue: 384, red: 308 },
    ], '마운틴 스타일, 변화무쌍한 지형'),
  ],
};

// ────────────────────────────────────────────────────────────
// 5. 클럽나인브릿지 — 제주 서귀포 (18홀, 이스트·웨스트)
// ────────────────────────────────────────────────────────────
const nineBridge = {
  name: '클럽나인브릿지',
  region: '제주 서귀포',
  address: '제주특별자치도 서귀포시 남원읍 한남리 산36-1',
  isPublic: false,
  nineCourses: [
    makeCourse('이스트코스', 1, [
      { par: 4, handicapIndex: 3,  white: 385, blue: 412, red: 330 },
      { par: 5, handicapIndex: 7,  white: 520, blue: 548, red: 462 },
      { par: 3, handicapIndex: 15, white: 165, blue: 183, red: 140 },
      { par: 4, handicapIndex: 1,  white: 408, blue: 436, red: 352 },
      { par: 4, handicapIndex: 9,  white: 375, blue: 400, red: 320 },
      { par: 5, handicapIndex: 11, white: 512, blue: 540, red: 455 },
      { par: 4, handicapIndex: 5,  white: 392, blue: 418, red: 338 },
      { par: 3, handicapIndex: 17, white: 158, blue: 175, red: 134 },
      { par: 4, handicapIndex: 13, white: 370, blue: 395, red: 316 },
    ], '한라산을 배경으로 한 챔피언십 코스'),
    makeCourse('웨스트코스', 2, [
      { par: 4, handicapIndex: 6,  white: 380, blue: 406, red: 325 },
      { par: 4, handicapIndex: 2,  white: 400, blue: 428, red: 345 },
      { par: 5, handicapIndex: 8,  white: 518, blue: 545, red: 460 },
      { par: 3, handicapIndex: 14, white: 162, blue: 180, red: 138 },
      { par: 4, handicapIndex: 4,  white: 390, blue: 416, red: 335 },
      { par: 5, handicapIndex: 10, white: 508, blue: 535, red: 450 },
      { par: 3, handicapIndex: 18, white: 152, blue: 168, red: 130 },
      { par: 4, handicapIndex: 12, white: 368, blue: 392, red: 315 },
      { par: 4, handicapIndex: 16, white: 358, blue: 382, red: 305 },
    ], '제주 특유의 현무암 지형을 살린 코스'),
  ],
};

// ────────────────────────────────────────────────────────────
// 6. 블루원상주CC — 경북 상주 (27홀, 레이크·포레스트·파크)
// ────────────────────────────────────────────────────────────
const blueone = {
  name: '블루원상주CC',
  region: '경북 상주',
  address: '경상북도 상주시 낙동면 낙강로 718',
  isPublic: true,
  nineCourses: [
    makeCourse('레이크코스', 1, [
      { par: 4, handicapIndex: 5,  white: 372, blue: 397, red: 316 },
      { par: 5, handicapIndex: 1,  white: 510, blue: 537, red: 452 },
      { par: 3, handicapIndex: 15, white: 155, blue: 173, red: 132 },
      { par: 4, handicapIndex: 9,  white: 362, blue: 386, red: 308 },
      { par: 4, handicapIndex: 3,  white: 392, blue: 418, red: 336 },
      { par: 5, handicapIndex: 7,  white: 505, blue: 532, red: 448 },
      { par: 4, handicapIndex: 11, white: 355, blue: 378, red: 302 },
      { par: 3, handicapIndex: 17, white: 148, blue: 165, red: 126 },
      { par: 4, handicapIndex: 13, white: 360, blue: 384, red: 308 },
    ], '낙동강 뷰가 일품인 코스'),
    makeCourse('포레스트코스', 2, [
      { par: 4, handicapIndex: 6,  white: 375, blue: 400, red: 320 },
      { par: 3, handicapIndex: 14, white: 158, blue: 176, red: 134 },
      { par: 5, handicapIndex: 2,  white: 512, blue: 540, red: 455 },
      { par: 4, handicapIndex: 8,  white: 368, blue: 392, red: 314 },
      { par: 4, handicapIndex: 4,  white: 385, blue: 410, red: 330 },
      { par: 5, handicapIndex: 10, white: 498, blue: 525, red: 440 },
      { par: 3, handicapIndex: 18, white: 145, blue: 162, red: 122 },
      { par: 4, handicapIndex: 12, white: 360, blue: 384, red: 308 },
      { par: 4, handicapIndex: 16, white: 350, blue: 373, red: 298 },
    ], '울창한 소나무 숲 사이를 걷는 코스'),
    makeCourse('파크코스', 3, [
      { par: 4, handicapIndex: 7,  white: 370, blue: 394, red: 315 },
      { par: 5, handicapIndex: 3,  white: 506, blue: 533, red: 449 },
      { par: 3, handicapIndex: 13, white: 160, blue: 178, red: 136 },
      { par: 4, handicapIndex: 1,  white: 398, blue: 426, red: 342 },
      { par: 4, handicapIndex: 9,  white: 372, blue: 396, red: 318 },
      { par: 5, handicapIndex: 5,  white: 500, blue: 528, red: 443 },
      { par: 4, handicapIndex: 11, white: 356, blue: 380, red: 304 },
      { par: 3, handicapIndex: 17, white: 150, blue: 168, red: 128 },
      { par: 4, handicapIndex: 15, white: 362, blue: 386, red: 310 },
    ], '완만한 구릉지에 펼쳐진 파크 스타일'),
  ],
};

// ────────────────────────────────────────────────────────────
// 7. 한양컨트리클럽 — 경기 하남 (18홀, 동·서코스)
// ────────────────────────────────────────────────────────────
const hanyang = {
  name: '한양컨트리클럽',
  region: '경기 하남',
  address: '경기도 하남시 감일로 200',
  isPublic: false,
  nineCourses: [
    makeCourse('동코스', 1, [
      { par: 4, handicapIndex: 3,  white: 378, blue: 403, red: 322 },
      { par: 5, handicapIndex: 7,  white: 502, blue: 528, red: 445 },
      { par: 3, handicapIndex: 15, white: 158, blue: 175, red: 134 },
      { par: 4, handicapIndex: 1,  white: 402, blue: 428, red: 346 },
      { par: 4, handicapIndex: 9,  white: 370, blue: 395, red: 316 },
      { par: 5, handicapIndex: 11, white: 495, blue: 522, red: 438 },
      { par: 4, handicapIndex: 5,  white: 380, blue: 405, red: 325 },
      { par: 3, handicapIndex: 17, white: 152, blue: 168, red: 130 },
      { par: 4, handicapIndex: 13, white: 365, blue: 390, red: 312 },
    ], '서울 근교 명문 코스, 정교한 아이언 샷 요구'),
    makeCourse('서코스', 2, [
      { par: 4, handicapIndex: 4,  white: 383, blue: 408, red: 327 },
      { par: 4, handicapIndex: 2,  white: 398, blue: 425, red: 342 },
      { par: 5, handicapIndex: 6,  white: 508, blue: 535, red: 450 },
      { par: 3, handicapIndex: 14, white: 162, blue: 180, red: 138 },
      { par: 4, handicapIndex: 8,  white: 374, blue: 399, red: 319 },
      { par: 5, handicapIndex: 10, white: 500, blue: 527, red: 443 },
      { par: 3, handicapIndex: 18, white: 148, blue: 165, red: 126 },
      { par: 4, handicapIndex: 12, white: 362, blue: 386, red: 309 },
      { par: 4, handicapIndex: 16, white: 355, blue: 379, red: 303 },
    ], '지형 변화가 크고 그린이 까다로운 코스'),
  ],
};

// ────────────────────────────────────────────────────────────
// 8. 제이드팰리스골프클럽 — 제주 제주시 (27홀, 드래곤·레이크·마운틴)
// ────────────────────────────────────────────────────────────
const jadePalace = {
  name: '제이드팰리스골프클럽',
  region: '제주 제주시',
  address: '제주특별자치도 제주시 조천읍 교래리 산91-0',
  isPublic: true,
  nineCourses: [
    makeCourse('드래곤코스', 1, [
      { par: 4, handicapIndex: 5,  white: 375, blue: 400, red: 320 },
      { par: 5, handicapIndex: 1,  white: 515, blue: 542, red: 458 },
      { par: 3, handicapIndex: 13, white: 165, blue: 183, red: 140 },
      { par: 4, handicapIndex: 9,  white: 368, blue: 392, red: 314 },
      { par: 4, handicapIndex: 3,  white: 395, blue: 422, red: 340 },
      { par: 5, handicapIndex: 7,  white: 508, blue: 535, red: 450 },
      { par: 4, handicapIndex: 11, white: 358, blue: 382, red: 306 },
      { par: 3, handicapIndex: 17, white: 155, blue: 172, red: 132 },
      { par: 4, handicapIndex: 15, white: 365, blue: 390, red: 312 },
    ], '제주 화산지형과 어우러진 드라마틱한 코스'),
    makeCourse('레이크코스', 2, [
      { par: 4, handicapIndex: 6,  white: 380, blue: 406, red: 325 },
      { par: 3, handicapIndex: 16, white: 160, blue: 178, red: 136 },
      { par: 5, handicapIndex: 2,  white: 512, blue: 540, red: 455 },
      { par: 4, handicapIndex: 8,  white: 370, blue: 395, red: 316 },
      { par: 4, handicapIndex: 4,  white: 390, blue: 416, red: 335 },
      { par: 5, handicapIndex: 10, white: 505, blue: 532, red: 448 },
      { par: 3, handicapIndex: 18, white: 150, blue: 167, red: 128 },
      { par: 4, handicapIndex: 12, white: 362, blue: 386, red: 309 },
      { par: 4, handicapIndex: 14, white: 355, blue: 379, red: 303 },
    ], '에메랄드빛 호수가 곳곳에 배치된 코스'),
    makeCourse('마운틴코스', 3, [
      { par: 4, handicapIndex: 7,  white: 372, blue: 397, red: 317 },
      { par: 5, handicapIndex: 3,  white: 510, blue: 538, red: 453 },
      { par: 3, handicapIndex: 15, white: 158, blue: 175, red: 134 },
      { par: 4, handicapIndex: 1,  white: 400, blue: 428, red: 344 },
      { par: 4, handicapIndex: 9,  white: 374, blue: 399, red: 319 },
      { par: 5, handicapIndex: 5,  white: 505, blue: 532, red: 447 },
      { par: 4, handicapIndex: 11, white: 356, blue: 380, red: 304 },
      { par: 3, handicapIndex: 17, white: 152, blue: 169, red: 130 },
      { par: 4, handicapIndex: 13, white: 360, blue: 385, red: 308 },
    ], '한라산을 바라보며 라운드하는 고지대 코스'),
  ],
};

// ────────────────────────────────────────────────────────────
// 9. 남서울컨트리클럽 — 경기 성남 (18홀, A·B코스)
// ────────────────────────────────────────────────────────────
const namseoul = {
  name: '남서울컨트리클럽',
  region: '경기 성남',
  address: '경기도 성남시 수정구 복정동 산1-1',
  isPublic: false,
  nineCourses: [
    makeCourse('A코스', 1, [
      { par: 4, handicapIndex: 4,  white: 373, blue: 398, red: 318 },
      { par: 5, handicapIndex: 8,  white: 498, blue: 524, red: 440 },
      { par: 3, handicapIndex: 14, white: 156, blue: 173, red: 133 },
      { par: 4, handicapIndex: 2,  white: 396, blue: 422, red: 340 },
      { par: 4, handicapIndex: 10, white: 365, blue: 390, red: 312 },
      { par: 5, handicapIndex: 6,  white: 502, blue: 529, red: 445 },
      { par: 4, handicapIndex: 12, white: 355, blue: 378, red: 303 },
      { par: 3, handicapIndex: 16, white: 150, blue: 167, red: 128 },
      { par: 4, handicapIndex: 18, white: 358, blue: 382, red: 306 },
    ], '클래식한 레이아웃의 정통 코스'),
    makeCourse('B코스', 2, [
      { par: 4, handicapIndex: 3,  white: 380, blue: 405, red: 325 },
      { par: 4, handicapIndex: 1,  white: 400, blue: 426, red: 344 },
      { par: 5, handicapIndex: 5,  white: 506, blue: 533, red: 448 },
      { par: 3, handicapIndex: 13, white: 160, blue: 178, red: 136 },
      { par: 4, handicapIndex: 9,  white: 370, blue: 395, red: 316 },
      { par: 5, handicapIndex: 7,  white: 500, blue: 527, red: 443 },
      { par: 3, handicapIndex: 17, white: 148, blue: 165, red: 126 },
      { par: 4, handicapIndex: 11, white: 362, blue: 386, red: 309 },
      { par: 4, handicapIndex: 15, white: 352, blue: 375, red: 300 },
    ], '언덕 지형을 활용한 전략적 코스'),
  ],
};

// ────────────────────────────────────────────────────────────
// 10. 오크밸리CC — 강원 원주 (27홀, 오크·밸리·레이크)
// ────────────────────────────────────────────────────────────
const oakValley = {
  name: '오크밸리CC',
  region: '강원 원주',
  address: '강원도 원주시 지정면 오크밸리1길 66',
  isPublic: true,
  nineCourses: [
    makeCourse('오크코스', 1, [
      { par: 4, handicapIndex: 5,  white: 376, blue: 401, red: 321 },
      { par: 5, handicapIndex: 1,  white: 514, blue: 542, red: 457 },
      { par: 3, handicapIndex: 15, white: 160, blue: 178, red: 136 },
      { par: 4, handicapIndex: 9,  white: 366, blue: 390, red: 312 },
      { par: 4, handicapIndex: 3,  white: 394, blue: 420, red: 338 },
      { par: 5, handicapIndex: 7,  white: 508, blue: 535, red: 450 },
      { par: 4, handicapIndex: 11, white: 356, blue: 380, red: 304 },
      { par: 3, handicapIndex: 17, white: 150, blue: 167, red: 128 },
      { par: 4, handicapIndex: 13, white: 362, blue: 386, red: 309 },
    ], '참나무 숲으로 둘러싸인 클래식 코스'),
    makeCourse('밸리코스', 2, [
      { par: 4, handicapIndex: 6,  white: 378, blue: 403, red: 323 },
      { par: 3, handicapIndex: 16, white: 156, blue: 174, red: 133 },
      { par: 5, handicapIndex: 2,  white: 510, blue: 537, red: 452 },
      { par: 4, handicapIndex: 8,  white: 369, blue: 393, red: 315 },
      { par: 4, handicapIndex: 4,  white: 388, blue: 413, red: 333 },
      { par: 5, handicapIndex: 10, white: 500, blue: 527, red: 443 },
      { par: 3, handicapIndex: 18, white: 148, blue: 165, red: 126 },
      { par: 4, handicapIndex: 12, white: 360, blue: 384, red: 308 },
      { par: 4, handicapIndex: 14, white: 353, blue: 377, red: 301 },
    ], '계곡을 따라 펼쳐지는 자연 친화 코스'),
    makeCourse('레이크코스', 3, [
      { par: 4, handicapIndex: 7,  white: 374, blue: 399, red: 319 },
      { par: 5, handicapIndex: 3,  white: 512, blue: 539, red: 454 },
      { par: 3, handicapIndex: 13, white: 163, blue: 181, red: 139 },
      { par: 4, handicapIndex: 1,  white: 399, blue: 426, red: 343 },
      { par: 4, handicapIndex: 9,  white: 373, blue: 398, red: 318 },
      { par: 5, handicapIndex: 5,  white: 503, blue: 530, red: 446 },
      { par: 4, handicapIndex: 11, white: 355, blue: 379, red: 303 },
      { par: 3, handicapIndex: 17, white: 151, blue: 168, red: 129 },
      { par: 4, handicapIndex: 15, white: 361, blue: 385, red: 309 },
    ], '호수 조망과 함께하는 아름다운 후반 코스'),
  ],
};

export const GOLF_CLUBS_SEED = [
  anyang, lakeside, gonjiam, pineBeach, nineBridge,
  blueone, hanyang, jadePalace, namseoul, oakValley,
];
