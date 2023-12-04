import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  patch,
} from '@loopback/rest';
import {ProductTag} from '../models';
import {TagsRepository} from '../repositories';

export class TagsController {
  constructor(
    @repository(TagsRepository)
    public tagRepository: TagsRepository,
  ) {}

  @post('/tags')
  @response(200, {
    description: 'Tag model instance',
    content: {'application/json': {schema: getModelSchemaRef(ProductTag)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductTag, {
            title: 'NewTag',
            exclude: ['id'],
          }),
        },
      },
    })
    productCategory: Omit<ProductTag, 'id'>,
  ): Promise<ProductTag> {
    return this.tagRepository.create(productCategory);
  }

  @get('/tags/count')
  @response(200, {
    description: 'ProductTag model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ProductTag) where?: Where<ProductTag>,
  ): Promise<Count> {
    return this.tagRepository.count(where);
  }

  @get('/tags')
  @response(200, {
    description: 'Array of Tags model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ProductTag, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ProductTag) filter?: Filter<ProductTag>,
  ): Promise<ProductTag[]> {
    return this.tagRepository.find(filter);
  }

  @patch('/tags/{id}')
  @response(204, {
    description: 'Tag PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductTag, {partial: true}),
        },
      },
    })
    productCategory: ProductTag,
  ): Promise<void> {
    await this.tagRepository.updateById(id, productCategory);
  }

  @del('/tags')
  @response(204, {
    description: 'Tag DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.tagRepository.deleteById(id);
  }
}
