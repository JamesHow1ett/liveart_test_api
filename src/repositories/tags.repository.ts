import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {ProductTag, ProductTagRelations} from '../models';

export class TagsRepository extends DefaultCrudRepository<
  ProductTag,
  typeof ProductTag.prototype.id,
  ProductTagRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(ProductTag, dataSource);
  }
}
