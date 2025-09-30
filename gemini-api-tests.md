# Native Gemini API Testing with Google Search

This file contains examples for testing the newly implemented native Gemini API forwarding functionality, including Google Search tool capabilities.

## Available Endpoints

### 1. List Models
```bash
curl -X GET https://your-worker.workers.dev/gemini/models \
  -H "Authorization: Bearer sk-your-secret-api-key-here"
```

### 2. Google Search Test (Quick Test Endpoint)
```bash
curl -X POST https://your-worker.workers.dev/gemini/search-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-suncloud" \
  -d '{
    "query": "latest developments in artificial intelligence 2024"
  }'
```

### 3. Generate Content with Google Search Tool
```bash
curl -X POST https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/generateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "What are the latest trends in machine learning for 2024? Please search for recent information."
          }
        ]
      }
    ],
    "tools": [
      {
        "googleSearchRetrieval": {
          "dynamicRetrievalConfig": {
            "mode": "MODE_DYNAMIC",
            "dynamicThreshold": 0.7
          }
        }
      }
    ],
    "generationConfig": {
      "temperature": 0.3,
      "maxOutputTokens": 2048
    }
  }'
```

### 4. Stream Generate Content with Google Search
```bash
curl -X POST https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/streamGenerateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Search for and summarize the latest developments in quantum computing. Please provide real-time information."
          }
        ]
      }
    ],
    "tools": [
      {
        "googleSearchRetrieval": {
          "dynamicRetrievalConfig": {
            "mode": "MODE_DYNAMIC",
            "dynamicThreshold": 0.8
          }
        }
      }
    ],
    "generationConfig": {
      "temperature": 0.4,
      "maxOutputTokens": 3000
    }
  }'
```

### 4. Image Analysis with Native Gemini API
```bash
curl -X POST https://your-worker.workers.dev/gemini/models/gemini-2.5-pro/generateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "What do you see in this image?"
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": "/9j/4AAQSkZJRgABAQAAAQABAAD..."
            }
          }
        ]
      }
    ]
  }'
```

## JavaScript Examples

### Google Search with Fetch API
```javascript
// Test Google Search functionality
async function testGoogleSearch() {
  const response = await fetch('https://your-worker.workers.dev/gemini/search-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-suncloud'
    },
    body: JSON.stringify({
      query: 'latest developments in artificial intelligence 2024'
    })
  });

  const data = await response.json();
  console.log(data);
}

// Generate content with Google Search tool
async function testGeminiWithSearch() {
  const response = await fetch('https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-secret-api-key-here'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'What are the latest trends in machine learning for 2024? Please search for recent information.'
            }
          ]
        }
      ],
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: 'MODE_DYNAMIC',
              dynamicThreshold: 0.7
            }
          }
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    })
  });

  const data = await response.json();
  console.log(data);
}

// Using Fetch API
```javascript
// Non-streaming request
async function testGeminiGenerate() {
  const response = await fetch('https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-secret-api-key-here'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Explain quantum computing in simple terms.'
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });

  const data = await response.json();
  console.log(data);
}

// Streaming request
async function testGeminiStream() {
  const response = await fetch('https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/streamGenerateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-secret-api-key-here'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Write a haiku about artificial intelligence.'
            }
          ]
        }
      ]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.substring(6));
          console.log(data);
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  }
}
```

### Using Node.js
```javascript
const https = require('https');

function testGeminiAPI() {
  const postData = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'What is the meaning of life?'
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 512
    }
  });

  const options = {
    hostname: 'your-worker.workers.dev',
    port: 443,
    path: '/gemini/models/gemini-2.5-flash/generateContent',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-secret-api-key-here',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(postData);
  req.end();
}
```

## Python Examples

### Using requests library
```python
import requests
import json

# Non-streaming request
def test_gemini_generate():
    url = "https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/generateContent"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-your-secret-api-key-here"
    }
    
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Write a Python function to calculate fibonacci numbers."
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(response.json())

# Streaming request
def test_gemini_stream():
    url = "https://your-worker.workers.dev/gemini/models/gemini-2.5-flash/streamGenerateContent"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-your-secret-api-key-here"
    }
    
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": "Tell me a joke about programming."
                    }
                ]
            }
        ]
    }
    
    response = requests.post(url, headers=headers, json=data, stream=True)
    
    for line in response.iter_lines():
        if line and line.startswith(b'data: '):
            try:
                chunk = json.loads(line[6:].decode())
                print(chunk)
            except json.JSONDecodeError:
                continue

if __name__ == "__main__":
    test_gemini_generate()
    test_gemini_stream()
```

## Expected Response Format

The native Gemini API responses maintain the original Gemini format:

### Non-streaming response:
```json
{
  "response": {
    "candidates": [
      {
        "content": {
          "parts": [
            {
              "text": "Hello! I'm doing well, thank you for asking..."
            }
          ]
        }
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 10,
      "candidatesTokenCount": 25
    }
  }
}
```

### Streaming response:
```
data: {"response":{"candidates":[{"content":{"parts":[{"text":"Hello!"}]}}]}}

data: {"response":{"candidates":[{"content":{"parts":[{"text":" I'm"}]}}]}}

data: {"response":{"candidates":[{"content":{"parts":[{"text":" doing"}]}}]}}
```

## Error Handling

The API handles various error scenarios:

1. **Authentication errors (401)**: Automatically retries with refreshed tokens
2. **Rate limiting (429)**: Returns appropriate error messages
3. **Invalid models**: Returns model not found errors
4. **Malformed requests**: Returns validation errors

Example error response:
```json
{
  "error": "Model 'invalid-model' not found"
}
```