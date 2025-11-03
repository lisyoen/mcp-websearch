#!/usr/bin/env node

/**
 * 새로 추가된 URL 탐색 툴 기능 테스트 (MCP 서버 없이 직접 테스트)
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * web.fetch 기능 테스트
 */
async function testWebFetch() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 테스트 1: web.fetch 기능');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://example.com';
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 스크립트, 스타일 제거
    $('script, style, noscript').remove();
    
    const title = $('title').text().trim();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    console.log(`✅ 요약 모드 결과:`);
    console.log(`   제목: ${title}`);
    console.log(`   본문 (처음 200자): ${bodyText.substring(0, 200)}...\n`);
    
    console.log(`✅ 원문 모드 결과:`);
    console.log(`   크기: ${html.length} 바이트`);
    console.log(`   처음 300자: ${html.substring(0, 300)}...\n`);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

/**
 * web.scrape 기능 테스트
 */
async function testWebScrape() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 테스트 2: web.scrape 기능');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://example.com';
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // h1 요소 추출
    console.log(`✅ 선택자 'h1' 텍스트 추출:`);
    const h1Texts = [];
    $('h1').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) h1Texts.push(text);
    });
    console.log(`   결과:`, JSON.stringify(h1Texts, null, 2));
    
    // a 태그의 href 속성 추출
    console.log(`\n✅ 선택자 'a' href 속성 추출:`);
    const hrefs = [];
    $('a').each((i, elem) => {
      if (i >= 5) return false; // 최대 5개
      const href = $(elem).attr('href');
      if (href) hrefs.push(href);
    });
    console.log(`   결과:`, JSON.stringify(hrefs, null, 2), '\n');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

/**
 * web.crawl 기능 테스트
 */
async function testWebCrawl() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 테스트 3: web.crawl 기능 (간단 버전)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const startUrl = 'https://example.com';
    const maxPages = 2;
    const visited = new Set();
    const results = [];
    
    console.log(`📡 시작 URL: ${startUrl}`);
    console.log(`   최대 페이지: ${maxPages}\n`);
    
    const queue = [startUrl];
    
    while (queue.length > 0 && results.length < maxPages) {
      const currentUrl = queue.shift();
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      
      console.log(`   크롤링 중: ${currentUrl}`);
      
      try {
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(5000),
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('title').text().trim() || '제목 없음';
        
        results.push({
          url: currentUrl,
          title,
          status: response.status
        });
        
        // 링크 수집 (동일 호스트만)
        const baseHost = new URL(startUrl).hostname;
        $('a[href]').each((i, elem) => {
          if (results.length >= maxPages) return false;
          
          const href = $(elem).attr('href');
          try {
            const absoluteUrl = new URL(href, currentUrl).href;
            const linkHost = new URL(absoluteUrl).hostname;
            
            if (linkHost === baseHost && !visited.has(absoluteUrl)) {
              queue.push(absoluteUrl);
            }
          } catch (e) {
            // 잘못된 URL 무시
          }
        });
        
      } catch (error) {
        console.log(`   ⚠️  오류: ${error.message}`);
      }
      
      // 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ 크롤링 완료:`);
    console.log(`   수집된 페이지: ${results.length}개`);
    console.log(JSON.stringify(results, null, 2), '\n');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

/**
 * 모든 테스트 실행
 */
async function runAllTests() {
  console.log('\n🧪 MCP 웹 탐색 툴 기능 테스트 시작\n');
  console.log('='.repeat(60), '\n');
  
  await testWebFetch();
  await testWebScrape();
  await testWebCrawl();
  
  console.log('='.repeat(60));
  console.log('🎉 모든 테스트 완료!');
  console.log('='.repeat(60), '\n');
}

runAllTests().catch(console.error);
