import { ClubData } from '../types';

const data: ClubData = {
  name: '남서울컨트리클럽',
  region: '경기 성남',
  address: '경기도 성남시 수정구 복정동 산1-1',
  isPublic: false,
  nineCourses: [
    {
      name: 'A코스',
      order: 1,
      memo: '클래식한 레이아웃의 정통 코스',
      holes: [
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 398 }, { teeName: 'White', distance: 373 }, { teeName: 'Red', distance: 318 }] },
        { par: 5, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 524 }, { teeName: 'White', distance: 498 }, { teeName: 'Red', distance: 440 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 173 }, { teeName: 'White', distance: 156 }, { teeName: 'Red', distance: 133 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 422 }, { teeName: 'White', distance: 396 }, { teeName: 'Red', distance: 340 }] },
        { par: 4, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 390 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 312 }] },
        { par: 5, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 529 }, { teeName: 'White', distance: 502 }, { teeName: 'Red', distance: 445 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 378 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 303 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 167 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 306 }] },
      ],
    },
    {
      name: 'B코스',
      order: 2,
      memo: '언덕 지형을 활용한 전략적 코스',
      holes: [
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 405 }, { teeName: 'White', distance: 380 }, { teeName: 'Red', distance: 325 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 426 }, { teeName: 'White', distance: 400 }, { teeName: 'Red', distance: 344 }] },
        { par: 5, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 533 }, { teeName: 'White', distance: 506 }, { teeName: 'Red', distance: 448 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 178 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 136 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 316 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 527 }, { teeName: 'White', distance: 500 }, { teeName: 'Red', distance: 443 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 126 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 309 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 375 }, { teeName: 'White', distance: 352 }, { teeName: 'Red', distance: 300 }] },
      ],
    },
  ],
};

export default data;
