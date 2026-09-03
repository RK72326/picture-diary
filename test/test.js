// --- テスト ---

// 簡易アサーション関数
function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`%c[PASS] ${testName}`, 'color: green; font-weight: bold;');
  } else {
    console.error(`[FAIL] ${testName} - 期待値: "${expected}", 実際: "${actual}"`);
  }
}

console.log('--- テスト開始 ---');

// 日付フォーマットロジックの検証
function formatDate(year, month, day) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}
assertEqual(formatDate(2026, 8, 5), '2026-08-05', '日付がゼロ埋め形式(YYYY-MM-DD)にフォーマットされること');
assertEqual(formatDate(2026, 12, 25), '2026-12-25', '2桁の月日はそのまま維持されること');

// 履歴スタックの上限管理（maxHistory）ロジックの検証
function testHistoryLimit() {
  const stack = [];
  const max = 3;

  for (let i = 1; i <= 5; i++) {
    stack.push(`state_${i}`);
    if (stack.length > max) {
      stack.shift();
    }
  }
  return stack.length === 3 && stack[0] === 'state_3' && stack[2] === 'state_5';
}
assertEqual(testHistoryLimit(), true, '履歴スタックが最大数(maxHistory)を超えた際に古い履歴が破棄されること');

// 改行による行数分割ロジックの検証
function splitLines(text) {
  return text.split('\n');
}
const dummyText = '1行目\n2行目\n3行目';
assertEqual(splitLines(dummyText).length, 3, '改行コードで正しく3行に分解されること');

console.log('--- テスト完了 ---');