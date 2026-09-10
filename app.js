// ==========================================
// 1. 상태 및 예시 프로그램 소스 정의
// ==========================================

const SEAT_ARRANGER_CODE = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>우당탕탕 학급 자리 배치도</title>
    <style>
        :root {
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --background: #f8fafc;
            --card-bg: #ffffff;
            --text: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --radius: 12px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: var(--background); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        header { margin-bottom: 20px; text-align: center; }
        h1 { color: var(--primary); font-size: 1.8rem; margin-bottom: 5px; }
        p { color: var(--text-muted); font-size: 0.9rem; }
        .container { display: grid; grid-template-columns: 300px 1fr; gap: 20px; width: 100%; max-width: 1100px; }
        .sidebar, .main-content { background: var(--card-bg); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--border); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }
        input[type="number"], textarea { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        input[type="number"]:focus, textarea:focus { border-color: var(--primary); }
        textarea { height: 180px; resize: vertical; }
        .grid-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        button { width: 100%; padding: 12px; background-color: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s, transform 0.1s; margin-bottom: 10px; }
        button:hover { background-color: var(--primary-hover); }
        button:active { transform: scale(0.98); }
        .btn-secondary { background-color: #e2e8f0; color: #475569; }
        .btn-secondary:hover { background-color: #cbd5e1; }
        .blackboard { background: #1e293b; color: white; text-align: center; padding: 10px; font-weight: bold; border-radius: 6px; margin-bottom: 25px; border: 4px solid #854d0e; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); font-size: 1.1rem; letter-spacing: 2px; }
        .seat-grid { display: grid; gap: 12px; justify-content: center; margin-bottom: 20px; }
        .seat { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 70px; font-weight: bold; font-size: 0.95rem; cursor: move; transition: all 0.2s; user-select: none; position: relative; }
        .seat.occupied { background: #e0e7ff; border: 2px solid #a5b4fc; color: #312e81; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.05); }
        .seat.occupied:hover { border-color: var(--primary); background: #eceeff; transform: translateY(-2px); }
        .seat-num { position: absolute; top: 4px; left: 6px; font-size: 0.65rem; color: var(--text-muted); font-weight: normal; }
        .drag-over { border: 2px dashed var(--primary) !important; background: #e0e7ff !important; transform: scale(1.05); }
        .legend { display: flex; gap: 15px; font-size: 0.8rem; color: var(--text-muted); justify-content: center; margin-top: 10px; }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .legend-color { width: 12px; height: 12px; border-radius: 3px; }
        @media (max-width: 768px) { .container { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header>
        <h1>🪑 오늘의 우리 반 자리 배치도</h1>
        <p>인원과 학생 이름을 입력하고 자리를 배치해 보세요. 드래그해서 자리를 바꿀 수 있습니다.</p>
    </header>
    <div class="container">
        <div class="sidebar">
            <div class="form-group">
                <label>교실 크기 설정</label>
                <div class="grid-inputs">
                    <div>
                        <label for="rows" style="font-size: 0.75rem; margin-top: 2px;">가로 줄 (행)</label>
                        <input type="number" id="rows" value="5" min="1" max="10">
                    </div>
                    <div>
                        <label for="cols" style="font-size: 0.75rem; margin-top: 2px;">세로 줄 (열)</label>
                        <input type="number" id="cols" value="6" min="1" max="10">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="studentList">학생 명단 입력 (줄바꿈 또는 쉼표 구분)</label>
                <textarea id="studentList" placeholder="김철수&#10;이영희&#10;..."></textarea>
            </div>
            <button id="btnArrange">🎲 무작위 자리 배치</button>
            <button id="btnReset" class="btn-secondary">🗑️ 전체 초기화</button>
        </div>
        <div class="main-content">
            <div class="blackboard">칠 판 (교탁 방향)</div>
            <div id="seatGrid" class="seat-grid"></div>
            <div class="legend">
                <div class="legend-item">
                    <span class="legend-color" style="background: #e0e7ff; border: 1px solid #a5b4fc;"></span>
                    <span>배치된 자리</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #f1f5f9; border: 1px dashed #cbd5e1;"></span>
                    <span>빈 자리</span>
                </div>
                <div class="legend-item">
                    <span>💡 마우스로 드래그하여 자리를 교환할 수 있습니다.</span>
                </div>
            </div>
        </div>
    </div>
    <script>
        const STORAGE_KEY = 'vibe_seat_students';
        const STORAGE_GRID = 'vibe_seat_grid';
        const rowsInput = document.getElementById('rows');
        const colsInput = document.getElementById('cols');
        const studentListText = document.getElementById('studentList');
        const btnArrange = document.getElementById('btnArrange');
        const btnReset = document.getElementById('btnReset');
        const seatGrid = document.getElementById('seatGrid');
        let students = [];
        let seatAssignments = [];
        window.addEventListener('load', () => {
            const savedStudents = localStorage.getItem(STORAGE_KEY);
            const savedGrid = localStorage.getItem(STORAGE_GRID);
            if (savedStudents) {
                studentListText.value = savedStudents;
            } else {
                studentListText.value = "강민준, 고은아, 김도현, 김민지, 김서연, 김우빈, 김지아, 김현우, 박서준, 박소율, 박예준, 박지민, 배수아, 서지훈, 신민서, 오지민, 유재석, 윤도현, 이서윤, 이준우, 이지아, 이채원, 장우진, 정민서, 조은우, 최서준, 최아윤, 한지민, 황민우";
            }
            if (savedGrid) {
                const gridData = JSON.parse(savedGrid);
                rowsInput.value = gridData.rows || 5;
                colsInput.value = gridData.cols || 6;
                seatAssignments = gridData.assignments || [];
                renderGrid();
            } else {
                generateEmptyGrid();
            }
        });
        rowsInput.addEventListener('change', generateEmptyGrid);
        colsInput.addEventListener('change', generateEmptyGrid);
        function parseStudents() {
            const rawText = studentListText.value;
            localStorage.setItem(STORAGE_KEY, rawText);
            return rawText.split(/[\\n,]+/).map(name => name.trim()).filter(name => name.length > 0);
        }
        function generateEmptyGrid() {
            const rows = parseInt(rowsInput.value) || 5;
            const cols = parseInt(colsInput.value) || 6;
            const totalSeats = rows * cols;
            seatAssignments = Array(totalSeats).fill("");
            renderGrid();
            saveGridState();
        }
        function renderGrid() {
            const rows = parseInt(rowsInput.value) || 5;
            const cols = parseInt(colsInput.value) || 6;
            seatGrid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
            seatGrid.innerHTML = "";
            seatAssignments.forEach((studentName, index) => {
                const seatDiv = document.createElement('div');
                seatDiv.classList.add('seat');
                seatDiv.dataset.index = index;
                const rowNum = Math.floor(index / cols) + 1;
                const colNum = (index % cols) + 1;
                const numSpan = document.createElement('span');
                numSpan.classList.add('seat-num');
                numSpan.textContent = rowNum + '-' + colNum;
                seatDiv.appendChild(numSpan);
                if (studentName) {
                    seatDiv.classList.add('occupied');
                    seatDiv.setAttribute('draggable', 'true');
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = studentName;
                    seatDiv.appendChild(nameSpan);
                }
                setupDragAndDrop(seatDiv);
                seatGrid.appendChild(seatDiv);
            });
        }
        btnArrange.addEventListener('click', () => {
            students = parseStudents();
            if (students.length === 0) {
                alert("학생 이름을 먼저 입력해 주세요!");
                return;
            }
            const rows = parseInt(rowsInput.value) || 5;
            const cols = parseInt(colsInput.value) || 6;
            const totalSeats = rows * cols;
            if (students.length > totalSeats) {
                alert("학생 수가 자리 수보다 많습니다. 교실 크기를 늘려주세요!");
                return;
            }
            const shuffledStudents = [...students];
            for (let i = shuffledStudents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
            }
            seatAssignments = Array(totalSeats).fill("");
            shuffledStudents.forEach((student, index) => {
                seatAssignments[index] = student;
            });
            renderGrid();
            saveGridState();
        });
        btnReset.addEventListener('click', () => {
            if (confirm("자리와 명단을 모두 초기화하시겠습니까?")) {
                studentListText.value = "";
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(STORAGE_GRID);
                generateEmptyGrid();
            }
        });
        function saveGridState() {
            const gridData = {
                rows: parseInt(rowsInput.value),
                cols: parseInt(colsInput.value),
                assignments: seatAssignments
            };
            localStorage.setItem(STORAGE_GRID, JSON.stringify(gridData));
        }
        let draggedElement = null;
        function setupDragAndDrop(element) {
            element.addEventListener('dragstart', (e) => {
                if (!element.classList.contains('occupied')) {
                    e.preventDefault();
                    return;
                }
                draggedElement = element;
                element.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', element.dataset.index);
            });
            element.addEventListener('dragend', () => {
                if (draggedElement) draggedElement.style.opacity = '1';
                document.querySelectorAll('.seat').forEach(s => s.classList.remove('drag-over'));
                draggedElement = null;
            });
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (element !== draggedElement) element.classList.add('drag-over');
            });
            element.addEventListener('dragleave', () => {
                element.classList.remove('drag-over');
            });
            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.classList.remove('drag-over');
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = parseInt(element.dataset.index);
                if (fromIndex === toIndex) return;
                const temp = seatAssignments[fromIndex];
                seatAssignments[fromIndex] = seatAssignments[toIndex];
                seatAssignments[toIndex] = temp;
                renderGrid();
                saveGridState();
            });
        }
    </script>
</body>
</html>`;

const ROULETTE_PICKER_CODE = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>반짝반짝 모둠 구성 & 발표자 추첨기</title>
    <style>
        :root {
            --primary: #ec4899;
            --primary-hover: #db2777;
            --secondary: #8b5cf6;
            --secondary-hover: #7c3aed;
            --background: #faf5ff;
            --card-bg: #ffffff;
            --text: #1e1b4b;
            --text-muted: #4f46e5;
            --border: #f3e8ff;
            --shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.1);
            --radius: 16px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, sans-serif; }
        body { background-color: var(--background); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        header { margin-bottom: 25px; text-align: center; }
        h1 { color: var(--secondary); font-size: 2rem; margin-bottom: 8px; background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { color: #6b7280; font-size: 0.95rem; }
        .container { display: grid; grid-template-columns: 320px 1fr; gap: 25px; width: 100%; max-width: 1100px; }
        .sidebar, .main-content { background: var(--card-bg); border-radius: var(--radius); padding: 25px; box-shadow: var(--shadow); border: 1px solid var(--border); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #4b5563; }
        textarea { width: 100%; height: 180px; padding: 12px; border: 2px solid var(--border); border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; resize: vertical; }
        textarea:focus { border-color: var(--secondary); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
        .tab-btn { padding: 10px 20px; background: none; border: none; font-weight: bold; font-size: 1rem; color: #9ca3af; cursor: pointer; position: relative; transition: color 0.2s; }
        .tab-btn.active { color: var(--secondary); }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 100%; height: 3px; background-color: var(--secondary); border-radius: 3px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .roulette-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0; }
        .roulette-wrapper { position: relative; width: 320px; height: 320px; margin-bottom: 25px; }
        #wheel { border-radius: 50%; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .pointer { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 30px solid var(--primary); z-index: 10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        button { width: 100%; padding: 12px; background-color: var(--secondary); color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2); }
        button:hover { background-color: var(--secondary-hover); transform: translateY(-1px); }
        .btn-pink { background-color: var(--primary); box-shadow: 0 4px 6px rgba(236, 72, 153, 0.2); }
        .btn-pink:hover { background-color: var(--primary-hover); }
        .group-config { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; background: var(--background); padding: 15px; border-radius: 10px; }
        .group-config input { width: 70px; padding: 8px; border: 2px solid var(--border); border-radius: 6px; text-align: center; font-weight: bold; font-size: 1rem; }
        .group-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
        .group-card { background: #faf5ff; border: 2px solid var(--border); border-radius: 12px; padding: 15px; transition: transform 0.2s; }
        .group-card:hover { transform: scale(1.02); border-color: #d8b4fe; }
        .group-card h3 { color: var(--secondary); font-size: 1.1rem; border-bottom: 2px solid var(--border); padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; }
        .group-members { list-style: none; font-size: 0.95rem; }
        .group-members li { padding: 6px 8px; background: white; margin-bottom: 5px; border-radius: 6px; border: 1px solid #f3f4f6; display: flex; justify-content: space-between; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); z-index: 100; justify-content: center; align-items: center; }
        .modal-content { background: white; border-radius: var(--radius); padding: 40px; text-align: center; max-width: 450px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; border: 3px solid var(--primary); }
        @keyframes popUp { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .modal h2 { font-size: 1.5rem; color: var(--secondary); margin-bottom: 10px; }
        .winner-name { font-size: 3rem; font-weight: 900; color: var(--primary); margin: 20px 0; letter-spacing: 2px; animation: pulse 1s infinite alternate; }
        @keyframes pulse { 0% { transform: scale(1); text-shadow: 0 0 10px rgba(236,72,153,0.3); } 100% { transform: scale(1.1); text-shadow: 0 0 25px rgba(236,72,153,0.6); } }
        #confetti { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 101; }
        @media (max-width: 768px) { .container { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header>
        <h1>🎉 반짝반짝 모둠 구성 & 룰렛 추첨기</h1>
        <p>명단을 입력하고 랜덤 모둠을 구성하거나, 룰렛을 돌려 발표자를 선정해 보세요!</p>
    </header>
    <div class="container">
        <div class="sidebar">
            <div class="form-group">
                <label for="studentList">학생 명단 입력 (쉼표 또는 줄바꿈)</label>
                <textarea id="studentList" placeholder="김철수&#10;이영희..."></textarea>
            </div>
            <p style="font-size: 0.8rem; color:#6b7280;">* 이름은 브라우저에 자동 저장됩니다.</p>
        </div>
        <div class="main-content">
            <div class="tabs">
                <button class="tab-btn active" id="btnTabPicker">🎯 룰렛 발표자 추첨</button>
                <button class="tab-btn" id="btnTabGroups">👥 랜덤 모둠 구성</button>
            </div>
            <div id="tab-picker" class="tab-content active">
                <div class="roulette-container">
                    <div class="roulette-wrapper">
                        <div class="pointer"></div>
                        <canvas id="wheel" width="320" height="320"></canvas>
                    </div>
                    <button id="btnSpin" class="btn-pink" style="max-width: 250px;">🎲 룰렛 돌리기</button>
                </div>
            </div>
            <div id="tab-groups" class="tab-content">
                <div class="group-config">
                    <label style="margin-bottom:0; font-weight:bold;">만들고자 하는 모둠 수 :</label>
                    <input type="number" id="groupCount" value="4" min="2" max="20">
                    <span style="color: #6b7280; font-size: 0.9rem;">개 모둠</span>
                    <button id="btnCreateGroups" style="margin-left:auto; width:auto; padding:8px 20px;">👥 모둠 생성하기</button>
                </div>
                <div id="groupGrid" class="group-grid"></div>
            </div>
        </div>
    </div>
    <div id="winnerModal" class="modal">
        <div class="modal-content">
            <h2>🎉 오늘의 발표 주인공 🎉</h2>
            <div id="winnerName" class="winner-name">홍길동</div>
            <p style="color:#6b7280;">멋진 발표를 기대합니다!</p>
            <button id="btnCloseModal">축하합니다! 👏</button>
        </div>
    </div>
    <canvas id="confetti"></canvas>
    <script>
        const STORAGE_KEY = 'vibe_picker_students';
        const studentListText = document.getElementById('studentList');
        const wheel = document.getElementById('wheel');
        const ctx = wheel.getContext('2d');
        const btnSpin = document.getElementById('btnSpin');
        const winnerModal = document.getElementById('winnerModal');
        const winnerNameDiv = document.getElementById('winnerName');
        const groupCountInput = document.getElementById('groupCount');
        const btnCreateGroups = document.getElementById('btnCreateGroups');
        const groupGrid = document.getElementById('groupGrid');
        const btnCloseModal = document.getElementById('btnCloseModal');
        const btnTabPicker = document.getElementById('btnTabPicker');
        const btnTabGroups = document.getElementById('btnTabGroups');
        let students = [];
        let startAngle = 0;
        let arc = 0;
        let spinTimeout = null;
        let spinAngleStart = 10;
        let spinTime = 0;
        let spinTimeTotal = 0;
        const colors = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#818cf8", "#a78bfa", "#f472b6"];
        window.addEventListener('load', () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                studentListText.value = saved;
            } else {
                studentListText.value = "강민준, 고은아, 김도현, 김민지, 김서연, 김우빈, 김지아, 김현우, 박서준, 박소율, 박예준, 박지민, 배수아, 서지훈, 신민서";
            }
            updateStudents();
            drawWheel();
        });
        studentListText.addEventListener('input', () => {
            localStorage.setItem(STORAGE_KEY, studentListText.value);
            updateStudents();
            drawWheel();
        });
        function updateStudents() {
            students = studentListText.value.split(/[\\n,]+/).map(name => name.trim()).filter(name => name.length > 0);
            arc = Math.PI / (students.length / 2);
        }
        function switchTab(tab) {
            btnTabPicker.classList.remove('active');
            btnTabGroups.classList.remove('active');
            document.getElementById('tab-picker').classList.remove('active');
            document.getElementById('tab-groups').classList.remove('active');
            if (tab === 'picker') {
                btnTabPicker.classList.add('active');
                document.getElementById('tab-picker').classList.add('active');
                drawWheel();
            } else {
                btnTabGroups.classList.add('active');
                document.getElementById('tab-groups').classList.add('active');
            }
        }
        btnTabPicker.addEventListener('click', () => switchTab('picker'));
        btnTabGroups.addEventListener('click', () => switchTab('groups'));
        function drawWheel() {
            if (students.length === 0) {
                ctx.clearRect(0, 0, 320, 320);
                ctx.fillStyle = "#cbd5e1";
                ctx.font = "bold 16px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("이름을 입력해 주세요", 160, 160);
                return;
            }
            ctx.clearRect(0, 0, 320, 320);
            const outsideRadius = 150;
            const textRadius = 110;
            const insideRadius = 40;
            for(let i = 0; i < students.length; i++) {
                const angle = startAngle + i * arc;
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.arc(160, 160, outsideRadius, angle, angle + arc, false);
                ctx.arc(160, 160, insideRadius, angle + arc, angle, true);
                ctx.stroke();
                ctx.fill();
                ctx.save();
                ctx.fillStyle = "white";
                ctx.font = "bold 13px sans-serif";
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 4;
                ctx.translate(160 + Math.cos(angle + arc / 2) * textRadius, 160 + Math.sin(angle + arc / 2) * textRadius);
                ctx.rotate(angle + arc / 2 + Math.PI / 2);
                const text = students[i];
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
                ctx.restore();
            }
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(160, 160, 35, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.strokeStyle = "#8b5cf6";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = "#8b5cf6";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PICK", 160, 164);
        }
        btnSpin.addEventListener('click', () => {
            if (students.length === 0) return;
            spinAngleStart = Math.random() * 10 + 10;
            spinTime = 0;
            spinTimeTotal = Math.random() * 3000 + 4000;
            rotateWheel();
        });
        function rotateWheel() {
            spinTime += 30;
            if(spinTime >= spinTimeTotal) {
                stopRotateWheel();
                return;
            }
            const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
            startAngle += (spinAngle * Math.PI / 180);
            drawWheel();
            spinTimeout = setTimeout(rotateWheel, 30);
        }
        function stopRotateWheel() {
            clearTimeout(spinTimeout);
            const degrees = startAngle * 180 / Math.PI + 90;
            const arcd = arc * 180 / Math.PI;
            const index = Math.floor((360 - (degrees % 360)) / arcd);
            const winner = students[index];
            winnerNameDiv.textContent = winner;
            winnerModal.style.display = 'flex';
            try {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance("오늘의 주인공은 " + winner + " 학생입니다!");
                    utterance.lang = 'ko-KR';
                    window.speechSynthesis.speak(utterance);
                }
            } catch(e) {}
            startConfetti();
        }
        function easeOut(t, b, c, d) {
            const ts = (t /= d) * t;
            const tc = ts * t;
            return b + c * (tc + -3 * ts + 3 * t);
        }
        btnCloseModal.addEventListener('click', () => {
            winnerModal.style.display = 'none';
            stopConfetti();
        });
        btnCreateGroups.addEventListener('click', () => {
            if (students.length === 0) {
                alert("학생 명단을 먼저 입력해 주세요!");
                return;
            }
            const numGroups = parseInt(groupCountInput.value) || 4;
            if (numGroups <= 1) {
                alert("모둠 수는 최소 2개 이상이어야 합니다.");
                return;
            }
            const list = [...students];
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            const groups = Array.from({ length: numGroups }, () => []);
            list.forEach((student, index) => {
                groups[index % numGroups].push(student);
            });
            groupGrid.innerHTML = "";
            groups.forEach((group, index) => {
                const card = document.createElement('div');
                card.classList.add('group-card');
                const title = document.createElement('h3');
                title.innerHTML = '<span>👥 모둠 ' + (index + 1) + '</span> <span style="font-size:0.8rem; color:#9ca3af;">' + group.length + '명</span>';
                card.appendChild(title);
                const memberList = document.createElement('ul');
                memberList.classList.add('group-members');
                group.forEach((member, mIdx) => {
                    const li = document.createElement('li');
                    li.innerHTML = '<span>' + member + '</span> <span style="color:#e2e8f0; font-size:0.75rem;">' + (mIdx + 1) + '</span>';
                    memberList.appendChild(li);
                });
                card.appendChild(memberList);
                groupGrid.appendChild(card);
            });
        });
        const confettiCanvas = document.getElementById('confetti');
        const cCtx = confettiCanvas.getContext('2d');
        let confettiActive = false;
        let particles = [];
        function resizeConfetti() {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeConfetti);
        class ConfettiParticle {
            constructor() {
                this.x = Math.random() * confettiCanvas.width;
                this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
                this.r = Math.random() * 6 + 4;
                this.d = Math.random() * confettiCanvas.height;
                this.color = 'hsl(' + (Math.random() * 360) + ', 100%, 60%)';
                this.tilt = Math.random() * 10 - 5;
                this.tiltAngleIncremental = Math.random() * 0.07 + 0.02;
                this.tiltAngle = 0;
            }
            update() {
                this.tiltAngle += this.tiltAngleIncremental;
                this.y += (Math.cos(this.tiltAngle) + 3 + this.r / 2) / 2;
                this.x += Math.sin(this.tiltAngle);
                this.tilt = Math.sin(this.tiltAngle - this.r / 2) * 5;
                return this.y > confettiCanvas.height;
            }
            draw() {
                cCtx.beginPath();
                cCtx.lineWidth = this.r;
                cCtx.strokeStyle = this.color;
                cCtx.moveTo(this.x + this.tilt + this.r / 2, this.y);
                cCtx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 2);
                cCtx.stroke();
            }
        }
        function startConfetti() {
            resizeConfetti();
            confettiCanvas.style.display = 'block';
            confettiActive = true;
            particles = Array.from({ length: 150 }, () => new ConfettiParticle());
            animateConfetti();
        }
        function stopConfetti() {
            confettiActive = false;
            confettiCanvas.style.display = 'none';
        }
        function animateConfetti() {
            if (!confettiActive) return;
            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            particles.forEach((p, idx) => {
                p.draw();
                const isOut = p.update();
                if (isOut) {
                    particles[idx] = new ConfettiParticle();
                    particles[idx].y = -10;
                }
            });
            requestAnimationFrame(animateConfetti);
        }
    </script>
</body>
</html>`;

const CLASS_BOARD_CODE = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>오늘의 학급 안내판 & 타이머</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #38bdf8;
            --primary-glow: rgba(56, 189, 248, 0.4);
            --accent: #34d399;
            --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .light-theme {
            --bg-color: #f1f5f9;
            --card-bg: rgba(255, 255, 255, 0.85);
            --border-color: rgba(0, 0, 0, 0.06);
            --text-color: #0f172a;
            --text-muted: #475569;
            --primary: #0284c7;
            --primary-glow: rgba(2, 132, 199, 0.2);
            --accent: #16a34a;
            --shadow: 0 8px 32px 0 rgba(148, 163, 184, 0.15);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; transition: background-color 0.3s, color 0.3s, border-color 0.3s; }
        body { background-color: var(--bg-color); color: var(--text-color); min-height: 100vh; padding: 20px; display: flex; flex-direction: column; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
        .header-title h1 { font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .theme-toggle { background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-color); padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 0.85rem; box-shadow: var(--shadow); }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; flex: 1; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .card { background: var(--card-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; box-shadow: var(--shadow); display: flex; flex-direction: column; }
        .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 15px; color: var(--primary); display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
        .timer-widget { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0; }
        .digital-clock { font-size: 1.5rem; font-weight: bold; color: var(--accent); margin-bottom: 15px; letter-spacing: 1px; }
        .timer-display { font-size: 4.5rem; font-weight: 800; font-family: monospace; margin: 10px 0; text-shadow: 0 0 15px var(--primary-glow); letter-spacing: -2px; }
        .timer-controls { display: flex; gap: 10px; width: 100%; max-width: 300px; margin-bottom: 15px; }
        .timer-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; background-color: var(--primary); color: white; }
        .timer-btn.btn-stop { background-color: #ef4444; }
        .timer-btn.btn-reset { background-color: #64748b; }
        .timer-presets { display: flex; gap: 8px; }
        .preset-btn { padding: 6px 12px; background: transparent; border: 1px solid var(--border-color); color: var(--text-color); border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .preset-btn:hover { border-color: var(--primary); color: var(--primary); }
        .timetable-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        .timetable-table th, .timetable-table td { padding: 10px; text-align: center; border-bottom: 1px solid var(--border-color); }
        .timetable-table th { color: var(--text-muted); font-weight: 600; }
        .timetable-table td input { width: 100%; background: transparent; border: none; color: var(--text-color); text-align: center; font-weight: bold; font-size: 0.95rem; outline: none; border-radius: 4px; padding: 4px; }
        .timetable-table td input:focus { background: rgba(56, 189, 248, 0.1); }
        .notice-list { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .notice-item { display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.03); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); }
        .notice-checkbox { width: 18px; height: 18px; cursor: pointer; }
        .notice-input { flex: 1; background: transparent; border: none; color: var(--text-color); font-size: 0.95rem; outline: none; }
        .info-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
        .info-block { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; }
        .info-block h4 { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; display: flex; justify-content: space-between; }
        .info-block textarea { width: 100%; height: 60px; background: transparent; border: none; color: var(--text-color); resize: none; outline: none; font-size: 0.9rem; line-height: 1.4; }
        .info-block textarea:focus { background: rgba(255, 255, 255, 0.05); }
    </style>
</head>
<body>
    <header>
        <div class="header-title">
            <h1 id="titleText">📅 오늘의 우리 반 안내판</h1>
        </div>
        <button class="theme-toggle" id="btnThemeToggle">☀️ 라이트 모드</button>
    </header>
    <div class="dashboard-grid">
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="card">
                <div class="card-title">🕒 실시간 집중 타이머</div>
                <div class="timer-widget">
                    <div class="digital-clock" id="currentClock">12:00:00 PM</div>
                    <div class="timer-display" id="timerDisplay">20:00</div>
                    <div class="timer-controls">
                        <button class="timer-btn" id="btnTimerStart">시작</button>
                        <button class="timer-btn btn-stop" id="btnTimerStop" style="display:none;">정지</button>
                        <button class="timer-btn btn-reset" id="btnTimerReset">리셋</button>
                    </div>
                    <div class="timer-presets">
                        <button class="preset-btn" data-time="300">5분</button>
                        <button class="preset-btn" data-time="600">10분</button>
                        <button class="preset-btn" data-time="1200">20분</button>
                        <button class="preset-btn" data-time="1800">30분</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-title">📚 오늘의 시간표</div>
                <table class="timetable-table">
                    <thead>
                        <tr>
                            <th style="width:20%;">교시</th>
                            <th style="width:50%;">교과명</th>
                            <th style="width:30%;">준비물</th>
                        </tr>
                    </thead>
                    <tbody id="timetableBody"></tbody>
                </table>
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="card" style="flex: 1;">
                <div class="card-title">📝 오늘의 알림장 (체크리스트)</div>
                <ul class="notice-list" id="noticeList"></ul>
                <button id="btnAddNotice" class="preset-btn" style="margin-top: 15px; width: auto; align-self: flex-start; padding: 6px 15px;">+ 알림 추가</button>
            </div>
            <div class="card">
                <div class="card-title">💡 학급 정보판</div>
                <div class="info-grid">
                    <div class="info-block">
                        <h4>🧹 오늘의 청소 구역 <span style="font-size:0.75rem;">* 자동 저장</span></h4>
                        <textarea id="cleaningInput" placeholder="청소 배정내용..."></textarea>
                    </div>
                    <div class="info-block">
                        <h4>🍴 오늘의 급식 메뉴 <span style="font-size:0.75rem;">* 자동 저장</span></h4>
                        <textarea id="lunchInput" placeholder="급식 메뉴..."></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        const STORAGE_KEY = 'vibe_board_data';
        const body = document.body;
        const btnThemeToggle = document.getElementById('btnThemeToggle');
        let boardState = {
            lightTheme: false,
            timetable: [
                { period: "1", subject: "국어", prep: "교과서, 배움공책" },
                { period: "2", subject: "수학", prep: "수학책, 익힘책, 자" },
                { period: "3", subject: "체육", prep: "운동복, 운동화" },
                { period: "4", subject: "과학", prep: "실험관찰" },
                { period: "5", subject: "사회", prep: "사회과 부도" },
                { period: "6", subject: "미술", prep: "스케치북, 색연필" }
            ],
            notices: [
                { text: "독서록 1편 작성하여 내일까지 제출하기", checked: false },
                { text: "내일 체육 수업을 위해 체육복 입고 오기", checked: false },
                { text: "개인 물통 가져오기", checked: false }
            ],
            cleaning: "1모둠: 교실 쓸기 / 2모둠: 칠판 및 창틀 / 3모둠: 책상 정돈 / 4모둠: 재활용 쓰레기",
            lunch: "보리밥, 감자수제비국, 돈육갈비찜, 숙주나물무침, 포기김치, 사과"
        };
        window.addEventListener('load', () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) boardState = JSON.parse(saved);
            if (boardState.lightTheme) {
                body.classList.add('light-theme');
                btnThemeToggle.textContent = "🌙 다크 모드";
            }
            renderTimetable();
            renderNotices();
            document.getElementById('cleaningInput').value = boardState.cleaning || "";
            document.getElementById('lunchInput').value = boardState.lunch || "";
            setInterval(updateClock, 1000);
            updateClock();
        });
        btnThemeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            boardState.lightTheme = body.classList.contains('light-theme');
            btnThemeToggle.textContent = boardState.lightTheme ? "🌙 다크 모드" : "☀️ 라이트 모드";
            saveState();
        });
        function updateClock() {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            document.getElementById('currentClock').textContent = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        }
        function saveState() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
        }
        function renderTimetable() {
            const tbody = document.getElementById('timetableBody');
            tbody.innerHTML = "";
            boardState.timetable.forEach((item, index) => {
                const tr = document.createElement('tr');
                const tdPeriod = document.createElement('td');
                tdPeriod.textContent = item.period + '교시';
                tr.appendChild(tdPeriod);
                const tdSubject = document.createElement('td');
                const inputSubj = document.createElement('input');
                inputSubj.value = item.subject;
                inputSubj.addEventListener('input', (e) => {
                    boardState.timetable[index].subject = e.target.value;
                    saveState();
                });
                tdSubject.appendChild(inputSubj);
                tr.appendChild(tdSubject);
                const tdPrep = document.createElement('td');
                const inputPrep = document.createElement('input');
                inputPrep.value = item.prep;
                inputPrep.addEventListener('input', (e) => {
                    boardState.timetable[index].prep = e.target.value;
                    saveState();
                });
                tdPrep.appendChild(inputPrep);
                tr.appendChild(tdPrep);
                tbody.appendChild(tr);
            });
        }
        function renderNotices() {
            const list = document.getElementById('noticeList');
            list.innerHTML = "";
            boardState.notices.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('notice-item');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('notice-checkbox');
                checkbox.checked = item.checked;
                checkbox.addEventListener('change', (e) => {
                    boardState.notices[index].checked = e.target.checked;
                    saveState();
                });
                li.appendChild(checkbox);
                const input = document.createElement('input');
                input.type = 'text';
                input.classList.add('notice-input');
                input.value = item.text;
                input.addEventListener('input', (e) => {
                    boardState.notices[index].text = e.target.value;
                    saveState();
                });
                li.appendChild(input);
                const delBtn = document.createElement('span');
                delBtn.textContent = "❌";
                delBtn.style.cursor = "pointer";
                delBtn.style.fontSize = "0.8rem";
                delBtn.addEventListener('click', () => {
                    boardState.notices.splice(index, 1);
                    renderNotices();
                    saveState();
                });
                li.appendChild(delBtn);
                list.appendChild(li);
            });
        }
        document.getElementById('btnAddNotice').addEventListener('click', () => {
            boardState.notices.push({ text: "새 알림장 내용을 적으세요", checked: false });
            renderNotices();
            saveState();
        });
        document.getElementById('cleaningInput').addEventListener('input', (e) => {
            boardState.cleaning = e.target.value;
            saveState();
        });
        document.getElementById('lunchInput').addEventListener('input', (e) => {
            boardState.lunch = e.target.value;
            saveState();
        });
        let timerSeconds = 1200;
        let timerInterval = null;
        const timerDisplay = document.getElementById('timerDisplay');
        const btnTimerStart = document.getElementById('btnTimerStart');
        const btnTimerStop = document.getElementById('btnTimerStop');
        const btnTimerReset = document.getElementById('btnTimerReset');
        function updateTimerDisplay() {
            const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
            const seconds = String(timerSeconds % 60).padStart(2, '0');
            timerDisplay.textContent = minutes + ':' + seconds;
        }
        btnTimerStart.addEventListener('click', () => {
            if (timerInterval) return;
            btnTimerStart.style.display = 'none';
            btnTimerStop.style.display = 'block';
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    btnTimerStart.style.display = 'block';
                    btnTimerStop.style.display = 'none';
                    triggerTimerAlert();
                }
            }, 1000);
        });
        btnTimerStop.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            btnTimerStart.style.display = 'block';
            btnTimerStop.style.display = 'none';
        });
        btnTimerReset.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            btnTimerStart.style.display = 'block';
            btnTimerStop.style.display = 'none';
            timerSeconds = 1200;
            updateTimerDisplay();
        });
        document.querySelectorAll('.preset-btn[data-time]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                clearInterval(timerInterval);
                timerInterval = null;
                btnTimerStart.style.display = 'block';
                btnTimerStop.style.display = 'none';
                timerSeconds = parseInt(e.target.dataset.time);
                updateTimerDisplay();
            });
        });
        function triggerTimerAlert() {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1.0);
                if ('speechSynthesis' in window) {
                    setTimeout(() => {
                        const utterance = new SpeechSynthesisUtterance("집중 시간이 끝났습니다. 마무리해 주세요.");
                        utterance.lang = 'ko-KR';
                        window.speechSynthesis.speak(utterance);
                    }, 1100);
                }
            } catch(e) {}
            timerDisplay.style.color = '#ef4444';
            setTimeout(() => { timerDisplay.style.color = ''; }, 5000);
        }
    </script>
