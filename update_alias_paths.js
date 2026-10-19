const fs = require('fs');

// 1. 대상 파일 불러오기 (nikkes.json에 직접 적용)
const filePath = './src/data/nikkes.json';
const rawData = fs.readFileSync(filePath, 'utf-8');
const nikkes = JSON.parse(rawData);

// 2. 별명이 있는 경우 text 값을 참조하여 image, sound 경로 생성
const updatedNikkes = nikkes.map(nikke => {
  if (nikke.aliases && nikke.aliases.length > 0) {
    const updatedAliases = nikke.aliases.map(alias => {
      // text가 null이나 빈 문자열이 아닐 때만 경로 덮어쓰기
      if (alias.text) {
        return {
          text: alias.text,
          image: `data/image/nikke-alt/${alias.text}.png`,
          sound: `data/audio/voice-alt/${alias.text}.mp3`
        };
      }
      return alias;
    });

    return { ...nikke, aliases: updatedAliases };
  }
  return nikke;
});

// 3. 수정된 내용을 다시 파일에 덮어쓰기
fs.writeFileSync(filePath, JSON.stringify(updatedNikkes, null, 2), 'utf-8');
console.log('✨ 별명(text)을 기준으로 image와 sound 경로가 성공적으로 일괄 업데이트되었습니다!');