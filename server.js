// 載入 express 和 cors 模組
const express = require('express');
const path = require('path'); // 引入 path 模組來處理檔案路徑
const app = express();
const cors = require('cors');
// 使用 Render 提供的 PORT 環境變數，如果沒有則使用 3000
const PORT = process.env.PORT || 3000; 

// 設定中介軟體 (Middleware)
app.use(express.json());
app.use(cors());

// --- 簡易的 "資料庫" ---
const users = [
    { username: 'company_user', password: 'password123' }
];
// 任務列表
let tasks = [
    { id: 1, text: '完成簡報', completed: false },
    { id: 2, text: '回覆客戶郵件', completed: true }
];
// 追蹤下一個任務的 ID
let nextId = 3; 


// --- 【關鍵新增區塊】 靜態檔案服務 ---
// 告訴 Express 任何對檔案的請求，都在專案根目錄中尋找
app.use(express.static(path.join(__dirname, '.')));


// --- API 路由 (Endpoints) ---

// 1. 處理使用者登入
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: '登入成功' });
    } else {
        res.status(401).json({ success: false, message: '無效的使用者名稱或密碼' });
    }
});

// 2. 獲取所有任務
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// 3. 新增任務
app.post('/api/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: '任務內容不能為空' });
    }
    const new_task = {
        id: nextId++,
        text: text,
        completed: false
    };
    tasks.push(new_task);
    res.status(201).json(new_task); 
});

// 4. 更新任務狀態 (標記完成或未完成)
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id); 
    const { completed } = req.body;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = completed;
        res.json({ message: '任務更新成功', task: task });
    } else {
        res.status(404).json({ message: '找不到該任務' });
    }
});

// 5. 【關鍵新增路由】 處理主網址請求 (根路由)
// 當使用者訪問主網址時，發送 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
});