# Simple Features Projection Javascript

#### Simple Features Projection Lib ####

The Simple Features Libraries were developed at the [National Geospatial-Intelligence Agency (NGA)](http://www.nga.mil/) in collaboration with [BIT Systems](https://www.caci.com/bit-systems/). The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the [MIT license](http://choosealicense.com/licenses/mit/).

### Pull Requests ###
If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the MIT license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.

### About ###

[Simple Features Projection](http://ngageoint.github.io/simple-features-proj-js/) is a Java library for performing projection conversions between [Simple Feature](https://github.com/ngageoint/simple-features-js) Geometries.

### Usage ###

View the latest [JS Docs](http://ngageoint.github.io/simple-features-js)

#### Browser Usage ####
```html
<script src="/path/to/simple-features-js/dist/sf.min.js"></script>
<script src="/path/to/simple-features-proj-js/dist/sf-proj.min.js"></script>
```
```javascript

const { Point } = window.SimpleFeatures;
const { ProjectionConstants, Projections } = window.Projections;
const { ProjectionFactory, GeometryTransform } = window.SimpleFeaturesProj;


// Geometry geometry = ...

const projection1 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WEB_MERCATOR);
const projection2 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);

const transform = GeometryTransform.create(projection1, projection2);

const transformed = transform.transformGeometry(geometry);

return transformed;
```

#### Node Usage ####
[![NPM](https://img.shields.io/npm/v/@ngageoint/simple-features-proj-js.svg)](https://www.npmjs.com/package/@ngageoint/simple-features-proj-js)

Pull from [NPM](https://www.npmjs.com/package/@ngageoint/simple-features-proj-js)

```install
npm install --save simple-features-proj-js
```
```javascript

const { Point } = require("@ngageoint/simple-features-js");
import { ProjectionConstants, Projections } from '@ngageoint/projections-js'
const { ProjectionFactory, GeometryTransform } = require("@ngageoint/simple-features-proj-js");

// Geometry geometry = ...

const projection1 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WEB_MERCATOR);
const projection2 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);

const transform = GeometryTransform.create(projection1, projection2);

const transformed = transform.transformGeometry(geometry);

return transformed;

```

### Build ###

![Build & Test](https://github.com/ngageoint/simple-features-proj-js/actions/workflows/run-tests.yml/badge.svg)

Build this repository using Node.js:

    npm install
    npm run build
