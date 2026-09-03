// Canvas要素の取得とコンテキストの作成
const canvas = document.getElementById('diaryCanvas');
const ctx = canvas.getContext('2d');

// ツールボタンの取得
const penBtn = document.getElementById('penBtn'); // ペンボタン
const eraserBtn = document.getElementById('eraserBtn'); // 消しゴムボタン
const clearBtn = document.getElementById('clearBtn'); // 全消去ボタン
const undoBtn = document.getElementById('undoBtn'); // 取り消しボタン
const colorBtns = document.querySelectorAll('.color-btn'); // 色選択ボタン

// --- ペンの太さを変更するスライダーのイベントリスナー ---
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');

// --- スタンプボタンの取得 ---
const stampBtns = document.querySelectorAll('.stampBtn');// スタンプボタン

// --- ガイド要素を取得 ---
const canvasGuide = document.getElementById('canvasGuide');

// --- ガイドを非表示にする関数 ---
function hideGuide() {
  if (canvasGuide) {
    canvasGuide.style.display = 'none';
  }
}

// --- 今日の日付を初期セットする関数 ---
function setTodayDate() {
  const todayDate = document.getElementById('diaryDate');
  const today = new Date();
  // 年、月、日を取得してフォーマットする
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
  const day = String(today.getDate()).padStart(2, '0');
  // 'YYYY-MM-DD' 形式の文字列を作成
  const formattedDate = `${year}-${month}-${day}`;
  todayDate.value = formattedDate; // input要素にセット
}

setTodayDate(); // ページ読み込み時に今日の日付をセット

// 描画状態を管理する変数
let isDrawing = false;
let nowMode = 'pen'; // 現在の描画モード（'pen' または 'eraser'）

// 初期設定（線の太さや端の丸み）
let backgroundColor = 'oklch(97.7% 0.013 236.62)'; // 背景色
let penSize = 5; // ペンの太さ
let eraserSize = 5; // 消しゴムの太さ
let penColor = "#000000"; // ペンの色

ctx.lineCap = 'round'; // 線の端を丸くする
ctx.lineJoin = 'round'; // 線の入りを丸くする

let currentStamp = null; // 現在選択されているスタンプの画像を保持する変数

// 履歴スタック（画像URLの文字列を保存）
let historyStack = []; // 描画履歴を保存する配列
const maxHistory = 30; // 履歴の最大数

// ツールボタン選択中に枠線を強調する
function SelectedToolBtn(button) {
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.style.outline = 'none'; // 全てのボタンの枠線を元に戻す
  });
  if (button) {
    button.style.outline = '3px solid #34a1d9'; // 選択されたボタンの枠線を強調表示
    button.style.outlineOffset = '-2px'; // 枠線の位置を調整
  }
}

SelectedToolBtn(penBtn); // 初期状態でペンボタンを選択中にする

// モード切替の関数
function setMode(mode) {
  nowMode = mode; // 現在のモードを設定

  if (mode === 'pen' || mode === 'eraser') {
    currentStamp = null; // スタンプモードではない場合、currentStampをnullにする
    stampBtns.forEach(b => b.style.outline = 'none'); // スタンプボタンの枠線を元に戻す
  }

  if (mode === 'pen') {
    ctx.strokeStyle = penColor; // ペンモードではペンの色
    ctx.lineWidth = penSize; // ペンの太さを更新
    sizeSlider.value = penSize; // スライダーの値をペンの太さに設定
    sizeValue.textContent = `${penSize}px`; // ペンの太さを表示
    SelectedToolBtn(penBtn); // ペンボタンを強調表示
    penBtn.textContent = '✏選択中'; // ペンボタンのテキストを変更
    eraserBtn.textContent = '□消しゴム'; // 消しゴムボタンのテキストを元に戻す

  } else if (mode === 'eraser') {
    ctx.strokeStyle = 'oklch(97.7% 0.013 236.62)'; // 背景色
    ctx.lineWidth = eraserSize; // 消しゴムの太さを更新
    sizeSlider.value = eraserSize; // スライダーの値を消しゴムの太さに設定
    sizeValue.textContent = `${eraserSize}px`; // 消しゴムの太さを表示
    SelectedToolBtn(eraserBtn); // 消しゴムボタンを強調表示
    eraserBtn.textContent = '□選択中'; // 消しゴムボタンのテキストを変更
    penBtn.textContent = '✏えんぴつ'; // ペンボタンのテキストを元に戻す
  }
};