</body>
</html>`;

// ==========================================
// 2. 도구별 메타데이터 정의 (프롬프트, 설명, 팁)
// ==========================================

const TOOLS_METADATA = {
    seat: {
        title: "자리 배치도 생성기 미리보기",
        desc: "교차 배치, 드래그앤드롭 자리 교환이 가능한 학급 자리 배치 프로그램을 생성합니다.",
        prompt: `초등학교 학급운영을 위한 '학급 자리 배치도 생성 프로그램'을 만들고 싶어. HTML, CSS, JavaScript를 단 하나의 파일로 결합해서 완성도 높은 웹 페이지를 만들어줘. 코딩 초보자도 더블클릭하면 실행할 수 있어야 해. 조건은 다음과 같아:

1. **디자인**: 
   - 글래스모피즘(Glassmorphism) 느낌이 가미된 세련되고 깔끔한 디자인(연한 푸른색/파스텔톤 바탕).
   - 상단에 '칠판 (교탁 방향)'을 나무 프레임 칠판 형태로 구현.
   - 좌석 카드는 둥근 테두리와 그림자 효과 적용.
2. **구조 및 배치 설정**:
   - 가로 줄(행)과 세로 줄(열) 수를 교사가 숫자로 입력하여 교실 크기 설정 가능 (기본값 가로 5줄, 세로 6칸).
   - 텍스트 입력창(Textarea)에 학생 이름을 줄바꿈이나 쉼표로 입력할 수 있도록 구성.
