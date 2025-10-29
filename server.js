// 載入 express 和 cors 模組
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

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

// 追蹤下一個任務的 ID (為了確保 ID 不重複)
let nextId = 3; 


// --- API 路由 (Endpoints) ---

// 1. 處理使用者登入 (保持不變)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: '登入成功' });
    } else {
        res.status(401).json({ success: false, message: '無效的使用者名稱或密碼' });
    }
});

// 2. 獲取所有任務 (保持不變)
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// 3. 【新增】新增任務
app.post('/api/tasks', (req, res) => {
    // 從前端獲取新任務的文字
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: '任務內容不能為空' });
    }

    // 建立新的任務物件
    const new_task = {
        id: nextId++, // 使用並增加 ID
        text: text,
        completed: false // 新增任務預設為未完成
    };

    tasks.push(new_task); // 將新任務加入列表
    
    // 回傳成功訊息和新的任務物件
    res.status(201).json(new_task); 
});

// 4. 【新增】更新任務狀態 (標記完成或未完成)
// 路由中包含 :id，表示任務的 ID 會從 URL 傳入 (例如 /api/tasks/1)
app.put('/api/tasks/:id', (req, res) => {
    // 從 URL 參數中獲取任務 ID (注意，它是一個字串，需要轉換為數字)
    const taskId = parseInt(req.params.id); 
    
    // 從請求 body 中獲取新的完成狀態
    const { completed } = req.body;

    // 找到要更新的任務
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        // 更新任務狀態
        task.completed = completed;
        res.json({ message: '任務更新成功', task: task });
    } else {
        res.status(404).json({ message: '找不到該任務' });
    }
});


// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
});