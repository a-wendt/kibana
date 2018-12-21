/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { resolve } from 'path';
import { initRoutes } from './server/routes';
import { kySaltTrucksSpecProvider } from './server/sample_data/ky_salt_trucks';
import webLogsSavedObjects from './server/sample_data/web_logs_saved_objects.json';
import mappings from './mappings.json';
import { checkLicense } from './check_license';
import { watchStatusAndLicenseToInitialize } from
  '../../server/lib/watch_status_and_license_to_initialize';

export function gis(kibana) {

  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch', 'xpack_main'],
    id: 'gis',
    configPrefix: 'xpack.gis',
    publicDir: resolve(__dirname, 'public'),
    uiExports: {
      app: {
        title: 'Maps',
        description: 'Map application',
        main: 'plugins/gis/index',
        icon: 'plugins/gis/icon.svg',
        euiIconType: 'gisApp',
      },
      inspectorViews: [
        'plugins/gis/inspector/views/register_views',
      ],
      home: ['plugins/gis/register_feature'],
      styleSheetPaths: `${__dirname}/public/index.scss`,
      mappings
    },
    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server) {
      const gisEnabled = server.config().get('xpack.gis.enabled');

      if (gisEnabled) {
        const thisPlugin = this;
        const xpackMainPlugin = server.plugins.xpack_main;

        watchStatusAndLicenseToInitialize(xpackMainPlugin, thisPlugin,
          async license => {
            if (license && license.gis) {
              initRoutes(server);
            }
          });

        xpackMainPlugin.info
          .feature(thisPlugin.id)
          .registerLicenseCheckResultsGenerator(checkLicense);

        server.registerSampleDataset(kySaltTrucksSpecProvider);
        server.addSavedObjectsToSampleDataset('logs', webLogsSavedObjects);
        server.injectUiAppVars('gis', async () => {
          return await server.getInjectedUiAppVars('kibana');
        });
      } else {
        server.log(['info', 'maps'], 'Maps app disabled by configuration');
      }
    }
  });
}
