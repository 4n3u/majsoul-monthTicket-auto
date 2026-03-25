# majsoul-monthTicket-auto

> 경고: 이 프로젝트 사용으로 인해 발생하는 불이익, 계정 제재 등 모든 결과에 대한 책임은 이용자 본인에게 있습니다.

![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/89844790-9a47-40b7-8e65-ed07430f3917)
![image](https://github.com/4n3u/majsoul-monthTicket-auto/assets/167657823/720689fa-7237-4d85-8979-c3e768c7f1d9)

이 프로젝트는 GitHub Actions를 이용해 작혼에 자동으로 접속하여 출석 업적(8bit 리치 BGM)을 채우고 매일 운수 부적을 수령합니다.  
<br/>
## 사전 준비

1. 웹 브라우저로 작혼에 접속합니다.
2. `F12`를 눌러 개발자 도구를 연 뒤 `Network` 탭으로 이동합니다.
3. `login`을 검색한 뒤, xhr 또는 fetch 요청의 페이로드를 확인합니다.
4. 확인한 요청에서 `token`과 `uid` 값을 기록합니다.
<br/><br/>
## 설정 방법

1. 이 프로젝트를 GitHub에서 포크합니다.
2. 포크한 저장소에서 `Settings > Secrets and variables > Actions`로 이동합니다.
3. `New repository secret` 버튼을 눌러 `UID`라는 이름으로 앞서 기록한 `uid` 값을 저장합니다.
4. 동일하게 `TOKEN`이라는 이름으로 `token` 값을 저장합니다.
5. `Settings > Actions > General`로 이동해 `Workflow permissions`를 `Read and write permissions`로 변경합니다.
6. 기본 서버는 JP 서버입니다. EN 서버를 사용하려면 저장소 시크릿(또는 로컬 환경 변수)에 `MS_HOST=https://mahjongsoul.game.yo-star.com/` 값을 추가합니다.
7. 기본 실행 시각은 매일 KST 기준 오전 6시 05분입니다. 변경하려면 `.github/workflows/main.yml`의 `cron` 값을 수정합니다.
8. 저장소 상단 `Actions` 탭으로 이동해 `I understand my workflows, go ahead and enable them` 버튼을 눌러 워크플로를 활성화합니다.
9. 왼쪽 `Workflows` 목록에서 `Login to Majsoul`을 선택하고 `Enable workflow`를 눌러 워크플로를 켭니다.
<br/><br/>
## 테스트 방법

1. 브라우저에서 작혼 계정을 로그인 상태로 둡니다.
2. GitHub의 `Actions > Workflows`에서 `Run workflow`를 클릭해 수동 실행합니다.
3. 올바르게 동작하면 브라우저 세션이 서버에 의해 종료됩니다.
<br/><br/>
## 주의

- GitHub Actions는 서버 상황에 따라 최대 30분까지 지연될 수 있습니다.
- `token`과 `uid`는 외부에 노출되지 않도록 주의하세요.
