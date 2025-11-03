#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";

// =============================================================================
// 공통 유틸리티
// =============================================================================

/**
 * 프록시 에이전트 생성 (HTTP_PROXY/HTTPS_PROXY 환경 변수 감지)
 */
function createProxyAgent() {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxy) {
    console.error(`프록시 감지: ${proxy}`);
    return new HttpsProxyAgent(proxy);
  }
  return undefined;
}

/**
 * URL 유효성 검증
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('HTTP 또는 HTTPS 프로토콜만 지원됩니다.');
    }
    return parsed;
  } catch (error) {
    throw new Error(`잘못된 URL 형식입니다: ${error.message}`);
  }
}

/**
 * 안전한 텍스트 절단 (최대 길이 제한)
 */
function safeTruncate(text, maxLength = 100000) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '\n\n... (내용이 잘렸습니다)';
}

/**
 * HTML에서 텍스트 추출 및 정규화
 */
function extractTextFromHtml(html, maxLength = 5000) {
  const $ = cheerio.load(html);
  
  // 스크립트, 스타일 제거
  $('script, style, noscript').remove();
  
  const title = $('title').text().trim();
  const bodyText = $('body').text()
    .replace(/\s+/g, ' ')  // 연속된 공백을 하나로
    .trim();
  
  return {
    title: title || '제목 없음',
    text: safeTruncate(bodyText, maxLength)
  };
}

/**
 * HTTP 요청 공통 옵션
 */
function getDefaultFetchOptions(timeoutMs = 15000) {
  const agent = createProxyAgent();
  
  return {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    },
    agent,
    timeout: timeoutMs,
    signal: AbortSignal.timeout(timeoutMs)
  };
}

// =============================================================================
// 툴 구현: web.fetch, web.scrape, web.crawl
// =============================================================================

/**
 * 단일 URL 가져오기 및 요약/원문 반환
 */
async function fetchUrl(url, mode = 'summary', timeoutMs = 15000) {
  validateUrl(url);
  
  try {
    const response = await fetch(url, getDefaultFetchOptions(timeoutMs));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    
    const body = await response.text();
    
    if (mode === 'raw' || !isHtml) {
      // 원문 모드 또는 비-HTML
      return {
        url,
        contentType,
        content: safeTruncate(body, 100000)
      };
    }
    
    // HTML 요약 모드
    const { title, text } = extractTextFromHtml(body);
    
    return {
      url,
      contentType,
      title,
      summary: text
    };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`타임아웃: ${timeoutMs}ms 내에 응답이 없습니다.`);
    }
    throw new Error(`URL 가져오기 실패: ${error.message}`);
  }
}

/**
 * fetchUrl 결과를 Markdown으로 포맷팅
 */
function formatFetchResult(result) {
  let markdown = `# URL 가져오기 결과\n\n`;
  markdown += `**URL:** ${result.url}\n`;
  markdown += `**Content-Type:** ${result.contentType}\n\n`;
  
  if (result.title) {
    markdown += `## ${result.title}\n\n`;
    markdown += result.summary || '';
  } else {
    markdown += `## 내용\n\n\`\`\`\n${result.content}\n\`\`\`\n`;
  }
  
  return markdown;
}

/**
 * CSS 선택자로 요소 추출
 */
async function scrapeUrl(url, selector, attr = null, limit = 20) {
  validateUrl(url);
  
  if (!selector || typeof selector !== 'string') {
    throw new Error('selector는 필수 문자열입니다.');
  }
  
  try {
    const response = await fetch(url, getDefaultFetchOptions());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = [];
    $(selector).each((i, elem) => {
      if (i >= limit) return false;
      
      const $elem = $(elem);
      
      if (attr) {
        // 속성 값 추출
        const value = $elem.attr(attr);
        if (value) {
          results.push(value);
        }
      } else {
        // 텍스트 추출
        const text = $elem.text().trim();
        if (text) {
          results.push(text);
        }
      }
    });
    
    return results;
    
  } catch (error) {
    throw new Error(`스크랩 실패: ${error.message}`);
  }
}

/**
 * 지연 처리 (Promise)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * BFS 크롤링
 */
