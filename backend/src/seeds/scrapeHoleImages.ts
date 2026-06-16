/**
 * 골프장 홀 이미지 스크래퍼
 *
 * 실행 방법:
 *   npx ts-node --transpile-only src/seeds/scrapeHoleImages.ts
 *   npx ts-node --transpile-only src/seeds/scrapeHoleImages.ts --dry-run
 *   npx ts-node --transpile-only src/seeds/scrapeHoleImages.ts --club "안양컨트리클럽"
 *
 * 필요 패키지 (최초 1회):
 *   npm install --save-dev puppeteer axios
 *
 * ────────────────────────────────────────────────────────────
 * 각 골프장 사이트 구조가 달라 CLUB_CONFIGS 에 셀렉터를 직접 설정합니다.
 * 새 골프장 추가 시 아래 CLUB_CONFIGS 배열에 항목을 추가하세요.
 * ────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';
import https from 'https';
import http from 'http';
import mongoose from 'mongoose';
import { GolfClub } from '../models/GolfClub';

// ── 타입 ────────────────────────────────────────────────────

interface HoleImageResult {
  courseIdx: number;  // nineCourses 배열 인덱스
  holeNumber: number; // 1~9
  imageUrl: string;   // 다운로드할 원본 URL
}

/**
 * 골프장별 스크래핑 설정
 *
 * scrape(page, clubName) 함수:
 *   - Puppeteer Page 객체를 받아 이미지 URL 목록을 반환
 *   - courseIdx: nineCourses 배열 순서 (0-based)
 *   - holeNumber: 해당 코스 내 홀 번호 (1-9)
 */
interface ClubConfig {
  /** DB에 저장된 골프장 이름 (정확히 일치해야 함) */
  clubName: string;
  /** 홀 가이드 첫 페이지 URL */
  startUrl: string;
  /** 스크래핑 함수 */
  scrape: (page: PuppeteerPage, log: Logger) => Promise<HoleImageResult[]>;
}

// Puppeteer 타입을 동적 import로 처리
type PuppeteerPage = import('puppeteer').Page;
type Logger = (msg: string) => void;

// ── 골프장별 설정 ───────────────────────────────────────────
//
// 각 사이트의 실제 DOM 구조에 맞게 scrape 함수를 작성하세요.
// 크롬 개발자도구 > Elements 탭에서 이미지 셀렉터를 확인하세요.
//
// 기본 제공 헬퍼:
//   - extractImgSrcs(page, selector)  : img[src] 목록 추출
//   - navigateAndCollect(page, urls)  : 여러 URL 방문 후 이미지 수집

