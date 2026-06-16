/**
 * 골프장 전체 시드 스크립트
 *
 * ── 역할 ─────────────────────────────────────────────────────
 *   1. clubs/골프장명/index.ts  →  DB 삽입/업데이트
 *   2. clubs/골프장명/images/코스명/홀번호.jpg  →  uploads/holes/ 복사 + DB imageUrl 업데이트
 *
 * ── 폴더 구조 ────────────────────────────────────────────────
 *   clubs/
 *     안양컨트리클럽/
 *       index.ts          ← 파, HCP, 거리 데이터
 *       images/           ← (선택) 이미지 폴더
 *         동코스/
 *           1.jpg
 *           2.jpg
 *           ...
 *         서코스/
 *           1.jpg
 *           ...
 *     레이크사이드컨트리클럽/
 *       index.ts
 *       images/
 *         ...
 *
 * ── 실행 ─────────────────────────────────────────────────────
 *   npm run seed:all              ← 전체 저장
 *   npm run seed:all:dry          ← 미리보기 (변경 없음)
 *   npm run seed:all -- --club 안양컨트리클럽   ← 특정 골프장만
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import fs from 'fs';
import mongoose from 'mongoose';
import { GolfClub } from '../../models/GolfClub';
import { ClubData } from './types';

const CLUBS_DIR   = path.resolve(__dirname, '.');
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads/holes');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// ── 헬퍼 ──────────────────────────────────────────────────────

function log(msg: string) { console.log(msg); }

function teeUnit(teeName: string): 'meter' | 'yard' {
  return 'meter';
}

// ── 메인 ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clubFilter = args.find((_, i) => args[i - 1] === '--club');

  log('\n⛳ 골프장 전체 시드');
  log(`   모드: ${dryRun ? '🔍 DRY-RUN (변경 없음)' : '✍️  실제 저장'}`);
  if (clubFilter) log(`   대상: ${clubFilter}`);
  log('');

  // MongoDB 연결
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌  MONGODB_URI 없음'); process.exit(1); }
  await mongoose.connect(uri);
  log('✅ MongoDB 연결됨\n');

  if (!dryRun) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // clubs/ 하위 폴더 목록
  const clubDirs = fs.readdirSync(CLUBS_DIR).filter((name) => {
    const full = path.join(CLUBS_DIR, name);
    if (!fs.statSync(full).isDirectory()) return false;
    if (!fs.existsSync(path.join(full, 'index.ts'))) return false;
    if (clubFilter && !name.includes(clubFilter)) return false;
    return true;
  });

  if (clubDirs.length === 0) {
    log(clubFilter ? `⚠️  "${clubFilter}" 에 해당하는 폴더 없음` : '⚠️  골프장 폴더 없음');
    await mongoose.disconnect();
    return;
  }

  let savedClubs = 0, savedImages = 0, skippedImages = 0;

  for (const dirName of clubDirs) {
    const clubDir = path.join(CLUBS_DIR, dirName);

    // ── 1. 데이터 로드 ──
    let clubData: ClubData;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      clubData = require(path.join(clubDir, 'index.ts')).default;
    } catch (e) {
      log(`❌  ${dirName}/index.ts 로드 실패: ${e}`);
      continue;
    }

    log(`\n⛳ ${clubData.name} (${clubData.region ?? ''})`);

    if (dryRun) {
      log(`   코스: ${clubData.nineCourses.map((c) => `${c.name}(${c.holes.length}홀)`).join(', ')}`);
    } else {
      // ── 2. DB 저장 (upsert) ──
      const dbData = {
        name:       clubData.name,
        region:     clubData.region,
        address:    clubData.address,
        isPublic:   clubData.isPublic ?? true,
        nineCourses: clubData.nineCourses.map((course, ci) => ({
          name:      course.name,
          order:     course.order ?? ci + 1,
          holeCount: course.holes.length,
          parTotal:  course.holes.reduce((s, h) => s + h.par, 0),
          memo:      course.memo,
          holes: course.holes.map((hole, hi) => ({
            holeNumber:    hi + 1,
            par:           hole.par,
            handicapIndex: hole.handicapIndex,
            memo:          hole.memo,
            teeDistances:  (hole.tees ?? []).map((t) => ({
              teeName:  t.teeName,
              distance: t.distance,
              unit:     teeUnit(t.teeName),
            })),
          })),
        })),
      };

      const existing = await GolfClub.findOne({ name: clubData.name });
      if (existing) {
        // 업데이트: 기존 imageUrl 보존
        for (let ci = 0; ci < dbData.nineCourses.length; ci++) {
          const existingCourse = existing.nineCourses[ci];
          if (!existingCourse) continue;
          for (let hi = 0; hi < dbData.nineCourses[ci].holes.length; hi++) {
            const existingHole = existingCourse.holes[hi];
            if (existingHole?.imageUrl) {
              (dbData.nineCourses[ci].holes[hi] as { imageUrl?: string }).imageUrl = existingHole.imageUrl;
            }
          }
        }
        await GolfClub.updateOne({ _id: existing._id }, { $set: dbData });
        log(`   ✅ DB 업데이트`);
      } else {
        await GolfClub.create({ ...dbData, createdBy: null });
        log(`   ✅ DB 신규 생성`);
      }
      savedClubs++;
    }

    // ── 3. 이미지 처리 ──
    const imagesDir = path.join(clubDir, 'images');
    if (!fs.existsSync(imagesDir)) {
      log(`   📂 images/ 폴더 없음 — 이미지 건너뜀`);
      continue;
    }

    // 업데이트된 club 재조회
    const club = dryRun
      ? null
      : await GolfClub.findOne({ name: clubData.name });

    const courseFolders = fs.readdirSync(imagesDir).filter((n) =>
      fs.statSync(path.join(imagesDir, n)).isDirectory()
    );

    for (const courseName of courseFolders) {
      const courseDir = path.join(imagesDir, courseName);
      const courseIdx = clubData.nineCourses.findIndex((c) => c.name === courseName);

      if (courseIdx === -1) {
        log(`   ⚠️  images/${courseName} — 코스명이 index.ts 와 다름`);
        log(`      index.ts 코스: ${clubData.nineCourses.map((c) => c.name).join(', ')}`);
        continue;
      }

      const imageFiles = fs.readdirSync(courseDir).filter((f) =>
        SUPPORTED_EXT.includes(path.extname(f).toLowerCase())
      );

      log(`\n   📂 ${courseName} — ${imageFiles.length}개 이미지`);

      for (const imgFile of imageFiles) {
        const holeNum = parseInt(path.basename(imgFile, path.extname(imgFile)), 10);

        if (isNaN(holeNum) || holeNum < 1 || holeNum > 9) {
          log(`      ⚠️  "${imgFile}" 파일명이 1~9 숫자여야 함`);
          skippedImages++;
          continue;
        }

        const srcPath = path.join(courseDir, imgFile);
        const ext     = path.extname(imgFile).toLowerCase().replace('.jpeg', '.jpg');

        if (dryRun) {
          log(`      [${holeNum}홀] ${imgFile} → 저장 예정`);
          continue;
        }

        if (!club) { skippedImages++; continue; }

        const dbCourse = club.nineCourses[courseIdx];
        const dbHole   = dbCourse?.holes.find((h) => h.holeNumber === holeNum);

        if (!dbHole?._id) {
          log(`      ⚠️  [${holeNum}홀] DB에서 홀 ID 없음`);
          skippedImages++;
          continue;
        }

        const holeId   = String(dbHole._id);
        const filename = `${holeId}${ext}`;
        const destPath = path.join(UPLOADS_DIR, filename);
        const dbUrl    = `/uploads/holes/${filename}`;

        try {
          fs.copyFileSync(srcPath, destPath);

          await GolfClub.updateOne(
            { _id: club._id },
            { $set: { 'nineCourses.$[c].holes.$[h].imageUrl': dbUrl } },
            {
              arrayFilters: [
                { 'c._id': dbCourse._id },
                { 'h._id': dbHole._id },
              ],
            }
          );

          log(`      [${holeNum}홀] ✅ ${filename}`);
          savedImages++;
        } catch (e) {
          log(`      [${holeNum}홀] ❌ ${e}`);
          skippedImages++;
        }
      }
    }
  }

  await mongoose.disconnect();

  log(`\n${'─'.repeat(50)}`);
  if (dryRun) {
    log(`🔍 DRY-RUN 완료 — 실제 저장: npm run seed:all`);
  } else {
    log(`✅ 완료 — 골프장 ${savedClubs}개, 이미지 ${savedImages}개 저장 / ${skippedImages}개 건너뜀`);
  }
}

main().catch((e) => {
  console.error('❌ 오류:', e);
  process.exit(1);
});
