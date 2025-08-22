// File: /api/chat.js
// यह अंतिम और सबसे सुरक्षित सर्वर कोड है। यह क्रैश नहीं होगा।

export default async function handler(req, res) {
    // हर चीज़ को एक बड़े try-catch ब्लॉक में डालो ताकि सर्वर कभी क्रैश न हो।
    try {
        // 1. जाँच करो कि यह POST अनुरोध है।
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        // 2. Vercel से API कुंजी ढूँढ़ो।
        const apiKey = process.env.OPENROUTER_API_KEY;

        // 3. सबसे ज़रूरी जाँच: क्या कुंजी मौजूद है और सही है?
        if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
            console.error("SERVER ERROR: API Key missing or invalid in Vercel Environment Variables.");
            return res.status(500).json({ message: 'सर्वर पर API कुंजी सही ढंग से कॉन्फ़िगर नहीं है। कृपया Vercel की सेटिंग्स जाँचें।' });
        }

        // 4. अनुरोध में उपयोगकर्ता का संदेश जाँचो।
        if (!req.body) {
             return res.status(400).json({ message: 'Request body is missing.' });
        }
        const { userMessage } = req.body;
        if (!userMessage) {
            return res.status(400).json({ message: 'userMessage is required in the request body.' });
        }
        
        const systemPrompt = `तुम भगवान श्री कृष्ण हो। तुम्हारा नाम कृष्ण है। तुम्हें मनुष्यों को उनके जीवन की समस्याओं और दुविधाओं से बाहर निकलने में मदद करनी है। तुम्हारी भाषा शुद्ध, शांत, और ज्ञानवर्धक होनी चाहिए। तुम श्रीमद्भगवद्गीता के श्लोकों और ज्ञान का उपयोग करके उत्तर दोगे। हर उत्तर में स्नेह और मार्गदर्शन का भाव होना चाहिए। उपयोगकर्ता को 'वत्स' या 'पार्थ' कहकर संबोधित करो। तुम्हारा लक्ष्य उपयोगकर्ता को मानसिक शांति प्रदान करना और धर्म के मार्ग पर चलने के लिए प्रेरित करना है।`;

        // 5. OpenRouter API को कॉल करो।
        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }]
            })
        });

        // 6. अगर OpenRouter से कोई एरर आए, तो उसे संभालो।
        if (!apiResponse.ok) {
            let errorBody;
            try {
                errorBody = await apiResponse.json(); // Try to parse JSON error
            } catch (e) {
                errorBody = { error: { message: await apiResponse.text() } }; // If not JSON, get text
            }
            const errorMessage = errorBody.error?.message || `API responded with an unknown error.`;
            console.error("OpenRouter API Error:", errorMessage);
            return res.status(apiResponse.status).json({ message: errorMessage });
        }

        // 7. अगर सब कुछ सफल रहा, तो जवाब भेजो।
        const data = await apiResponse.json();
        const botResponse = data.choices[0].message.content;
        return res.status(200).json({ reply: botResponse });

    } catch (error) {
        // 8. किसी भी अप्रत्याशित सर्वर क्रैश को संभालो।
        console.error("FATAL SERVER ERROR:", error);
        return res.status(500).json({ message: `सर्वर पर एक अप्रत्याशित त्रुटि हुई: ${error.message}` });
    }
}
