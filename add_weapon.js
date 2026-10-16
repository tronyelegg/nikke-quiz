const fs = require('fs');

// 1. 원본 DB와 현재 서비스 중인 JSON 파일 읽기
const rawDb = fs.readFileSync('nikke_db.json', 'utf-8');
const dbData = JSON.parse(rawDb);

const currentNikkesRaw = fs.readFileSync('src/data/nikkes.json', 'utf-8');
const nikkesData = JSON.parse(currentNikkesRaw);

// 2. 원본 DB를 이름 기준으로 매핑 (빠른 검색을 위해)
const weaponMap = {};
dbData.forEach(item => {
  if (item.name_localkey && item.name_localkey.name) {
    // 샷건, 머신건 등의 무기 타입 추출
    weaponMap[item.name_localkey.name] = item.shot_id?.element?.weapon_type || 'Unknown';
  }
});

// 3. 기존 퀴즈 데이터에 무기군 속성(weaponType) 병합
const updatedNikkes = nikkesData.map(nikke => {
  return {
    ...nikke,
    weaponType: weaponMap[nikke.name] || 'Unknown' 
  };
});

// 4. 동일한 경로에 덮어쓰기
fs.writeFileSync('src/data/nikkes.json', JSON.stringify(updatedNikkes, null, 2), 'utf-8');
console.log('무기군(weaponType) 데이터 업데이트가 완료되었습니다!');