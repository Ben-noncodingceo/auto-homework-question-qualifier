// Configuration
const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev';

// Available models for each provider
const MODELS = {
    deepseek: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
        { id: 'deepseek-coder', name: 'DeepSeek Coder' }
    ],
    doubao: [
        { id: 'doubao-pro-32k', name: 'Doubao Pro 32K' },
        { id: 'doubao-lite-32k', name: 'Doubao Lite 32K' },
        { id: 'doubao-pro-128k', name: 'Doubao Pro 128K' }
    ],
    tongyi: [
        { id: 'qwen-turbo', name: 'Qwen Turbo' },
        { id: 'qwen-plus', name: 'Qwen Plus' },
        { id: 'qwen-max', name: 'Qwen Max' }
    ]
};

// State
let selectedFile = null;
let analysisResults = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const aiProvider = document.getElementById('aiProvider');
const aiModel = document.getElementById('aiModel');
const temperature = document.getElementById('temperature');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const progressText = document.getElementById('progressText');
const results = document.getElementById('results');
const questionsContainer = document.getElementById('questionsContainer');
const messages = document.getElementById('messages');

// Initialize
init();

function init() {
    // File upload handlers
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // AI provider change handler
    aiProvider.addEventListener('change', updateModelOptions);

    // Analyze button handler
    analyzeBtn.addEventListener('click', analyzeDocument);

    // Export handlers
    document.getElementById('exportJSON').addEventListener('click', exportJSON);
    document.getElementById('exportExcel').addEventListener('click', exportExcel);

    // Initialize model options
    updateModelOptions();
}

function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileExt)) {
        showMessage('只支持 PDF 和 Word 文档格式', 'error');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showMessage('文件大小超过 10MB 限制', 'error');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.add('active');
    analyzeBtn.disabled = false;

    showMessage('文件已选择，点击"开始分析"按钮', 'info');
}

function updateModelOptions() {
    const provider = aiProvider.value;
    const models = MODELS[provider];

    aiModel.innerHTML = '';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        aiModel.appendChild(option);
    });
}

async function analyzeDocument() {
    if (!selectedFile) {
        showMessage('请先选择文件', 'error');
        return;
    }

    const config = {
        provider: aiProvider.value,
        model: aiModel.value,
        temperature: parseFloat(temperature.value)
    };

    // Validate temperature
    if (config.temperature < 0 || config.temperature > 2) {
        showMessage('温度参数必须在 0-2 之间', 'error');
        return;
    }

    // Show loading
    loading.classList.add('active');
    results.classList.remove('active');
    analyzeBtn.disabled = true;

    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('config', JSON.stringify(config));

        // Update progress
        updateProgress('正在上传文档...');

        // Call API
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Analysis failed');
        }

        // Update progress
        updateProgress('分析完成！正在显示结果...');

        // Display results
        analysisResults = data.data;
        displayResults(data.data);

        showMessage(`分析成功！共找到 ${data.data.total_count} 道题目`, 'success');

    } catch (error) {
        console.error('Analysis error:', error);
        showMessage('分析失败：' + error.message, 'error');
    } finally {
        loading.classList.remove('active');
        analyzeBtn.disabled = false;
    }
}

function displayResults(data) {
    const { questions, total_count } = data;

    // Update statistics
    document.getElementById('totalQuestions').textContent = total_count;

    const avgDiff = questions.reduce((sum, q) => sum + q.difficulty, 0) / total_count;
    document.getElementById('avgDifficulty').textContent = avgDiff.toFixed(1);

    const subjects = new Set(questions.map(q => q.subject));
    document.getElementById('subjects').textContent = subjects.size;

    // Display questions
    questionsContainer.innerHTML = '';

    questions.forEach(question => {
        const card = createQuestionCard(question);
        questionsContainer.appendChild(card);
    });

    // Show results
    results.classList.add('active');
    results.scrollIntoView({ behavior: 'smooth' });
}

function createQuestionCard(question) {
    const card = document.createElement('div');
    card.className = 'question-card';

    const difficultyPercent = (question.difficulty / 5.0) * 100;

    card.innerHTML = `
        <div class="question-number">题目 ${question.question_number}</div>
        <span class="question-subject">${question.subject}</span>

        <div class="question-analysis">
            <strong>📝 解析：</strong><br>
            ${question.analysis || '暂无解析'}
        </div>

        <div class="difficulty-bar">
            <div class="difficulty-label">难度评分</div>
            <div class="difficulty-visual">
                <div class="difficulty-track">
                    <div class="difficulty-fill" style="width: ${difficultyPercent}%"></div>
                </div>
                <div class="difficulty-value">${question.difficulty}</div>
            </div>
        </div>

        <div class="tags-section">
            <div class="tags-label">知识点标签</div>
            ${question.knowledge_tags.map(tag =>
                `<span class="tag knowledge-tag">${tag}</span>`
            ).join('')}
        </div>

        <div class="tags-section">
            <div class="tags-label">能力标签</div>
            ${question.ability_tags.map(tag =>
                `<span class="tag ability-tag">${tag}</span>`
            ).join('')}
        </div>
    `;

    return card;
}

function exportJSON() {
    if (!analysisResults) {
        showMessage('没有可导出的数据', 'error');
        return;
    }

    const json = JSON.stringify(analysisResults, null, 2);
    downloadFile(json, 'analysis_results.json', 'application/json');
    showMessage('JSON 文件已下载', 'success');
}

function exportExcel() {
    if (!analysisResults) {
        showMessage('没有可导出的数据', 'error');
        return;
    }

    const data = analysisResults.questions.map(q => ({
        '题号': q.question_number,
        '学科': q.subject,
        '难度': q.difficulty,
        '解析': q.analysis,
        '知识点1': q.knowledge_tags[0] || '',
        '知识点2': q.knowledge_tags[1] || '',
        '知识点3': q.knowledge_tags[2] || '',
        '知识点4': q.knowledge_tags[3] || '',
        '知识点5': q.knowledge_tags[4] || '',
        '能力1': q.ability_tags[0] || '',
        '能力2': q.ability_tags[1] || '',
        '能力3': q.ability_tags[2] || '',
        '能力4': q.ability_tags[3] || '',
        '能力5': q.ability_tags[4] || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '题目分析');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    XLSX.writeFile(wb, `题目分析_${timestamp}.xlsx`);

    showMessage('Excel 文件已下载', 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function updateProgress(text) {
    progressText.textContent = text;
}

function showMessage(message, type) {
    const alertClass = type === 'error' ? 'alert-error' :
                      type === 'success' ? 'alert-success' : 'alert-info';

    messages.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

    setTimeout(() => {
        messages.innerHTML = '';
    }, 5000);
}