// スライダーの値が変更されたときの処理
sizeSlider.addEventListener('input', (event) => {
  const newSize = Number(event.target.value); // スライダーの値を取得
  ctx.lineWidth = newSize; // 線の太さを更新
  sizeValue.textContent = `${newSize}px`; // 線の太さを表示

  if (nowMode === 'pen') {
    penSize = newSize; // ペンの太さを更新
  } else if (nowMode === 'eraser') {
    eraserSize = newSize; // 消しゴムの太さを更新
  }
});

// ボタンのクリックイベントでモードを切り替える
penBtn.addEventListener('click', () => { setMode('pen') });
eraserBtn.addEventListener('click', () => { setMode('eraser') });

// 色選択ボタンのクリックイベントでペンの色を変更
colorBtns.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const selectedColor = event.target.getAttribute('data-color'); // 選択された色を取得
    penColor = selectedColor; // ペンの色を更新
    ctx.strokeStyle = penColor; // 描画色を更新
    setMode('pen'); // ペンモードに切り替え

    // 「選択中のボタン」を枠線を大きくして強調表示
    colorBtns.forEach((border) => border.style.outline = 'none'); // 全てのボタンの枠線を元に戻す
    event.target.style.outline = '3px solid #34a1d9'; // 選択されたボタンの枠線を強調表示
    event.target.style.outlineOffset = '-2px'; // 枠線の位置を調整
  });
});

if (colorBtns[0]) {
  colorBtns[0].style.outline = '3px solid #34a1d9';
  colorBtns[0].style.outlineOffset = '-1px';
}

// 取り消しボタンの状態を更新する関数
function updateUndoBtn() {

  if (historyStack.length > 1) {
    // 【有効化】クリックできるように、青色
    undoBtn.disabled = false;
    undoBtn.className = "kiwi-maru-light flex-1 px-4 py-1 md:py-2 border border-blue-300 bg-sky-100 text-blue-500 font-bold rounded hover:bg-sky-200";
  } else {
    // 【無効化】クリック不可、灰色
    undoBtn.disabled = true;
    undoBtn.className = "kiwi-maru-light flex-1 px-4 py-1 md:py-2 border border-slate-400 bg-slate-300 text-slate-500 font-bold rounded cursor-not-allowed";
  }
}

//  履歴保存
function saveHistory() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  historyStack.push(imageData);

  if (historyStack.length > maxHistory) {
    historyStack.shift();
  }
  updateUndoBtn();
}

// ひとつ前に戻す
undoBtn.addEventListener('click', () => {
  if (historyStack.length > 1) {
    historyStack.pop(); // 今（最新）の状態を捨てる
    const previousDataURL = historyStack[historyStack.length - 1]; // 1つ前のデータURL

    // キャンバスにそのまま描き直す
    ctx.putImageData(previousDataURL, 0, 0);


    // モードごとの描画色設定を再適用
    if (nowMode === 'pen') ctx.strokeStyle = penColor;
    if (nowMode === 'eraser') ctx.strokeStyle = backgroundColor;

    updateUndoBtn();
  }
});

// --- 全消去機能の実装 ---
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
  saveHistory(); // 全消去後に履歴を保存
});

setMode('pen'); // 初期状態でペンモードに設定
saveHistory(); // 初期状態の履歴を保存


