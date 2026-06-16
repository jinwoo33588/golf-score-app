import { ClubData } from '../types';

const data: ClubData = {
  name: '레이크사이드컨트리클럽',
  region: '경기 용인',
  address: '경기도 용인시 기흥구 농서로 137',
  isPublic: true,
  nineCourses: [
    {
      name: '동코스',
      order: 1,
      memo: '호수를 끼고 도는 전략적 코스',
      holes: [
        { par: 4, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 385 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 305 }] },
        { par: 5, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 515 }, { teeName: 'White', distance: 490 }, { teeName: 'Red', distance: 430 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 368 }, { teeName: 'White', distance: 345 }, { teeName: 'Red', distance: 290 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 178 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 135 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 428 }, { teeName: 'White', distance: 400 }, { teeName: 'Red', distance: 345 }] },
        { par: 5, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 448 }] },
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 318 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 302 }] },
      ],
    },
    {
      name: '서코스',
      order: 2,
      memo: '오르막 내리막이 많은 산악형 코스',
      holes: [
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 392 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 312 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 172 }, { teeName: 'White', distance: 155 }, { teeName: 'Red', distance: 132 }] },
        { par: 5, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 525 }, { teeName: 'White', distance: 498 }, { teeName: 'Red', distance: 440 }] },
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 396 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 316 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 412 }, { teeName: 'White', distance: 388 }, { teeName: 'Red', distance: 332 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 162 }, { teeName: 'White', distance: 145 }, { teeName: 'Red', distance: 122 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 514 }, { teeName: 'White', distance: 488 }, { teeName: 'Red', distance: 430 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 375 }, { teeName: 'White', distance: 352 }, { teeName: 'Red', distance: 298 }] },
        { par: 4, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 362 }, { teeName: 'White', distance: 340 }, { teeName: 'Red', distance: 288 }] },
      ],
    },
    {
      name: '남코스',
      order: 3,
      memo: '넓은 페어웨이, 초보자에게 적합',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 402 }, { teeName: 'White', distance: 378 }, { teeName: 'Red', distance: 322 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 540 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 455 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 180 }, { teeName: 'White', distance: 162 }, { teeName: 'Red', distance: 138 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 418 }, { teeName: 'White', distance: 392 }, { teeName: 'Red', distance: 336 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 528 }, { teeName: 'White', distance: 502 }, { teeName: 'Red', distance: 445 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 370 }, { teeName: 'White', distance: 348 }, { teeName: 'Red', distance: 295 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 378 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 300 }] },
      ],
    },
  ],
};

export default data;
