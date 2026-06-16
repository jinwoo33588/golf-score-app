import { Schema, model } from 'mongoose';
import { IRound, IRoundSummary, IRoundHole } from '../types';

// ── GolfClubSnapshot ──────────────────────────────────────
const GolfClubSnapshotSchema = new Schema(
  {
    golfClubName: { type: String, required: true },
    region: { type: String },
  },
  { _id: false }
);

// ── PlayedCourse ──────────────────────────────────────────
const PlayedCourseSchema = new Schema(
  {
    nineCourseId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    order: { type: Number, enum: [1, 2], required: true },
    label: { type: String, enum: ['front', 'back'], required: true },
    parTotal: { type: Number, required: true },
  },
  { _id: false }
);

// ── RoundHoleSnapshot ─────────────────────────────────────
const RoundHoleSnapshotSchema = new Schema(
  {
    par: { type: Number, enum: [3, 4, 5], required: true },
    distance: { type: Number },
    handicapIndex: { type: Number },
  },
  { _id: false }
);

// ── RoundHole ─────────────────────────────────────────────
const RoundHoleSchema = new Schema(
  {
    roundHoleNumber: { type: Number, required: true, min: 1, max: 18 },
    nineCourseId: { type: Schema.Types.ObjectId, required: true },
    nineCourseName: { type: String, required: true },
    courseHoleId: { type: Schema.Types.ObjectId },
    courseHoleNumber: { type: Number, required: true, min: 1, max: 9 },
    courseHoleSnapshot: { type: RoundHoleSnapshotSchema, required: true },
    score: { type: Number, required: true, min: 1 },
    putts: { type: Number, required: true, min: 0 },
    fir: { type: Boolean, default: null },   // Par 3은 null
    gir: { type: Boolean, required: true },
    penalties: { type: Number, required: true, min: 0, default: 0 },
    memo: { type: String, trim: true },
  },
  { _id: false }
);

// ── RoundSummary ──────────────────────────────────────────
const RoundSummarySchema = new Schema(
  {
    totalScore: { type: Number, required: true },
    totalPar: { type: Number, required: true },
    overPar: { type: Number, required: true },
    totalPutts: { type: Number, required: true },
    firHit: { type: Number, required: true },
    firEligible: { type: Number, required: true },
    firRate: { type: Number, required: true },
    girHit: { type: Number, required: true },
    girRate: { type: Number, required: true },
    totalPenalties: { type: Number, required: true },
    frontNineScore: { type: Number, required: true },
    backNineScore: { type: Number, required: true },
    frontNinePar: { type: Number, required: true },
    backNinePar: { type: Number, required: true },
    birdiesOrBetter: { type: Number, required: true },
    pars: { type: Number, required: true },
    bogeys: { type: Number, required: true },
    doubleBogeyOrWorse: { type: Number, required: true },
    threePutts: { type: Number, required: true },
    scrambleHit: { type: Number, required: true },
    scrambleEligible: { type: Number, required: true },
    scrambleRate: { type: Number, required: true },
  },
  { _id: false }
);

// ── Round ─────────────────────────────────────────────────
const RoundSchema = new Schema<IRound>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    golfClubId: { type: Schema.Types.ObjectId, ref: 'GolfClub', required: true },
    golfClubSnapshot: { type: GolfClubSnapshotSchema, required: true },
    playedCourses: {
      type: [PlayedCourseSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length === 2,
        message: 'playedCourses must have exactly 2 courses (front + back)',
      },
    },
    date: { type: String, required: true },   // "YYYY-MM-DD"
    teeName: { type: String, required: true, trim: true },
    weather: { type: String, trim: true },
    memo: { type: String, trim: true },
    holes: {
      type: [RoundHoleSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length === 18,
        message: 'holes must have exactly 18 records',
      },
    },
    summary: { type: RoundSummarySchema, required: true },
  },
  { timestamps: true }
);

// ── RoundSummary 자동 계산 ────────────────────────────────
function calcSummary(holes: IRoundHole[], playedCourses: IRound['playedCourses']): IRoundSummary {
  const frontPar = playedCourses.find((c) => c.label === 'front')?.parTotal ?? 0;
  const backPar  = playedCourses.find((c) => c.label === 'back')?.parTotal ?? 0;
  const totalPar = frontPar + backPar;

  const frontHoles = holes.filter((h) => h.roundHoleNumber <= 9);
  const backHoles  = holes.filter((h) => h.roundHoleNumber >= 10);

  const totalScore    = holes.reduce((s, h) => s + h.score, 0);
  const totalPutts    = holes.reduce((s, h) => s + h.putts, 0);
  const totalPenalties = holes.reduce((s, h) => s + h.penalties, 0);
  const frontNineScore = frontHoles.reduce((s, h) => s + h.score, 0);
  const backNineScore  = backHoles.reduce((s, h) => s + h.score, 0);

  const firEligible = holes.filter((h) => h.courseHoleSnapshot.par !== 3).length;
  const firHit      = holes.filter((h) => h.fir === true).length;

  const girHit = holes.filter((h) => h.gir === true).length;

  const diff = (h: IRoundHole) => h.score - h.courseHoleSnapshot.par;

  return {
    totalScore,
    totalPar,
    overPar: totalScore - totalPar,
    totalPutts,
    firHit,
    firEligible,
    firRate: firEligible > 0 ? Math.round((firHit / firEligible) * 1000) / 10 : 0,
    girHit,
    girRate: Math.round((girHit / 18) * 1000) / 10,
    totalPenalties,
    frontNineScore,
    backNineScore,
    frontNinePar: frontPar,
    backNinePar:  backPar,
    birdiesOrBetter:    holes.filter((h) => diff(h) <= -1).length,
    pars:               holes.filter((h) => diff(h) === 0).length,
    bogeys:             holes.filter((h) => diff(h) === 1).length,
    doubleBogeyOrWorse: holes.filter((h) => diff(h) >= 2).length,
    threePutts:         holes.filter((h) => h.putts >= 3).length,
    // 스크램블: GIR 실패했지만 파 이하로 막은 홀
    scrambleEligible: holes.filter((h) => h.gir === false).length,
    scrambleHit:      holes.filter((h) => h.gir === false && h.score <= h.courseHoleSnapshot.par).length,
    scrambleRate: (() => {
      const eli = holes.filter((h) => h.gir === false).length;
      const hit = holes.filter((h) => h.gir === false && h.score <= h.courseHoleSnapshot.par).length;
      return eli > 0 ? Math.round((hit / eli) * 1000) / 10 : 0;
    })(),
  };
}

RoundSchema.pre('save', function (next) {
  this.summary = calcSummary(this.holes, this.playedCourses);
  next();
});

// ── 인덱스 (설계서 20항) ──────────────────────────────────
RoundSchema.index({ userId: 1, date: -1 });
RoundSchema.index({ userId: 1, golfClubId: 1, date: -1 });
RoundSchema.index({ userId: 1, 'playedCourses.nineCourseId': 1 });

export const Round = model<IRound>('Round', RoundSchema);
