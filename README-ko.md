# majsoul-monthTicket-auto
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

이 프로젝트는 작혼에서 출석 업적(8bit 리치 BGM)을 달성하고, 매일 운수대통 부적을 수령하기 위해 GitHub Actions를 사용하여 자동으로 로그인하는 기능을 제공합니다.  
이 프로젝트는 [mahjong_soul_api](https://github.com/MahjongRepository/mahjong_soul_api)를 기반으로 하고 있습니다.
<br/><br/>
## 사전 작업

1. 브라우저로 작혼에 접속합니다.
2. `F12`를 눌러 개발자 모드에 접근합니다.
3. `Network` 탭으로 이동한 후 `login`을 검색합니다.
4. 검색 결과에서 나온 xhr 또는 fetch 형식의 login 파일의 페이로드를 확인합니다.
5. 필요한 `token`과 `uid` 값을 메모해 두세요.
<br/><br/>
## 설정 방법

1. 이 프로젝트를 GitHub에서 포크하세요.
2. 포크한 프로젝트에서 `Settings > Secrets and variables > Actions`로 이동하세요.
3. `Repository secrets`에서 `New repository secret`을 클릭하세요.
4. `Name`에는 `UID`, `Secret`에는 사전 작업에서 메모해둔 `uid` 값을 입력하고 `Add secret`을 클릭하세요.
5. 새로운 Repository secret을 만들고 `Name`에는 `TOKEN`, `Secret`에는 사전 작업에서 메모해둔 `token` 값을 입력한 뒤 `Add secret`을 클릭하세요.
6. `Settings > Actions > General`로 이동하여 `Workflow permissions`를 `Read and write permissions`로 설정하세요.
7. 서버의 기본 위치는 JP 서버로 설정되어 있습니다. EN 서버로 변경하고 싶다면 `main.py`의 `MS_HOST` 값을 `https://mahjongsoul.game.yo-star.com/`로 수정하세요.
8. 기본 접속 시간은 한국 시간 기준 매일 오전 6시 5분으로 설정되어 있습니다. 변경하고 싶다면 `.github/workflows/main.yml`에서 `cron` 값을 수정하세요.
9. 상단의 `Actions` 탭으로 들어가 `I understand my workflows, go ahead and enable them` 버튼을 눌러 워크플로우를 활성화하세요.
10. 좌측 `Workflows`에서 `Login to Majsoul` 탭으로 접속해 `Enable workflow`를 클릭하세요.
<br/><br/>
## 테스트 방법

1. 브라우저를 통해 작혼에 접속하여 로그인합니다.
2. `Actions > Workflows` 탭에서 `Run workflow`를 누릅니다.
3. 정상적으로 작동되면 이중 접속으로 인해 브라우저의 작혼이 강제로 종료됩니다.
<br/><br/>
## 주의 사항

- GitHub Actions는 지정된 스케줄보다 최대 30분 정도 지연될 수 있습니다. 이는 GitHub의 서버 부하에 따라 달라질 수 있습니다.
- 타인에게 `token` 및 `uid`가 공개되지 않도록 주의해주세요.
- Github Action은 60일동안 저장소 업데이트가 없으면 워크플로우가 비활성화됩니다. Action에서 Enable workflow를 눌러 다시 활성화시켜 주세요.

  ![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/28e1c8c1-5f4b-4bd4-837a-2c19ae7d3eb5)

