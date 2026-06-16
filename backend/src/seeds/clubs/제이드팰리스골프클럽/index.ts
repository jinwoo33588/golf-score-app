import { ClubData } from '../types';

const data: ClubData = {
  name: '제이드팰리스골프클럽',
  region: '제주 제주시',
  address: '제주특별자치도 제주시 조천읍 교래리 산91-0',
  isPublic: true,
  nineCourses: [
    {
      name: '드래곤코스',
      order: 1,
      memo: '제주 화산지형과 어우러진 드라마틱한 코스',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 542 }, { teeName: 'White', distance: 515 }, { teeName: 'Red', distance: 458 }] },
        { par: 3, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 183 }, { teeName: 'White', distance: 165 }, { teeName: 'Red', distance: 140 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 392 }, { teeName: 'White', distance: 368 }, { teeName: 'Red', distance: 314 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 422 }, { teeName: 'White', distance: 395 }, { teeName: 'Red', distance: 340 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 535 }, { teeName: 'White', distance: 508 }, { teeName: 'Red', distance: 450 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 382 }, { teeName: 'White', distance: 358 }, { teeName: 'Red', distance: 306 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 172 }, { teeName: 'White', distance: 155 }, { teeName: 'Red', distance: 132 }] },
        { par: 4, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 390 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 312 }] },
      ],
    },
    {
      name: '레이크코스',
      order: 2,
      memo: '에메랄드빛 호수가 곳곳에 배치된 코스',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 406 }, { teeName: 'White', distance: 380 }, { teeName: 'Red', distance: 325 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 178 }, { teeName: 'White', distance: 160 }, { teeName: 'Red', distance: 136 }] },
        { par: 5, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 540 }, { teeName: 'White', distance: 512 }, { teeName: 'Red', distance: 455 }] },
        { par: 4, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 316 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 416 }, { teeName: 'White', distance: 390 }, { teeName: 'Red', distance: 335 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 448 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 167 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 128 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 386 }, { teeName: 'White', distance: 362 }, { teeName: 'Red', distance: 309 }] },
        { par: 4, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 379 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 303 }] },
      ],
    },
    {
      name: '마운틴코스',
      order: 3,
      memo: '한라산을 바라보며 라운드하는 고지대 코스',
      holes: [
        { par: 4, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 397 }, { teeName: 'White', distance: 372 }, { teeName: 'Red', distance: 317 }] },
        { par: 5, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 538 }, { teeName: 'White', distance: 510 }, { teeName: 'Red', distance: 453 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 175 }, { teeName: 'White', distance: 158 }, { teeName: 'Red', distance: 134 }] },
        { par: 4, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 428 }, { teeName: 'White', distance: 400 }, { teeName: 'Red', distance: 344 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 399 }, { teeName: 'White', distance: 374 }, { teeName: 'Red', distance: 319 }] },
        { par: 5, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 532 }, { teeName: 'White', distance: 505 }, { teeName: 'Red', distance: 447 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 380 }, { teeName: 'White', distance: 356 }, { teeName: 'Red', distance: 304 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 169 }, { teeName: 'White', distance: 152 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 385 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 308 }] },
      ],
    },
  ],
};

export default data;
