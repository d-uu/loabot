const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Loabot is running!');
});
server.listen(process.env.PORT || 3000);


const { Client, GatewayIntentBits, EmbedBuilder, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 로스트아크 API 키
const LOSTARK_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAwMTg5NzAifQ.ex5Q2EtaPVznK3GCX51rCTEBOfKlx0V66XNO68LY2tyWgt0vqTIWKXAjh_IgZhGnJh8lR-9C_ttN5yXTA7NRdteMy55RgjSpoIh5lnjLZ_Zevv3YQGFVEOCIW7JKfSWqNKqavnFcnxAdwbA9_FciyyBe3uH-emJRYVshrMrMrCJjOrA7xNLX4bhAsI8KsgzHbXx2f6gYxkKob9iH3SQgMBaNb8G0WwGjFUkjkE7AYCge3QW9kvIKOikbPjsnKiqIu-iWNIeP3hbhB2Aa5d1A-ENj0866MkafgKd5sv7Qp-f6IpubKP2rxlB9TxHm-gFHgpO7lvIfkG_EoktFMB_77g';

client.once('ready', () => {
  console.log(`${client.user.tag}님이 로그인했습니다!`);
});

// 중복 없이 랜덤 아이템을 뽑는 헬퍼 함수
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 템레벨 문자열을 숫자로 변환하는 헬퍼 함수
const parseLvl = (lvlStr) => {
  if (!lvlStr) return 0;
  return parseFloat(String(lvlStr).replace(/,/g, '')) || 0;
};

// 💡 레이드 데이터 베이스 (골드 정산용)
const RAID_DATABASE = [
  { id: 'belga_night', minLvl: 1780, group: '벨가르딘', mode: '나이트메어', gold: 75000, boundRatio: 0 },
  { id: 'belga_hard', minLvl: 1770, group: '벨가르딘', mode: '하드', gold: 62000, boundRatio: 0 },
  { id: 'belga_norm', minLvl: 1750, group: '벨가르딘', mode: '노말/싱글', gold: 52000, boundRatio: 0 },
  
  { id: 'cathedral_3', minLvl: 1750, group: '지평의성당', mode: '3단계', gold: 50000, boundRatio: 1 },
  { id: 'cathedral_2', minLvl: 1720, group: '지평의성당', mode: '2단계', gold: 40000, boundRatio: 1 },
  { id: 'cathedral_1', minLvl: 1700, group: '지평의성당', mode: '1단계', gold: 30000, boundRatio: 1 },

  { id: 'serka_night', minLvl: 1740, group: '세르카', mode: '나이트메어', gold: 54000, boundRatio: 0 },
  { id: 'serka_hard', minLvl: 1730, group: '세르카', mode: '하드', gold: 44000, boundRatio: 0 },
  { id: 'serka_norm', minLvl: 1710, group: '세르카', mode: '노말/싱글', gold: 32000, boundRatio: 0.5 },

  { id: 'end_hard', minLvl: 1730, group: '종막', mode: '하드', gold: 48000, boundRatio: 1 },
  { id: 'end_norm', minLvl: 1710, group: '종막', mode: '노말/싱글', gold: 32000, boundRatio: 0.5 },

  { id: 'act4_hard', minLvl: 1720, group: '4막', mode: '하드', gold: 38000, boundRatio: 1 },
  { id: 'act4_norm', minLvl: 1700, group: '4막', mode: '노말/싱글', gold: 27000, boundRatio: 0.5 },

  { id: 'act3_hard', minLvl: 1700, group: '3막', mode: '하드', gold: 27000, boundRatio: 0.5 },
  { id: 'act3_norm', minLvl: 1680, group: '3막', mode: '노말/싱글', gold: 21000, boundRatio: 0.5 },

  { id: 'act2_hard', minLvl: 1690, group: '2막', mode: '하드', gold: 23000, boundRatio: 0.5 },
  { id: 'act2_norm', minLvl: 1670, group: '2막', mode: '노말/싱글', gold: 16500, boundRatio: 0.5 },

  { id: 'act1_hard', minLvl: 1680, group: '1막', mode: '하드', gold: 18000, boundRatio: 0.5 },
  { id: 'act1_norm', minLvl: 1660, group: '1막', mode: '노말/싱글', gold: 11500, boundRatio: 0.5 },

  { id: 'echidna_hard', minLvl: 1640, group: '에키드나', mode: '하드', gold: 7200, boundRatio: 0.5 },
  { id: 'echidna_norm', minLvl: 1620, group: '에키드나', mode: '노말/싱글', gold: 6100, boundRatio: 1 },

  { id: 'kamen_g4', minLvl: 1630, group: '카멘', mode: '4관', gold: 13000, boundRatio: 1 },
  { id: 'kamen_hard', minLvl: 1630, group: '카멘', mode: '하드', gold: 8000, boundRatio: 1 },
  { id: 'kamen_norm', minLvl: 1610, group: '카멘', mode: '노말/싱글', gold: 6400, boundRatio: 1 },

  { id: 'ivory_hard', minLvl: 1620, group: '상아탑', mode: '하드', gold: 7200, boundRatio: 1 },
  { id: 'ivory_norm', minLvl: 1600, group: '상아탑', mode: '노말/싱글', gold: 5200, boundRatio: 1 }
];

// 💡 레이드별 딜량 컷 데이터 베이스
const RAID_DMG_CUT_DATABASE = {
  '종막': {
    title: '종막 레이드 (익스트림 및 일반)',
    rows: [
      { category: '종막 익스 노말', gate: '2-1', gangtoo: '2,064억', janhyul: '2,751억', onePerson: '2,293억' },
      { category: '종막 익스 노말', gate: '2-3까지', gangtoo: '4,118억', janhyul: '5,191억', onePerson: '45,776억' },
      { category: '종막 익스 하드', gate: '2-1', gangtoo: '5,417억', janhyul: '7,223억', onePerson: '6,019억' },
      { category: '종막 익스 하드', gate: '2-3까지', gangtoo: '1조 365억', janhyul: '1조 3,821억', onePerson: '1조 1,517억' },
      { category: '종막 익스 나메', gate: '2-1 (1)', gangtoo: '1조 5,174억', janhyul: '2조 232억', onePerson: '1조 6,860억' },
      { category: '종막 익스 나메', gate: '2-1 (2)', gangtoo: '2조 8,102억', janhyul: '3조 7,469억', onePerson: '3조 1,224억' },
      { category: '종막 일반 노말', gate: '1관문', gangtoo: '1,186억', janhyul: '1,581억', onePerson: '1,318억' },
      { category: '종막 일반 노말', gate: '2관문', gangtoo: '1,074억', janhyul: '1,433억', onePerson: '1,194억' },
      { category: '종막 일반 하드', gate: '1관문', gangtoo: '2,015억', janhyul: '2,687억', onePerson: '2,239억' },
      { category: '종막 일반 하드', gate: '2관문', gangtoo: '3,477억', janhyul: '4,637억', onePerson: '3,864억' }
    ]
  },
  '벨가르딘': {
    title: '벨가르딘 레이드',
    rows: [
      { category: '노말', gate: '1관문', gangtoo: '2,609억', janhyul: '3,479억', onePerson: '2,899억' },
      { category: '노말', gate: '2관문', gangtoo: '2,926억', janhyul: '3,901억', onePerson: '3,251억' },
      { category: '하드', gate: '1관문', gangtoo: '4,153억', janhyul: '5,537억', onePerson: '4,614억' },
      { category: '하드', gate: '2관문', gangtoo: '4,701억', janhyul: '6,268억', onePerson: '5,223억' },
      { category: '나이트메어', gate: '1관문', gangtoo: '7,427억', janhyul: '9,903억', onePerson: '8,253억' },
      { category: '나이트메어', gate: '2관문', gangtoo: '8,408억', janhyul: '1조 1,210억', onePerson: '9,342억' }
    ]
  },
  '세르카': {
    title: '세르카 레이드',
    rows: [
      { category: '노말', gate: '1관문', gangtoo: '1,110억', janhyul: '1,480억', onePerson: '1,233억' },
      { category: '노말', gate: '2관문', gangtoo: '1,430억', janhyul: '1,907억', onePerson: '1,589억' },
      { category: '하드', gate: '1관문', gangtoo: '2,309억', janhyul: '3,078억', onePerson: '2,565억' },
      { category: '하드', gate: '2관문', gangtoo: '2,976억', janhyul: '3,968억', onePerson: '3,307억' },
      { category: '나이트메어', gate: '1관문', gangtoo: '3,582억', janhyul: '4,777억', onePerson: '3,980억' },
      { category: '나이트메어', gate: '2관문', gangtoo: '4,618억', janhyul: '6,157억', onePerson: '5,131억' }
    ]
  },
  '성당': {
    title: '지평의 성당 레이드',
    rows: [
      { category: '1단계', gate: '1관문', gangtoo: '994억', janhyul: '1,326억', onePerson: '1,105억' },
      { category: '1단계', gate: '2관문', gangtoo: '937억', janhyul: '1,250억', onePerson: '1,042억' },
      { category: '2단계', gate: '1관문', gangtoo: '2,161억', janhyul: '2,882억', onePerson: '2,401억' },
      { category: '2단계', gate: '2관문', gangtoo: '2,089억', janhyul: '2,786억', onePerson: '2,322억' },
      { category: '3단계', gate: '1관문', gangtoo: '3,649억', janhyul: '4,866억', onePerson: '4,055억' },
      { category: '3단계', gate: '2관문', gangtoo: '3,594억', janhyul: '4,792억', onePerson: '3,993억' }
    ]
  },
  '4막': {
    title: '4막 레이드',
    rows: [
      { category: '노말', gate: '1관문', gangtoo: '737억', janhyul: '982억', onePerson: '819억' },
      { category: '노말', gate: '2관문', gangtoo: '940억', janhyul: '1,254억', onePerson: '1,045억' },
      { category: '하드', gate: '1관문', gangtoo: '1,423억', janhyul: '1,898억', onePerson: '1,582억' },
      { category: '하드', gate: '2관문', gangtoo: '1,577억', janhyul: '2,103억', onePerson: '1,753억' }
    ]
  }
};

// 유저 메시지 세션 저장소
const userSessions = {};

function getDefaultSelectedRaidIds(itemLevel) {
  const possible = RAID_DATABASE.filter(r => itemLevel >= r.minLvl);
  let selected = [];
  for (const raid of possible) {
    if (!selected.some(r => r.group === raid.group)) {
      selected.push(raid);
      if (selected.length === 3) break;
    }
  }
  return selected.map(r => r.id);
}

function buildDashboardUI(session) {
  let totalTradableGold = 0;
  let totalBoundGold = 0;

  let reportText = `🪙 **[원정대 상위 6캐릭터 주간 골드 대시보드]** (${session.mainAccount} 계정)\n`;
  reportText += `💡 하단 버튼으로 캐릭터를 전환하고 레이드를 **ON/OFF**해 보세요!\n\`\`\`text\n`;

  session.top6.forEach((char, idx) => {
    const activeRaidIds = session.charStates[char.name] || [];
    const activeRaids = RAID_DATABASE.filter(r => activeRaidIds.includes(r.id));
    
    let charTotal = 0;

    activeRaids.forEach(r => {
      const bound = Math.round(r.gold * r.boundRatio);
      const tradable = r.gold - bound;
      
      totalBoundGold += bound;
      totalTradableGold += tradable;
      charTotal += r.gold;
    });

    const isSelectedChar = (char.name === session.activeCharName);
    const prefix = isSelectedChar ? '▶ ' : '  ';
    const namePad = char.name.padEnd(12, ' ');
    const classPad = char.className.padEnd(7, ' ');

    reportText += `${prefix}${idx + 1}. [${classPad}] ${namePad} | Lv.${char.itemLevel} (${activeRaids.length}/3 선택 - 총 ${charTotal.toLocaleString()} G)\n`;

    if (activeRaids.length === 0) {
      reportText += `     └ (선택된 레이드 없음 / 0 G)\n`;
    } else {
      activeRaids.forEach(r => {
        reportText += `     └ ${r.group} (${r.mode}) : ${r.gold.toLocaleString()} G\n`;
      });
    }
    reportText += `\n`;
  });

  const grandTotal = totalTradableGold + totalBoundGold;

  reportText += `--------------------------------------------------\n`;
  reportText += `💰 거래 가능 골드 총합 : ${totalTradableGold.toLocaleString()} G\n`;
  reportText += `🔒 귀속 골드 총합     : ${totalBoundGold.toLocaleString()} G\n`;
  reportText += `✨ 원정대 주간 최종 총합 : ${grandTotal.toLocaleString()} 골드\n`;
  reportText += `\`\`\``;

  const rows = [];
  const charRow1 = new ActionRowBuilder();
  session.top6.slice(0, 5).forEach((char, idx) => {
    charRow1.addComponents(
      new ButtonBuilder()
        .setCustomId(`tab_char_${idx}`)
        .setLabel(`${idx + 1}. ${char.name}`)
        .setStyle(char.name === session.activeCharName ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  });
  rows.push(charRow1);

  if (session.top6.length > 5) {
    const charRow2 = new ActionRowBuilder();
    const char = session.top6[5];
    charRow2.addComponents(
      new ButtonBuilder()
        .setCustomId(`tab_char_5`)
        .setLabel(`6. ${char.name}`)
        .setStyle(char.name === session.activeCharName ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
    rows.push(charRow2);
  }

  const activeChar = session.top6.find(c => c.name === session.activeCharName);
  if (activeChar) {
    const availableRaids = RAID_DATABASE.filter(r => activeChar.itemLevel >= r.minLvl);
    const activeRaidIds = session.charStates[activeChar.name] || [];

    let currentRaidRow = new ActionRowBuilder();
    let countInRow = 0;

    availableRaids.slice(0, 10).forEach((raid) => {
      const isON = activeRaidIds.includes(raid.id);
      
      if (countInRow === 5) {
        rows.push(currentRaidRow);
        currentRaidRow = new ActionRowBuilder();
        countInRow = 0;
      }

      currentRaidRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`toggle_raid_${raid.id}`)
          .setLabel(`${isON ? '✅' : '❌'} ${raid.group}(${raid.mode})`)
          .setStyle(isON ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );
      countInRow++;
    });

    if (countInRow > 0 && rows.length < 5) {
      rows.push(currentRaidRow);
    }
  }

  return { content: reportText, components: rows };
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 1. 자동차 경주 기능 (!경주)
  if (message.content.startsWith('!경주')) {
    const args = message.content.split(' ').slice(1);
    const racerNames = args.length > 0 ? args : ['1', '2', '3', '4'];
    const racers = racerNames.map(name => ({ name, pos: 0, emoji: '<:run:1566043396769054740>' }));
    const goal = 40;
    let msg = await message.channel.send('~경주중~\n자동차가 출발합니다!');

    const interval = setInterval(async () => {
      racers.forEach(racer => {
        if (racer.pos < goal) {
          racer.pos += Math.floor(Math.random() * 4) + 2;
          if (racer.pos > goal) racer.pos = goal;
        }
      });

      const crossedRacers = racers.filter(r => r.pos >= goal);
      let finished = crossedRacers.length > 0;
      let content = '~경주중~\n';
      racers.forEach(racer => {
        const codeBoxName = `\`${racer.name}\``;
        const namePadding = '\u00A0'.repeat(Math.max(0, 6 - racer.name.length));
        content += `${codeBoxName}${namePadding} : ${'\u00A0'.repeat(racer.pos)}${racer.emoji}${'\u00A0'.repeat(goal - racer.pos)}|\n`;
      });

      if (finished) {
        clearInterval(interval);
        const winner = crossedRacers[Math.floor(Math.random() * crossedRacers.length)];
        content += `\n🎉 경주 종료! 우승: **${winner.name}** 차량! 🏆`;
      }
      await msg.edit(content);
    }, 1000);
  }

  // 2. 식사 메뉴 추천 기능 (!메뉴)
  if (message.content === '!메뉴' || message.content.startsWith('!메뉴추천')) {
    const menus = ['김치찌개', '된장찌개', '부대찌개', '제육볶음', '삼겹살', '짜장면', '짬뽕', '마라탕', '초밥', '파스타', '치킨'];
    const randomMenu = menus[Math.floor(Math.random() * menus.length)];
    await message.channel.send(`🍽️ 오늘의 추천 식사 메뉴는 **${randomMenu}**입니다! 😋`);
  }

  // 3. 공대 조합기 (!공대)
  if (message.content.startsWith('!공대')) {
    const args = message.content.split(' ').slice(1);
    const partySize = parseInt(args[0]);
    const targetItemLevel = parseFloat(args[1]);
    const characterNames = args.slice(2);

    if (isNaN(partySize) || (partySize !== 4 && partySize !== 8) || isNaN(targetItemLevel)) {
      return message.channel.send('⚠️ **사용법:** `!공대 [인원수(4 또는 8)] [원하는템레벨] [닉네임들...]`');
    }

    if (characterNames.length < partySize) {
      return message.channel.send(`⚠️ 인원이 부족합니다! 최소 ${partySize}명의 닉네임을 적어주세요.`);
    }

    await message.channel.send(`🔍 ${characterNames.length}개 계정의 정보를 수집 중입니다...`);

    try {
      let allSupports = [];
      let allDealers = [];
      const supportClasses = ['바드', '홀리나이트', '도화가'];

      const promises = characterNames.map(async (charName) => {
        try {
          const res = await fetch(`https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(charName)}/siblings`, {
            headers: { 'accept': 'application/json', 'authorization': `bearer ${LOSTARK_API_KEY}` }
          });
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch (err) { return []; }
      });

      const results = await Promise.all(promises);

      results.forEach((siblings) => {
        siblings.forEach((c) => {
          if (!c) return;
          const lvlStr = c.ItemMaxLevel || c.ItemAvgLevel || '0';
          const itemLvl = parseLvl(lvlStr);
          if (itemLvl >= targetItemLevel) {
            const charInfo = { name: c.CharacterName, className: c.CharacterClassName, itemLevel: itemLvl };
            if (supportClasses.includes(c.CharacterClassName)) allSupports.push(charInfo);
            else allDealers.push(charInfo);
          }
        });
      });

      allSupports = Array.from(new Map(allSupports.map(item => [item.name, item])).values());
      allDealers = Array.from(new Map(allDealers.map(item => [item.name, item])).values());

      const reqSup = partySize === 8 ? 2 : 1;
      const reqDeal = partySize === 8 ? 6 : 3;

      if (allSupports.length < reqSup || allDealers.length < reqDeal) {
        return message.channel.send(`❌ 조건(Lv.${targetItemLevel} 이상)을 만족하는 서포터 또는 딜러가 부족합니다.`);
      }

      if (partySize === 4) {
        const support = getRandomItems(allSupports, 1)[0];
        const dealers = getRandomItems(allDealers, 3);
        const party = [
          { role: '서포터', ...support },
          { role: '딜러', ...dealers[0] }, { role: '딜러', ...dealers[1] }, { role: '딜러', ...dealers[2] }
        ].sort(() => Math.random() - 0.5);

        let resultText = `🛡️ **[로스트아크 4인 맞춤 파티 조합]** (Lv.${targetItemLevel}+)\n\`\`\`text\n`;
        party.forEach(p => { resultText += `[${p.role}]`.padEnd(6, ' ') + ` ${p.className.padEnd(7, ' ')} | Lv.${p.itemLevel} | ${p.name}\n`; });
        resultText += `\`\`\``;
        await message.channel.send(resultText);
      } else {
        const supports = getRandomItems(allSupports, 2);
        const dealers = getRandomItems(allDealers, 6);
        const p1 = [
          { role: '서포터', ...supports[0] }, { role: '딜러', ...dealers[0] }, { role: '딜러', ...dealers[1] }, { role: '딜러', ...dealers[2] }
        ].sort(() => Math.random() - 0.5);
        const p2 = [
          { role: '서포터', ...supports[1] }, { role: '딜러', ...dealers[3] }, { role: '딜러', ...dealers[4] }, { role: '딜러', ...dealers[5] }
        ].sort(() => Math.random() - 0.5);

        let resultText = `⚔️ **[로스트아크 8인 레이드 맞춤 조합]** (Lv.${targetItemLevel}+)\n\`\`\`text\n`;
        resultText += `--- [ 1 파티 ] ---\n`;
        p1.forEach(p => { resultText += `[${p.role}]`.padEnd(6, ' ') + ` ${p.className.padEnd(7, ' ')} | Lv.${p.itemLevel} | ${p.name}\n`; });
        resultText += `\n--- [ 2 파티 ] ---\n`;
        p2.forEach(p => { resultText += `[${p.role}]`.padEnd(6, ' ') + ` ${p.className.padEnd(7, ' ')} | Lv.${p.itemLevel} | ${p.name}\n`; });
        resultText += `\`\`\``;
        await message.channel.send(resultText);
      }
    } catch (error) {
      console.error(error);
      await message.channel.send('⚠️ 공대 조합 생성 중 오류가 발생했습니다.');
    }
  }

  // 4. 캐릭터 정보 상세 조회 (!정보)
  if (message.content.startsWith('!정보') || message.content.startsWith('!캐릭터')) {
    const args = message.content.split(' ').slice(1);
    const characterName = args[0];
    if (!characterName) return message.channel.send('⚠️ 조회할 캐릭터 이름을 입력해 주세요!');

    try {
      const profileRes = await fetch(`https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(characterName)}/profiles`, {
        headers: { 'accept': 'application/json', 'authorization': `bearer ${LOSTARK_API_KEY}` }
      });
      if (!profileRes.ok) return message.channel.send(`❌ 캐릭터 정보를 가져오지 못했습니다.`);
      const profile = await profileRes.json();
      if (!profile) return message.channel.send(`❌ 존재하지 않는 캐릭터입니다.`);

      const siblingsRes = await fetch(`https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(characterName)}/siblings`, {
        headers: { 'accept': 'application/json', 'authorization': `bearer ${LOSTARK_API_KEY}` }
      });

      let siblingsText = '부캐릭터 정보 없음';
      if (siblingsRes.ok) {
        const siblings = await siblingsRes.json();
        if (Array.isArray(siblings) && siblings.length > 0) {
          const getItemLvlStr = (c) => c.ItemMaxLevel || c.ItemAvgLevel || '0';
          const sortedSiblings = siblings
            .filter(c => c && c.CharacterName !== profile.CharacterName)
            .sort((a, b) => parseLvl(getItemLvlStr(b)) - parseLvl(getItemLvlStr(a)))
            .slice(0, 6);

          if (sortedSiblings.length > 0) {
            siblingsText = sortedSiblings
              .map(c => `• **${c.CharacterName}** (${c.CharacterClassName} / Lv.${getItemLvlStr(c)})`)
              .join('\n');
          } else {
            siblingsText = '등록된 부캐릭터가 없습니다.';
          }
        }
      }

      const itemLevel = profile.ItemMaxLevel || profile.ItemAvgLevel || '정보없음';
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`💎 [${profile.CharacterName}] 전투정보실 프로필`)
        .setDescription(`**서버:** ${profile.ServerName} | **길드:** ${profile.GuildName || '없음'}`)
        .addFields(
          { name: '⚔️ 직업', value: profile.CharacterClassName || '정보없음', inline: true },
          { name: '⭐ 아이템 레벨', value: `Lv.${itemLevel}`, inline: true },
          { name: '🎖️ 원정대 / 전투', value: `원정대 Lv.${profile.ExpeditionLevel || 0} / 전투 Lv.${profile.CharacterLevel || 0}`, inline: true },
          { name: '👥 주요 원정대 부캐릭터 (상위 6개)', value: siblingsText, inline: false }
        )
        .setFooter({ text: 'Lost Ark API' });

      if (profile.CharacterImage) embed.setImage(profile.CharacterImage);
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.channel.send('⚠️ 정보 조회 중 오류가 발생했습니다.');
    }
  }

  // 5. 제비뽑기 (!제비뽑기)
  if (message.content.startsWith('!제비뽑기')) {
    const args = message.content.split(' ').slice(1);
    const totalCount = parseInt(args[0]);
    const winCount = parseInt(args[1]);
    if (isNaN(totalCount) || isNaN(winCount) || totalCount <= 0 || winCount < 0) {
      return message.channel.send('⚠️ **사용법:** `!제비뽑기 [총 개수] [당첨 개수]`');
    }
    if (winCount > totalCount) return message.channel.send('❌ 당첨 개수는 총 개수보다 많을 수 없습니다!');
    if (totalCount > 50) return message.channel.send('⚠️ 제비는 한 번에 최대 50개까지만 생성할 수 있습니다!');

    let results = [];
    for (let i = 0; i < winCount; i++) results.push('<:yes:1566056954827374714>');
    for (let i = 0; i < (totalCount - winCount); i++) results.push('❌');
    results.sort(() => Math.random() - 0.5);

    let resultText = `🎲 **[제비뽑기 결과]** (총 ${totalCount}개 중 당첨 ${winCount}개)\n`;
    results.forEach((emoji, index) => { resultText += `제비 ${index + 1} : ${emoji}\n`; });
    await message.channel.send(resultText);
  }

  // 딜량 컷 조회 명령어 (!딜컷 [레이드이름])
  if (message.content.startsWith('!딜컷')) {
    const args = message.content.split(' ').slice(1);
    const raidName = args[0];

    if (!raidName) {
      const availableList = Object.keys(RAID_DMG_CUT_DATABASE).join(', ');
      return message.channel.send(`⚠️ **사용법:** \`!딜컷 [레이드이름]\`\n📌 **조회 가능:** ${availableList}`);
    }

    const cutData = RAID_DMG_CUT_DATABASE[raidName];
    if (!cutData) {
      return message.channel.send(`❌ **${raidName}**에 대한 딜량 컷 정보가 없습니다. (종류: 종막, 벨가르딘, 세르카, 성당, 4막)`);
    }

    let text = `⚔️ **[${cutData.title}]** 딜량 판정 기준표\n\`\`\`text\n`;
    cutData.rows.forEach(r => {
      text += `[${r.category} / ${r.gate}]\n`;
      text += ` 🔸 강투컷 : ${r.gangtoo}\n`;
      text += ` 🔸 잔혈컷 : ${r.janhyul}\n`;
      text += ` 🔸 1인분  : ${r.onePerson}\n`;
      text += `----------------------------------------\n`;
    });
    text += `\`\`\``;

    await message.channel.send(text);
  }

  
  // 6. 원정대 골드 대시보드 (!골드 [닉네임])
  if (message.content.startsWith('!골드')) {
    const args = message.content.split(' ').slice(1);
    const characterName = args[0];

    if (!characterName) {
      return message.channel.send('⚠️ **사용법:** `!골드 [본캐닉네임]` (예: `!골드 다니XD`)');
    }

    try {
      const res = await fetch(`https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(characterName)}/siblings`, {
        headers: { 'accept': 'application/json', 'authorization': `bearer ${LOSTARK_API_KEY}` }
      });

      if (!res.ok) return message.channel.send(`❌ 원정대 정보를 불러오지 못했습니다.`);
      const siblings = await res.json();
      if (!Array.isArray(siblings) || siblings.length === 0) return message.channel.send(`❌ 등록된 캐릭터가 없습니다.`);

      const top6 = siblings
        .filter(c => c && (c.ItemMaxLevel || c.ItemAvgLevel))
        .map(c => ({
          name: c.CharacterName,
          className: c.CharacterClassName,
          itemLevel: parseLvl(c.ItemMaxLevel || c.ItemAvgLevel)
        }))
        .sort((a, b) => b.itemLevel - a.itemLevel)
        .slice(0, 6);

      const msgId = Date.now().toString();
      userSessions[msgId] = {
        userId: message.author.id,
        mainAccount: characterName,
        top6: top6,
        activeCharName: top6[0].name,
        charStates: {}
      };

      top6.forEach(char => {
        userSessions[msgId].charStates[char.name] = getDefaultSelectedRaidIds(char.itemLevel);
      });

      const initialUI = buildDashboardUI(userSessions[msgId]);
      const sentMessage = await message.channel.send(initialUI);

      userSessions[sentMessage.id] = userSessions[msgId];
      delete userSessions[msgId];

    } catch (error) {
      console.error(error);
      await message.channel.send('⚠️ 골드 계산 중 오류가 발생했습니다.');
    }
  }
});

// 버튼 클릭 상호작용 처리 이벤트
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const msgId = interaction.message.id;
  const session = userSessions[msgId];

  if (!session) return interaction.deferUpdate();

  if (interaction.user.id !== session.userId) {
    return interaction.reply({ 
      content: '❌ 이 판넬을 조작할 권한이 없습니다! 본인이 직접 `!골드` 명령어를 입력해 주세요.', 
      ephemeral: true 
    });
  }

  const customId = interaction.customId;

  if (customId.startsWith('tab_char_')) {
    const charIndex = parseInt(customId.replace('tab_char_', ''));
    if (session.top6[charIndex]) {
      session.activeCharName = session.top6[charIndex].name;
    }
  }

  if (customId.startsWith('toggle_raid_')) {
    const raidId = customId.replace('toggle_raid_', '');
    const activeCharName = session.activeCharName;
    
    let currentRaidIds = session.charStates[activeCharName] || [];

    if (currentRaidIds.includes(raidId)) {
      currentRaidIds = currentRaidIds.filter(id => id !== raidId);
    } else {
      if (currentRaidIds.length < 3) {
        const targetRaid = RAID_DATABASE.find(r => r.id === raidId);
        if (targetRaid) {
          currentRaidIds = currentRaidIds.filter(id => {
            const existing = RAID_DATABASE.find(r => r.id === id);
            return existing && existing.group !== targetRaid.group;
          });
          currentRaidIds.push(raidId);
        }
      }
    }

    session.charStates[activeCharName] = currentRaidIds;
  }


  const updatedUI = buildDashboardUI(session);
  await interaction.update(updatedUI);
});

// 토큰을 직접 적는 대신 환경 변수나 빈 칸으로 변경
client.login(process.env.DISCORD_TOKEN);