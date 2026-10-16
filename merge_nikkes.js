const fs = require('fs');
const path = require('path');

// ==========================================
// 1. 파일 경로 설정
// ==========================================
const NIKKES_JSON_PATH = path.join(__dirname, 'src/data/nikkes.json'); // 업데이트할 원본 nikkes.json
const NIKKES_NEW_PATH = path.join(__dirname, 'src/data/nikkes_new.json');       // 새로 정제한 nikkes_new.json
const KR_JSON_PATH = path.join(__dirname, 'kr.json');                 // (선택) 원본 kr.json 데이터

function mergeNikkeData() {
  console.log("데이터 병합 작업을 시작합니다...");

  if (!fs.existsSync(NIKKES_JSON_PATH) || !fs.existsSync(NIKKES_NEW_PATH)) {
    console.error("❌ 파일 경로를 확인해 주세요. (nikkes.json 또는 nikkes_new.json이 없습니다)");
    return;
  }

  const nikkesData = JSON.parse(fs.readFileSync(NIKKES_JSON_PATH, 'utf-8'));
  const nikkesNewData = JSON.parse(fs.readFileSync(NIKKES_NEW_PATH, 'utf-8'));

  // 2. kr.json이 있다면 ID(209001) -> 한국어 이름("엠마") 매핑 테이블 생성
  const idToKrNameMap = {};
  if (fs.existsSync(KR_JSON_PATH)) {
    console.log("💡 kr.json을 발견하여 ID 기반 정밀 매핑을 진행합니다.");
    const krData = JSON.parse(fs.readFileSync(KR_JSON_PATH, 'utf-8'));
    krData.forEach(char => {
      if (char.id && char.name_localkey && char.name_localkey.name) {
        idToKrNameMap[char.id.toString()] = char.name_localkey.name;
      }
    });
  }

  // 3. nikkes_new.json 데이터를 검색하기 쉽게 맵으로 변환
  const newDataByKrName = {};
  const newDataByEnName = {};

  nikkesNewData.forEach(item => {
    // EN 이름 기준 맵 (대소문자/공백/특수문자 제거)
    if (item.nameEn) {
      const cleanEn = item.nameEn.toLowerCase().replace(/[\s:_]/g, '');
      newDataByEnName[cleanEn] = item;
    }
    // KR 이름 기준 맵 (kr.json이 있는 경우)
    if (idToKrNameMap[item.id]) {
      const krName = idToKrNameMap[item.id];
      newDataByKrName[krName] = item;
    }
  });

  let updatedCount = 0;

  // 4. 원본 nikkes.json 순회하며 데이터 업데이트
  const updatedNikkes = nikkesData.map(nikke => {
    // A. 한국어 이름으로 직접 매칭 시도
    let match = newDataByKrName[nikke.name];

    // B. 매칭이 안 되었을 경우 영문 이름/이격 처리 매칭 시도
    if (!match && nikke.nameEn) {
      const cleanEn = nikke.nameEn.toLowerCase().replace(/[\s:_]/g, '');
      match = newDataByEnName[cleanEn];
    }

    if (match) {
      updatedCount++;
      return {
        ...nikke,
        nameEn: match.nameEn || nikke.nameEn || "",
        nameJa: match.nameJa || nikke.nameJa || "",
        image: match.image // nikkes_new.json의 image 경로("data/image/nikke/Emma.png")로 교체
      };
    } else {
      console.warn(`⚠️ 매칭 실패 캐릭터: ${nikke.name} (ID: ${nikke.id})`);
      return nikke;
    }
  });

  // 5. 안전을 위해 기존 nikkes.json 백업 후 새 파일 작성
  fs.writeFileSync(`${NIKKES_JSON_PATH}.bak`, fs.readFileSync(NIKKES_JSON_PATH));
  fs.writeFileSync(NIKKES_JSON_PATH, JSON.stringify(updatedNikkes, null, 2), 'utf-8');

  console.log(`\n✅ 병합 완료! 총 ${nikkesData.length}개 중 ${updatedCount}개 데이터가 업데이트되었습니다.`);
  console.log(`(만약의 사태에 대비해 기존 파일은 nikkes.json.bak 으로 백업되었습니다.)`);
}

try {
  mergeNikkeData();
} catch (error) {
  console.error("병합 도중 오류 발생:", error);
}