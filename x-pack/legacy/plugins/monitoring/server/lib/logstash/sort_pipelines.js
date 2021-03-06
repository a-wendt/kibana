/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { sortByOrder } from 'lodash';

export function sortPipelines(pipelines, sort) {
  if (!sort) {
    return pipelines;
  }

  return sortByOrder(pipelines, pipeline => pipeline[sort.field], sort.direction);
}
