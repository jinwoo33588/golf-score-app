import { ClubData } from '../types';

const data: ClubData = {
  name: '안양컨트리클럽',
  region: '경기 군포',
  address: '경기도 군포시 군포로 364',
  isPublic: true,
  nineCourses: [
    {
      name: '동코스',
      order: 1,
      memo: '한국 최고 명문 클럽. 짧지만 전략적인 레이아웃',
      holes: [
        { par: 4, handicapIndex: 5,  tees: [{ teeName: 'Blue', distance: 385 }, { teeName: 'White', distance: 365 }, { teeName: 'Red', distance: 310 }] },
        { par: 5, handicapIndex: 1,  tees: [{ teeName: 'Blue', distance: 510 }, { teeName: 'White', distance: 480 }, { teeName: 'Red', distance: 420 }] },
        { par: 3, handicapIndex: 15, tees: [{ teeName: 'Blue', distance: 170 }, { teeName: 'White', distance: 155 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 9,  tees: [{ teeName: 'Blue', distance: 360 }, { teeName: 'White', distance: 340 }, { teeName: 'Red', distance: 295 }] },
        { par: 4, handicapIndex: 3,  tees: [{ teeName: 'Blue', distance: 415 }, { teeName: 'White', distance: 390 }, { teeName: 'Red', distance: 335 }] },
        { par: 5, handicapIndex: 7,  tees: [{ teeName: 'Blue', distance: 520 }, { teeName: 'White', distance: 495 }, { teeName: 'Red', distance: 440 }] },
        { par: 3, handicapIndex: 17, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 145 }, { teeName: 'Red', distance: 125 }] },
        { par: 4, handicapIndex: 11, tees: [{ teeName: 'Blue', distance: 375 }, { teeName: 'White', distance: 355 }, { teeName: 'Red', distance: 305 }] },
        { par: 4, handicapIndex: 13, tees: [{ teeName: 'Blue', distance: 380 }, { teeName: 'White', distance: 360 }, { teeName: 'Red', distance: 310 }] },
      ],
    },
    {
      name: '서코스',
      order: 2,
      memo: '기복 있는 지형과 빠른 그린이 특징',
      holes: [
        { par: 4, handicapIndex: 6,  tees: [{ teeName: 'Blue', distance: 395 }, { teeName: 'White', distance: 370 }, { teeName: 'Red', distance: 315 }] },
        { par: 4, handicapIndex: 2,  tees: [{ teeName: 'Blue', distance: 420 }, { teeName: 'White', distance: 395 }, { teeName: 'Red', distance: 340 }] },
        { par: 5, handicapIndex: 8,  tees: [{ teeName: 'Blue', distance: 525 }, { teeName: 'White', distance: 500 }, { teeName: 'Red', distance: 445 }] },
        { par: 3, handicapIndex: 16, tees: [{ teeName: 'Blue', distance: 165 }, { teeName: 'White', distance: 150 }, { teeName: 'Red', distance: 130 }] },
        { par: 4, handicapIndex: 4,  tees: [{ teeName: 'Blue', distance: 400 }, { teeName: 'White', distance: 375 }, { teeName: 'Red', distance: 320 }] },
        { par: 5, handicapIndex: 10, tees: [{ teeName: 'Blue', distance: 515 }, { teeName: 'White', distance: 490 }, { teeName: 'Red', distance: 435 }] },
        { par: 3, handicapIndex: 18, tees: [{ teeName: 'Blue', distance: 155 }, { teeName: 'White', distance: 140 }, { teeName: 'Red', distance: 120 }] },
        { par: 4, handicapIndex: 14, tees: [{ teeName: 'Blue', distance: 370 }, { teeName: 'White', distance: 350 }, { teeName: 'Red', distance: 300 }] },
        { par: 4, handicapIndex: 12, tees: [{ teeName: 'Blue', distance: 405 }, { teeName: 'White', distance: 380 }, { teeName: 'Red', distance: 325 }] },
      ],
    },
  ],
};

export default data;
