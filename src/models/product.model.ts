import {Entity, belongsTo, model, property} from '@loopback/repository';
import {ProductCategory} from './product-category.model';

@model({settings: {strict: false}})
export class Product extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectID'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @belongsTo(() => ProductCategory)
  categoryId: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'object',
  })
  medias: {
    images: Array<ProductMedia>;
    thumbnail: Array<ProductMedia>;
  };

  @property({
    type: 'boolean',
    required: true,
  })
  hidden: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductMedia {
  filename: string;
  originalname: string;
  size: number;
  path: string;
  createAt: number;
  updateAt: number;
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
