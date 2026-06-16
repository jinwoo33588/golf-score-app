/**
 * 홀 이미지 일괄 임포트 스크립트
 *
 * ── 폴더 구조 ────────────────────────────────────────────────
 *
 *   src/seeds/hole-images/
 *     안양컨트리클럽/
 *       파인코스/
 *         1.jpg   ← 홀 번호 = 파일명
 *         2.jpg
 *         ...
 *         9.jpg
 *       애플코스/
 *         1.jpg
 *         ...
 *     레이크사이드컨트리클럽/
 *       이스트코스/
 *         1.png
 *         ...
 *
 * ── 규칙 ─────────────────────────────────────────────────────
 *   • 폴더명(골프장/코스)은 DB 이름과 정확히 일치해야 합니다
 *   • 파일명은 홀 번호 숫자 (1.jpg, 2.png, 3.webp 등)
 *   • 지원 확장자: jpg, jpeg, png, webp, gif
 *
 * ── 실행 방법 ─────────────────────────────────────────────────
 *   npm run import:images           ← 실제 저장
 *   npm run import:images:dry       ← 미리보기 (DB/파일 변경 없음)
 *   npm run import:images -- --club 안양컨트리클럽   ← 특정 골프장만
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';
import mongoose from 'mongoose';
import { GolfClub } from '../models/GolfClub';

const IMAGES_DIR  = path.resolve(__dirname, 'hole-images');
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/holes');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// ── 결과 집계 ─────────────────────────────────────────────────
let saved = 0, skipped = 0, failed = 0;

function log(msg: string) { console.log(msg); }

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clubFilter = args.find((_, i) => args[i - 1] === '--club');

  console.log('\n📁 홀 이미지 임포트');
  console.log(`   모드: ${dryRun ? '🔍 DRY-RUN (변경 없음)' : '✍️  실제 저장'}`);
  if (clubFilter) console.log(`   대상: ${clubFilter}`);
  console.log(`   소스: ${IMAGES_DIR}\n`);

  // 소스 폴더 확인
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌  소스 폴더가 없습니다: ${IMAGES_DIR}`);
    console.error(`   아래 구조로 폴더를 만들고 이미지를 넣어주세요:\n`);
    console.error(`   hole-images/`);
    console.error(`     골프장이름/`);
    console.error(`       코스이름/`);
    console.error(`         1.jpg`);
    console.error(`         2.jpg  ...\n`);
    process.exit(1);
  }

  // MongoDB 연결
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌  MONGODB_URI 없음'); process.exit(1); }
  await mongoose.connect(uri);
  log('✅ MongoDB 연결됨\n');

  // uploads 폴더 생성
  if (!dryRun) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // 골프장 폴더 순회
  const clubFolders = fs.readdirSync(IMAGES_DIR).filter((name) => {
    const full = path.join(IMAGES_DIR, name);
    return fs.statSync(full).isDirectory() && (!clubFilter || name.includes(clubFilter));
  });

  if (clubFolders.length === 0) {
    log(clubFilter
      ? `⚠️  "${clubFilter}" 에 해당하는 폴더가 없습니다`
      : '⚠️  hole-images 폴더가 비어있습니다'
    );
    await mongoose.disconnect();
    return;
  }

  for (const clubFolderName of clubFolders) {
    log(`\n⛳ ${clubFolderName}`);

    // DB에서 골프장 조회
    const club = await GolfClub.findOne({ name: clubFolderName });
    if (!club) {
      log(`  ❌  DB에서 찾을 수 없음 — 폴더명이 DB 골프장명과 다를 수 있습니다`);
      log(`      DB에 있는 이름들: (npm run seed 후 확인)`);
      failed++;
      continue;
    }

    const clubDir = path.join(IMAGES_DIR, clubFolderName);

    // 코스 폴더 순회
    const courseFolders = fs.readdirSync(clubDir).filter((name) => {
      return fs.statSync(path.join(clubDir, name)).isDirectory();
    });

    for (const courseFolderName of courseFolders) {
      const course = club.nineCourses.find((c) => c.name === courseFolderName);
      if (!course) {
        log(`  ⚠️  코스 "${courseFolderName}" DB에 없음 — 코스명을 확인하세요`);
        log(`      이 골프장의 코스: ${club.nineCourses.map((c) => c.name).join(', ')}`);
        skipped++;
        continue;
      }

      const courseDir = path.join(clubDir, courseFolderName);
      const imageFiles = fs.readdirSync(courseDir).filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return SUPPORTED_EXT.includes(ext);
      });

      log(`\n  📂 ${courseFolderName} (${imageFiles.length}개 파일)`);

      for (const imageFile of imageFiles) {
        const holeNum = parseInt(path.basename(imageFile, path.extname(imageFile)), 10);

        if (isNaN(holeNum) || holeNum < 1 || holeNum > 9) {
          log(`    ⚠️  "${imageFile}" — 파일명이 홀 번호가 아님 (1~9 사이 숫자여야 함)`);
          skipped++;
          continue;
        }

        const hole = course.holes.find((h) => h.holeNumber === holeNum);
        if (!hole) {
          log(`    ⚠️  ${holeNum}번 홀 DB에 없음`);
          skipped++;
          continue;
        }

        const srcPath  = path.join(courseDir, imageFile);
        const ext      = path.extname(imageFile).toLowerCase().replace('.jpeg', '.jpg');
        const holeId   = String(hole._id);
        const filename = `${holeId}${ext}`;
        const destPath = path.join(UPLOADS_DIR, filename);
        const dbUrl    = `/uploads/holes/${filename}`;

        log(`    [${holeNum}홀] ${imageFile} → ${filename}`);

        if (dryRun) {
          log(`         dry-run: 저장 예정 ${dbUrl}`);
          continue;
        }

        try {
          // 파일 복사
          fs.copyFileSync(srcPath, destPath);

          // DB 업데이트
          await GolfClub.updateOne(
            { _id: club._id },
            {
              $set: {
                'nineCourses.$[c].holes.$[h].imageUrl': dbUrl,
              },
            },
            {
              arrayFilters: [
                { 'c._id': course._id },
                { 'h._id': hole._id },
              ],
            }
          );

          log(`         ✅ 완료`);
          saved++;
        } catch (e) {
          log(`         ❌ 실패: ${e}`);
          failed++;
        }
      }
    }
  }

  await mongoose.disconnect();

  console.log(`\n${'─'.repeat(50)}`);
  if (dryRun) {
    console.log(`🔍 DRY-RUN 완료 — 실제 저장: npm run import:images`);
  } else {
    console.log(`✅ 완료 — 저장: ${saved}개 | 건너뜀: ${skipped}개 | 실패: ${failed}개`);
  }
}

main().catch((e) => {
  console.error('❌ 오류:', e);
  process.exit(1);
});
