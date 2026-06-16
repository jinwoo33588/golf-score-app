import { Schema, model } from 'mongoose';
import { IGolfClub } from '../types';

// ── TeeDistance ───────────────────────────────────────────
const TeeDistanceSchema = new Schema(
  {
    teeName: { type: String, required: true, trim: true }, // "Black" | "Blue" | "White" | "Red" ...
    distance: { type: Number, required: true, min: 1 },
    unit: { type: String, enum: ['meter', 'yard'], required: true },
  },
  { _id: false }
);

// ── CourseHole ────────────────────────────────────────────
const CourseHoleSchema = new Schema(
  {
    holeNumber: { type: Number, required: true, min: 1, max: 9 },
    par: { type: Number, required: true, enum: [3, 4, 5] },
    handicapIndex: { type: Number, min: 1, max: 18 },
    teeDistances: { type: [TeeDistanceSchema], default: [] },
    memo: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: true } // courseHoleId로 참조 가능하도록 _id 유지
);

// ── NineCourse ────────────────────────────────────────────
const NineCourseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number },
    holeCount: { type: Number, default: 9 },
    parTotal: { type: Number, required: true },
    holes: {
      type: [CourseHoleSchema],
      required: true,
      validate: {
        validator: (holes: unknown[]) => holes.length >= 1,
        message: 'holes must have at least 1 hole',
      },
    },
    memo: { type: String, trim: true },
  },
  { _id: true }
);

// parTotal 자동 계산
NineCourseSchema.pre('save', function (next) {
  this.parTotal = this.holes.reduce((sum, h) => sum + h.par, 0);
  next();
});

// ── GolfClub ──────────────────────────────────────────────
const GolfClubSchema = new Schema<IGolfClub>(
  {
    name: { type: String, required: true, trim: true },
    region: { type: String, trim: true },
    address: { type: String, trim: true },
    nineCourses: {
      type: [NineCourseSchema],
      required: true,
      validate: {
        validator: (courses: unknown[]) => courses.length >= 1,
        message: 'nineCourses must have at least 1 course',
      },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 인덱스 (설계서 20항)
GolfClubSchema.index({ name: 'text', region: 'text' }); // 전문 검색
GolfClubSchema.index({ name: 1, region: 1 });            // 중복 확인 / 지역별 조회
GolfClubSchema.index({ isPublic: 1 });

export const GolfClub = model<IGolfClub>('GolfClub', GolfClubSchema);
