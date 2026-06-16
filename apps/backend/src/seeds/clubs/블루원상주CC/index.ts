import { ClubData } from '../types';

const data: ClubData = {
  name: '블루원상주CC',
  region: '경북 상주',
  address: '경상북도 상주시 낙동면 낙강로 718',
  isPublic: true,
  nineCourses: [
    {
      name: '레이크코스',
      order: 1,
      memo: '낙동강 뷰가 일품인 코스',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 397 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 316 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 537 }, { teeName: 'White', distance: 510 }, { teeName: 'Red', distance: 452 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 173 }, { teeName: 'White', distance: 155 }, { teeName: 'Red', distance: 132 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 418 }, { teeName: 'White', distance: 392 }, { teeName: 'Red', distance: 336 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 448 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 378 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 302 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 126 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 384 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
      ],
    },
    {
      name: '포레스트코스',
      order: 2,
      memo: '울창한 소나무 숲 사이를 걷는 코스',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 176 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 134 }] },
        { par: 5, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 540 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 455 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 392 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 314 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 410 }, { teeName: 'White', distance: 385 }, { teeName: 'Red', distance: 330 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 525 }, { teeName: 'White', distance: 498 }, { teeName: 'Red', distance: 440 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 162 }, { teeName: 'White', distance: 145 }, { teeName: 'Red', distance: 122 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 384 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 373 }, { teeName: 'White', distance: 350 }, { teeName: 'Red', distance: 298 }] },
      ],
    },
    {
      name: '파크코스',
      order: 3,
      memo: '완만한 구릉지에 펼쳐진 파크 스타일',
      holes: [
        { par: 4, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 394 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 315 }] },
        { par: 5, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 533 }, { teeName: 'White', distance: 506 }, { teeName: 'Red', distance: 449 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 178 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 136 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 426 }, { teeName: 'White', distance: 398 }, { teeName: 'Red', distance: 342 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 396 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 318 }] },
        { par: 5, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 528 }, { teeName: 'White', distance: 500 }, { teeName: 'Red', distance: 443 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 380 }, { teeName: 'White', distance: 356 }, { teeName: 'Red', distance: 304 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 310 }] },
      ],
    },
  ],
};

export default data;
