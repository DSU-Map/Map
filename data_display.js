/**
 * data_display.js
 * JSON 데이터를 읽어 식단표 HTML 영역에 동적으로 표시하는 스크립트 (오늘 날짜 검색 및 석식 제거됨)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. HTML에서 데이터가 들어갈 위치(<ul> 태그)를 가져옵니다.
    const lunchList = document.getElementById('lunch-menu-list');
    // 석식 리스트를 후식/기타 리스트로 변경
    const otherList = document.getElementById('other-menu-list'); 
    const dateHeader = document.getElementById('current-date');

    // 2. JSON 파일을 비동기적으로 가져오는 함수
    async function fetchMenuData() {
        try {
            // ✅ 경로 확인: restaurant_detail.HTML과 menu_data.json이 같은 위치에 있으므로 상대 경로 사용
            const response = await fetch('menu_data.json'); 
            
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
        // 📌 수정: 오늘 날짜를 YYYY-MM-DD 형식으로 가져옵니다.
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayDateString = `${yyyy}-${mm}-${dd}`; // 예: 2025-11-23
        
        // 📌 수정: JSON 배열에서 오늘 날짜와 일치하는 항목을 찾습니다.
        const todayMenu = data.find(item => item.date === todayDateString);

        if (!todayMenu) {
            lunchList.innerHTML = '<li>오늘의 식단 정보가 없습니다.</li>';
            otherList.innerHTML = ''; 
            if (dateHeader) {
                dateHeader.textContent = `${todayDateString} - 식단 없음`;
            }
            return;
        }

        // 📌 날짜 표시
        if (dateHeader) {
            dateHeader.textContent = `${todayDateString} (${todayMenu.location})`;
        }

        // 기존 목록 초기화
        lunchList.innerHTML = '';
        otherList.innerHTML = ''; // 후식/기타 목록 초기화

        // 4. 각 식사 종류별로 반복 처리
        todayMenu.meals.forEach(meal => {
            // 'menu' 문자열을 쉼표와 공백을 기준으로 분리하여 배열로 만듭니다.
            let menuItems = meal.menu
                .split(',')
                .map(item => item.trim()) // 공백 제거
                .filter(item => item.length > 1 && item !== '(' && item !== ')'); // 빈 문자열, 괄호 제거
            
            // 후식 메뉴에 '숭늉/식혜' 등이 포함되어 있다면 이를 하나의 항목으로 유지
            if (meal.type === '후식') {
                // 후식은 통째로 하나의 항목으로 취급하여 별도의 목록에 추가
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
            } else if ((meal.type === '석식' || meal.type === '후식') && otherList) {
                // 석식은 제거되었으므로, 주로 후식 메뉴가 이 컬럼에 표시됩니다.
                otherList.innerHTML += listHTML;
            }
        });
    }

    // 데이터 가져오기 시작
    fetchMenuData();
});
