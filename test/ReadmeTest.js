import { GeometryTransform } from '../lib/GeometryTransform'
import { ProjectionConstants, Projections } from '@ngageoint/projections-js'
import { GeometryType, Point } from '@ngageoint/simple-features-js'

function testTransform(geometry) {
	// Geometry geometry = ...

	const projection1 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WEB_MERCATOR);
	const projection2 = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);

	const transform = GeometryTransform.create(projection1, projection2);

	const transformed = transform.transformGeometry(geometry);

	return transformed;
}

describe('Readme Tests', function () {
	it('testTransform', function () {
		const transformed = testTransform(new Point(111319.49079327357, 111325.14286638486));
		if (transformed instanceof Point) {
			transformed.geometryType.should.be.equal(GeometryType.POINT);
			transformed.x.should.be.gt(1.0 - .0000000000001);
			transformed.x.should.be.lt(1.0 + .0000000000001);
			transformed.y.should.be.gt(1.0 - .0000000000001);
			transformed.y.should.be.lt(1.0 + .0000000000001);
		} else {
			should.fail('Unexpected Geometry');
		}
	});
});
