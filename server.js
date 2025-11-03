#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

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
    ],
  };
});

// 툴 호출 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "web.search") {
    const { q, count = 5 } = request.params.arguments;

    if (!q || typeof q !== "string") {
      throw new Error("검색어(q)는 필수 문자열입니다.");
    }

    try {
      const results = await webSearch(q, count);
      const markdown = formatResultsAsMarkdown(results);

      return {
        content: [
          {
            type: "text",
            text: markdown,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `오류 발생: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`알 수 없는 툴: ${request.params.name}`);
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
