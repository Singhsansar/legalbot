import { PineconeStore } from "@langchain/pinecone";
import { TaskType } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";



const pineconeApiKey = process.env.REACT_APP_PINECONE_API_KEY;
const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const pineconeIndex_key = process.env.REACT_APP_PINECONE_INDEX;


const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
});

const pineconeIndex = pinecone.Index(pineconeIndex_key);

const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
    apiKey: googleApiKey
});

const model = new ChatGoogleGenerativeAI({
    apiKey: googleApiKey,
    modelName: "gemini-pro",
    maxOutputTokens: 2048,
});

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    { pineconeIndex }
);

const prompt_template = `
    As a legal professional, provide an informed response to the user's query, considering the laws in India. Ensure your answer adheres to Indian legal standards and includes relevant rules and regulations.
    You can also generate responses on your own; don't fully depend on the provided context.

    Context: {context}
    Question: {question}

    Present your answer in accordance with legal principles and refrain from conjecture or speculation. you are flexiable to answer the casual questions
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


export async function searchSimilarQuestions(question) {
    try {
        const res = await chain.invoke({ question, chat_history: "" });
        return res.text;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return "I don't know, it's not in my knowledge.";
        } else {
            console.error("Error occurred during similarity search:", error);
            return null;
        }
    }
}
