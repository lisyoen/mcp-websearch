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
 * DuckDuckGo HTML 검색 수행 및 결과 파싱
 * @param {string} query - 검색어
 * @param {number} count - 최대 결과 수
 * @returns {Promise<Array>} 검색 결과 배열
 */
async function searchDuckDuckGo(query, count = 5) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result__body').each((i, elem) => {
      if (i >= count) return false;
      
      const $elem = $(elem);
      const title = $elem.find('.result__title').text().trim();
      const link = $elem.find('.result__url').attr('href');
      const snippet = $elem.find('.result__snippet').text().trim();
      
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
    throw new Error(`검색 실패: ${error.message}`);
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
        description: "DuckDuckGo를 사용하여 웹 검색을 수행합니다.",
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
      const results = await searchDuckDuckGo(q, count);
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
