#!/usr/bin/env node

/**
 * MCP 서버 직접 호출 테스트 (JSON-RPC stdio)
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

async function testMCPServer() {
  console.log('🧪 MCP 서버 직접 호출 테스트 시작\n');
  
  // 서버 프로세스 시작
  const serverProcess = spawn('node', ['server.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });
  
  const rl = createInterface({
    input: serverProcess.stdout,
    output: process.stdout,
    terminal: false
  });
  
  let messageId = 1;
  
  // JSON-RPC 메시지 전송 함수
  function sendMessage(method, params) {
    const message = {
      jsonrpc: '2.0',
      id: messageId++,
      method,
      params: params || {}
    };
    
    console.log('📤 요청:', JSON.stringify(message, null, 2));
    serverProcess.stdin.write(JSON.stringify(message) + '\n');
  }
  
  // 응답 수신
  rl.on('line', (line) => {
    try {
      const response = JSON.parse(line);
      console.log('📥 응답:', JSON.stringify(response, null, 2), '\n');
    } catch (error) {
      console.log('원본 출력:', line);
    }
  });
  
  // 테스트 시퀀스
  setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. initialize 요청');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sendMessage('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });
  }, 1000);
  
  setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2. tools/list 요청');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sendMessage('tools/list');
  }, 2000);
  
  setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3. tools/call - web.fetch 요청');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sendMessage('tools/call', {
      name: 'web.fetch',
      arguments: {
        url: 'https://example.com',
        mode: 'summary',
        timeoutMs: 10000
      }
    });
  }, 3000);
  
  setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4. tools/call - web.scrape 요청');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    sendMessage('tools/call', {
      name: 'web.scrape',
      arguments: {
        url: 'https://example.com',
        selector: 'h1',
        limit: 5
      }
    });
  }, 5000);
  
  setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 테스트 완료 - 서버 종료');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    serverProcess.kill();
    process.exit(0);
  }, 8000);
  
  // 오류 핸들링
  serverProcess.on('error', (error) => {
    console.error('❌ 서버 프로세스 오류:', error);
    process.exit(1);
  });
  
  serverProcess.on('exit', (code) => {
    console.log(`\n🔌 서버 종료 (코드: ${code})`);
  });
}

testMCPServer().catch(console.error);