async function crawlUrl(startUrl, maxPages = 10, sameHostOnly = true, delayMs = 300, pattern = null) {
  const startParsed = validateUrl(startUrl);
  const startHost = startParsed.hostname;
  
  const visited = new Set();
  const queue = [startUrl];
  const results = [];
  
  const patternRegex = pattern ? new RegExp(pattern, 'i') : null;
  
  while (queue.length > 0 && results.length < maxPages) {
    const currentUrl = queue.shift();
    
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);
    
    try {
      const response = await fetch(currentUrl, getDefaultFetchOptions());
      
      if (!response.ok) {
        console.error(`크롤 건너뜀 (HTTP ${response.status}): ${currentUrl}`);
        continue;
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        console.error(`크롤 건너뜀 (비-HTML): ${currentUrl}`);
        continue;
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // 페이지 정보 수집
      const title = $('title').text().trim() || '제목 없음';
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      const preview = safeTruncate(bodyText, 500);
      
      results.push({
        url: currentUrl,
        title,
        preview
      });
      
      // 링크 확장
      if (results.length < maxPages) {
        $('a[href]').each((i, elem) => {
          try {
            const href = $(elem).attr('href');
            const absoluteUrl = new URL(href, currentUrl).href;
            const parsedUrl = new URL(absoluteUrl);
            
            // 동일 호스트 필터
            if (sameHostOnly && parsedUrl.hostname !== startHost) {
              return;
            }
            
            // 패턴 필터
            if (patternRegex && !patternRegex.test(absoluteUrl)) {
              return;
            }
            
            // 중복 제거
            if (!visited.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
              queue.push(absoluteUrl);
            }
          } catch (e) {
            // 잘못된 URL 무시
          }
        });
      }
      
      // 지연
      if (delayMs > 0 && queue.length > 0) {
        await delay(delayMs);
      }
      
    } catch (error) {
      console.error(`크롤 오류 (${currentUrl}): ${error.message}`);
    }
  }
  
  return results;
}

// =============================================================================
// 기존 검색 함수들
// =============================================================================

/**
 * Bing HTML 검색 수행 및 결과 파싱
 * @param {string} query - 검색어
 * @param {number} count - 최대 결과 수
 * @returns {Promise<Array>} 검색 결과 배열
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

/**
 * Brave Search HTML 검색 수행 및 결과 파싱 (폴백용)
 * @param {string} query - 검색어
 * @param {number} count - 최대 결과 수
 * @returns {Promise<Array>} 검색 결과 배열
 */
