from langchain.prompts import ChatPromptTemplate
import os
import openai 
import cosmosdb
from langchain.prompts import ChatPromptTemplate
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_community.vectorstores.azure_cosmos_db import AzureCosmosDBVectorSearch
from typing import List
from bson import ObjectId
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from dotenv import load_dotenv
load_dotenv(override=True)

# Create RAG Function


MONGO_CONNECTION_STRING= os.getenv("MONGO_CONNECTION_STRING_DISKANN")
COLLECTION_NAME=os.getenv("COLLECTION_NAME") if os.getenv("COLLECTION_NAME") else "listings"
DATABASE_NAME= os.getenv("DATABASE_NAME") if os.getenv("DATABASE_NAME") else "contoso_bookings"
AOAI_KEY = os.getenv("AOAI_KEY")
AOAI_ENDPOINT =  os.getenv("AOAI_ENDPOINT")
API_VERSION =  os.getenv("API_VERSION")
AOAI_CHAT_MODEL_DEPLOYMENT = os.getenv("AOAI_COMPLETION_DEPLOYMENT")


openai_chat_model = os.getenv("AZURE_OPENAI_CHAT_MODEL_NAME", "gpt-3.5-turbo")

azure_openai_chat: AzureChatOpenAI = AzureChatOpenAI(
    model=openai_chat_model,
    azure_deployment=AOAI_CHAT_MODEL_DEPLOYMENT,
    api_key=AOAI_KEY,
    azure_endpoint=AOAI_ENDPOINT,
    api_version=API_VERSION,

)


REPHRASE_PROMPT = """\
Given the following conversation and a follow up question, rephrase the follow up \
question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:"""

CONTEXT_PROMPT = """\
You are a chatbot, tasked with answering any question about \
rental listings from the context. You may only suggest rental options that exist in the context \
You can also answer questions about the particular areas, and provide suggestions for things to do. \
You may ask a follow up question about things the user likes to do while on vacation or if there's a particular point of interest.

Generate a response of 150 words or less for the \
given question based solely on the provided search results. \
You must only use information from the provided search results. Use an unbiased and \
fun tone. Do not repeat text. Do not suggest areas that don't exist in the context's locations. \
For example, if the context is about a rental listings with great hiking spots in Portland, Oregon, \
don't suggest rental listings based in Burlington, Vermont \
Your response must be solely based on the provided context. \

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


# Rephrase Chain
rephrase_chain = rephrase_prompt_template | azure_openai_chat
# Context Chain
context_chain = context_prompt_template | azure_openai_chat

MESSAGE_HISTORY = []

## Custom Retriever

class CustomRetriever(BaseRetriever):
    def _get_relevant_documents(self, query: str, amenity:str, user_location:list, *,  run_manager: CallbackManagerForRetrieverRun) -> List[Document]:
        search_results = cosmosdb.search_listings(query, amenity, user_location)
        documents = [] # List of Document objects
        for result in search_results:
            document = Document(
                id={str(result['_id'])},
                page_content=result['name'],
                metadata=result
            )
            
            documents.append(document)
        return documents
    
retriever = CustomRetriever()
# Use a custom retriever
document_retriever = retriever

def send_chat_message(message, amenity, user_location):

    MESSAGE_HISTORY.append([{"content": message, "role": "user"}])
 
    rephrased_question = rephrase_chain.invoke({"chat_history": MESSAGE_HISTORY[:-1], "question": MESSAGE_HISTORY[-1]})
    context = document_retriever.invoke(str(rephrased_question.content), amenity=amenity, user_location=user_location)
    response = context_chain.invoke({"context": context, "input": rephrased_question.content})

    MESSAGE_HISTORY.append({"content": response.content, "role": "assistant"})

    return response.content, [doc.metadata for doc in context]

