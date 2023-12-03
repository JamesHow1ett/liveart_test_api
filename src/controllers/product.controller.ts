import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  Request,
  RestBindings,
  Response,
} from '@loopback/rest';
import {Product, ProductMedia} from '../models';
import {ProductRepository} from '../repositories';
import {inject} from '@loopback/core';
import {upload} from '../middleware/upload-files.middleware';
import {
  deletePublicMediaByFilename,
  productMediaFactory,
  updateProductImg,
} from './utils/product-controller';

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  @post('/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody({
      description: 'multipart/form-data',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {type: 'object'},
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Product> {
    const product = await new Promise<Product>((resolve, reject) => {
      upload.any()(request, res, err => {
        if (err) {
          reject(err);
        } else {
          const [file] = request.files
            ? (request.files as Array<Express.Multer.File>)
            : [];

          resolve({
            ...request.body,
            medias: {
              images: [
                /* can be used in future if product will expaned */
              ],
              thumbnail: [this.createProductMedia(file)],
            },
          });
        }
      });
    });

    return this.productRepository.create(product);
  }

  @get('/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    return this.productRepository.count(where);
  }

  @get('/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.productRepository.find(filter);
  }

  @get('/products/active')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async findAllActiveProducts(@param.filter(Product) filter?: Filter<Product>) {
    const where = {hidden: false};
    return this.productRepository.find(
      Object.assign({}, filter, {where}) as Filter<Product>,
    );
  }

  @patch('/products')
  @response(200, {
    description: 'Product PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
    @param.where(Product) where?: Where<Product>,
  ): Promise<Count> {
    return this.productRepository.updateAll(product, where);
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Product, {exclude: 'where'})
    filter?: FilterExcludingWhere<Product>,
  ): Promise<Product> {
    return this.productRepository.findById(id, filter);
  }

  @patch('/products/{id}')
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
  ): Promise<void> {
    await this.productRepository.updateById(id, product);
  }

  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'multipart/form-data',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {type: 'object'},
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void> {
    const product = await this.productRepository.findById(id);
    const updatedProduct = await new Promise<Product>((resolve, reject) => {
      upload.any()(request, res, err => {
        if (err) {
          reject(err);
        } else {
          const [file] = request.files
            ? (request.files as Array<Express.Multer.File>)
            : [];

          const isProductHasThumbnail = !!product.medias.thumbnail[0];
          if (file) {
            const thumbnail: Array<ProductMedia> = [];

            if (isProductHasThumbnail) {
              this.deleteProductMedia(product.medias.thumbnail[0].filename);

              thumbnail.push(
                this.updateProductMedia(
                  product.medias.thumbnail[0],
                  file.filename,
                ),
              );
            } else {
              thumbnail.push(this.createProductMedia(file));
            }

            resolve({
              ...product,
              ...request.body,
              medias: {
                ...product.medias,
                thumbnail,
              },
            });
          } else {
            if (isProductHasThumbnail && request.body.removeThumb) {
              this.deleteProductMedia(product.medias.thumbnail[0].filename);
            }

            const newProduct = request.body.removeThumb
              ? {
                  ...product,
                  ...request.body,
                  medias: {
                    ...product.medias,
                    thumbnail: [],
                  },
                }
              : {
                  ...product,
                  ...request.body,
                };

            resolve(newProduct);
          }
        }
      });
    });
    await this.productRepository.replaceById(id, updatedProduct);
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.productRepository.deleteById(id);
  }

  private createProductMedia(file?: Express.Multer.File): ProductMedia {
    return productMediaFactory(file);
  }

  private updateProductMedia(
    media: ProductMedia,
    filename: string,
  ): ProductMedia {
    return updateProductImg(media, filename);
  }

  private deleteProductMedia(filename: string): boolean {
    return deletePublicMediaByFilename(filename);
  }
}
