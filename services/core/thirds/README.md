# Operator Fabric - Core - Third Party Management Service

This sub project manages Third Partye Business Module registration

## 1. Set up and Build

see [Operator Fabric main page](../../README.md)

## 2. Features

### Thirdparty Service configuration

See [swagger generated documentation model section](build/doc/api/index.html#__Models) for data layout

### Resource serving
#### CSS

CSS 3 style sheet are supported, they allow custom styling of card template detail all css selector must be prefixed by
the ```.detail.template``` parent selector

#### Internationalization
Internationalization (i18n) files are json file (JavaScript Object Notation). One file must be defined by module 
supported language. See [swagger generated documentation model section](build/doc/api/index.html#model) for data layout.

Sample json i18n file 
```
{ "emergency": 
  {
    "message": "Emergency situation happened on {{date}}. Cause : {{cause}}."
    "module":
      {
        "name": "Emergency Module",
        "description": "The emergency module managed ermergencies"
      }
  }
}
```

i18n messages may include parameters, these parameters are framed with double curly braces.

The bundled json files name must conform to the following pattern : [lang].json

ex:
```
fr.json
en.json
de.json
```

#### Media (notification sounds)
Supported media files type :
* ogg
* wav
* mp3

Due to web nature of Operator Fabric, we encourage business modules provider to favor the lightest file formats (ogg,mp3, ...)

#### Templates

Templates are [Handlebars](https://handlebarsjs.com/) template files. Templates are fuelled with a data structure 
containing the card data (See [card data model](../publisher/build/doc/api/index.html#__Models) for more information)

In addition to Handlebars basic syntax and helpers, Operator Fabric defines the following helpers :

##### numberFormat
formats a number parameter using [Intl.NumberFormat](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/NumberFormat).
The locale used is current user selected one, and options are passed as hash parameters ([see Handlebars doc Literals section](https://handlebarsjs.com/)).

```
{{numberFormat data.price style="currency" currency="EUR"}}
```

##### dateFormat
formats the submitted parameters (millisecond since epoch) using [mement.format](https://momentjs.com/).
The locale used is current user selected one, thr format is "format" hash parameter ([see Handlebars doc Literals section](https://handlebarsjs.com/)).

```
{{dateFormat data.birthday format="MMMM Do YYYY, h:mm:ss a"}}
```

##### slice
extracts a sub array from ann array

example:
```
<!--
{"array": ["foo","bar","baz"]}
-->
<ul>
{{#each (slice array 0 2)}}
  <li>{{this}}</li>
{{/each}}
</ul>
```
outputs:

```
<ul>
  <li>foo</li>
  <li>bar</li>
</ul>
```

and

```
<!--
{"array": ["foo","bar","baz"]}
-->
<ul>
{{#each (slice array 1)}}
  <li>{{this}}</li>
{{/each}}
</ul>
```
outputs:

```
<ul>
  <li>bar</li>
  <li>baz</li>
</ul>
```

##### now
Outputs current date as millisecond from epoch. the date is computed from application internal time service and thus may be different from the date that one can compute from javascript api which relies on the browsers' system time.

NB: Due to Handlebars limitation you must provide at least one argument to helpers otherwise, Handlebars will confuse a helper and a variable. In the bellow example, we simply pass an empty string.

example:

```
{{now ""}}

{{dateFormat (now "") format="MMMM Do YYYY, h:mm:ss a"}}
```

outputs



##### preserveSpace
preserve space in parameter string to avoid html standard space trimming.

```
{{preserveSpace data.businessId}}
```

##### bool
returns a boolean result value on an arithmetical operation (including object equality) or boolean operation.
arguments:
- v1: left value operand
- op: operator (string value)
- v2: right value operand

arithmetical operator:
- ==
- ===
- \!=
- \!==
- <
- <=
- \>
- \>=

boolean operators
- &&
- ||

examples: 
```
{{#if (bool v1 '<' v2}}
  v1 is strictly lower than v2
{{else}}
 V2 is lower or equal to v1
{{/if}}
```

##### math
returns the result of a mathematical operation.
arguments:
- v1: left value operand
- op: operator (string value)
- v2: right value operand

arithmetical operator:
- \+
- \-
- \*
- /
- %

example:

```
{{math 1 '+' 2}}
```
##### split
splits a string into an array based on a split string

example:

```
<ul>
{{#each (split 'my.example.string' '.')]]
  <li>{{this}}</li>
{{/each}}
</ul>
```
outputs
```
<ul>
  <li>my</li>
  <li>example</li>
  <li>string</li>
</ul>
```

##### cardAction
outputs a card action button whose card action id is the concatenation of an arbitrary number of helper arguments

```
{{{cardAction "PREREQUISITE_" id}}}
```

##### svg
outputs a svg tag with lazy loading, and missing image replacement message. The image url is the concatenation of an arbitrary number of helper arguments

```
{{{svg baseUri scheduledOpId "/" substation "/before/" computationPhaseOrdinal}}}
```

##### i18n
outputs a i18n result from a key and parameters. There are two way of configuring

* Pass an object as its sole argument. The object contains a key field (string) and an optionnal parameters field (map of parameterKey => value)
```
{{i18n data.i18nTitle}}
```

* Pass a string key as its sole argument and use hash parameters ([see Handlebars doc Literals section](https://handlebarsjs.com/)) for i18n string parameters.

```
<!--
emergency.title=Emergency situation happened on {{date}}. Cause : {{cause}}.
-->
{{i18n "emergency.title" date="2018-06-14" cause="Broken Cofee Machine"}}
```
outputs
```
Emergency situation happened on 2018-06-14. Cause : Broken Cofee Machine
```

##### sort
Sorts an array or object's properties (first argument) using an optional field name (second argument) to sort the collection on this fields natural order
if no field argument is provided :

* if the sorted structure is an array, the original order of the array is kept ;
* if the sorted structure is an object, the structure is sorted by objects field name.


```
<!--
users :

{"john": { "firstName": "John", "lastName": "Cleese"},
"graham": { "firstName": "Graham", "lastName": "Chapman"},
"terry": { "firstName": "Terry", "lastName": "Gilliam"},
"eric": { "firstName": "Eric", "lastName": "Idle"},
"terry": { "firstName": "Terry", "lastName": "Jones"},
"michael": { "firstName": "Michael", "lastName": "Palin"},
-->

<ul>
{{#each (sort users)}}
    <li>{{this.firstName}} {{this.lastName}}</li>
{{/each}}
</ul>
```

outputs :

```
<ul>
  <li>Eric Idle</li>
  <li>Graham Chapman</li>
  <li>John Cleese</li>
  <li>Michael Pallin</li>
  <li>Terry Gilliam</li>
  <li>Terry Jones</li>
</ul>
```

and

```
<ul>
{{#each (sort users "lastName")}}
    <li>{{this.firstName}} {{this.lastName</li>
{{/each}}
</ul>
```

outputs :

```
<ul>
  <li>Graham Chapman</li>
  <li>John Cleese</li>
  <li>Terry Gilliam</li>
  <li>Eric Idle</li>
  <li>Terry Jones</li>
  <li>Michael Pallin</li>
</ul>
```

### Third Party bundle
Bundle files are uploaded to service to declare Third Party Business 
Module resources. These bundle are tar.gz archives enclosing resource 
files and a configuration file.

Bundle is composed of one subdirectory per resources, when resource is 
internationalized (template, i18n, media) , this subdirectory itself has 
one subdirectory per supported languages

#### layout

```
bundle
└──css
│   └──tab.css
│   └──emergency.css
└──i18n
│   └──en.json
│   └──fr.json
└──media
│   └──en
│       └──sound.opus
│       └──sound.mp3
│   └──fr
│       └──sound.opus
│       └──sound.mp3
└──template
│   └──en
│       └──emergency.handlebars
│   └──fr
│       └──emergency.handlebars
└──config.json
```

#### configuration

```
{
  "name": "sample",
  "version": "0.1",
  "defaultLocale": "fr",
  "templates": [
    "emergency"
  ],
  "csses": [
    "tab",
    "emergency"
  ],
  "medias": {
    "sound": {
      "name": "sound",
      "files": [
        "sound.opus",
        "sound.mp3"
      ]
    }
  },
  "locales": [
    "fr",
    "en"
  ]
}
```

See [swagger generated documentation model section](build/doc/api/index.html#__Models) for data description

## 3. Rest Endpoints and Data Model

See [swagger generated documentation](build/doc/api/index.html)
