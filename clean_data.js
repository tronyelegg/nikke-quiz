const fs = require('fs');
const path = require('path');

// ==========================================
// 1. 경로 설정 (본인의 환경에 맞게 수정하세요)
// ==========================================
const EN_JSON_PATH = path.join(__dirname, 'en.json'); // 원본 EN JSON 경로
const JP_JSON_PATH = path.join(__dirname, 'jp.json'); // 원본 JP JSON 경로
const KR_JSON_PATH = path.join(__dirname, 'kr.json');
const OUTPUT_JSON_PATH = path.join(__dirname, 'nikkes_new.json'); // 새로 생성될 JSON 경로

const IMAGE_DIR = path.join(__dirname, 'public/data/image/nikke'); // 다운로드 받은 이미지가 있는 폴더
const UNUSED_DIR = path.join(__dirname, 'public/data/image/unused'); // 사용하지 않는 이미지를 격리할 폴더

// ==========================================
// 2. 스크립트 실행 함수
// ==========================================
function processNikkeData() {
  console.log("데이터 정제를 시작합니다...");

  // 파일 읽기
  const enData = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf-8'));
  const jpData = JSON.parse(fs.readFileSync(JP_JSON_PATH, 'utf-8'));
  const krData = JSON.parse(fs.readFileSync(KR_JSON_PATH, 'utf-8'));

  const nikkeMap = {};
  const validImageNames = new Set();

  // JP 데이터를 먼저 맵핑 (ID 기준)
  const jpNameMap = {};
  jpData.forEach(char => {
    if (char.name_localkey && char.name_localkey.name) {
      jpNameMap[char.id] = char.name_localkey.name;
    }
  });

    // JP 데이터를 먼저 맵핑 (ID 기준)
  const krNameMap = {};
  krData.forEach(char => {
    if (char.name_localkey && char.name_localkey.name) {
      krNameMap[char.id] = char.name_localkey.name;
    }
  });

  // EN 데이터를 기준으로 통합 JSON 생성 및 유효한 파일명 추출
  const finalNikkes = [];

  enData.forEach(char => {
    if (!char.name_localkey || !char.name_localkey.name) return;

    const id = char.id;
    const nameEn = char.name_localkey.name;
    const nameJa = jpNameMap[id] || "";
    const nameKr = krNameMap[id] || "";

    // 이격 캐릭터 파일명 처리: ':' 를 '_' 로 변환 (예: "Ade: Agent Bunny" -> "Ade_ Agent Bunny")
    const fileNameEn = nameEn.replace(/:/g, '_');
    const imageFileName = `${fileNameEn}.png`;

    validImageNames.add(imageFileName);

    finalNikkes.push({
      id: id.toString(),
      nameEn: nameEn,
      nameJa: nameJa,
      nameKr: nameKr,
      image: `data/image/nikke/${imageFileName}` // 프론트에서 쓸 이미지 경로
    });
  });

  // 새 JSON 파일 저장
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(finalNikkes, null, 2), 'utf-8');
  console.log(`✅ JSON 생성 완료: 총 ${finalNikkes.length}개의 캐릭터 데이터가 저장되었습니다.`);

  // ==========================================
  // 3. 이미지 폴더 정제 (불필요한 파일 걸러내기)
  // ==========================================
  if (!fs.existsSync(UNUSED_DIR)) {
    fs.mkdirSync(UNUSED_DIR, { recursive: true });
  }

  const files = fs.readdirSync(IMAGE_DIR);
  let movedCount = 0;
  let keptCount = 0;

  files.forEach(file => {
    if (!file.endsWith('.png')) return;

    if (!validImageNames.has(file)) {
      // 리스트에 없는 이미지는 unused 폴더로 이동
      fs.renameSync(
        path.join(IMAGE_DIR, file),
        path.join(UNUSED_DIR, file)
      );
      movedCount++;
    } else {
      keptCount++;
    }
  });

  console.log(`✅ 이미지 정제 완료: 유효한 파일 ${keptCount}개 유지, 불필요한 파일 ${movedCount}개 unused 폴더로 이동됨.`);
}

// 스크립트 실행
try {
  processNikkeData();
} catch (error) {
  console.error("오류가 발생했습니다:", error);
}