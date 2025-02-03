import { Injectable } from '@nestjs/common';
import { ICard, IGroup } from './interfaces/directus.interface';
import { FormatterService } from './formatter.service';
import { readItems } from '@directus/sdk';

const language: object = {
  en: 'en-US',
  fr: 'fr-FR',
};

@Injectable()
export class DirectusService {
  constructor(private readonly formatterService: FormatterService) {}

  // ========== CARD ==========
  async handleCardRequest(
    client: any,
    languageCode: ICard['languageCode'],
    type: ICard['type'],
    id: ICard['id'],
  ): Promise<Array<unknown>> {
    try {
      let result;

      switch (type) {
        case 'users':
          result = await this.usersRequest(client, languageCode, id);
          break;
        case 'situations':
          result = await this.situationsRequest(client, languageCode, id);
          break;
        case 'design-for-all':
          result = await this.designRequest(client, languageCode, id);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  // Card Request & formatter Function
  async usersRequest(
    client: any,
    languageCode: ICard['languageCode'],
    id: ICard['id'],
  ) {
    const filter: any = {};

    // Add the filter for `id` only if `id` is not null
    if (id !== null) {
      filter.id = { _eq: id };
    }

    // Make an explicit request for users (allows filtering fields)
    let usersData = await client.request(
      readItems<any, any, any>('cards_users', {
        filter,
        deep: {
          handicap_category: {
            translations: {
              _filter: {
                languages_code: { _eq: language[languageCode] }, // Choose language
              },
            },
          },
          translations: {
            _filter: {
              languages_code: { _eq: language[languageCode] },
            },
          },
        },
        fields: [
            // Allows filtering the fields we want
          {
            handicap_category: [
              'icon',
              {
                translations: ['category_name'],
              },
            ],
          },
          'image',
          {
            translations: ['description'],
          },
        ],
      }),
    );

    // Formatting data
    usersData = this.formatterService.usersFormatter(usersData);

    return usersData;
  }

  async situationsRequest(
    client: any,
    languageCode: ICard['languageCode'],
    id: ICard['id'],
  ) {
    const filter: any = {};

    // Add the filter for `id` only if `id` is not null
    if (id !== null) {
      filter.id = { _eq: id };
    }

    // Make an explicit request for users (allows filtering fields)
    let situationsData = await client.request(
      readItems<any, any, any>(`cards_situations`, {
        filter,
        deep: {
          translations: {
            _filter: {
              _and: [
                {
                  languages_code: { _eq: language[languageCode] }, // Choose language
                },
              ],
            },
          },
          context_translations: {
            _filter: {
              languages_code: { _eq: language[languageCode] },
            },
          },
          description_translations: {
            _filter: {
              languages_code: { _eq: language[languageCode] },
            },
          },
        },
        fields: [
          // Allows filtering the fields we want
          'image',
          {
            context_translations: ['context'],
          },
          {
            description_translations: ['description'],
          },
        ],
      }),
    );

    // Formatting data
    situationsData = this.formatterService.situationsFormatter(situationsData);

    return situationsData;
  }

  async designRequest(
    client: any,
    languageCode: ICard['languageCode'],
    id: ICard['id'],
  ) {
    const filter: any = {};

    // Add the filter for `id` only if `id` is not null
    if (id !== null) {
      filter.id = { _eq: id };
    }

    // Make an explicit request for users (allows filtering fields)
    let designData = await client.request(
      readItems<any, any, any>('cards_design_for_all', {
        filter,
        deep: {
          principle_category: {
            translations: {
              _filter: {
                languages_code: { _eq: language[languageCode] }, // Choose language
              },
            },
          },
          translations: {
            _filter: {
              _and: [
                {
                  languages_code: { _eq: language[languageCode] },
                },
              ],
            },
          },
        },
        fields: [
          // Allows filtering the fields we want
          'image',
          {
            principle_category: [
              'icon',
              {
                translations: ['category_name'],
              },
            ],
          },
          {
            translations: ['description'],
          },
        ],
      }),
    );

    // Formatting data
    designData = this.formatterService.designFormatter(designData);

    return designData;
  }

  // ========== GROUP ==========
  async handleGroupRequest(
    client: any,
    languageCode: IGroup['languageCode'],
    id: IGroup['id'],
  ): Promise<Array<unknown>> {
    try {
      const filter: any = {};

      // Add the filter for `id` only if `id` is not null
      if (id !== null) {
        filter.id = { _eq: id };
      }

      // Make an explicit request for users (allows filtering fields)
      let groupData = await client.request(
        readItems<any, any, any>('cards_group', {
          filter,
          deep: {
            //
            translations: {
              _filter: {
                _and: [
                  {
                    languages_code: { _eq: language[languageCode] }, // Choose language
                  },
                ],
              },
            },
            usage_situation: {
              translations: {
                _filter: {
                  _and: [
                    {
                      languages_code: { _eq: language[languageCode] }, 
                    },
                  ],
                },
              },
              context_translations: {
                _filter: {
                  languages_code: { _eq: language[languageCode] }, 
                },
              },
              description_translations: {
                _filter: {
                  languages_code: { _eq: language[languageCode] }, 
                },
              },
            },
            extreme_user: {
              cards_users_id: {
                handicap_category: {
                  translations: {
                    _filter: {
                      languages_code: { _eq: language[languageCode] }, 
                    },
                  },
                },
                translations: {
                  _filter: {
                    languages_code: { _eq: language[languageCode] }, 
                  },
                },
              },
            },
          },
          fields: [
            {
              usage_situation: [
                'image',
                {
                  context_translations: ['context'],
                },
                {
                  description_translations: ['description'],
                },
              ],
            },
            {
              translations: ['title'],
              extreme_user: [
                {
                  cards_users_id: [
                    {
                      handicap_category: [
                        'icon',
                        {
                          translations: ['category_name'],
                        },
                      ],
                    },
                    'image',
                    {
                      translations: ['description'],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      // Formatting data
      groupData = this.formatterService.groupFormatter(groupData);

      return groupData;
    } catch (error) {
      throw new Error(error);
    }
  }

  // ========== DECK ==========
  async handleDeckRequest(
    client: any,
    languageCode: IGroup['languageCode'],
    id: IGroup['id'],
  ): Promise<Array<unknown>> {
    try {
      const filter: any = {};

      // Add the filter for `id` only if `id` is not null
      if (id !== null) {
        filter.id = { _eq: id };
      }

      // Make an explicit request for users (allows filtering fields)
      let groupData = await client.request(
        readItems<any, any, any>('decks', {
          filter,
          deep: {
            //
            translations: {
              _filter: {
                _and: [
                  {
                    languages_code: { _eq: language[languageCode] }, // Choose language
                  },
                ],
              },
            },
            group: {
              translations: {
                _filter: {
                  _and: [
                    {
                      languages_code: { _eq: language[languageCode] },
                    },
                  ],
                },
              },
              cards_group_id: {
                translations: {
                  _filter: {
                    _and: [
                      {
                        languages_code: { _eq: language[languageCode] },
                      },
                    ],
                  },
                },
                usage_situation: {
                  translations: {
                    _filter: {
                      _and: [
                        {
                          languages_code: { _eq: language[languageCode] },
                        },
                      ],
                    },
                  },
                  context_translations: {
                    _filter: {
                      languages_code: { _eq: language[languageCode] },
                    },
                  },
                  description_translations: {
                    _filter: {
                      languages_code: { _eq: language[languageCode] },
                    },
                  },
                },
                extreme_user: {
                  cards_users_id: {
                    handicap_category: {
                      translations: {
                        _filter: {
                          languages_code: { _eq: language[languageCode] },
                        },
                      },
                    },
                    translations: {
                      _filter: {
                        languages_code: { _eq: language[languageCode] },
                      },
                    },
                  },
                },
              },
            },
          },
          fields: [
            {
              group: [
                {
                  cards_group_id: [
                    {
                      usage_situation: [
                        'image',
                        {
                          context_translations: ['context'],
                        },
                        {
                          description_translations: ['description'],
                        },
                      ],
                    },
                    {
                      translations: ['title'],
                      extreme_user: [
                        {
                          cards_users_id: [
                            {
                              handicap_category: [
                                'icon',
                                {
                                  translations: ['category_name'],
                                },
                              ],
                            },
                            'image',
                            {
                              translations: ['description'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              translations: ['title'],
            },
          ],
        }),
      );

      // Formatting data
      groupData = this.formatterService.deckFormatter(groupData);

      return groupData;
    } catch (error) {
      throw new Error(error);
    }
  }
}
