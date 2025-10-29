document.addEventListener('DOMContentLoaded', () => {

    // 獲取頁面上所有的 DOM 元素 (包含新增的)
    const loginSection = document.getElementById('login-section');
    const taskSection = document.getElementById('task-section');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const taskList = document.getElementById('task-list');
    
    // 【新增】獲取新增任務相關的元素
    const newTaskForm = document.getElementById('new-task-form');
    const newTaskInput = document.getElementById('new-task-input');

    const API_URL = 'http://192.168.1.202:3000';

    // 1. 監聽登入表單的提交事件 (保持不變)
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
            loginMessage.textContent = '無法連接到伺服器';
        }
    });
    
    // 2. 【新增】監聽新增任務表單的提交事件
    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 獲取輸入框的值，並清除頭尾空白
        const text = newTaskInput.value.trim(); 

        if (!text) {
            alert('請輸入任務內容！');
            return;
        }

        try {
            // 向後端發送 POST 請求來新增任務
            const response = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text }),
            });

            if (response.ok) {
                // 如果成功，清空輸入框
                newTaskInput.value = ''; 
                // 重新載入任務列表，以顯示新任務
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
        
        // 設定新的狀態
        const newCompletedStatus = !currentCompleted;

        try {
            // 向後端發送 PUT 請求來更新任務狀態
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompletedStatus }),
            });

            if (response.ok) {
                // 如果成功，重新載入任務列表
                loadTasks();
            } else {
                alert('更新任務狀態失敗！');
            }
        } catch (error) {
            console.error('更新任務錯誤:', error);
            alert('更新任務狀態時發生錯誤。');
        }
    }


    // 4. 載入任務的函式 (已修改，增加點擊監聽器)
    async function loadTasks() {
        try {
            const response = await fetch(`${API_URL}/api/tasks`);
            const tasks = await response.json();
            taskList.innerHTML = ''; 

            tasks.forEach(task => {
                const li = document.createElement('li');
                // 將任務 ID 儲存在 li 元素上，方便後續操作
                li.setAttribute('data-id', task.id);
                li.setAttribute('data-completed', task.completed); 
                
                li.textContent = task.text;
                
                if (task.completed) {
                    li.classList.add('completed'); // 應用 CSS 樣式
                }
                
                // 【關鍵】為每個任務項目新增點擊事件監聽器
                li.addEventListener('click', () => {
                    // 點擊時，呼叫 toggleTaskCompleted 函式
                    toggleTaskCompleted(task.id, task.completed);
                });

                taskList.appendChild(li);
            });

        } catch (error) {
            console.error('載入任務失敗:', error);
            taskList.innerHTML = '<li>載入任務失敗</li>';
        }
    }
});