const CLUB_CONFIGS: ClubConfig[] = [
  // ──────────────────────────────────────────────────────────
  // 안양컨트리클럽  https://www.aygc.co.kr
  // 코스: 파인(0), 애플(1), 체리(2)  — 각 코스 페이지에 9홀 이미지
  // ──────────────────────────────────────────────────────────
  {
    clubName: '안양컨트리클럽',
    startUrl: 'https://www.aygc.co.kr/course/course01.asp',
    async scrape(page, log) {
      const results: HoleImageResult[] = [];

      // 코스별 URL 목록 (실제 사이트 확인 후 수정 필요)
      const courseUrls = [
        { courseIdx: 0, url: 'https://www.aygc.co.kr/course/course01.asp' },
        { courseIdx: 1, url: 'https://www.aygc.co.kr/course/course02.asp' },
        { courseIdx: 2, url: 'https://www.aygc.co.kr/course/course03.asp' },
      ];

      for (const { courseIdx, url } of courseUrls) {
        log(`  → ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        // 홀 이미지 셀렉터 — 사이트 구조에 맞게 수정
        // 보통 .hole-img img, .course-hole img, #hole_1 img 등
        const imgs = await page.$$eval(
          '.hole_img img, .hole-img img, .course_img img, img[src*="hole"]',
          (els) => els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
        );

        log(`    이미지 ${imgs.length}개 발견`);
        imgs.slice(0, 9).forEach((src, i) => {
          results.push({ courseIdx, holeNumber: i + 1, imageUrl: src });
        });
      }

      return results;
    },
  },

  // ──────────────────────────────────────────────────────────
  // 레이크사이드컨트리클럽  https://www.lakesidegolf.co.kr
  // ──────────────────────────────────────────────────────────
  {
    clubName: '레이크사이드컨트리클럽',
    startUrl: 'https://www.lakesidegolf.co.kr/course',
    async scrape(page, log) {
      const results: HoleImageResult[] = [];

      const courseUrls = [
        { courseIdx: 0, url: 'https://www.lakesidegolf.co.kr/course/east' },
        { courseIdx: 1, url: 'https://www.lakesidegolf.co.kr/course/west' },
        { courseIdx: 2, url: 'https://www.lakesidegolf.co.kr/course/south' },
      ];

      for (const { courseIdx, url } of courseUrls) {
        log(`  → ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
          const imgs = await page.$$eval(
            'img[src*="hole"], img[src*="course"], .hole img',
            (els) => els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
          );
          log(`    이미지 ${imgs.length}개 발견`);
          imgs.slice(0, 9).forEach((src, i) => {
            results.push({ courseIdx, holeNumber: i + 1, imageUrl: src });
          });
        } catch (e) {
          log(`    ⚠️  접근 실패: ${e}`);
        }
      }

      return results;
    },
  },

  // ──────────────────────────────────────────────────────────
  // 곤지암리조트CC  https://www.gonjiam.com
  // ──────────────────────────────────────────────────────────
  {
    clubName: '곤지암리조트CC',
    startUrl: 'https://www.gonjiam.com/golf/course',
    async scrape(page, log) {
      const results: HoleImageResult[] = [];

      const courseUrls = [
        { courseIdx: 0, url: 'https://www.gonjiam.com/golf/course/birch' },
        { courseIdx: 1, url: 'https://www.gonjiam.com/golf/course/maple' },
        { courseIdx: 2, url: 'https://www.gonjiam.com/golf/course/pine' },
      ];

      for (const { courseIdx, url } of courseUrls) {
        log(`  → ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
          const imgs = await page.$$eval(
            'img[class*="hole"], img[class*="course"], .hole_guide img',
            (els) => els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
          );
          log(`    이미지 ${imgs.length}개 발견`);
          imgs.slice(0, 9).forEach((src, i) => {
            results.push({ courseIdx, holeNumber: i + 1, imageUrl: src });
          });
        } catch (e) {
          log(`    ⚠️  접근 실패: ${e}`);
        }
      }

      return results;
    },
  },

  // ──────────────────────────────────────────────────────────
  // 클럽나인브릿지  https://www.ninebridge.co.kr
  // ──────────────────────────────────────────────────────────
  {
    clubName: '클럽나인브릿지',
    startUrl: 'https://www.ninebridge.co.kr/course/guide',
    async scrape(page, log) {
      const results: HoleImageResult[] = [];

      // 나인브릿지는 단일 18홀 — 코스 2개로 분리
      log(`  → ${this.startUrl}`);
      try {
        await page.goto(this.startUrl, { waitUntil: 'networkidle2', timeout: 25000 });

        // 홀 번호 버튼을 순서대로 클릭하며 이미지 수집
        for (let hole = 1; hole <= 18; hole++) {
          // 사이트별 홀 선택 방식에 맞게 수정 필요
          try {
            await page.click(`[data-hole="${hole}"], .hole-tab:nth-child(${hole}), button:nth-child(${hole})`);
            await page.waitForTimeout(500);
          } catch { /* 클릭 없이도 전체 이미지가 있을 수 있음 */ }
        }

        const imgs = await page.$$eval(
          'img[src*="hole"], .hole_img img, .course_guide img',
          (els) => els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
        );

        log(`    이미지 ${imgs.length}개 발견`);
        imgs.slice(0, 9).forEach((src, i) => {
          results.push({ courseIdx: 0, holeNumber: i + 1, imageUrl: src });
        });
        imgs.slice(9, 18).forEach((src, i) => {
          results.push({ courseIdx: 1, holeNumber: i + 1, imageUrl: src });
        });
      } catch (e) {
        log(`    ⚠️  접근 실패: ${e}`);
      }

      return results;
    },
  },

  // ──────────────────────────────────────────────────────────
  // 한양컨트리클럽  https://www.hanyang-cc.co.kr
  // ──────────────────────────────────────────────────────────
  {
    clubName: '한양컨트리클럽',
    startUrl: 'https://www.hanyang-cc.co.kr/course/course01.asp',
    async scrape(page, log) {
      const results: HoleImageResult[] = [];

      const courseUrls = [
        { courseIdx: 0, url: 'https://www.hanyang-cc.co.kr/course/course01.asp' },
        { courseIdx: 1, url: 'https://www.hanyang-cc.co.kr/course/course02.asp' },
      ];

      for (const { courseIdx, url } of courseUrls) {
        log(`  → ${url}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
          const imgs = await page.$$eval(
            '.hole_img img, .courseImg img, img[src*="hole"], img[src*="course"]',
            (els) => els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
          );
          log(`    이미지 ${imgs.length}개 발견`);
          imgs.slice(0, 9).forEach((src, i) => {
            results.push({ courseIdx, holeNumber: i + 1, imageUrl: src });
          });
        } catch (e) {
          log(`    ⚠️  접근 실패: ${e}`);
        }
      }

      return results;
    },
  },
];

// ── 헬퍼: 이미지 다운로드 ────────────────────────────────────

function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => {
      fs.unlink(destPath, () => {});
      reject(e);
    });
  });
}

