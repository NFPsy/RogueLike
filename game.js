import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    // 2. 플레이어 클래스에서 플레이어 스탯 (공격력, 체력 등) 관리하기
    this.hp = 100; // 초기 체력 100
    this.AP = 20; // 초기 공격력 20
  }

  attack(monster) {
    // 플레이어의 공격
    monster.hp -= this.AP;
    console.log(chalk.green(`몬스터에게 ${this.AP}의 피해를 입혔습니다.`));
  }
}

class Monster {
  // 5. 스테이지의 진행과 비례해서 몬스터의 체력과 공격력 증가 시키기
  constructor(stage) {
    this.hp = 100 + (stage - 1) * 10; // 초기 체력 100, 다음스테이지 : 초기 체력 + (스테이지 * 10)
    this.AP = 10 + (stage - 1) * 2; // 초기 공격력 10, 다음스테이지 : 초기 공격력 + (스테이지 * 2)
  }

  attack(player) {
    // 몬스터의 공격
    const damage = Math.floor(this.AP * (0.8 + Math.random() * 0.4));
    player.hp -= damage;
    return damage;
    // console.log(chalk.red(`몬스터가 ${damage}의 피해를 입혔습니다.`));
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| Plater HP : ${player.hp}, Attack : ${player.AP} `,
    ) +
    chalk.redBright(
      `| Monster HP : ${monster.hp}, Attack : ${monster.AP} |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}
// 배틀 비동기 함수
const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        // 1. 단순 행동 패턴 4가지 구현 (공격, 연속공격, 방어, 도망)
        `\n1. 공격한다 2. 연속 공격(30%) 3. 방어한다(70%) 4. 도망친다(10%).`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 사용자의 선택에 따라 다른 행동을 수행
    switch (choice) {
      case '1':
        // 플레이어가 몬스터를 공격
        player.attack(monster);
        logs.push(chalk.green(`몬스터에게 ${player.AP}의 피해를 입혔습니다.`));
        break;

      case '2':
        // 연속 공격 시도 (30% 확률로 성공)
        if (Math.random() < 0.3) {
          player.attack(monster);
          player.attack(monster);
          logs.push(chalk.green('플레이어가 연속 공격에 성공했습니다!'));
        } else {
          console.log(chalk.red('연속 공격에 실패했습니다.'));
          logs.push(chalk.red('연속 공격에 실패했습니다.'));
        }
        break;

      case '3':
        // 방어 시도 (50% 확률로 다음 몬스터의 공격 피해 50% 감소)
        if (Math.random() < 0.5) {
          console.log(chalk.blue('방어에 성공하여 다음 공격의 피해를 절반으로 줄였습니다!'));
          player.defense = true; // 방어 성공 시 플래그 설정
          logs.push(chalk.blue('방어에 성공했습니다.'));
        } else {
          console.log(chalk.red('방어에 실패했습니다.'));
          logs.push(chalk.red('방어에 실패했습니다.'));
        }
        break;

      case '4':
        // 도망 시도 (10% 확률로 성공)
        if (Math.random() < 0.3) {
          console.log(chalk.blue('플레이어가 도망쳤습니다.'));
          logs.push(chalk.blue('플레이어가 도망쳤습니다.'));
          return; // 도망치면 전투 종료 (패배로 간주)
        } else {
          console.log(chalk.red('도망에 실패했습니다.'));
          logs.push(chalk.red('도망에 실패했습니다.'));
        }
        break;

      default:
        // 잘못된 선택을 했을 때
        console.log(chalk.red('다시 선택하세요.'));
        logs.push(chalk.red('다시 선택하세요.'));
        continue; // 다시 입력을 받음
    }

    // 3. 간단한 전투 로직 구현(플레이어 공격, 몬스터 피격)
    // 몬스터가 살아있을 때
    if (monster.hp > 0) {
      const damage = monster.attack(player); // 실제 공격한 데미지 값을 반환
      logs.push(chalk.red(`몬스터가 ${damage}의 피해를 입혔습니다.`));

      // 방어에 성공한 경우
      if (player.defense) {
        const recoveredHP = Math.floor(damage / 2);
        player.hp += recoveredHP;
        player.defense = false;

        console.log(chalk.green(`방어에 성공하여 ${recoveredHP}의 HP를 회복했습니다.`));
        logs.push(chalk.green(`방어에 성공하여 ${recoveredHP}의 HP를 회복했습니다.`));
      }
    } else {
      console.log(chalk.yellow('몬스터를 처치했습니다')); // 몬스터가 죽었을 때
      logs.push(chalk.yellow('몬스터를 처치했습니다'));
      break; // 몬스터가 죽으면 전투 종료
    }
  };

  // 전투 종료 후, 플레이어가 죽었을 경우
  if (player.hp <= 0) {
    console.log(chalk.red('플레이어가 죽었습니다. 게임 오버!'));
    process.exit(0); // 게임 종료
  }
};
// 게임 시작(비동기 함수) server.js
export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);


    // 4. 스테이지 클리어 시 유저 체력 회복, 공격력 상승
    // 스테이지 클리어 및 게임 종료 조건
    if (player.hp > 0) {
      console.log(chalk.yellowBright(`스테이지 ${stage}를 클리어했습니다!`)); // 스테이지 클리어 메시지 출력
      player.hp += 40; // 체력 회복 (최대 체력 제한 없음)
      console.log(chalk.green(`플레이어의 체력이 회복되었습니다 : ${player.hp} HP`)); // 회복된 체력 출력
      // 공격력 증가
      player.AP += 5;
      console.log(chalk.green(`플레이어의 공격력이 증가했습니다 : ${player.AP} 공격력`));
    }

    stage++;
  }

  // 모든 스테이지를 클리어했을 때
  console.log(chalk.blueBright('축하합니다! 모든 스테이지를 클리어했습니다!'));
  process.exit(0); // 게임 종료
}