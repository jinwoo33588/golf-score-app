import { ClubData } from '../types';

const data: ClubData = {
  name: '곤지암리조트CC',
  region: '경기 광주',
  address: '경기도 광주시 도척면 도척윗로 278',
  isPublic: true,
  nineCourses: [
    {
      name: '레이크코스',
      order: 1,
      memo: '호수 뷰와 함께하는 아름다운 코스',
      holes: [
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 408 }, { teeName: 'White', distance: 382 }, { teeName: 'Red', distance: 325 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 536 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 175 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 135 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 432 }, { teeName: 'White', distance: 405 }, { teeName: 'Red', distance: 348 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 392 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 315 }] },
        { par: 5, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 522 }, { teeName: 'White', distance: 495 }, { teeName: 'Red', distance: 438 }] },
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 384 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
      ],
    },
    {
      name: '밸리코스',
      order: 2,
      memo: '계곡을 따라 펼쳐지는 자연 속 코스',
      holes: [
        { par: 5, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 542 }, { teeName: 'White', distance: 515 }, { teeName: 'Red', distance: 458 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 396 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 318 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 170 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 425 }, { teeName: 'White', distance: 398 }, { teeName: 'Red', distance: 342 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 305 }] },
        { par: 5, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 530 }, { teeName: 'White', distance: 502 }, { teeName: 'Red', distance: 445 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 162 }, { teeName: 'White', distance: 145 }, { teeName: 'Red', distance: 122 }] },
        { par: 4, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 388 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 312 }] },
        { par: 4, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 378 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 302 }] },
      ],
    },
    {
      name: '힐코스',
      order: 3,
      memo: '높은 고도에서 내려다보는 탁 트인 전경',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 422 }, { teeName: 'White', distance: 395 }, { teeName: 'Red', distance: 340 }] },
        { par: 5, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 448 }] },
        { par: 3, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 182 }, { teeName: 'White', distance: 165 }, { teeName: 'Red', distance: 140 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 410 }, { teeName: 'White', distance: 385 }, { teeName: 'Red', distance: 330 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 525 }, { teeName: 'White', distance: 498 }, { teeName: 'Red', distance: 440 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 125 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 383 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 375 }, { teeName: 'White', distance: 352 }, { teeName: 'Red', distance: 300 }] },
      ],
    },
  ],
};

export default data;
