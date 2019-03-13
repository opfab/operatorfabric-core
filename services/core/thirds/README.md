# OperatorFabric - Core - Third Party Management Service

This sub project manages Third Partye Business Module registration

## 1. Set up and Build

see [OperatorFabric main page](../../../README.md)

## 2. Features

see [reference documentation : Technical overview ](https://opfab.github.io/projects/services/core/thirds/0.1.1.SNAPSHOT/reference/#_techincal_overview)


### Third Party bundle

Bundle files are uploaded to service to declare Third Party Business 
Module resources. These bundle are `tar.gz` archives enclosing resource 
files and a configuration file.

Bundle is composed of one subdirectory per resource. When the resource is 
internationalized (template, i18n, media) , those subdirectories themselves need to have 
one subdirectory per supported language.

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

See [swagger generated documentation model section](https://opfab.github.io/projects/services/core/thirds/0.1.1.SNAPSHOT/api/#__Models) for data description

## 3. Rest Endpoints and Data Model

See [swagger generated documentation](https://opfab.github.io/projects/services/core/thirds/0.1.1.SNAPSHOT/api)
