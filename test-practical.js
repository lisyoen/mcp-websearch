#!/usr/bin/env node

/**
 * 실용적인 웹 스크랩핑 테스트 (뉴스 사이트, 블로그 등)
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Hacker News 프론트 페이지 스크랩
 */
async function testHackerNews() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📰 Hacker News 상위 5개 기사');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://news.ycombinator.com';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const stories = [];
    $('.athing').each((i, elem) => {
      if (i >= 5) return false;
      
      const $elem = $(elem);
      const title = $elem.find('.titleline > a').first().text().trim();
      const url = $elem.find('.titleline > a').first().attr('href');
      
      if (title && url) {
        stories.push({ title, url });
      }
    });
    
    console.log(`✅ ${stories.length}개 기사 발견:\n`);
    stories.forEach((story, idx) => {
      console.log(`${idx + 1}. ${story.title}`);
      console.log(`   ${story.url}\n`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message, '\n');
  }
}

/**
 * GitHub Trending 페이지 스크랩
 */
async function testGitHubTrending() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⭐ GitHub Trending Repositories (Today)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://github.com/trending';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const repos = [];
    $('article.Box-row').each((i, elem) => {
      if (i >= 5) return false;
      
      const $elem = $(elem);
      const name = $elem.find('h2 a').text().trim().replace(/\s+/g, ' ');
      const description = $elem.find('p').first().text().trim();
      const stars = $elem.find('.d-inline-block.float-sm-right').text().trim();
      
      if (name) {
        repos.push({ name, description: description || '설명 없음', stars });
      }
    });
    
    console.log(`✅ ${repos.length}개 저장소 발견:\n`);
    repos.forEach((repo, idx) => {
      console.log(`${idx + 1}. ${repo.name}`);
      console.log(`   ${repo.description}`);
      console.log(`   ⭐ ${repo.stars}\n`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message, '\n');
  }
}

/**
 * 웹페이지 메타데이터 추출
 */
async function testMetadataExtraction() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️  웹페이지 메타데이터 추출');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const testUrls = [
    'https://www.wikipedia.org',
    'https://nodejs.org',
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`📡 ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(10000),
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const metadata = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || 
                    '설명 없음',
        keywords: $('meta[name="keywords"]').attr('content') || '키워드 없음',
        ogImage: $('meta[property="og:image"]').attr('content') || '이미지 없음',
      };
      
      console.log(`   제목: ${metadata.title}`);
      console.log(`   설명: ${metadata.description.substring(0, 100)}...`);
      console.log(`   키워드: ${metadata.keywords}`);
      console.log(`   OG 이미지: ${metadata.ogImage}\n`);
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}\n`);
    }
  }
}

/**
 * 링크 수집 테스트
 */
async function testLinkCollection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 페이지 내 모든 링크 수집');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://example.com';
    console.log(`📡 ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const links = new Set();
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, url).href;
          links.add(absoluteUrl);
        } catch (e) {
          // 잘못된 URL 무시
        }
      }
    });
    
    console.log(`✅ ${links.size}개 고유 링크 발견:`);
    Array.from(links).forEach(link => {
      console.log(`   ${link}`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ 오류:', error.message, '\n');
  }
}

/**
 * 모든 실용 테스트 실행
 */
async function runPracticalTests() {
  console.log('\n🧪 실용적인 웹 스크랩핑 테스트\n');
  console.log('='.repeat(60), '\n');
  
  await testHackerNews();
  await testGitHubTrending();
  await testMetadataExtraction();
  await testLinkCollection();
  
  console.log('='.repeat(60));
  console.log('🎉 모든 실용 테스트 완료!');
  console.log('='.repeat(60), '\n');
}

runPracticalTests().catch(console.error);
