import { ClubData } from '../types';

const data: ClubData = {
  name: '한양컨트리클럽',
  region: '경기 하남',
  address: '경기도 하남시 감일로 200',
  isPublic: false,
  nineCourses: [
    {
      name: '동코스',
      order: 1,
      memo: '서울 근교 명문 코스, 정교한 아이언 샷 요구',
      holes: [
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 403 }, { teeName: 'White', distance: 378 }, { teeName: 'Red', distance: 322 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 528 }, { teeName: 'White', distance: 502 }, { teeName: 'Red', distance: 445 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 175 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 134 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 428 }, { teeName: 'White', distance: 402 }, { teeName: 'Red', distance: 346 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 316 }] },
        { par: 5, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 522 }, { teeName: 'White', distance: 495 }, { teeName: 'Red', distance: 438 }] },
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 405 }, { teeName: 'White', distance: 380 }, { teeName: 'Red', distance: 325 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 390 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 312 }] },
      ],
    },
    {
      name: '서코스',
      order: 2,
      memo: '지형 변화가 크고 그린이 까다로운 코스',
      holes: [
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 408 }, { teeName: 'White', distance: 383 }, { teeName: 'Red', distance: 327 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 425 }, { teeName: 'White', distance: 398 }, { teeName: 'Red', distance: 342 }] },
        { par: 5, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 535 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 180 }, { teeName: 'White', distance: 162 }, { teeName: 'Red', distance: 138 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 399 }, { teeName: 'White', distance: 374 }, { teeName: 'Red', distance: 319 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 527 }, { teeName: 'White', distance: 500 }, { teeName: 'Red', distance: 443 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 126 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 309 }] },
        { par: 4, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 379 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 303 }] },
      ],
    },
  ],
};

export default data;
