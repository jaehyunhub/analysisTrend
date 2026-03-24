/**
 * DB 헬퍼
 * docker-compose MySQL에 직접 접근해 테스트 데이터 시드/초기화합니다.
 * 주로 global-setup / global-teardown 에서 사용합니다.
 */
import mysql from 'mysql2/promise';

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const defaultDBConfig: DBConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'analysis_trend',
};

/**
 * 특정 이메일 사용자의 role을 ADMIN으로 업데이트합니다.
 */
export async function setAdminRole(email: string, config: DBConfig = defaultDBConfig): Promise<void> {
  const connection = await mysql.createConnection(config);
  try {
    const [result] = await connection.execute(
      "UPDATE users SET role = 'ADMIN' WHERE email = ?",
      [email],
    );
    const res = result as { affectedRows: number };
    if (res.affectedRows === 0) {
      throw new Error(`[DB] ${email} 계정을 찾을 수 없습니다. 먼저 회원가입이 필요합니다.`);
    }
    console.log(`[DB] ${email} → ADMIN role 부여 완료`);
  } finally {
    await connection.end();
  }
}

/**
 * 테스트 데이터 시드
 */
export async function seedTestData(_config: DBConfig = defaultDBConfig): Promise<void> {
  console.log('[DB] 테스트 데이터 시드 (미구현)');
}

/**
 * 테스트 데이터 정리
 */
export async function cleanupTestData(_config: DBConfig = defaultDBConfig): Promise<void> {
  const connection = await mysql.createConnection(_config);
  try {
    await connection.execute("DELETE FROM posts WHERE author_email LIKE '%@e2e.com'");
    console.log('[DB] 테스트 데이터 정리 완료');
  } catch {
    console.log('[DB] 테스트 데이터 정리 실패 (무시)');
  } finally {
    await connection.end();
  }
}
