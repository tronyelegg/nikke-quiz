const fs = require('fs');
const path = require('path');

// 경로 설정 (현재 프로젝트 구조에 맞게 설정됨)
const jsonPath = path.join(__dirname, 'src', 'data', 'nikkes.json');
const voiceDir = path.join(__dirname, 'public', 'data', 'audio', 'voice');

function mapVoices() {
  console.log("🔊 보이스 매핑 스크립트를 시작합니다...\n");

  // 1. 기존 JSON 데이터 읽기
  let nikkes;
  try {
    nikkes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error("❌ nikkes.json 파일을 읽을 수 없습니다. 경로를 확인해주세요.");
    return;
  }

  // 2. voice 폴더의 오디오 파일 목록 읽기
  let voiceFiles = [];
  try {
    voiceFiles = fs.readdirSync(voiceDir).filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));
  } catch (err) {
    console.error("❌ voice 폴더를 읽을 수 없습니다. (public/data/audio/voice 폴더가 있는지 확인해주세요)");
    return;
  }

  let matchCount = 0;

  // 3. 매칭 및 sound 속성 업데이트
  nikkes = nikkes.map(nikke => {
    // [매칭용 이름 정제 1] JSON 이름 (예: "앵커 : 이노센트 메이드" -> "앵커_이노센트메이드")
    // : 기호 주변의 공백을 포함해 _로 바꾸고, 남은 모든 공백을 제거
    const normalizedJsonName = nikke.name.replace(/\s*:\s*/g, '_').replace(/\s+/g, '');

    // [매칭용 이름 정제 2] 영문 이름 대비 (예: "Emma" -> "emma")
    const normalizedEnName = nikke.nameEn ? nikke.nameEn.replace(/\s+/g, '').toLowerCase() : '';

    // voice 폴더의 파일들과 비교
    const matchedFile = voiceFiles.find(file => {
      // 확장자를 제외한 파일명 추출 (예: "앵커_이노센트_메이드.mp3" -> "앵커_이노센트_메이드")
      const fileNameNoExt = path.parse(file).name;
      
      // 파일명 역시 공백을 모두 제거하여 비교 (예: "앵커_이노센트메이드")
      const normalizedFileName = fileNameNoExt.replace(/\s+/g, '');
      
      // 한국어 정제 이름과 같거나, 영문 소문자 이름과 같으면 매칭 성공!
      return normalizedFileName === normalizedJsonName || normalizedFileName.toLowerCase() === normalizedEnName;
    });

    if (matchedFile) {
      // 💡 매칭 성공 시 JSON의 sound 속성 업데이트
      nikke.sound = `data/audio/voice/${matchedFile}`;
      matchCount++;
      console.log(`✅ 매칭 성공: [${nikke.name}] ➔ ${matchedFile}`);
    } else {
      console.log(`⚠️ 매칭 실패: [${nikke.name}] 의 보이스 파일을 찾지 못했습니다.`);
    }

    return nikke;
  });

  // 4. 업데이트된 데이터를 nikkes.json에 덮어쓰기
  fs.writeFileSync(jsonPath, JSON.stringify(nikkes, null, 2), 'utf8');
  
  console.log(`\n🎉 완료! 총 ${nikkes.length}명의 니케 중 ${matchCount}명의 보이스 매칭 및 저장이 완료되었습니다.`);
}

mapVoices();