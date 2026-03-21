// エントリを保存するための配列（ブラウザのローカルストレージを使用）
let entries = [];
let filteredEntries = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingId = null; // 編集中のエントリID

// ページ読み込み時に、保存されたデータを復元
document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージからデータを読み込む
    const saved = localStorage.getItem('expressionEntries');
    if (saved) {
        entries = JSON.parse(saved);
    }
    
    // 初期状態は全件を対象とする
    filteredEntries = [...entries];

    // 最初に表示
    updateDisplay();
    
    // フォーム送信イベントリスナー
    document.getElementById('entryForm').addEventListener('submit', createEntry);
    
    // 編集フォーム送信イベントリスナー
    document.getElementById('editForm').addEventListener('submit', saveEdit);
    
    // 検索入力イベントリスナー
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // アコーディオンボタンイベントリスナー
    document.getElementById('toggleFormButton').addEventListener('click', toggleForm);
});

// アコーディオン形式のフォームトグル
function toggleForm() {
    const button = document.getElementById('toggleFormButton');
    const container = document.getElementById('entryFormContainer');
    
    if (container.classList.contains('collapsed')) {
        // 展開
        container.classList.remove('collapsed');
        button.textContent = 'ー 閉じる';
    } else {
        // 折りたたむ
        container.classList.add('collapsed');
        button.textContent = '＋ 表現を追加';
    }
}

// 新しいエントリを作成
function createEntry(e) {
    e.preventDefault();
    
    // フォームから値を取得
    const expression = document.getElementById('expression').value.trim();
    const meaning = document.getElementById('meaning').value.trim();
    const examples = document.getElementById('examples').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const tagsInput = document.getElementById('tags').value.trim();
    
    // タグをカンマで分割して配列に
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // 新しいエントリオブジェクトを作成（IDと日付付き）
    const newEntry = {
        id: Date.now(), // ユニークなID
        expression: expression,
        meaning: meaning,
        examples: examples,
        notes: notes,
        tags: tags,
        createdAt: new Date().toLocaleString('ja-JP')
    };
    
    // 配列に追加
    entries.unshift(newEntry); // 新しいものが上に
    
    // ローカルストレージに保存
    saveToLocalStorage();
    
    // 画面を更新
    displayEntries(entries);
    
    // フォームをリセット
    document.getElementById('entryForm').reset();
    
    // フィードバック
    alert('表現を追加しました！');
}

// 編集モーダルを開く
function openEditModal(id) {
    // 該当するエントリを探す
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    editingId = id;
    
    // フォームに現在の値を入力
    document.getElementById('editExpression').value = entry.expression;
    document.getElementById('editMeaning').value = entry.meaning;
    document.getElementById('editExamples').value = entry.examples;
    document.getElementById('editNotes').value = entry.notes;
    document.getElementById('editTags').value = entry.tags.join(', ');
    
    // モーダルを表示
    document.getElementById('editModal').classList.add('show');
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingId = null;
    document.getElementById('editForm').reset();
}

// 編集を保存
function saveEdit(e) {
    e.preventDefault();
    
    if (editingId === null) return;
    
    // 該当するエントリを探す
    const entry = entries.find(e => e.id === editingId);
    if (!entry) return;
    
    // フォームから新しい値を取得
    const newExpression = document.getElementById('editExpression').value.trim();
    const newMeaning = document.getElementById('editMeaning').value.trim();
    const newExamples = document.getElementById('editExamples').value.trim();
    const newNotes = document.getElementById('editNotes').value.trim();
    const newTagsInput = document.getElementById('editTags').value.trim();
    const newTags = newTagsInput ? newTagsInput.split(',').map(tag => tag.trim()) : [];
    
    // エントリを更新
    entry.expression = newExpression;
    entry.meaning = newMeaning;
    entry.examples = newExamples;
    entry.notes = newNotes;
    entry.tags = newTags;
    
    // 保存して表示更新
    saveToLocalStorage();
    displayEntries(entries);
    
    // モーダルを閉じる
    closeEditModal();
    
    alert('表現を更新しました！');
}

// エントリを削除
function deleteEntry(id) {
    if (!confirm('この表現を削除してもよろしいですか？')) {
        return;
    }
    
    // 該当するエントリを配列から削除
    entries = entries.filter(e => e.id !== id);
    
    // 保存して表示更新
    saveToLocalStorage();
    displayEntries(entries);
    alert('表現を削除しました！');
}