async function searchBrave(query, count = 5) {
  const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
  
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

    // Brave Search 검색 결과 파싱
    $('.snippet').each((i, elem) => {
      if (i >= count) return false;
      
      const $elem = $(elem);
      const $title = $elem.find('.snippet-title');
      const title = $title.text().trim();
      const link = $elem.find('.result-header').attr('href');
      const snippet = $elem.find('.snippet-description').text().trim();
      
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
    throw new Error(`Brave Search 실패: ${error.message}`);
  }
}

/**
 * 웹 검색 수행 (Bing 메인, Brave 폴백)
 * @param {string} query - 검색어
 * @param {number} count - 최대 결과 수
 * @returns {Promise<Array>} 검색 결과 배열
 */
async function webSearch(query, count = 5) {
  // 먼저 Bing 시도
  try {
    const results = await searchBing(query, count);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.error('Bing 검색 실패, Brave Search로 폴백:', error.message);
  }
  
  // Bing 실패 시 Brave Search 시도
  try {
    const results = await searchBrave(query, count);
    return results;
  } catch (error) {
    throw new Error(`모든 검색 엔진 실패: ${error.message}`);
  }
}

/**
 * 검색 결과를 Markdown 형식으로 변환
 * @param {Array} results - 검색 결과 배열
 * @returns {string} Markdown 텍스트
 */
function formatResultsAsMarkdown(results) {
  if (results.length === 0) {
    return "검색 결과가 없습니다.";
  }

  let markdown = `# 검색 결과 (${results.length}개)\n\n`;
  
  results.forEach((result, index) => {
    markdown += `## ${index + 1}. ${result.title}\n`;
    markdown += `**URL:** ${result.link}\n\n`;
    markdown += `${result.snippet}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

// MCP 서버 생성
const server = new Server(
  {
    name: "mcp-websearch",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 툴 목록 제공
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "web.search",
        description: "Bing을 사용하여 웹 검색을 수행합니다. (폴백: Brave Search)",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "검색어",
            },
            count: {
              type: "number",
              description: "최대 결과 수 (기본값: 5)",
              default: 5,
            },
          },
          required: ["q"],
        },
      },
      {
        name: "web.fetch",
        description: "단일 URL을 가져와 HTML이면 제목/본문 요약을, 비-HTML이면 원문을 반환합니다.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "가져올 URL",
            },
            mode: {
              type: "string",
              description: "반환 모드: 'summary' (요약, 기본값) 또는 'raw' (원문)",
              enum: ["summary", "raw"],
              default: "summary",
            },
            timeoutMs: {
              type: "number",
              description: "타임아웃 (밀리초, 기본값: 15000)",
              default: 15000,
            },
          },
          required: ["url"],
        },
      },
      {
        name: "web.scrape",
        description: "CSS 선택자로 웹 페이지에서 요소들을 추출합니다 (텍스트 또는 속성).",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "스크랩할 URL",
            },
            selector: {
              type: "string",
              description: "CSS 선택자 (예: 'article', '.content', '#main')",
            },
            attr: {
              type: "string",
              description: "추출할 속성 이름 (선택, 예: 'href'). 지정하지 않으면 텍스트 추출",
            },
            limit: {
              type: "number",
              description: "최대 결과 수 (기본값: 20)",
              default: 20,
            },
          },
          required: ["url", "selector"],
        },
      },
      {
        name: "web.crawl",
        description: "동일 호스트 내에서 BFS로 링크를 따라가며 간단한 크롤링을 수행합니다.",
        inputSchema: {
          type: "object",
          properties: {
            startUrl: {
              type: "string",
              description: "크롤링 시작 URL",
            },
            maxPages: {
              type: "number",
              description: "최대 페이지 수 (기본값: 10)",
              default: 10,
            },
            sameHostOnly: {
              type: "boolean",
              description: "동일 호스트만 크롤 (기본값: true)",
              default: true,
            },
            delayMs: {
              type: "number",
              description: "페이지 간 지연 시간 (밀리초, 기본값: 300)",
              default: 300,
            },
            pattern: {
              type: "string",
              description: "URL에 포함되어야 할 정규식 패턴 (선택)",
            },
          },
          required: ["startUrl"],
        },
      },
    ],
  };
});

// 툴 호출 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "web.search": {
        const { q, count = 5 } = args;
        if (!q || typeof q !== "string") {
          throw new Error("검색어(q)는 필수 문자열입니다.");
        }
        const results = await webSearch(q, count);
        const markdown = formatResultsAsMarkdown(results);
        return {
          content: [{ type: "text", text: markdown }],
        };
      }

      case "web.fetch": {
        const { url, mode = "summary", timeoutMs = 15000 } = args;
        if (!url || typeof url !== "string") {
          throw new Error("url은 필수 문자열입니다.");
        }
        const result = await fetchUrl(url, mode, timeoutMs);
        const markdown = formatFetchResult(result);
        return {
          content: [{ type: "text", text: markdown }],
        };
      }

      case "web.scrape": {
        const { url, selector, attr, limit = 20 } = args;
        if (!url || typeof url !== "string") {
          throw new Error("url은 필수 문자열입니다.");
        }
        if (!selector || typeof selector !== "string") {
          throw new Error("selector는 필수 문자열입니다.");
        }
        const results = await scrapeUrl(url, selector, attr, limit);
        const output = JSON.stringify(results, null, 2);
        return {
          content: [{ 
            type: "text", 
            text: `# 스크랩 결과\n\n**URL:** ${url}\n**선택자:** ${selector}\n${attr ? `**속성:** ${attr}\n` : ''}**결과 수:** ${results.length}\n\n\`\`\`json\n${output}\n\`\`\`` 
          }],
        };
      }

      case "web.crawl": {
        const { startUrl, maxPages = 10, sameHostOnly = true, delayMs = 300, pattern } = args;
        if (!startUrl || typeof startUrl !== "string") {
          throw new Error("startUrl은 필수 문자열입니다.");
        }
        const results = await crawlUrl(startUrl, maxPages, sameHostOnly, delayMs, pattern);
        const output = JSON.stringify(results, null, 2);
        return {
          content: [{ 
            type: "text", 
            text: `# 크롤링 결과\n\n**시작 URL:** ${startUrl}\n**수집 페이지:** ${results.length}개\n\n\`\`\`json\n${output}\n\`\`\`` 
          }],
        };
      }

      default:
        throw new Error(`알 수 없는 툴: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ 오류 발생: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// STDIO 전송 계층으로 서버 실행
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Web Search 서버가 STDIO로 실행 중입니다...");
}

main().catch((error) => {
  console.error("서버 실행 오류:", error);
  process.exit(1);
});
