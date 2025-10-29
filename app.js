document.addEventListener('DOMContentLoaded', () => {

    // 獲取頁面上所有的 DOM 元素
    const loginSection = document.getElementById('login-section');
    const taskSection = document.getElementById('task-section');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const taskList = document.getElementById('task-list');
    const newTaskForm = document.getElementById('new-task-form');
    const newTaskInput = document.getElementById('new-task-input');

    // 【重要】後端伺服器的 URL (請替換成你 Render 上的實際網址！)
    const API_URL = 'https://task-tracker-global.onrender.com';

    // 1. 監聽登入表單的提交事件
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        loginMessage.textContent = '正在登入...';

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password }),
            });

            const data = await response.json(); 

            if (data.success) {
                loginMessage.textContent = '';
                loginSection.style.display = 'none';
                taskSection.style.display = 'block';
                loadTasks(); 
            } else {
                loginMessage.textContent = data.message;
            }

        } catch (error) {
            loginMessage.textContent = '無法連接到伺服器或網路錯誤。';
        }
    });
    
    // 2. 監聽新增任務表單的提交事件
    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = newTaskInput.value.trim(); 

        if (!text) {
            alert('請輸入任務內容！');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text }),
            });

            if (response.ok) {
                newTaskInput.value = ''; 
                loadTasks(); 
            } else {
                alert('新增任務失敗！');
            }
        } catch (error) {
            console.error('新增任務錯誤:', error);
            alert('新增任務時發生錯誤，請檢查伺服器。');
        }
    });

    // 3. 處理點擊任務 (標記完成) 的函式
    async function toggleTaskCompleted(taskId, currentCompleted) {
        const newCompletedStatus = !currentCompleted;

        try {
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompletedStatus }),
            });

            if (response.ok) {
                loadTasks();
            } else {
                alert('更新任務狀態失敗！');
            }
        } catch (error) {
            console.error('更新任務錯誤:', error);
            alert('更新任務狀態時發生錯誤。');
        }
    }


    // 4. 載入任務的函式 (增加點擊監聽器)
    async function loadTasks() {
        try {
            const response = await fetch(`${API_URL}/api/tasks`);
            const tasks = await response.json();
            taskList.innerHTML = ''; 

            tasks.forEach(task => {
                const li = document.createElement('li');
                
                // 創建任務文字元素
                const taskText = document.createElement('span');
                taskText.textContent = task.text;
                taskText.classList.add('task-text');
                
                // 點擊文字時標記完成/未完成
                taskText.addEventListener('click', () => {
                    toggleTaskCompleted(task.id, task.completed);
                });
                
                if (task.completed) {
                    taskText.classList.add('completed'); 
                }
                
                li.appendChild(taskText);
                taskList.appendChild(li);
            });

        } catch (error) {
            console.error('載入任務失敗:', error);
            taskList.innerHTML = '<li>載入任務失敗</li>';
        }
    }
});