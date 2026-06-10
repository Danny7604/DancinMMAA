/**
 * HƯỚNG DẪN RESET DATABASE DANCIN MMAA
 * 
 * Cách 1 (Khuyên dùng - Nhanh nhất):
 * Vào Supabase Dashboard -> SQL Editor -> Chạy đoạn code SQL sau:
 * 
 *   TRUNCATE TABLE transactions RESTART IDENTITY CASCADE;
 *   TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;
 *   TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
 *   TRUNCATE TABLE users RESTART IDENTITY CASCADE;
 * 
 * ---
 * 
 * Cách 2 (Dùng script Node.js):
 * Điền URL và KEY của Supabase vào đây, sau đó chạy lệnh:
 *   node reset_db.js
 */

const SUPABASE_URL = "YOUR_SUPABASE_URL"; // Điền Supabase URL của bạn (VD: https://xxxx.supabase.co)
const SUPABASE_KEY = "YOUR_SUPABASE_KEY"; // Điền API Key của bạn (service_role hoặc anon)

async function resetTable(tableName) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  });
  if (response.ok) {
    console.log(`✅ Đã xóa sạch dữ liệu bảng: ${tableName}`);
  } else {
    console.error(`❌ Lỗi khi xóa bảng ${tableName}:`, response.status, await response.text());
  }
}

async function run() {
  if (SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_KEY === "YOUR_SUPABASE_KEY") {
    console.error("Vui lòng điền SUPABASE_URL và SUPABASE_KEY vào file reset_db.js!");
    return;
  }
  
  console.log("⏳ Bắt đầu dọn dẹp database...");
  
  // Xóa theo thứ tự ràng buộc khóa ngoại để tránh lỗi (transactions -> accounts -> categories -> users)
  await resetTable('transactions');
  await resetTable('accounts');
  await resetTable('categories');
  await resetTable('users');
  
  console.log("🎉 Reset dữ liệu database thành công!");
}

run();