// --- スタンプ機能の実装 ---
// 1. スタンプボタンのクリック処理
stampBtns.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const stampSrc = btn.getAttribute('data-stamp'); // スタンプ画像のパスを取得
    const img = new Image(); // 画像オブジェクトを生成して事前読み込み
    img.src = stampSrc; // 画像のパスを設定

    img.onload = () => {
      currentStamp = img; // 画像が読み込まれたらcurrentStampに設定
      nowMode = 'stamp'; // モードをスタンプに切り替え

      // 描画ツール側の強調枠をリセット
      SelectedToolBtn(null); // ペン・消しゴムの強調表示を解除
      penBtn.textContent = '✏えんぴつ'; // ペンボタンのテキストを元に戻す
      eraserBtn.textContent = '□消しゴム'; // 消しゴムボタンのテキストを元に戻す

      // スタンプボタンの枠線を強調表示
      stampBtns.forEach((b) => b.style.outline = 'none'); // 全てのスタンプボタンの枠線を元に戻す
      btn.style.outline = '3px solid #34a1d9'; // 選択されたスタンプボタンの枠線を強調表示
      btn.style.outlineOffset = '-2px'; // 枠線の位置を調整
    }
  });
});


// 2. Canvas上でクリックした位置にスタンプを描画する処理
canvas.addEventListener('click', (event) => {
  if (nowMode !== 'stamp' || !currentStamp) return; // スタンプモードでスタンプが選択されていない場合は何もしない
  hideGuide(); // ガイドを非表示にする

  const pos = getMousePos(event); // Canvas上の座標を取得
  const stampSize = 130; // スタンプのサイズを設定

  ctx.drawImage(
    currentStamp,
    pos.x - stampSize / 2,
    pos.y - stampSize / 2,
    stampSize,
    stampSize
  );

  saveHistory(); // スタンプ描画後に履歴を保存
});

// ---canvas描画機能の作成--- 

// 座標計算用のヘルパー関数
function getMousePos(event) {
  const rect = canvas.getBoundingClientRect(); // キャンバスの位置とサイズを取得

  // タッチ操作かマウス操作か判定して座標を取得
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  // 画面上の表示サイズとCanvas本来の解像度のスケール計算
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX, // スケールを掛けてCanvas内部の座標に変換
    y: (clientY - rect.top) * scaleY
  };
}

// 描画開始（マウス/タッチが押されたとき）
function startDrawing(event) {
  hideGuide(); // ガイドを非表示にする
  if (nowMode === 'stamp') return; // スタンプモードでは描画しない
  if (event.cancelable) event.preventDefault(); // スマホで画面がスクロールするのを防ぐ
  isDrawing = true; // 描画状態を開始
  const pos = getMousePos(event); // 位置を取得
  ctx.beginPath(); // 新しいパスを開始 (ペンがつながらないようにする)
  ctx.moveTo(pos.x, pos.y); // パスの開始位置を設定
}

// 描画中（マウス/タッチが動いたとき）
function draw(event) {
  if (!isDrawing || nowMode === 'stamp') return; // 描画状態でなければ何もしない
  if (event.cancelable) event.preventDefault(); // スマホで画面がスクロールするのを防ぐ
  const pos = getMousePos(event); // 位置を取得
  ctx.lineTo(pos.x, pos.y); // パスに新しい点を追加
  ctx.stroke(); // パスを描画
}

// 描画終了（マウス/タッチが離されたとき）
function stopDrawing() {
  if (!isDrawing) return; // 描画状態でなければ何もしない
  isDrawing = false; // 描画状態を終了
  ctx.closePath(); // パスを閉じる
  saveHistory(); // 描画終了後に履歴を保存
}

// ---イベントリスナーの登録---
canvas.addEventListener('mousedown', startDrawing); // マウスが押されたとき
canvas.addEventListener('mousemove', draw); // マウスが動いたとき
canvas.addEventListener('mouseup', stopDrawing); // マウスが離されたとき
canvas.addEventListener('mouseleave', stopDrawing); // マウスがキャンバス外に出たとき

canvas.addEventListener('touchstart', startDrawing, { passive: false }); // タッチが押されたとき
canvas.addEventListener('touchmove', draw, { passive: false }); // タッチが動いたとき
canvas.addEventListener('touchend', stopDrawing); // タッチが離されたとき
canvas.addEventListener('touchcancel', stopDrawing); // タッチがキャンセルされたとき

