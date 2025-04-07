import {ChromaClient, Collection, Document} from 'chromadb';

interface VectorDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];  // Add this line
}

class ChromaVector {
  private client: ChromaClient;
  private collections: Map<string, Collection>;

  constructor(path: string = 'http://localhost:8000', database ?: string) {
    this.client = new ChromaClient({path, database});
    this.collections = new Map();
  }

  async initializeCollection(collectionName: string): Promise<void> {
    if (!this.collections.has(collectionName)) {
      const collection = await this.client.createCollection({
        name: collectionName,
        // embeddingFunction: embeddingFunction
      });
      this.collections.set(collectionName, collection);
    }
  }

  async addDocument(collectionName: string, document: VectorDocument): Promise<void> {
    await this.initializeCollection(collectionName);
    const collection = this.collections.get(collectionName);
    if (collection) {
      await collection.add({
        ids: [document.id],
        documents: [document.content],
        metadatas: [document.metadata || {}],
        embeddings: document.embedding ? [document.embedding] : undefined,  // Add this line
      });
    } else {
      throw new Error(`Collection ${collectionName} not found`);
    }
  }

  async queryCollection(collectionName: string, query: string, topK: number = 5): Promise<Document[]> {
    await this.initializeCollection(collectionName);
    const collection = this.collections.get(collectionName);
    if (collection) {
      const results = await collection.query({
        queryTexts: [query],
        nResults: topK,
      });
      return results.documents[0] || [];
    } else {
      throw new Error(`Collection ${collectionName} not found`);
    }
  }

  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    const collection = this.collections.get(collectionName);
    if (collection) {
      await collection.delete({
        ids: [documentId],
      });
    } else {
      throw new Error(`Collection ${collectionName} not found`);
    }
  }

  async listCollections(): Promise<string[]> {
    return await this.client.listCollections();
  }

  async deleteCollection(collectionName: string): Promise<void> {
    await this.client.deleteCollection({ name: collectionName });
    this.collections.delete(collectionName);
  }
}

export default ChromaVector;
export {ChromaVector}
