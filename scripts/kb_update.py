from dotenv import load_dotenv
import json
import os
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import *

load_dotenv()
endpoint = os.getenv("AIS_ENDPOINT")
api_key = os.getenv("AIS_API_KEY")
index_name = os.getenv("AIS_INDEX_NAME")
kb_path = "../data/knowledge_base.json"

client = SearchClient(endpoint=endpoint,
                      index_name=index_name,
                      credential=AzureKeyCredential(api_key))

with open(kb_path, "r") as file:
    data = json.load(file)

for doc in data:
    doc["@search.action"] = "upload"

try:
    result = client.upload_documents(documents=data)
    print(f"Upload successful! Uploaded {len(result)} documents.")  # Print number of documents uploaded
    results = client.search("*")  # Query for all documents
    print(f"Found {results} documents in the index.")
except Exception as e:
    print(f"Error uploading documents: {e}")