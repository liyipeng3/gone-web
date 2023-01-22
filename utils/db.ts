import mysql from 'mysql2'
// @ts-expect-error
import wrapper from 'co-mysql'
import { DBConfig } from '@configs'

const config = DBConfig

const pool = mysql.createPool({
  host: config.host, // 服务器地址
  user: config.username, // 数据库用户名
  password: config.password, // 数据库密码
  database: config.database, // 数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const database = wrapper(pool)

const pageHelper: (sql: string, pageIndex: number, pageSize: number) => string = (sql: string, pageIndex: number, pageSize: number) => {
  if (pageSize > 0) {
    if (pageSize * (pageIndex - 1) <= 0) {
      return `${sql} limit ${pageSize}`
    } else {
      return `${sql} limit ?,?`
    }
  } else {
    return sql
  }
}

const db: {
  query: (sql: string, params?: any[], pageIndex?: number, pageSize?: number, isTotal?: boolean) => Promise<any>
} = {
  query: async (sql = '', params = [], pageIndex = -1, pageSize = -1, isTotal = false) => {
    const data = await database.query(pageHelper(sql, pageIndex, pageSize), [...params, pageSize * (pageIndex - 1), Number(pageSize)])
    if (isTotal) {
      const tempSql = sql.replace(/select.*?from/, 'select count(*) as total from')
      const total = await db.query(tempSql, params)
      data.total = total[0].total
    }
    return data
  }
}

export default db
