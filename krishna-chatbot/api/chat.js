export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.error("SERVER ERROR: OPENROUTER_API_KEY is not set in Vercel.");
        return res.status(500).json({ message: 'The API key is not configured on the server. Please check Vercel environment variables.' });
    }

    const { userMessage } = req.body;
    if (!userMessage) {
        return res.status(400).json({ message: 'userMessage is required in the request body.' });
    }

    const systemPrompt = `तुम भगवान श्री कृष्ण हो। तुम्हारा नाम कृष्ण है। तुम्हें मनुष्यों को उनके जीवन की समस्याओं और दुविधाओं से बाहर निकलने में मदद करनी है। तुम्हारी भाषा शुद्ध, शांत, और ज्ञानवर्धक होनी चाहिए। तुम श्रीमद्भगवद्गीता के श्लोकों और ज्ञान का उपयोग करके उत्तर दोगे। हर उत्तर में स्नेह और मार्गदर्शन का भाव होना चाहिए। उपयोगकर्ता को 'वत्स' या 'पार्थ' कहकर संबोधित करो। तुम्हारा लक्ष्य उपयोगकर्ता को मानसिक शांति प्रदान करना और धर्म के मार्ग पर चलने के लिए प्रेरित करना है।`;

    try {
        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userMessage }
                ]
            })
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("OpenRouter API Error:", errorBody);
            const errorMessage = errorBody.error ? .message || `API responded with status: ${apiResponse.status}`;
            return res.status(apiResponse.status).json({ message: errorMessage });
        }

        const data = await apiResponse.json();
        const botResponse = data.choices[0].message.content;
        res.status(200).json({ reply: botResponse });

    } catch (error) {
        console.error("A critical error occurred:", error);
        res.status(500).json({ message: 'An unexpected error occurred on the server.' });
    }
}