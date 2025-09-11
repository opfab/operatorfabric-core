/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

// Type representing a cell to display in the CustomCardList component

export type ResultTableCell =
    | string // Simple string value to display in the cell
    | {
          value?: any; // Raw data for the cell; displayed by default if no other display value is provided
          stringValue?: string; // String representation to display if the raw value is not suitable for direct display
          color?: string; // Used for columns of type COLORED_CIRCLE to specify the circle's color
          htmlValue?: string; // HTML markup to render in the cell for custom display needs
          possibleValues?: {value: string; label: string}[]; // For select fields: list of selectable options
          allowNewOptionForSelect?: boolean; // For select fields: if true, allows user to add new options
      };
