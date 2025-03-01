// services/cvParserService.js
require('dotenv').config();
const axios = require('axios');
const pdf = require('pdf-parse');

if (!process.env.CLAUDE_API_KEY) {
  throw new Error('CLAUDE_API_KEY is not set in environment variables');
}

const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';

const parseCV = async (fileBuffer, fileType) => {
  try {
    console.log(`Starting CV parse for file type: ${fileType}`);

    if (!fileBuffer) {
      throw new Error('No file buffer provided');
    }

    let textContent;
    
    // Extract text based on file type
    if (fileType === 'pdf') {
      try {
        const pdfData = await pdf(fileBuffer);
        textContent = pdfData.text;
      } catch (pdfError) {
        throw new Error(`Failed to parse PDF: ${pdfError.message}`);
      }
    } else {
      textContent = fileBuffer.toString('utf-8');
    }

    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No text content extracted from file');
    }

    console.log('Extracted text length:', textContent.length);

    const messages = [{
      role: "user",
      content: `Please analyze this resume/CV and extract the following information in JSON format:
      {
        "personalInfo": {
          "name": "",
          "email": "",
          "phone": "",
          "location": ""
        },
        "skills": [],
        "workExperience": [
          {
            "company": "",
            "position": "",
            "duration": "",
            "description": ""
          }
        ],
        "education": [
          {
            "institution": "",
            "degree": "",
            "year": "",
            "field": ""
          }
        ]
      }

      CV Content:
      ${textContent}`
    }];

    const response = await axios.post(
      CLAUDE_API_ENDPOINT,
      {
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: messages
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    if (!response.data || !response.data.content) {
      throw new Error('Invalid response from Claude API');
    }

    const parsedData = parseClaudeResponse(response.data.content);
    
    // Validate parsed data
    validateParsedData(parsedData);

    return parsedData;

  } catch (error) {
    console.error('CV parsing error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    throw new Error(`CV parsing failed: ${error.message}`);
  }
};

const validateParsedData = (data) => {
  const requiredFields = {
    personalInfo: ['name', 'email', 'phone', 'location'],
    workExperience: ['company', 'position', 'duration', 'description'],
    education: ['institution', 'degree', 'year', 'field']
  };

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure: not an object');
  }

  for (const [section, fields] of Object.entries(requiredFields)) {
    if (!data[section]) {
      throw new Error(`Missing required section: ${section}`);
    }

    if (section === 'workExperience' || section === 'education') {
      if (!Array.isArray(data[section])) {
        throw new Error(`${section} must be an array`);
      }
      
      data[section].forEach((item, index) => {
        fields.forEach(field => {
          if (!item.hasOwnProperty(field)) {
            throw new Error(`Missing ${field} in ${section}[${index}]`);
          }
        });
      });
    } else {
      fields.forEach(field => {
        if (!data[section].hasOwnProperty(field)) {
          throw new Error(`Missing ${field} in ${section}`);
        }
      });
    }
  }

  if (!Array.isArray(data.skills)) {
    throw new Error('Skills must be an array');
  }
};

const parseClaudeResponse = (content) => {
  try {
    let jsonStr = content;
    
    // If the response contains markdown code blocks, extract the JSON
    const codeBlockMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    // Clean up any potential invalid characters
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    const parsedData = JSON.parse(jsonStr);
    return parsedData;

  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error(`Failed to parse Claude response: ${error.message}`);
  }
};

module.exports = { parseCV };