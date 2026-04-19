/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


/**********************
 * Example get method *
 **********************/

app.get('/suggest', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/suggest/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Post method for AI Task Suggestion *
****************************/

app.post('/suggest', async function(req, res) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.log("CRITICAL: GROQ_API_KEY is missing from Env Variables");
      return res.json({ 
        success: true, 
        suggestions: ["ERROR: GROQ_API_KEY is missing in AWS.", "Please configure process.env.GROQ_API_KEY in Lambda."] 
      });
    }

    const task = req.body && req.body.task;
    const imageUrl = req.body && req.body.imageUrl;
    if (!task) {
       return res.status(400).json({ error: "Provide a task object in the request body." });
    }

    const taskDetails = `
Task Name: ${task.name || 'Untitled'}
Description: ${task.description || 'None'}
Priority: ${task.priority || 'Normal'}
Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
Has Image Attached: ${task.filePath ? 'Yes' : 'No'}
`;

    const prompt = `You are a productivity expert. Look at the user's specific task details:
    
${taskDetails}

Suggest 3 highly actionable, short (up to 8 words) logical steps or advice to help them complete this specific task. 
IMPORTANT: Respond in the exact same language and script that the Task Name and Description are written in. If the input is in Romanized Marathi/Hindi (e.g., "speech dyache aahe"), ensure your reply is fluent, grammatically correct Romanized text. Do not leave sentences incomplete.
If an image is provided alongside this prompt, analyze it and incorporate specific details from the image into your 3 steps.
Return ONLY a JSON array of strings, without any markdown formatting. Example format: ["Research best tools", "Create a draft"]`;

    console.log("Sending prompt to Groq API via standard Node fetch...");

    let contentPayload;
    if (imageUrl) {
        contentPayload = [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
        ];
    } else {
        contentPayload = prompt; 
    }
    
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: contentPayload }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!groqResponse.ok) {
       const errBody = await groqResponse.text();
       console.error("Groq HTTP Error:", groqResponse.status, errBody);
       return res.json({ success: true, suggestions: ["Groq API Error: " + groqResponse.status, errBody] });
    }

    const payload = await groqResponse.json();
    const aiText = payload.choices[0]?.message?.content || "[]";
    
    let suggestions = [];
    try {
      suggestions = JSON.parse(aiText);
    } catch(e) {
       const match = aiText.match(/\[.*\]/s);
       if (match) {
         suggestions = JSON.parse(match[0]);
       } else {
         return res.json({ success: true, suggestions: ["JSON Parse Error from AI", aiText] });
       }
    }

    return res.json({ success: true, suggestions });
    
  } catch (error) {
    console.error("Fetch/Logic Error:", error);
    res.json({ success: true, suggestions: ["Internal Lambda Error:", error.message] });
  }
});

app.post('/suggest/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/suggest', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/suggest/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/suggest', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/suggest/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
