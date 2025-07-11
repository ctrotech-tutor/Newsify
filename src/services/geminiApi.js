const GEMINI_API_KEY = "AIzaSyCRftuMjB92nfnXX04aACBBCHg1hr3ErrU";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const generateSummary = async (articleText, type = 'summary') => {
  try {
    let prompt;
    
    switch (type) {
      case 'summary':
        prompt = `Summarize this news article in 3-4 key bullet points:\n\n${articleText}`;
        break;
      case 'digest':
        prompt = `Create a brief daily news digest from these articles. Group by categories and provide key insights:\n\n${articleText}`;
        break;
      case 'quick_read':
        prompt = `Provide a 2-sentence quick read summary of this article:\n\n${articleText}`;
        break;
      default:
        prompt = `Summarize this content:\n\n${articleText}`;
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        success: true,
        summary: data.candidates[0].content.parts[0].text
      };
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      success: false,
      error: error.message,
      summary: 'Unable to generate summary at this time.'
    };
  }
};

export const generateDailyDigest = async (articles) => {
  try {
    const articlesText = articles.map(article => 
      `Title: ${article.title}\nDescription: ${article.description || 'No description'}\nCategory: ${article.category || 'General'}`
    ).join('\n\n');

    const prompt = `Create a comprehensive daily news digest from these articles. 
    Group them by categories (Technology, Sports, Politics, Business, etc.) and provide:
    1. A brief overview of each category
    2. Key trends or patterns
    3. Most important stories
    4. A concluding summary
    
    Articles:\n${articlesText}`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        success: true,
        digest: data.candidates[0].content.parts[0].text,
        generatedAt: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error generating daily digest:', error);
    return {
      success: false,
      error: error.message,
      digest: 'Unable to generate daily digest at this time.'
    };
  }
};

