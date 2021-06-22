/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { JsonToArray as JsonToArray } from './json-to-array';


describe('set array columns ', () => {

  it('set two field in rules   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" }
    ]

    const wantedResult = [["column1", "column2"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('set two field with one bad rules   ', () => {

    const rules = [
      { dummy: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" }
    ]

    const wantedResult = [["column2"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('set tow field in rules but for two colums   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      { columnName: "column2", jsonField: "field3" }
    ]

    const wantedResult = [["column1", "column2"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

});



describe('flatten simple objects ', () => {

  it('add two field of an object in an array   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" }
    ]
    const jsonToConvert = { field1: "f1", field2: "f2", notFlattenField: "f3" };

    const wantedResult = [["column1", "column2"], ["f1", "f2"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);

    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('flatten simple objects with nested field  ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2.nestedField" },
      { columnName: "column3", jsonField: "field2.field3.nestedField" }
    ]
    const jsonToConvert = { field1: "f1", field2: { nestedField: "f2", field3: { nestedField: "f3" } } };

    const wantedResult = [["column1", "column2", "column3"], ["f1", "f2", "f3"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);

    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('add two field of three object in a two column  array   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" }
    ]
    const jsonToConvert1 = { field1: "f1.1", field2: "f1.2", notFlattenField: "f3" };
    const jsonToConvert2 = { field1: "f2.1", field2: "f2.2", notFlattenField: "f3" };
    const jsonToConvert3 = { field1: "f3.1", notFlattenField: "f3" };

    const wantedResult = [["column1", "column2"], ["f1.1", "f1.2"], ["f2.1", "f2.2"], ["f3.1", ""]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert1);
    jsonToArray.add(jsonToConvert2);
    jsonToArray.add(jsonToConvert3);

    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('add three field of three object in a two columns array   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      { columnName: "column2", jsonField: "field3" }
    ]
    const jsonToConvert1 = { field1: "f1.1", field2: "f1.2", notFlattenField: "f3" };
    const jsonToConvert2 = { field1: "f2.1", field2: "f2.2" };
    const jsonToConvert3 = { field1: "f3.1", field3: "f3.2" };

    const wantedResult = [["column1", "column2"], ["f1.1", "f1.2"], ["f2.1", "f2.2"], ["f3.1", "f3.2"]];

    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert1);
    jsonToArray.add(jsonToConvert2);
    jsonToArray.add(jsonToConvert3);

    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

});

describe('set array columns for nested array rules ', () => {

  it('two fields  +  a nested array with two field in rules  ==> 4 columns   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" }
        ]
      }
    ];
    const wantedResult = [["column1", "column2", "column3", "column4"]];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('two fields  +  a nested array with 2 field + a second nested array inside with 2 fields ==>  6 columns   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" },
          {
            jsonField: "arrayField", fields: [
              { columnName: "column5", jsonField: "field3" },
              { columnName: "column6", jsonField: "field4" }
            ]
          }
        ]
      }
    ];
    const wantedResult = [["column1", "column2", "column3", "column4", "column5", "column6"]];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('two fields  +  a nested array with 2 field + a second nested array inside with 2 fields but one exiting column ==>  5 columns   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" },
          {
            jsonField: "arrayField", fields: [
              { columnName: "column5", jsonField: "field3" },
              { columnName: "column1", jsonField: "field4" }
            ]
          }
        ]
      }
    ];
    const wantedResult = [["column1", "column2", "column3", "column4", "column5"]];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('two fields  +  a nested array with no jsonField set  ==> 2 columns   ', () => {

    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        fields: [  // shall have a jsonField
          { columnName: "column3", jsonField: "field3" }
        ]
      }
    ];
    const wantedResult = [["column1", "column2"]];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });
});

describe('Flatten objects with nested arrays', () => {

  it('add 2 field + 2 field in one line nested array    ', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [{ field3: "f3", field4: "f4" }]
    };
    const wantedResult = [["column1", "column2", "column3", "column4"], ["f1", "f2", "f3", "f4"]];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);


  });


  it('add 2 field + 2 field in two line nested array    ', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3", field4: "f4" },
        { field3: "f3b", field4: "f4b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3", "column4"],
      ["f1", "f2", "f3", "f4"],
      ["f1", "f2", "f3b", "f4b"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);


  });


  it('add object with 2 fields +2 fields in two line nested array and one override   ', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column2", jsonField: "field4" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3", field4: "f4" },
        { field3: "f3b", field4: "f4b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3"],
      ["f1", "f4", "f3"],
      ["f1", "f4b", "f3b"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

  it('add 2 objects / per object: 2 fields +2 fields in two lines nested array    ', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" }
        ]
      }
    ];

    const jsonToConvert1 = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3", field4: "f4" },
        { field3: "f3b", field4: "f4b" }
      ]
    };

    const jsonToConvert2 = {
      field1: "f1b", field2: "f2b",
      arrayField: [
        { field3: "f3c", field4: "f4c" },
        { field3: "f3d", field4: "f4d" }
      ]
    };

    const wantedResult = [
      ["column1", "column2", "column3", "column4"],
      ["f1", "f2", "f3", "f4"],
      ["f1", "f2", "f3b", "f4b"],
      ["f1b", "f2b", "f3c", "f4c"],
      ["f1b", "f2b", "f3d", "f4d"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert1);
    jsonToArray.add(jsonToConvert2);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);


  });


  it('add 2 fields  + 2 nested arrays, only the first nested array is processed if processOnlyIfPreviousArraysAreEmpty is true', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      },
      {
        jsonField: "arrayField2", processOnlyIfPreviousArraysAreEmpty: true, fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3" }
      ],
      arrayField2: [
        { field3: "f3b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3"],
      ["f1", "f2", "f3"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });


  it('add 2 fields  + 2 nested arrays, the two nested arrays are processed if processOnlyIfPreviousArraysAreEmpty is false', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      },
      {
        jsonField: "arrayField2", processOnlyIfPreviousArraysAreEmpty: false, fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3" }
      ],
      arrayField2: [
        { field3: "f3b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3"],
      ["f1", "f2", "f3"],
      ["f1", "f2", "f3b"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });



  it('add 2 fields + 2 nested arrays, the two nested arrays are processed if processOnlyIfPreviousArraysAreEmpty is not set', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      },
      {
        jsonField: "arrayField2", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3" }
      ],
      arrayField2: [
        { field3: "f3b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3"],
      ["f1", "f2", "f3"],
      ["f1", "f2", "f3b"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });


  it('add 2 fields + 2 nested arrays, the second nested array is processed as the first is empty in the object to convert and processOnlyIfPreviousArraysAreEmpty is true', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      },
      {
        jsonField: "arrayField2", processOnlyIfPreviousArraysAreEmpty: true, fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
      ],
      arrayField2: [
        { field3: "f3b" }
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3"],
      ["f1", "f2", "f3b"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });


  it('complex case : add 2 fields + 2 nested arrays with more than one line and processOnlyIfPreviousArraysAreEmpty is not set, the two nested arrays are processed', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" }
        ]
      },
      {
        jsonField: "arrayField2", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" },
        ]
      }
    ];

    const jsonToConvert = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3" },
        { field3: "f3b" }
      ],
      arrayField2: [
        { field3: "f3c",field4 : "f4c" },
        { field3: "f3d",field4 : "f4d" },
      ]
    };

    const jsonToConvert2 = {
      field1: "f1b", field2: "f2b",
      arrayField2: [
        { field3: "f3c2",field4 : "f4c2" },
        { field3: "f3d2",field4 : "f4d2" },
      ]
    };
    const wantedResult = [
      ["column1", "column2", "column3","column4"],
      ["f1", "f2", "f3" ,""],
      ["f1", "f2", "f3b" ,""],
      ["f1", "f2", "f3c","f4c"],
      ["f1", "f2", "f3d","f4d"],
      ["f1b", "f2b", "f3c2","f4c2"],
      ["f1b", "f2b", "f3d2","f4d2"]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert);
    jsonToArray.add(jsonToConvert2);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);

  });

});

