/**
 * DB 헬퍼
 * docker-compose MySQL에 직접 접근해 테스트 데이터 시드/초기화합니다.
 * 주로 global-setup / global-teardown 에서 사용합니다.
 *
 * 실제 구현 시 `mysql2` 패키지 추가 필요:
 * npm install --save-dev mysql2
 */

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
 * 테스트 데이터 시드
 * TODO: mysql2 설치 후 실제 쿼리 구현
 */
export async function seedTestData(_config: DBConfig = defaultDBConfig): Promise<void> {
  // const connection = await mysql.createConnection(config);
  // await connection.execute(`INSERT INTO ...`);
  // await connection.end();
  console.log('[DB] 테스트 데이터 시드 (미구현 — mysql2 설치 필요)');
}

/**
 * 테스트 데이터 정리
 */
export async function cleanupTestData(_config: DBConfig = defaultDBConfig): Promise<void> {
  // const connection = await mysql.createConnection(config);
  // await connection.execute(`DELETE FROM posts WHERE author_email LIKE '%@e2e.com'`);
  // await connection.end();
  console.log('[DB] 테스트 데이터 정리 (미구현 — mysql2 설치 필요)');
}
