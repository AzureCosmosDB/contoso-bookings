from langchain.prompts import ChatPromptTemplate
import os
import openai 
from . import cosmosdb



# Create RAG Function
from langchain.prompts import ChatPromptTemplate
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_community.vectorstores.azure_cosmos_db import AzureCosmosDBVectorSearch

AOAI_KEY = os.getenv("AOAI_KEY")
AOAI_ENDPOINT =  os.getenv("AOAI_ENDPOINT")
API_VERSION =  os.getenv("API_VERSION")

# openai_embeddings_model = os.getenv("AZURE_OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")
# openai_embeddings_deployment = os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME", "embeddings")

# azure_openai_embeddings: AzureOpenAIEmbeddings = AzureOpenAIEmbeddings(
#     model=openai_embeddings_model,
#     azure_deployment=openai_embeddings_deployment,
#     api_key=AOAI_KEY,
#     azure_endpoint=AOAI_ENDPOINT,
# )

openai_chat_model = os.getenv("AZURE_OPENAI_CHAT_MODEL_NAME", "gpt-3.5-turbo")
openai_chat_deployment = os.getenv("AOAI_CHAT_DEPLOYMENT_NAME", "jasmineg-demo")

azure_openai_chat: AzureChatOpenAI = AzureChatOpenAI(
    model=openai_chat_model,
    azure_deployment=openai_chat_deployment,
    api_key=AOAI_KEY,
    azure_endpoint=AOAI_ENDPOINT,
    api_version=API_VERSION,

)

from typing import List
from bson import ObjectId
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

## Custom Retriever

class CustomRetriever(BaseRetriever):
    def _get_relevant_documents(self, query: str, *, run_manager: CallbackManagerForRetrieverRun) -> List[Document]:
        search_results = cosmosdb.search_listings(query)
    
        documents = [] # List of Document objects
        for result in search_results:
            document = Document(
                id={result['id']},
                page_content=result['name'],
                metadata=result
            )
            documents.append(document)
        return documents
    
query = "quiet house with hot tub"
retriever = CustomRetriever()

# Test the chat flow
chat_response = azure_openai_chat.invoke("Tell me a joke")
print(chat_response.content)

REPHRASE_PROMPT = """\
Given the following conversation and a follow up question, rephrase the follow up \
question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:"""

CONTEXT_PROMPT = """\
You are a chatbot, tasked with answering any question about \
rental listings from the context. You can also answer questions about the particular areas, and provide suggestions for things to do.\
You may ask a follow up question about things the user likes to do while on vacation or if there's a particular point of interest.

Generate a response of 100 words or less for the \
given question based solely on the provided search results. \
You must only use information from the provided search results. Use an unbiased and \
fun tone. Do not repeat text. Your response must be solely based on the provided context.

If there is nothing in the context is relevant to the question at hand, just say \
"I'm not sure." Don't try to make up an answer.

Anything between the following `context` html blocks is retrieved from a knowledge \
bank, not part of the conversation with the user. 

<context>
    {context} 
<context/>

REMEMBER: If there is no relevant information within the context, just say "I'm \
not sure." Don't try to make up an answer. Anything between the preceding 'context' \
html blocks is retrieved from a knowledge bank, not part of the conversation with the \
user.\

User Question: {input}

Chatbot Response:"""

rephrase_prompt_template = ChatPromptTemplate.from_template(REPHRASE_PROMPT)
context_prompt_template = ChatPromptTemplate.from_template(CONTEXT_PROMPT)

# Use a custom retriever
document_retriever = retriever

# Rephrase Chain
rephrase_chain = rephrase_prompt_template | azure_openai_chat
# Context Chain
context_chain = context_prompt_template | azure_openai_chat

messages = [{"content": "Do you have any houses in quiet neighborhoods?", "role": "user"}]

rephrased_question = rephrase_chain.invoke({"chat_history": messages[:-1], "question": messages[-1]})
print(rephrased_question.content)

# Get the context from the database
context = document_retriever.invoke(str(rephrased_question.content))

# Generate a response based on the context
response = context_chain.invoke({"context": context, "input": rephrased_question.content})
print(response.content)

messages.append({"content": response.content, "role": "assistant"})

# Test with another question to see if the chat history is maintained
messages.append({"content": "Which rental listings are quiet?", "role": "user"})

rephrased_question = rephrase_chain.invoke({"chat_history": messages[:-1], "question": messages[-1]})
context = document_retriever.invoke(str(rephrased_question.content))

response = context_chain.invoke({"context": context, "input": rephrased_question.content})

print("Rephrased Question: ", rephrased_question.content)
print("LLM Response: ", response.content)



def send_chat_message(message):
