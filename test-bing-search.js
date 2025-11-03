#!/usr/bin/env node

/**
 * server.js의 검색 기능 테스트
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Bing HTML 검색 수행 및 결과 파싱
 */
async function searchBing(query, count = 5) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    // Bing 검색 결과 파싱
    $('.b_algo').each((i, elem) => {
      if (i >= count) return false;
      
      const $elem = $(elem);
      const $title = $elem.find('h2 a');
      const title = $title.text().trim();
      const link = $title.attr('href');
      const snippet = $elem.find('.b_caption p, .b_caption').first().text().trim();
      
      if (title && link) {
        results.push({
          title,
          link,
          snippet: snippet || '설명 없음'
        });
      }
    });

    return results;
  } catch (error) {
    throw new Error(`Bing 검색 실패: ${error.message}`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Bing 검색 기능 테스트');
  console.log('='.repeat(60));
  
  const testQueries = [
    'Node.js MCP',
    'GitHub Copilot',
    '한글 검색 테스트'
  ];
  
  for (const query of testQueries) {
    console.log(`\n검색어: "${query}"`);
    console.log('-'.repeat(60));
    
    try {
      const results = await searchBing(query, 3);
      
      if (results.length === 0) {
        console.log('❌ 검색 결과가 없습니다.');
        continue;
      }
      
      console.log(`✅ ${results.length}개 결과 발견\n`);
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.link}`);
        console.log(`   요약: ${result.snippet.substring(0, 100)}${result.snippet.length > 100 ? '...' : ''}`);
        console.log();
      });
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('테스트 완료');
  console.log('='.repeat(60));
}

main().catch(console.error);