describe('Flatten objects with double nested array  ', () => {
  it('add 2 objects / per object: 2 fields +2 fields nested array + 2field nested in nested array     ', () => {
    const rules = [
      { columnName: "column1", jsonField: "field1" },
      { columnName: "column2", jsonField: "field2" },
      {
        jsonField: "arrayField", fields: [
          { columnName: "column3", jsonField: "field3" },
          { columnName: "column4", jsonField: "field4" },
          {
            jsonField: "arrayField2", fields: [
              { columnName: "column5", jsonField: "field5" },
              { columnName: "column6", jsonField: "field6" }
            ]
          }
        ]
      }
    ];

    const jsonToConvert1 = {
      field1: "f1", field2: "f2",
      arrayField: [
        { field3: "f3", field4: "f4" },
        {
          field3: "f3b", field4: "f4b", arrayField2: [
            { field5: "f5", field6: "f6" },
            { field5: "f5b", field6: "f6b" }]
        }
      ]
    };

    const jsonToConvert2 = {
      field1: "f1b", field2: "f2b",
      arrayField: [
        { field3: "f3c", field4: "f4c" },
        { field3: "f3d", field4: "f4d" }
      ]
    };

    const wantedResult = [
      ["column1", "column2", "column3", "column4", "column5", "column6"],
      ["f1", "f2", "f3", "f4", "", ""],
      ["f1", "f2", "f3b", "f4b", "f5", "f6"],
      ["f1", "f2", "f3b", "f4b", "f5b", "f6b"],
      ["f1b", "f2b", "f3c", "f4c", "", ""],
      ["f1b", "f2b", "f3d", "f4d", "", ""]
    ];
    const jsonToArray: JsonToArray = new JsonToArray(rules);
    jsonToArray.add(jsonToConvert1);
    jsonToArray.add(jsonToConvert2);
    expect(areArraysEquals(jsonToArray.getJsonAsArray(), wantedResult)).toEqual(true);


  });

});

export function areArraysEquals(array1, array2): boolean {
  const equals = (JSON.stringify(array1) == JSON.stringify(array2));
  if (!equals) console.error("Warning ", array1, " is different from ", array2);
  return equals;
}