// --- diaryText の行数制限コード ---
const diaryText = document.getElementById('diaryText');
const MAX_LINES = 9; // 最大行数

const measureCanvas = document.createElement('canvas'); // 仮のCanvasを作成して文字幅を計測
const measureCtx = measureCanvas.getContext('2d');
measureCtx.font = '20px "Kiwi Maru", serif';

function getLineCount(text) {
  const maxTextWidth = diaryText.clientWidth - 20; // テキストエリアの幅を取得
  if (maxTextWidth <= 0) return 1; // 幅が取得できない場合は1行を返す

  const rawLines = text.split('\n'); // 改行で分割
  let totalLines = 0;

  for (const line of rawLines) {
    if (line === '') {
      totalLines += 1; // 空行は1行としてカウント
      continue;
    }
    let currentLineWidth = 0;
    let lineCount = 1; // 最低でも1行はある
    for (const char of line) {
      const charWidth = measureCtx.measureText(char).width; // 文字の幅を計測
      if (currentLineWidth + charWidth > maxTextWidth) {
        lineCount += 1; // 1行を超えたら改行としてカウント
        currentLineWidth = charWidth; // 新しい行の幅を初期化
      } else {
        currentLineWidth += charWidth; // 現在の行の幅を更新
      }
    }
    totalLines += lineCount; // 総行数に加算
  }
  return totalLines;
}

function trimExLines() {
  while (getLineCount(diaryText.value) > MAX_LINES && diaryText.value.length > 0) {
    diaryText.value = diaryText.value.slice(0, -1);
  }
}

// diaryTextの入力イベントで行数をチェック
diaryText.addEventListener('input', (e) => {
  if (e.isComposing) return; // IME入力中は無視
  trimExLines(); // 行数が超えた場合は末尾を削除
});

// 変換確定時
diaryText.addEventListener('compositionend', () => {
  trimExLines(); // 行数が超えた場合は末尾を削除
});

