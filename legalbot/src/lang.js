import { PineconeStore } from "@langchain/pinecone";
import { TaskType } from "@google/generative-ai";
import { PromptTemplate } from "langchain/prompts";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
    apiKey: process.env.GOOGLE_API_KEY
});

const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    maxOutputTokens: 2048,
});

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    { pineconeIndex }
);

const prompt_template = `
    As a legal professional, provide an informed response to the user's query. Ensure your answer adheres to legal standards and includes relevant rules and regulations.

    Context: {context}
    Question: {question}

    Present your answer in accordance with legal principles and refrain from conjecture or speculation.

    Helpful answer:
`;

const PROMPT = new PromptTemplate({
    inputVariables: ["context", "question"],
    template: prompt_template,
});

const chain_type_kwargs = { "prompt": PROMPT };

const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
        maxOutputTokens: 2048,
        returnSourceDocuments: true,
        questionGeneratorChainOptions: chain_type_kwargs,
    }
);

async function searchSimilarQuestions(question) {
    try {
        const res = await chain.invoke({ question });
        console.log(res);
        return res;
    } catch (error) {
        console.error("Error occurred during similarity search:", error);
        return null;
    }
}

(async () => {
    const question = "what is there in section 370 in constitution of india";
    const searchResults = await searchSimilarQuestions(question);
    console.log(searchResults);
})();
