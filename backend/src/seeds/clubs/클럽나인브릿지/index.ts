import { ClubData } from '../types';

const data: ClubData = {
  name: '클럽나인브릿지',
  region: '제주 서귀포',
  address: '제주특별자치도 서귀포시 남원읍 한남리 산36-1',
  isPublic: false,
  nineCourses: [
    {
      name: '이스트코스',
      order: 1,
      memo: '한라산을 배경으로 한 챔피언십 코스',
      holes: [
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 412 }, { teeName: 'White', distance: 385 }, { teeName: 'Red', distance: 330 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 548 }, { teeName: 'White', distance: 520 }, { teeName: 'Red', distance: 462 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 183 }, { teeName: 'White', distance: 165 }, { teeName: 'Red', distance: 140 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 436 }, { teeName: 'White', distance: 408 }, { teeName: 'Red', distance: 352 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 5, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 540 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 455 }] },
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 418 }, { teeName: 'White', distance: 392 }, { teeName: 'Red', distance: 338 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 175 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 134 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 316 }] },
      ],
    },
    {
      name: '웨스트코스',
      order: 2,
      memo: '제주 특유의 현무암 지형을 살린 코스',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 406 }, { teeName: 'White', distance: 380 }, { teeName: 'Red', distance: 325 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 428 }, { teeName: 'White', distance: 400 }, { teeName: 'Red', distance: 345 }] },
        { par: 5, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 545 }, { teeName: 'White', distance: 518 }, { teeName: 'Red', distance: 460 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 180 }, { teeName: 'White', distance: 162 }, { teeName: 'Red', distance: 138 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 416 }, { teeName: 'White', distance: 390 }, { teeName: 'Red', distance: 335 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 535 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 392 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 315 }] },
        { par: 4, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 305 }] },
      ],
    },
  ],
};

export default data;
