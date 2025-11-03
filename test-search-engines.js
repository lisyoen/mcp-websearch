#!/usr/bin/env node

/**
 * 검색 엔진 접근성 테스트 스크립트
 * 여러 검색 엔진에 접근 가능한지 확인
 */

import fetch from 'node-fetch';

const searchEngines = [
  {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/html/?q=test',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=test',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=test',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=test',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  {
    name: 'Brave Search',
    url: 'https://search.brave.com/search?q=test',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
];

async function testSearchEngine(engine) {
  console.log(`\n테스트 중: ${engine.name}...`);
  console.log(`URL: ${engine.url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(engine.url, {
      headers: engine.headers,
      timeout: 10000 // 10초 타임아웃
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ 상태 코드: ${response.status}`);
    console.log(`⏱️  응답 시간: ${responseTime}ms`);
    console.log(`📏 컨텐츠 타입: ${response.headers.get('content-type')}`);
    
    const text = await response.text();
    console.log(`📦 응답 크기: ${text.length} bytes`);
    
    return {
      name: engine.name,
      accessible: response.status === 200,
      status: response.status,
      responseTime,
      contentLength: text.length
    };
  } catch (error) {
    console.log(`❌ 오류: ${error.message}`);
    return {
      name: engine.name,
      accessible: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('검색 엔진 접근성 테스트 시작');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const engine of searchEngines) {
    const result = await testSearchEngine(engine);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('테스트 결과 요약');
  console.log('='.repeat(60));
  
  const accessible = results.filter(r => r.accessible);
  const blocked = results.filter(r => !r.accessible);
  
  console.log('\n✅ 접근 가능한 검색 엔진:');
  if (accessible.length === 0) {
    console.log('  없음');
  } else {
    accessible.forEach(r => {
      console.log(`  - ${r.name} (${r.responseTime}ms)`);
    });
  }
  
  console.log('\n❌ 차단되거나 접근 불가능한 검색 엔진:');
  if (blocked.length === 0) {
    console.log('  없음');
  } else {
    blocked.forEach(r => {
      console.log(`  - ${r.name}: ${r.error || '상태 ' + r.status}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('권장 사항:');
  if (accessible.length > 0) {
    const fastest = accessible.sort((a, b) => a.responseTime - b.responseTime)[0];
    console.log(`가장 빠른 검색 엔진: ${fastest.name} (${fastest.responseTime}ms)`);
  } else {
    console.log('접근 가능한 검색 엔진이 없습니다.');
    console.log('회사 방화벽 또는 프록시 설정을 확인하세요.');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
