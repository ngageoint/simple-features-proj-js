import { LineString, Point, Polygon } from '@ngageoint/simple-features-js'
import { ProjectionConstants, Projections } from '@ngageoint/projections-js'
import { GeometryTransform } from '../lib/GeometryTransform'
const should = require('chai').should();

describe('GeometryTransformTest', function () {
  it('testTransform', function () {

		let polygon = new Polygon();
    let ring = new LineString();
		ring.addPoint(new Point(-ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, -ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
		ring.addPoint(new Point(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, -ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
		ring.addPoint(new Point(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
		ring.addPoint(new Point(-ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
		polygon.addRing(ring);

    let wgs84Polygon = new Polygon();
    let wgs84Ring = new LineString();
		wgs84Ring.addPoint(new Point(-ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, -ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE));
		wgs84Ring.addPoint(new Point(ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, -ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE));
		wgs84Ring.addPoint(new Point(ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE));
		wgs84Ring.addPoint(new Point(-ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE));
		wgs84Polygon.addRing(wgs84Ring);

    let webMercator = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WEB_MERCATOR);
    let wgs84 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);

    let transformWebMercatorToWgs84 = GeometryTransform.create(webMercator, wgs84);

    let transformedGeometry = transformWebMercatorToWgs84.transformPolygon(polygon);
		should.exist(transformedGeometry);
    (transformedGeometry instanceof Polygon).should.be.true;

    wgs84Polygon.numRings().should.be.equal(transformedGeometry.numRings());
    wgs84Polygon.getExteriorRing().numPoints().should.be.equal(transformedGeometry.getExteriorRing().numPoints());

    for (let i = 0; i < polygon.getExteriorRing().numPoints(); i++) {
      wgs84Polygon.getExteriorRing().getPoint(i).x.should.be.gt(transformedGeometry.getExteriorRing().getPoint(i).x - 0.0000000000001);
      wgs84Polygon.getExteriorRing().getPoint(i).x.should.be.lt(transformedGeometry.getExteriorRing().getPoint(i).x + 0.0000000000001);
      wgs84Polygon.getExteriorRing().getPoint(i).y.should.be.gt(transformedGeometry.getExteriorRing().getPoint(i).y - 0.0000000000001);
      wgs84Polygon.getExteriorRing().getPoint(i).y.should.be.lt(transformedGeometry.getExteriorRing().getPoint(i).y + 0.0000000000001);
    }

    let transformWgs84ToWebMercator = GeometryTransform.create(wgs84, webMercator);

    let transformedGeometry2 = transformWgs84ToWebMercator.transformGeometry(transformedGeometry);

		should.exist(transformedGeometry2);
		(transformedGeometry2 instanceof Polygon).should.be.true;

    let transformedPolygon2 = transformedGeometry2;
    if (transformedPolygon2 instanceof Polygon) {
      polygon.numRings().should.be.equal(transformedPolygon2.numRings());
      polygon.getExteriorRing().numPoints().should.be.equal(transformedPolygon2.getExteriorRing().numPoints());

      for (let i = 0; i < polygon.getExteriorRing().numPoints(); i++) {
        polygon.getExteriorRing().getPoint(i).x.should.be.equal(transformedPolygon2.getExteriorRing().getPoint(i).x);
        polygon.getExteriorRing().getPoint(i).y.should.be.gt(transformedPolygon2.getExteriorRing().getPoint(i).y - 0.0000001);
        polygon.getExteriorRing().getPoint(i).y.should.be.lt(transformedPolygon2.getExteriorRing().getPoint(i).y + 0.0000001);
      }
    } else {
      should.fail('Unknown GeometryType');
    }
	});
});
