/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver-es';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export abstract class ExportService {

  public static exportJsonToExcelFile(json: any[], excelFileName: string): void {
    this.exportWorksheet(XLSX.utils.json_to_sheet(json),excelFileName);
  }

  public static exportArrayToExcelFile(data: any[][],excelFileName: string): void {
    this.exportWorksheet(XLSX.utils.aoa_to_sheet(data),excelFileName);
  }

  private static exportWorksheet(worksheet: XLSX.WorkSheet, excelFileName: string,) {
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private static saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

}
