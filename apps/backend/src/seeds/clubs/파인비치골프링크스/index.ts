import { ClubData } from '../types';

const data: ClubData = {
  name: '파인비치골프링크스',
  region: '전남 해남',
  address: '전라남도 해남군 화산면 방축리 산168',
  isPublic: true,
  nineCourses: [
    {
      name: '노스코스',
      order: 1,
      memo: '바다를 끼고 도는 링크스 스타일',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 405 }, { teeName: 'White', distance: 378 }, { teeName: 'Red', distance: 322 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 548 }, { teeName: 'White', distance: 520 }, { teeName: 'Red', distance: 462 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 180 }, { teeName: 'White', distance: 162 }, { teeName: 'Red', distance: 138 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 390 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 310 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 422 }, { teeName: 'White', distance: 395 }, { teeName: 'Red', distance: 338 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 538 }, { teeName: 'White', distance: 510 }, { teeName: 'Red', distance: 453 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 305 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 172 }, { teeName: 'White', distance: 155 }, { teeName: 'Red', distance: 132 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 398 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 318 }] },
      ],
    },
    {
      name: '사우스코스',
      order: 2,
      memo: '숲속 파크랜드 스타일',
      holes: [
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 412 }, { teeName: 'White', distance: 385 }, { teeName: 'Red', distance: 328 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 175 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 135 }] },
        { par: 5, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 542 }, { teeName: 'White', distance: 515 }, { teeName: 'Red', distance: 458 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 315 }] },
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 418 }, { teeName: 'White', distance: 390 }, { teeName: 'Red', distance: 335 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 448 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 125 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 380 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 302 }] },
      ],
    },
    {
      name: '이스트코스',
      order: 3,
      memo: '마운틴 스타일, 변화무쌍한 지형',
      holes: [
        { par: 4, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 393 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 312 }] },
        { par: 5, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 535 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 177 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 136 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 430 }, { teeName: 'White', distance: 402 }, { teeName: 'Red', distance: 345 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 5, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 540 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 455 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 378 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 302 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 170 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 384 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
      ],
    },
  ],
};

export default data;
