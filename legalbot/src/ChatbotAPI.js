const API = {
  GetChatbotResponse: async message => {
    const apiKey = "YOUR_API_KEY";
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-002",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    };

    try {
      const response = await fetch(endpoint, requestOptions);
      const data = await response.json();
      const botMessage = data.choices[0].message.content;
      return botMessage;
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      return "Error: Failed to fetch response";
    }
  },
};

export default API;
