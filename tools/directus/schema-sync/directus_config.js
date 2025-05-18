/**
 * This file contains the default configuration for the schema exporter.
 *
 * Some possibly sensitive collections are commented out, remove the comments and add filters if needed
 *
 * Uncomment the collection you want to export.
 *
 * These are just some sensible settings, but you might not want to export everything
 *
 * Add custom collections to the syncCustomCollections object in the config.js file.
 */

export const syncDirectusCollections = {
  directus_folders: {
    watch: ['folders'],
    excludeFields: [],
    linkedFields: ['parent'],
    query: {
      sort: ['parent', 'id'],
    },
  },
  directus_roles: {
    watch: ['roles'],
    linkedFields: ['parent'],
    query: {
      filter: {
        name: { _neq: 'Administrator' },
      },
      sort: ['name'],
    },
  },
  directus_policies: {
    watch: ['policies'],
    query: {
      filter: {
        name: { _neq: 'Administrator' },
      },
      sort: ['name'],
    },
  },
  directus_permissions: {
    watch: ['permissions', 'collections', 'fields'],
    excludeFields: ['id'],
    getKey: (o) => `${o.policy}-${o.collection}-${o.action}`,
    query: {
      sort: ['policy', 'collection', 'action'],
    },
  },
  directus_access: {
    watch: ['access'],
    excludeFields: ['id'],
    getKey: (o) => `${o.role ?? o.user ?? 'public'}-${o.policy}`,
    query: {
      filter: {
        role: { 
          name: { _neq: 'Administrator' },
        },
      },
      sort: ['policy'],
    },
  },
  directus_dashboards: {
    watch: ['dashboards'],
    excludeFields: ['user_created', 'panels'],
  },
  directus_panels: {
    watch: ['panels'],
    excludeFields: ['user_created'],
  },
  directus_presets: {
    watch: ['presets'],
    excludeFields: ['id'],
    getKey: (o) =>
      `${o.role ?? 'all'}-${o.collection}-${o.bookmark || 'default'}`,
    query: {
      filter: {
        user: { _null: true },
      },
    },
  },
  directus_translations: {
    watch: ['translations'],
    excludeFields: ['id'],
    getKey: (o) => `${o.key}-${o.language}`,
    query: {
      sort: ['key', 'language'],
    },
  },
};
