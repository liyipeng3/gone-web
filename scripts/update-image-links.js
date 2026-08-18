/**
 * 图片链接替换脚本
 * 将 posts 表 text 字段中的老图片链接
 *   https://lyp123.com/usr/uploads/YYYY/MM/XXXXXXXXXX.<ext>
 * 替换为
 *   https://oss.lyp123.com/img/XXXXXXXXXX.<ext>
 *
 * 用法：
 *   node scripts/update-image-links.js --dry-run   # 只预览将要替换的内容，不写库
 *   node scripts/update-image-links.js             # 真正执行 UPDATE
 */

// 加载环境变量
require('dotenv').config({ path: '.env.production.local' });
const mysql = require('mysql2/promise');

const DRY_RUN = process.argv.includes('--dry-run');

// 匹配 https://lyp123.com/usr/uploads/YYYY/MM/XXXX.<ext> 的图片链接
// 覆盖常见图片扩展名，避免遗漏（如 .jpeg）
const IMAGE_LINK_REGEX =
  /https?:\/\/lyp123\.com\/usr\/uploads\/\d+\/\d+\/(\d+\.(?:png|jpe?g|gif|webp|bmp|svg))/gi;
const REPLACEMENT = 'https://oss.lyp123.com/img/$1';

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
  console.log(DRY_RUN ? '模式：DRY-RUN（仅预览，不写库）' : '模式：执行（会写入数据库）');

  try {
    // 获取所有 posts 记录
    const [rows] = await connection.execute('SELECT cid, text FROM posts');
    console.log(`共找到 ${rows.length} 条记录`);

    let updatedCount = 0;
    let replacedLinks = 0;

    // 遍历每条记录
    for (const row of rows) {
      const { cid, text } = row;

      if (!text) continue;

      // 统计本条记录命中的链接数量（用于预览）
      const matches = text.match(IMAGE_LINK_REGEX) || [];
      if (matches.length === 0) continue;

      const newText = text.replace(IMAGE_LINK_REGEX, REPLACEMENT);
      if (newText === text) continue;

      replacedLinks += matches.length;
      updatedCount++;

      if (DRY_RUN) {
        console.log(`[预览] cid=${cid} 将替换 ${matches.length} 处：`);
        matches.forEach((m) =>
          console.log(`   ${m}  ->  ${m.replace(IMAGE_LINK_REGEX, REPLACEMENT)}`)
        );
      } else {
        await connection.execute('UPDATE posts SET text = ? WHERE cid = ?', [newText, cid]);
        console.log(`已更新记录 cid=${cid}（${matches.length} 处）`);
      }
    }

    console.log('------------------------------------------');
    console.log(
      `${DRY_RUN ? '预览' : '操作'}完成：涉及 ${updatedCount} 条记录，共 ${replacedLinks} 处图片链接`
    );
    if (DRY_RUN) {
      console.log('如无问题，去掉 --dry-run 再次运行即可真正写入数据库。');
    }
  } catch (error) {
    console.error('发生错误:', error);
    process.exitCode = 1;
  } finally {
    // 关闭数据库连接
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

// 执行函数
updateImageLinks().catch(console.error);
