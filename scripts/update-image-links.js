/**
 * 图片链接替换脚本
 * 将 posts 表中 text 字段的图片链接从 https://lyp123.com/usr/uploads/xxxx/xx/xxxxxxxxxx.png 
 * 替换为 https://lyp123.com/img/xxxxxxxxxx.png
 */

// 加载环境变量
require('dotenv').config({ path: '.env.production.local' });
const mysql = require('mysql2/promise');

// 从环境变量中获取数据库配置
const dbUrl = process.env.DATABASE_URL;
// 解析数据库连接字符串
const dbConfig = (() => {
  // 格式: mysql://username:password@host:port/database
  const url = new URL(dbUrl);
  return {
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1).split('?')[0]
  };
})();

async function updateImageLinks() {
  // 创建数据库连接
  const connection = await mysql.createConnection(dbConfig);
  console.log('数据库连接成功');

  try {
    // 获取所有 posts 记录
    const [rows] = await connection.execute('SELECT cid, text FROM posts');
    console.log(`共找到 ${rows.length} 条记录`);

    let updatedCount = 0;

    // 遍历每条记录
    for (const row of rows) {
      const { cid, text } = row;
      
      if (!text) continue;

      // 使用正则表达式匹配并替换图片链接
      // 匹配 https://lyp123.com/usr/uploads/YYYY/MM/XXXXXXXXXX.png 格式
      const regex = /https:\/\/lyp123\.com\/usr\/uploads\/\d+\/\d+\/(\d+\.png)/g;
      
      // 替换为新格式 https://lyp123.com/img/XXXXXXXXXX.png
      const newText = text.replace(regex, 'https://oss.lyp123.com/img/$1');
      
      // 如果内容有变化，则更新数据库
      if (newText !== text) {
        await connection.execute(
          'UPDATE posts SET text = ? WHERE cid = ?',
          [newText, cid]
        );
        updatedCount++;
        console.log(`已更新记录 ID: ${cid}`);
      }
    }

    console.log(`操作完成，共更新了 ${updatedCount} 条记录`);
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭数据库连接
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

// 执行函数
updateImageLinks().catch(console.error);
