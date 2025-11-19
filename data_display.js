/**
 * data_display.js
 * JSON 데이터를 읽어 식단표 HTML 영역에 동적으로 표시하는 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. HTML에서 데이터가 들어갈 위치(<ul> 태그)를 가져옵니다.
    const lunchList = document.getElementById('lunch-menu-list');
    const dinnerList = document.getElementById('dinner-menu-list');
    const dateHeader = document.getElementById('current-date');

    // 2. JSON 파일을 비동기적으로 가져오는 함수
    async function fetchMenuData() {
        try {
            // 프로젝트 폴더에 있는 JSON 파일 경로를 지정합니다.
            const response = await fetch('./menu_data.json'); 
            
            // HTTP 응답이 성공적인지 확인
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 데이터가 로드되면 표시 함수 호출
            displayMenu(data);
            
        } catch (error) {
            console.error('메뉴 데이터를 불러오는 중 오류 발생:', error);
            // 오류 메시지를 사용자에게 표시
            if (lunchList) {
                lunchList.innerHTML = '<li>식단표 정보를 불러올 수 없습니다.</li>';
            }
        }
    }

    // 3. 데이터를 HTML로 변환하여 삽입하는 함수
    function displayMenu(data) {
        // 현재는 JSON 배열의 첫 번째 항목(가장 빠른 날짜)만 표시한다고 가정합니다.
        const todayMenu = data[0]; 
        
        if (!todayMenu) {
            lunchList.innerHTML = '<li>오늘의 식단 정보가 없습니다.</li>';
            return;
        }

        // 📌 날짜 표시 (선택 사항)
        if (dateHeader) {
            dateHeader.textContent = `${todayMenu.date} (${todayMenu.location})`;
        }

        // 기존 목록 초기화
        lunchList.innerHTML = '';
        dinnerList.innerHTML = '';

        // 4. 각 식사 종류별로 반복 처리
        todayMenu.meals.forEach(meal => {
            // 'menu' 문자열을 쉼표와 공백을 기준으로 분리하여 배열로 만듭니다.
            let menuItems = meal.menu
                .split(',')
                .map(item => item.trim()) // 공백 제거
                .filter(item => item.length > 1 && item !== '(' && item !== ')'); // 빈 문자열, 괄호 제거
            
            // 후식 메뉴에 '숭늉/식혜' 등이 포함되어 있다면 이를 하나의 항목으로 유지
            if (meal.type === '후식') {
                // 후식은 중식/석식 컬럼에 합쳐서 표시한다고 가정합니다.
                menuItems = [meal.menu.replace(/[(),]/g, '').trim()];
            } else {
                // 첫 항목('월', '화' 등 요일)은 제거 (데이터에 이미 포함되어 있으므로)
                if (menuItems.length > 0 && menuItems[0].length <= 2) {
                    menuItems.shift(); 
                }
            }
            
            // HTML 문자열 생성
            const listHTML = menuItems.map(item => `<li>${item}</li>`).join('');

            // 5. 생성된 HTML을 올바른 위치에 삽입
            if (meal.type === '중식' && lunchList) {
                lunchList.innerHTML = listHTML;
            } else if ((meal.type === '석식' || meal.type === '후식') && dinnerList) {
                // 석식과 후식은 현재 HTML 구조상 같은 컬럼에 표시합니다.
                // 중복 방지를 위해 기존 석식/후식 목록에 추가합니다.
                dinnerList.innerHTML += listHTML;
            }
        });
    }

    // 데이터 가져오기 시작
    fetchMenuData();
});