3. **핵심 기능**:
   - '무작위 자리 배치' 버튼을 누르면 이름이 랜덤하게 섞여 좌석에 배치됨.
   - 배치 완료된 자리 카드는 마우스 **드래그 앤 드롭(Drag & Drop)**으로 드래그하여 임의로 자리를 상호 교환할 수 있음.
   - 명단 입력값은 웹 브라우저의 **localStorage**에 실시간 저장되어, 브라우저를 껐다 켜도 입력한 명단이 자동으로 로드되어야 함.
   - 전체 리셋 버튼 제공.`,
        code: SEAT_ARRANGER_CODE,
        tips: `<h4>💡 바이브 꿀팁: 드래그 앤 드롭</h4>
        HTML5 표준 드래그 앤 드롭 기능을 제미나이에게 직접 요구해 구현했습니다. 마우스로 카드를 옮기는 직관적인 조작을 교사들이 제일 좋아합니다. <code>localStorage</code>로 데이터가 세션 간 보존되게 지시하는 것이 핵심 비결입니다.`
    },
    roulette: {
        title: "모둠 구성 & 룰렛 발표자 추첨기 미리보기",
        desc: "원형 룰렛 애니메이션, TTS 이름 발표, 캔버스 폭죽 효과음이 어우러진 추첨기입니다.",
        prompt: `수업 시간에 발표자를 추첨하고 모둠을 구성할 수 있는 '모둠 구성 및 룰렛 발표자 추첨기' 프로그램을 만들고 싶어. HTML, CSS, JavaScript를 단 하나의 독립된 파일로 짜줘. 아래 조건을 만족해야 해:

1. **디자인 및 레이아웃**:
   - 화려한 파스텔 핑크와 보라색 그라디언트를 사용한 깔끔한 UI.
   - 탭 메뉴 제공: '🎯 룰렛 발표자 추첨' 탭과 '👥 랜덤 모둠 구성' 탭.
   - 학생 이름을 쉼표나 줄바꿈으로 입력할 수 있는 설정 영역을 좌측에 배치.
2. **룰렛 발표자 추첨 기능**:
   - HTML5 Canvas를 활용하여 학생 이름이 균등하게 표시된 아름다운 원형 룰렛 휠(회전판) 렌더링.
   - '룰렛 돌리기' 버튼을 클릭하면 빠르게 회전하다가 서서히 마찰력에 의해 멈추는 물리 룰렛 효과 구현.
   - 당첨자가 선정되면 모달 팝업으로 크게 이름을 노출하며, 브라우저 음성 합성(Speech Synthesis TTS)을 이용해 "오늘의 주인공은 [학생이름] 학생입니다!"라고 목소리로 읽어주는 기능 추가.
   - 화면에 알록달록한 **폭죽(Confetti)이 터지는 캔버스 애니메이션**을 오프라인 환경에서도 작동하게 자체 구현.
3. **랜덤 모둠 구성 기능**:
   - 모둠 수(예: 4개 모둠)를 교사가 숫자로 지정.
   - 버튼 클릭 시 명단을 셔플하여 순차적으로 분배하고, 화면에 '모둠 1', '모둠 2' 카드로 이쁘게 렌더링하여 표시.
   - 입력한 명단은 브라우저 **localStorage**에 자동 저장되어 유지됨.`,
        code: ROULETTE_PICKER_CODE,
        tips: `<h4>💡 바이브 꿀팁: 브라우저 TTS & 폭죽</h4>
        인터넷 연결이나 파일 없이 소리를 구현하기 위해 Web Speech API(음성 합성)와 Canvas 자체 Confetti 폭죽 렌더링 코드를 탑재했습니다. 교실 환경에서는 이 같은 단독 구동 기술이 가장 안전합니다.`
    },
    board: {
        title: "오늘의 학급 안내판 & 타이머 미리보기",
        desc: "실시간 시계, 타이머, 알림장, 시간표, 급식 메뉴 등을 종합 대시보드로 띄웁니다.",
        prompt: `교실 TV 화면에 띄워 아침 조회나 자습 시간에 활용할 수 있는 '오늘의 학급 안내판 및 타이머 대시보드' 프로그램을 만들고 싶어. HTML, CSS, JavaScript를 단 하나의 파일로 코딩해줘. 아래 요소를 포함해야 해:

1. **레이아웃 및 테마**:
   - 눈의 피로를 덜어주는 다크 테마(기본값)와 밝고 화사한 라이트 테마를 바꿀 수 있는 '테마 토글 버튼' 제공.
   - 좌우 2단 그리드 형태로 반응형 레이아웃 배치.
2. **화면 구성 요소 (위젯)**:
   - **실시간 타이머 위젯**: 현재 시간(실시간 초단위 업데이트)과 함께 남은 시간(분:초)을 크게 표시하는 뽀모도로/집중 타이머 내장. 5분/10분/20분/30분 프리셋 버튼 제공. 타이머 종료 시 비프음(Web Audio API로 직접 생성) 및 "집중 시간이 완료되었습니다" 음성 안내(TTS) 송출.
   - **시간표 위젯**: 1교시부터 6교시까지 과목명과 준비물을 즉석에서 텍스트 상자 형태로 입력하고 수정할 수 있는 편집형 시간표 테이블.
   - **알림장 위젯**: 오늘 해야 할 일을 체크리스트(To-Do) 형태로 추가하고 줄을 긋거나 삭제할 수 있는 알림장 보드.
   - **학급 정보판**: '오늘의 청소 구역'과 '오늘의 급식 메뉴'를 입력할 수 있는 텍스트 영역(Textarea) 배치.
