import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { GolfClub } from '../models/GolfClub';
import { GOLF_CLUBS_SEED } from './golfClubData';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI가 설정되지 않았습니다');

  await mongoose.connect(uri);
  console.log('✅ MongoDB 연결됨');

  // 기존 공용 골프장 데이터 삭제 (createdBy: null)
  const deleted = await GolfClub.deleteMany({ createdBy: null });
  console.log(`🗑️  기존 시드 데이터 ${deleted.deletedCount}개 삭제`);

  // 새 데이터 삽입
  const result = await GolfClub.insertMany(
    GOLF_CLUBS_SEED.map((club) => ({ ...club, createdBy: null }))
  );

  console.log(`\n⛳ 골프장 ${result.length}개 삽입 완료:\n`);
  result.forEach((club, i) => {
    const courseNames = club.nineCourses.map((c) => c.name).join(', ');
    console.log(`  ${i + 1}. ${club.name} (${club.region}) — ${courseNames}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ 완료');
}

seed().catch((err) => {
  console.error('❌ 시드 실패:', err);
  process.exit(1);
});