function getExtension(url: string): string {
  const match = url.split('?')[0].match(/\.(jpg|jpeg|png|webp|gif)$/i);
  return match ? match[0].toLowerCase().replace('jpeg', 'jpg') : '.jpg';
}

// ── 메인 ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clubFilter = args.find((a) => a.startsWith('--club='))?.split('=')[1]
    ?? args[args.indexOf('--club') + 1];

  console.log(`\n⛳ 골프장 홀 이미지 스크래퍼`);
  console.log(`   모드: ${dryRun ? '🔍 DRY-RUN (DB 저장 없음)' : '✍️  실제 저장'}`);
  if (clubFilter) console.log(`   대상: ${clubFilter}`);
  console.log('');

  // ── Puppeteer 동적 임포트 ──
  let puppeteer: typeof import('puppeteer');
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.error('❌  puppeteer 설치 필요: npm install --save-dev puppeteer');
    process.exit(1);
  }

  // ── MongoDB 연결 ──
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌  MONGODB_URI 없음'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('✅ MongoDB 연결됨\n');

  // ── 업로드 폴더 ──
  const uploadsDir = path.resolve(__dirname, '../../uploads/holes');
  fs.mkdirSync(uploadsDir, { recursive: true });

  // ── Puppeteer 브라우저 ──
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let totalSaved = 0;
  let totalFailed = 0;

  const configs = clubFilter
    ? CLUB_CONFIGS.filter((c) => c.clubName.includes(clubFilter))
    : CLUB_CONFIGS;

  if (configs.length === 0) {
    console.error(`❌  "${clubFilter}" 에 해당하는 설정 없음`);
    await browser.close();
    await mongoose.disconnect();
    return;
  }

  for (const config of configs) {
    console.log(`\n📍 ${config.clubName}`);

    // DB에서 골프장 조회
    const club = await GolfClub.findOne({ name: config.clubName });
    if (!club) {
      console.log(`  ⚠️  DB에서 찾을 수 없음 — 건너뜀`);
      continue;
    }

    const log: Logger = (msg) => console.log(msg);

    // Puppeteer 페이지 생성
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    page.setDefaultTimeout(30000);

    let results: HoleImageResult[] = [];
    try {
      results = await config.scrape(page, log);
    } catch (e) {
      console.log(`  ❌ 스크래핑 실패: ${e}`);
    }
    await page.close();

    if (results.length === 0) {
      console.log(`  ⚠️  이미지를 찾지 못했습니다`);
      console.log(`      → 사이트(${config.startUrl})를 직접 열어 DOM 구조를 확인하고`);
      console.log(`        CLUB_CONFIGS 의 scrape 함수 셀렉터를 수정하세요`);
      continue;
    }

    console.log(`  📷 ${results.length}개 이미지 발견`);

    // 각 결과 처리
    for (const result of results) {
      const course = club.nineCourses[result.courseIdx];
      if (!course) {
        console.log(`    ⚠️  courseIdx=${result.courseIdx} 코스 없음`);
        continue;
      }

      const hole = course.holes.find((h) => h.holeNumber === result.holeNumber);
      if (!hole) {
        console.log(`    ⚠️  ${course.name} ${result.holeNumber}번홀 없음`);
        continue;
      }

      const holeId = String(hole._id);
      const ext = getExtension(result.imageUrl);
      const filename = `${holeId}${ext}`;
      const destPath = path.join(uploadsDir, filename);
      const dbImageUrl = `/uploads/holes/${filename}`;

      console.log(`    [${course.name} ${result.holeNumber}홀] ${result.imageUrl.slice(0, 60)}...`);

      if (dryRun) {
        console.log(`      → 저장 예정: ${dbImageUrl}`);
        continue;
      }

      try {
        // 이미지 다운로드
        await downloadImage(result.imageUrl, destPath);

        // DB 업데이트 (findOneAndUpdate 대신 직접 수정)
        await GolfClub.updateOne(
          { _id: club._id, 'nineCourses._id': course._id, 'nineCourses.holes._id': hole._id },
          { $set: { 'nineCourses.$[c].holes.$[h].imageUrl': dbImageUrl } },
          {
            arrayFilters: [
              { 'c._id': course._id },
              { 'h._id': hole._id },
            ],
          }
        );

        console.log(`      ✅ 저장 완료`);
        totalSaved++;
      } catch (e) {
        console.log(`      ❌ 실패: ${e}`);
        totalFailed++;
      }
    }
  }

  await browser.close();
  await mongoose.disconnect();

  console.log(`\n${'─'.repeat(50)}`);
  if (dryRun) {
    console.log(`🔍 DRY-RUN 완료 — 실제 저장하려면 --dry-run 없이 실행하세요`);
  } else {
    console.log(`✅ 완료: ${totalSaved}개 저장, ${totalFailed}개 실패`);
  }
}

main().catch((e) => {
  console.error('❌ 오류:', e);
  process.exit(1);
});