// 検索機能
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredEntries = [...entries];
    } else {
        filteredEntries = entries.filter(entry => {
            return (
                entry.expression.toLowerCase().includes(searchTerm) ||
                entry.meaning.toLowerCase().includes(searchTerm) ||
                entry.examples.toLowerCase().includes(searchTerm) ||
                entry.notes.toLowerCase().includes(searchTerm) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });
    }

    currentPage = 1;
    updateDisplay();
}

// エクスポート
function exportEntries() {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expression-stock-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// インポート
function importEntries(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) {
                throw new Error('JSONは配列である必要があります。');
            }

            // 欠損検証 (最低限のキー)
            for (const entry of imported) {
                if (typeof entry.expression !== 'string' || typeof entry.meaning !== 'string') {
                    throw new Error('JSONフォーマットが不正です。');
                }
            }

            if (!confirm('インポートすると現在のデータは上書きされます。実行しますか？')) {
                return;
            }

            entries = imported.map((item) => ({
                id: item.id || Date.now() + Math.floor(Math.random() * 9999),
                expression: item.expression || '',
                meaning: item.meaning || '',
                examples: item.examples || '',
                notes: item.notes || '',
                tags: Array.isArray(item.tags) ? item.tags : [],
                createdAt: item.createdAt || new Date().toLocaleString('ja-JP')
            }));
            
            saveToLocalStorage();
            filteredEntries = [...entries];
            currentPage = 1;
            updateDisplay();
            alert('インポートが完了しました！');
        } catch (error) {
            alert('インポートに失敗しました: ' + error.message);
        } finally {
            document.getElementById('importFileInput').value = '';
        }
    };
    reader.readAsText(file);
}

// ページ切り替え
function changePage(direction) {
    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    updateDisplay();
}

// 表示更新（ページネーション対応）
function updateDisplay() {
    const container = document.getElementById('entriesList');
    const countSpan = document.getElementById('entryCount');
    const pageIndicatorTop = document.getElementById('pageIndicatorTop');
    const pageIndicatorBottom = document.getElementById('pageIndicatorBottom');

    const totalItems = filteredEntries.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageEntries = filteredEntries.slice(start, end);

    countSpan.textContent = totalItems;
    pageIndicatorTop.textContent = `${currentPage} / ${totalPages}`;
    pageIndicatorBottom.textContent = `${currentPage} / ${totalPages}`;

    // ボタン活性化/非活性化
    document.getElementById('prevTop').disabled = document.getElementById('prevBottom').disabled = currentPage === 1;
    document.getElementById('nextTop').disabled = document.getElementById('nextBottom').disabled = currentPage === totalPages;

    if (totalItems === 0) {
        container.innerHTML = '<p class="empty-message">該当する表現がありません</p>';
        return;
    }

    container.innerHTML = pageEntries.map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <div class="entry-expression">${escapeHtml(entry.expression)}</div>
                <div class="entry-actions">
                    <button class="btn btn-edit" onclick="openEditModal(${entry.id})">編集</button>
                    <button class="btn btn-delete" onclick="deleteEntry(${entry.id})">削除</button>
                </div>
            </div>

            <div class="entry-meaning">
                <strong>意味:</strong> ${escapeHtml(entry.meaning)}
            </div>

            ${entry.examples ? `
                <div class="entry-examples">
                    <strong>用例:</strong>
                    ${entry.examples.split('\n').map(ex => `<div class="example-item">• ${escapeHtml(ex)}</div>`).join('')}
                </div>
            ` : ''}

            ${entry.notes ? `
                <div class="entry-notes">
                    <strong>コメント:</strong> ${escapeHtml(entry.notes)}
                </div>
            ` : ''}

            ${entry.tags.length > 0 ? `
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}

            <small style="color: #999;">作成: ${entry.createdAt}</small>
        </div>
    `).join('');
}

// エントリ一覧を表示（旧displayEntriesの互換）
function displayEntries(entriesToDisplay) {
    entries = entriesToDisplay;
    filteredEntries = [...entries];
    currentPage = 1;
    updateDisplay();
}

// ローカルストレージに保存
function saveToLocalStorage() {
    localStorage.setItem('expressionEntries', JSON.stringify(entries));
}

// XSS対策用関数（HTMLをエスケープ）
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// モーダルの外側をクリックした時に閉じる
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});
