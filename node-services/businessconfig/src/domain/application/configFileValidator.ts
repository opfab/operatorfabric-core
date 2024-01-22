/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import Ajv from 'ajv';

export class JsonValidator {
    private ajv: Ajv;

    constructor() {
        this.ajv = new Ajv({removeAdditional: true});
    }

    public validateJSON(json: any, schema: any): { valid: boolean; json: any; errors?: string } {
        const valid = this.ajv.validate(schema, json);
        if (valid) {
            return { valid, json };
        } else {
             // Map over the errors to create an array of error message strings and then join them into a single string
            const errors = this.ajv.errors?.map(error => `${error.instancePath} ${error.message}`).join(", ") || '';
            return { valid, json: null, errors };
        }
    }


}

const userCardSchema = {
    type: 'object',
    properties: {
        template: {type: 'string'},
        endDateVisible: {type: 'boolean'},
        recipientForInformationVisible: {type: 'boolean'},
        publisherList: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {type: 'string'},
                    levels: {
                        type: 'array',
                        items: {type: 'number'}
                    }
                },
                required: ['id'],
                additionalProperties: false
            }
        },
        additionalProperties: false
    }
};

const stateSchema = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        description: {type: 'string'},
        color: {type: 'string'},
        userCard: userCardSchema,
        templateName: {type: 'string'},
        emailBodyTemplate: {type: 'string'},
        styles: {
            type: 'array',
            items: {type: 'string'}
        },
        acknowledgmentAllowed: {
            type: 'string',
            enum: ['Always', 'Never', 'OnlyWhenResponseDisabledForUser']
        },
        type: {type: 'string'}
    },
    additionalProperties: false
};

export const processSchema = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        id: {type: 'string'},
        version: {type: 'string'},
        uiVisibility: {
            type: 'object',
            properties: {
                monitoring: {type: 'boolean'},
                processMonitoring: {type: 'boolean'},
                logging: {type: 'boolean'},
                calendar: {type: 'boolean'}
            },
            additionalProperties: false
        },
        states: {
            type: 'object',
            patternProperties: {
                '.*': stateSchema
            },
            additionalProperties: false
        }
    },
    required: ['id', 'name', 'version'],
    additionalProperties: false
};


const monitoringExportFieldSchema = {
    type: "object",
    properties: {
      columnName: {
        type: "string"
      },
      jsonField: {
        type: "string"
      },
      type: {
        type: "string"
      },
      fields: {
        type: "array",
        items: {
          $ref: "#"
        }
      }
    },
    required: ["jsonField"],
    additionalProperties: false
  }


export const monitoringSchema = {
    type: 'object',
    properties: {
        export: {
            type: 'object',
            properties: {
                fields: {
                    type: 'array',
                    items: monitoringExportFieldSchema
                }
            },
            additionalProperties: false
        }
    },
    additionalProperties: false
};