3. **데이터 유지**:
   - 사용자가 수정한 시간표, 알림장 체크 상태, 급식 정보 등 모든 대시보드 입력 상태는 **localStorage**에 실시간 저장되어 브라우저를 새로고침해도 그대로 유지됨.`,
        code: CLASS_BOARD_CODE,
        tips: `<h4>💡 바이브 꿀팁: 종합 대시보드 상태 저장</h4>
        사용자가 수정한 알림장 텍스트나 시간표 내용 전체를 단일 JSON 객체 상태로 묶어 <code>localStorage</code>에 저장합니다. 교사가 매일 아침 수정하는 내용을 완벽하게 자동 보존해 줍니다.`
    }
};

let currentSelectedTool = "seat";

// ==========================================
// 3. UI 제어 및 인터랙션 로직
// ==========================================

// 뷰 전환 (상단 네비게이션)
function switchView(viewName) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));

    const event = window.event;
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // 워크벤치가 활성화되면 초기 도구 렌더링
    if (viewName === 'workbench') {
        selectTool(currentSelectedTool);
    }
}

// 4. 슬라이드 제어 로직
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide-item');
const totalSlides = slides.length;
const slideDotsContainer = document.getElementById('slideDots');
const btnPrevSlide = document.getElementById('btnPrevSlide');
const btnNextSlide = document.getElementById('btnNextSlide');

// 슬라이드 네비게이션 도트 생성
function initSlideDots() {
    slideDotsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('slide-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        slideDotsContainer.appendChild(dot);
    }
}

function updateSlideView() {
    slides.forEach((slide, idx) => {
        slide.classList.remove('active');
        if (idx === currentSlideIndex) {
            slide.classList.add('active');
        }
    });

    // 도트 활성화 상태 변경
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, idx) => {
        dot.classList.remove('active');
        if (idx === currentSlideIndex) {
            dot.classList.add('active');
        }
    });

    // 이전/다음 버튼 비활성화 제어
    btnPrevSlide.disabled = (currentSlideIndex === 0);
    btnNextSlide.disabled = (currentSlideIndex === totalSlides - 1);

    // 사이드바 타임라인 단계 강조 동기화
    const activeSlide = slides[currentSlideIndex];
    const timelineStep = activeSlide.dataset.timeline;
    highlightTimelineStep(timelineStep);
}

function moveSlide(direction) {
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = 0;
    if (currentSlideIndex >= totalSlides) currentSlideIndex = totalSlides - 1;
    updateSlideView();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateSlideView();
}

// 키보드 방향키 슬라이드 제어
document.addEventListener('keydown', (e) => {
    // 슬라이드 뷰가 활성화되어 있는 동안만 작동
    const slidesView = document.getElementById('view-slides');
    if (slidesView.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
            moveSlide(1);
        } else if (e.key === 'ArrowLeft') {
            moveSlide(-1);
        }
    }
});

// 사이드바 타임라인 강조 변경
function highlightTimelineStep(stepNum) {
    document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
    const targetItem = document.getElementById(`time-${stepNum}`);
    if (targetItem) {
        targetItem.classList.add('active');
    }
}

// ==========================================
// 5. 워크벤치 및 샌드박스 제어 로직
// ==========================================

function selectTool(toolKey) {
    currentSelectedTool = toolKey;

    // 도구 버튼 액티브 설정
    document.querySelectorAll('.tool-selector-btn').forEach(btn => btn.classList.remove('active'));
    
    let btnIndex = 0;
    if (toolKey === 'seat') btnIndex = 0;
    if (toolKey === 'roulette') btnIndex = 1;
    if (toolKey === 'board') btnIndex = 2;
    
    document.querySelectorAll('.tool-selector-btn')[btnIndex].classList.add('active');

    const metadata = TOOLS_METADATA[toolKey];
    
    // 타이틀 및 정보 업데이트
    document.getElementById('sandboxTitle').textContent = metadata.title;
    document.getElementById('toolTipContent').innerHTML = metadata.tips;

    // 샌드박스 아이프레임 로드
    const iframe = document.getElementById('sandboxIframe');
    iframe.srcdoc = metadata.code;

    // 복사 버튼 이벤트 연동
    document.getElementById('btnCopyPrompt').onclick = () => {
        copyToClipboard(metadata.prompt, "제미나이 실습용 프롬프트가 복사되었습니다!");
    };

    document.getElementById('btnCopyCode').onclick = () => {
        copyToClipboard(metadata.code, "완성형 HTML 소스코드가 복사되었습니다!");
    };
}

// 클립보드 복사 유틸리티
function copyToClipboard(text, successMessage) {
    const hiddenTextarea = document.getElementById('hiddenCopyTextarea');
    hiddenTextarea.value = text;
    hiddenTextarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(successMessage);
        } else {
            alert("복사에 실패했습니다. 직접 복사해 주세요.");
        }
    } catch (err) {
        console.error("복사 중 에러 발생: ", err);
    }
}

// 토스트 팝업 띄우기
function showToast(message) {
    const toast = document.getElementById('toastBox');
    const toastMsg = document.getElementById('toastMessage');
    
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// 초기화 호출
window.addEventListener('load', () => {
    initSlideDots();
    updateSlideView();
});
