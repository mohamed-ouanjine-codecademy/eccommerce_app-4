// server/services/SearchService.js
import { Client } from '@elastic/elasticsearch';
import Product from '../models/Product.js';

export default class SearchService {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
      auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD
      }
    });
    this.indexName = 'products';
  }

  async initialize() {
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              name: { type: 'text', analyzer: 'english' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              stock: { type: 'integer' }
            }
          }
        }
      });
    }
  }

  async indexProduct(product) {
    return this.client.index({
      index: this.indexName,
      id: product._id.toString(),
      body: {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock
      }
    });
  }

  async search(query) {
    const { body } = await this.client.search({
      index: this.indexName,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'category'],
            fuzziness: 'AUTO'
          }
        }
      }
    });
    
    return body.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  }
}