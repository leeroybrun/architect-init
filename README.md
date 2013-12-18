architect-init
===============

CLI tool to help you start a new [Architect](https://github.com/c9/architect) app by creating all the structure and main files.

## Install

```shell
npm install -g architect-init
```

## Plugins

Before running `architect-init` you must create a config file containing your plugins list.

It's a simple text file with each plugins on a new line.

Example :

```plain
firstplugin
firstplugin.secondplugin
thirdplugin
thirdplugin/fourthplugin
```

With default options (auto structure), this will create the following directory structure :

```plain
lib
├─ firstplugin
├─ firstplugin.secondplugin
└─ thirdplugin
    └─ fourthplugin
```

## Run

```shell
architect-init
```

It will then ask you the following questions :

- *Where is stored your plugins list file ?*

  Specify the path to your plugins list file created above. Default : plugins.conf

- *Where do you want to store the plugins ?*

  The directory where to store plugins.  Default : lib/

- *Do you want sub or dotted dirs for plugins ?*
  - auto : keep the structure of your plugins.conf file (default)
  - sub : force subdirs for "sub" plugins
  - dotted : force dotted dirs for "sub" plugins

- *Create package.json file for each plugins (yes|no) ?*

  Create a default package.json file in each of the created folders. Template of the package.json file is located in `tpl/package.json`. Default : yes

- *Create main file for each plugins (yes|no) ?*

  Create a main JS file in each of the created folders. Template of the main file is located in `tpl/main.js`. Default : yes

- *Force the creation of files even if they exists (yes|no) ?*

  Do you want to replace existing (package.json/main) files in directories ? Default : no

## Directory structures

Here is the final structure of plugins with options :

### auto
```plain
lib
├─ firstplugin
├─ firstplugin.secondplugin
└─ thirdplugin
    └─ fourthplugin
```

### sub
```plain
lib
├─ firstplugin
│   └─ secondplugin
└─ thirdplugin
    └─ fourthplugin
```

### dotted
```plain
lib
├─ firstplugin
├─ firstplugin.secondplugin
├─ thirdplugin
└─ thirdplugin.fourthplugin
```

## TODO

- Create tests

## Licence

The MIT License (MIT)

Copyright (c) 2013 Leeroy Brun

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
