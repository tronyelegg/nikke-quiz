const fs = require('fs');

// 1. 원본 데이터 불러오기
const rawData = fs.readFileSync('./src/data/nikkes.json', 'utf-8');
const nikkes = JSON.parse(rawData);

// 2. text가 null이 아닌 유효한 별명이 하나라도 있는 니케만 필터링한 후 추출
const aliasesData = nikkes
  .filter(nikke => nikke.aliases && nikke.aliases.some(alias => alias.text !== null))
  .map(nikke => ({
    id: nikke.id,
    name: nikke.name,
    aliases: nikke.aliases
  }));

// 3. 분리된 데이터를 별도의 JSON 파일로 저장
fs.writeFileSync('./src/data/aliases.json', JSON.stringify(aliasesData, null, 2), 'utf-8');
console.log(`✅ text가 null인 데이터를 제외하고, 총 ${aliasesData.length}명의 별명 데이터가 추출되었습니다!`);