import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class ProductTag extends Entity {
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
  title: string;

  @property({
    type: 'string',
  })
  color?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ProductTag>) {
    super(data);
  }
}

export interface ProductTagRelations {
  // describe navigational properties here
}

export type ProductTagWithRelations = ProductTag & ProductTagRelations;
