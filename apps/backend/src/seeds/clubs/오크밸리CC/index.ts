import { ClubData } from '../types';

const data: ClubData = {
  name: '오크밸리CC',
  region: '강원 원주',
  address: '강원도 원주시 지정면 오크밸리1길 66',
  isPublic: true,
  nineCourses: [
    {
      name: '오크코스',
      order: 1,
      memo: '참나무 숲으로 둘러싸인 클래식 코스',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 401 }, { teeName: 'White', distance: 376 }, { teeName: 'Red', distance: 321 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 542 }, { teeName: 'White', distance: 514 }, { teeName: 'Red', distance: 457 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 178 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 136 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 390 }, { teeName: 'White', distance: 366 }, { teeName: 'Red', distance: 312 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 420 }, { teeName: 'White', distance: 394 }, { teeName: 'Red', distance: 338 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 535 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 380 }, { teeName: 'White', distance: 356 }, { teeName: 'Red', distance: 304 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 167 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 309 }] },
      ],
    },
    {
      name: '밸리코스',
      order: 2,
      memo: '계곡을 따라 펼쳐지는 자연 친화 코스',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 403 }, { teeName: 'White', distance: 378 }, { teeName: 'Red', distance: 323 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 174 }, { teeName: 'White', distance: 156 }, { teeName: 'Red', distance: 133 }] },
        { par: 5, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 537 }, { teeName: 'White', distance: 510 }, { teeName: 'Red', distance: 452 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 393 }, { teeName: 'White', distance: 369 }, { teeName: 'Red', distance: 315 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 413 }, { teeName: 'White', distance: 388 }, { teeName: 'Red', distance: 333 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 527 }, { teeName: 'White', distance: 500 }, { teeName: 'Red', distance: 443 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 148 }, { teeName: 'Red', distance: 126 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 384 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
        { par: 4, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 377 }, { teeName: 'White', distance: 353 }, { teeName: 'Red', distance: 301 }] },
      ],
    },
    {
      name: '레이크코스',
      order: 3,
      memo: '호수 조망과 함께하는 아름다운 후반 코스',
      holes: [
        { par: 4, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 399 }, { teeName: 'White', distance: 374 }, { teeName: 'Red', distance: 319 }] },
        { par: 5, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 539 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 454 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 181 }, { teeName: 'White', distance: 163 }, { teeName: 'Red', distance: 139 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 426 }, { teeName: 'White', distance: 399 }, { teeName: 'Red', distance: 343 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 398 }, { teeName: 'White', distance: 373 }, { teeName: 'Red', distance: 318 }] },
        { par: 5, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 530 }, { teeName: 'White', distance: 503 }, { teeName: 'Red', distance: 446 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 379 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 303 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 168 }, { teeName: 'White', distance: 151 }, { teeName: 'Red', distance: 129 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 385 }, { teeName: 'White', distance: 361 }, { teeName: 'Red', distance: 309 }] },
      ],
    },
  ],
};

export default data;
