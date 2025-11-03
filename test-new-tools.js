#!/usr/bin/env node

/**
 * 새로 추가된 URL 탐색 툴 테스트
 * - web.fetch: URL 가져오기 및 요약
 * - web.scrape: CSS 선택자로 데이터 추출
 * - web.crawl: 웹사이트 크롤링
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testNewTools() {
  console.log('🧪 MCP 웹 탐색 툴 테스트 시작\n');

  // MCP 클라이언트 및 전송 생성
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['server.js'],
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log('✅ MCP 서버 연결 성공\n');

    // 1. web.fetch 테스트 (summary 모드)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 1: web.fetch (summary 모드)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const fetchResult = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'web.fetch',
            arguments: {
              url: 'https://example.com',
              mode: 'summary',
              timeoutMs: 10000
            },
          },
        },
        null
      );
      console.log('결과:', JSON.stringify(fetchResult, null, 2));
      console.log('✅ web.fetch (summary) 테스트 성공\n');
    } catch (error) {
      console.error('❌ web.fetch (summary) 테스트 실패:', error.message);
    }

    // 2. web.fetch 테스트 (raw 모드)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 2: web.fetch (raw 모드)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const fetchRawResult = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'web.fetch',
            arguments: {
              url: 'https://example.com',
              mode: 'raw',
              timeoutMs: 10000
            },
          },
        },
        null
      );
      console.log('결과 길이:', fetchRawResult.content?.[0]?.text?.length || 0, '자');
      console.log('✅ web.fetch (raw) 테스트 성공\n');
    } catch (error) {
      console.error('❌ web.fetch (raw) 테스트 실패:', error.message);
    }

    // 3. web.scrape 테스트
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 3: web.scrape (CSS 선택자)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const scrapeResult = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'web.scrape',
            arguments: {
              url: 'https://example.com',
              selector: 'h1',
              limit: 5
            },
          },
        },
        null
      );
      console.log('결과:', JSON.stringify(scrapeResult, null, 2));
      console.log('✅ web.scrape 테스트 성공\n');
    } catch (error) {
      console.error('❌ web.scrape 테스트 실패:', error.message);
    }

    // 4. web.scrape 테스트 (속성 추출)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 4: web.scrape (href 속성 추출)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const scrapeAttrResult = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'web.scrape',
            arguments: {
              url: 'https://example.com',
              selector: 'a',
              attr: 'href',
              limit: 3
            },
          },
        },
        null
      );
      console.log('결과:', JSON.stringify(scrapeAttrResult, null, 2));
      console.log('✅ web.scrape (attr) 테스트 성공\n');
    } catch (error) {
      console.error('❌ web.scrape (attr) 테스트 실패:', error.message);
    }

    // 5. web.crawl 테스트 (제한된 크롤링)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 5: web.crawl (최대 2페이지)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const crawlResult = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'web.crawl',
            arguments: {
              startUrl: 'https://example.com',
              maxPages: 2,
              sameHostOnly: true,
              delayMs: 1000
            },
          },
        },
        null
      );
      console.log('결과:', JSON.stringify(crawlResult, null, 2));
      console.log('✅ web.crawl 테스트 성공\n');
    } catch (error) {
      console.error('❌ web.crawl 테스트 실패:', error.message);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 모든 테스트 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    // 정리
    await client.close();
    console.log('\n🔌 MCP 서버 종료');
  }
}

// 테스트 실행
testNewTools().catch(console.error);