// --- 絵日記画像を合成してダウンロードする関数 ---
async function exportDiaryImage() {
  // 1. 各入力を取得
  const dateVal = document.getElementById('diaryDate').value;
  const weatherVal = document.getElementById('diaryWeather').value;
  const textVal = document.getElementById('diaryText').value;

  // 日付の表記を整える (2026-08-09 ➔ 2026年08月09日)
  let dateText = dateVal;
  if (dateVal) {
    const [y, m, d] = dateVal.split('-');
    dateText = `${y}年${m}月${d}日`;
  }

  // 画面で使うすべてのテキスト（漢字を含む）を結合
  const allText = `夏の絵日記メーカー日付年月日天気${weatherVal}${dateText}${textVal}`;

  await Promise.all([
    document.fonts.load('500 36px "Kiwi Maru"', allText),
    document.fonts.load('500 22px "Kiwi Maru"', allText),
    document.fonts.load('400 24px "Kiwi Maru"', allText)
  ]);
  document.fonts.ready; //WebFontの読み込みを待つ

  // 2. メモリ上に合成用Canvasを作成 (サイズ: 横700px × 縦1050px)
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 700;
  exportCanvas.height = 1050;
  const expCtx = exportCanvas.getContext('2d');

  // --- A. 全体の背景描画 ---
  expCtx.fillStyle = 'oklch(97.7% 0.013 236.62)';
  expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // 外枠
  expCtx.strokeStyle = 'oklch(80.9% 0.105 251.813)';
  expCtx.lineWidth = 9;
  expCtx.strokeRect(20, 20, exportCanvas.width - 40, exportCanvas.height - 40);

  // タイトル描画
  expCtx.fillStyle = 'oklch(50% 0.134 242.749)';
  expCtx.font = '500 36px "Kiwi Maru", serif';
  expCtx.textAlign = 'center';
  expCtx.fillText('夏 の 絵 日 記 メ ー カ ー', exportCanvas.width / 2, 65);

  // --- B. お絵描きCanvasの合成 ---
  // 元のCanvas(diaryCanvas)をそのまま描画
  const drawX = 50;
  const drawY = 85;
  const drawWidth = 600;
  const drawHeight = 400;

  // 背景と枠線を描いてから絵を乗せる
  expCtx.fillStyle = 'oklch(97.7% 0.013 236.62)';
  expCtx.fillRect(drawX, drawY, drawWidth, drawHeight);
  expCtx.drawImage(canvas, drawX, drawY, drawWidth, drawHeight);

  // キャンバス枠線
  expCtx.strokeStyle = 'oklch(80.9% 0.105 251.813)';
  expCtx.lineWidth = 3;
  expCtx.strokeRect(drawX, drawY, drawWidth, drawHeight);

  // --- C. 日付 ＆ 天気 エリアの描画 ---
  const infoY = 510;
  const infoHeight = 50;

  // 背景帯
  expCtx.fillStyle = 'oklch(58.8% 0.158 241.966)';
  expCtx.fillRect(50, infoY, 600, infoHeight);

  // 帯の上下に薄い枠線を引く
  expCtx.strokeStyle = 'oklch(80.9% 0.105 251.813)';
  expCtx.lineWidth = 1;
  expCtx.strokeRect(50, infoY, 600, infoHeight);

  // 文字の描画
  const textY = infoY + 32;
  expCtx.fillStyle = 'oklch(95.1% 0.026 236.824)';
  expCtx.font = '500 22px "kiwi Maru", serif';
  expCtx.textAlign = 'left';
  expCtx.fillText(`日付：${dateText}`, 70, textY);
  expCtx.textAlign = 'right';
  expCtx.fillText(`天気：${weatherVal}`, 630, textY);

  // --- D. 本文とノート罫線の描画 ---
  const textStartY = 585; // 1行目のY座標
  const lineHeight = 46;  // 行と行の間隔（高さ）
  const maxLines = 9;     // 描画する最大行数
  const maxTextWidth = 600; // 1行の最大幅(px)

  expCtx.fillStyle = 'oklch(50% 0.134 242.749)';
  expCtx.font = '400 24px "kiwi Maru", serif';
  expCtx.textAlign = 'left';

  // 文章を改行や自動折り返しで1行ずつ分解する
  const rawLines = textVal.split('\n');
  let formattedLines = [];

  rawLines.forEach(line => {
    let currentLine = '';
    for (let char of line) {
      const testLine = currentLine + char;
      const metrics = expCtx.measureText(testLine); // 文字の横幅(px)を計算
      if (metrics.width > maxTextWidth && currentLine !== '') {
        formattedLines.push(currentLine);// 600pxを超えたら、そこまでの文字を1行として確定
        currentLine = char; // 溢れた1文字を次の行の先頭にする
      } else {
        currentLine = testLine; // まだ収まるなら文字を追加していく
      }
    }
    formattedLines.push(currentLine);
  });

  // 罫線と文章を上から描画
  for (let i = 0; i < maxLines; i++) {
    const currentY = textStartY + (i * lineHeight); // i行目のY座標を計算

    // 罫線を描画
    expCtx.beginPath();
    expCtx.strokeStyle = '#7fd5fa';
    expCtx.lineWidth = 1;
    expCtx.moveTo(50, currentY + 6);
    expCtx.lineTo(650, currentY + 6);
    expCtx.stroke();

    // 文字があれば描画
    if (formattedLines[i]) {
      expCtx.fillText(formattedLines[i], 50, currentY);
    }
  }

    // 保存完了通知表示用の関数
    function showSaveToast() {
      const toast = document.getElementById('saveToast');
      if (!toast) return;

      // 通知を表示
      toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
      toast.classList.add('opacity-100', 'translate-y-0');

      // 2.5秒後に通知を消す
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
      }, 2500);
    }

  // --- E. ダウンロード発火処理 ---
  const link = document.createElement('a');
  link.download = `絵日記_${dateVal || '夏のおもいで'}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
  showSaveToast();
}

// --- イベント登録 ---
document.getElementById('downloadBtn').addEventListener('click', exportDiaryImage);


