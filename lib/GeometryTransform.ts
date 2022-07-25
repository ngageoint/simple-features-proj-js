import {
	Projections,
	ProjectionTransform,
	Projection,
	ProjectionConstants
} from "@ngageoint/projections-js";
import {
	Geometry,
	GeometryEnvelope,
	Point,
	SFException,
	GeometryType,
	LineString,
	Polygon,
	MultiPoint,
	MultiLineString,
	MultiPolygon,
	CircularString,
	CompoundCurve,
	CurvePolygon,
	Curve,
	PolyhedralSurface,
	TIN,
	Triangle,
	GeometryCollection
} from "@ngageoint/simple-features-js";

/**
 * Geometry Projection Transform
 */
export class GeometryTransform extends ProjectionTransform {

	public static create(transform: GeometryTransform): GeometryTransform;
	public static create(transform: ProjectionTransform): GeometryTransform;
	public static create(fromProjection: Projection, toProjection: Projection): GeometryTransform;
	public static create(fromProjection: Projection, toEpsg: number | string): GeometryTransform;
	public static create(fromProjection: Projection, toAuthority: string, toCode: number | string): GeometryTransform;
	public static create(fromEpsg: number | string, toProjection: Projection): GeometryTransform;
	public static create(fromAuthority: string, fromCode: number | string, toProjection: Projection): GeometryTransform;
	public static create(fromEpsg: number | string, toEpsg: number | string): GeometryTransform;

	/**
	 * Create a geometry projection transform
	 * @param args
	 */
	public static create(...args): GeometryTransform {
		let fromProj: Projection = null;
		let toProj: Projection = null;
		if (args.length === 1 && (args[0] instanceof ProjectionTransform || args[0] instanceof GeometryTransform)) {
			fromProj = args[0].getFromProjection();
			toProj = args[0].getToProjection();
		} else if (args.length === 2) {
			if (args[0] instanceof Projection) {
				fromProj = args[0];
			} else if (typeof args[0] === "number") {
				fromProj = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, args[1]);
			}
			if (args[1] instanceof Projection) {
				toProj = args[1];
			} else if (typeof args[1] === "number") {
				toProj = Projections.getProjection(ProjectionConstants.AUTHORITY_EPSG, args[1]);
			}
		} else if (args.length === 3) {
			if (args[0] instanceof Projection) {
				fromProj = args[0];
			} else if (typeof args[0] === "string") {
				if (typeof args[1] === "number" || typeof args[1] === "string") {
					fromProj = Projections.getProjection(args[0], args[1]);
				}
			}
			if (typeof args[1] === "string") {
				if (typeof args[2] === "number" || typeof args[2] === "string") {
					toProj = Projections.getProjection(args[1], args[2]);
				}
			}
			if (args[2] instanceof Projection) {
				toProj = args[2];
			}
		}  else if (args.length === 4) {
			if (typeof args[0] === "string") {
				if (typeof args[1] === "number" || typeof args[1] === "string") {
					fromProj = Projections.getProjection(args[0], args[1]);
				}
			}
			if (typeof args[2] === "string") {
				if (typeof args[3] === "number" || typeof args[3] === "string") {
					toProj = Projections.getProjection(args[2], args[3]);
				}
			}
		}

		return new GeometryTransform(fromProj, toProj);
	}

	/**
	 * Constructor
	 * @param fromProjection  from projection
	 * @param toProjection to projection
	 */
	public constructor(fromProjection: Projection, toProjection: Projection) {
		super(fromProjection, toProjection);
	}

	/**
	 * {@inheritDoc}
	 */
	public getInverseTransformation(): GeometryTransform {
		return GeometryTransform.create(this.getToProjection(), this.getFromProjection());
	}

	/**
	 * Transform the geometry envelope
	 * @param envelope geometry envelope
	 * @return geometry envelope
	 */
	public transformEnvelope(envelope: GeometryEnvelope): GeometryEnvelope {
		const bounds = this.transformBounds(envelope.minX, envelope.minY, envelope.maxX, envelope.maxY);
		return new GeometryEnvelope(bounds[0], bounds[1], bounds[2], bounds[3]);
	}

	/**
	 * Transform the geometry
	 * 
	 * @param geometry  geometry
	 * @return projected geometry
	 */
	public transformGeometry(geometry: Geometry): Geometry {

		let to = null;

		const geometryType = geometry.geometryType;
		switch (geometryType) {
		case GeometryType.POINT:
			to = this.transformPoint(geometry as Point);
			break;
		case GeometryType.LINESTRING:
			to = this.transformLineString(geometry as LineString);
			break;
		case GeometryType.POLYGON:
			to = this.transformPolygon(geometry as Polygon);
			break;
		case GeometryType.MULTIPOINT:
			to = this.transformMultiPoint(geometry as MultiPoint);
			break;
		case GeometryType.MULTILINESTRING:
			to = this.transformMultiLineString(geometry as MultiLineString);
			break;
		case GeometryType.MULTIPOLYGON:
			to = this.transformMultiPolygon(geometry as MultiPolygon);
			break;
		case GeometryType.CIRCULARSTRING:
			to = this.transformCircularString(geometry as CircularString);
			break;
		case GeometryType.COMPOUNDCURVE:
			to = this.transformCompoundCurve(geometry as CompoundCurve);
			break;
		case GeometryType.CURVEPOLYGON:
			to = this.transformCurvePolygon(geometry as CurvePolygon<Curve>);
			break;
		case GeometryType.POLYHEDRALSURFACE:
			to = this.transformPolyhedralSurface(geometry as PolyhedralSurface);
			break;
		case GeometryType.TIN:
			to = this.transformTIN(geometry as TIN);
			break;
		case GeometryType.TRIANGLE:
			to = this.transformTriangle(geometry as Triangle);
			break;
		case GeometryType.GEOMETRYCOLLECTION:
			to = this.transformGeometryCollection(geometry as GeometryCollection<Geometry>);
			break;
		default:
			throw new SFException("Unsupported Geometry Type: " + geometryType);
		}

		return to;
	}

	/**
	 * Transform the projected point
	 * 
	 * @param from from point
	 * @return projected from
	 */
	public transformPoint(from: Point): Point {
		let fromCoord;

		fromCoord = {x: from.x, y: from.y};
		if (from.hasZ && from.z != null) {
			fromCoord.z = from.z;

		}

		const toCoord = this.transformCoordinate(fromCoord);

		const to = new Point(from.hasZ, from.hasM, toCoord.x, toCoord.y);
		if (from.hasZ) {
			if (toCoord.z === Number.NaN) {
				to.z = from.z;
			} else {
				to.z = toCoord.z;
			}
		}
		if (from.hasM) {
			to.m = from.m;
		}

		return to;
	}

	/**
	 * Transform a list of points
	 * 
	 * @param from points to transform
	 * @return transformed points
	 */
	public transformPoints(from: Array<Point>): Array<Point> {
		const to = [];

		for (const fromPoint of from) {
			to.push( this.transformPoint(fromPoint));
		}

		return to;
	}

	/**
	 * Transform the projected line string
	 * @param lineString line string
	 * @return projected line string
	 */
	public transformLineString(lineString: LineString): LineString {
		let to;

		switch (lineString.geometryType) {
			case GeometryType.CIRCULARSTRING:
				to = new CircularString(lineString.hasZ, lineString.hasM);
				break;
			default:
				to = new LineString(lineString.hasZ, lineString.hasM);
		}

		for (const point of lineString.points) {
			to.addPoint(this.transformPoint(point));
		}

		return to;
	}

	/**
	 * Transform the projected polygon
	 * @param polygon polygon
	 * @return projected polygon
	 */
	public transformPolygon(polygon: Polygon): Polygon {
		let to;

		switch (polygon.geometryType) {
		case GeometryType.TRIANGLE:
			to = new Triangle(polygon.hasZ, polygon.hasM);
			break;
		default:
			to = new Polygon(polygon.hasZ, polygon.hasM);
		}

		for (const ring of polygon.rings) {
			to.addRing(this.transformLineString(ring));
		}

		return to;
	}

	/**
	 * Transform the projected multi point
	 * 
	 * @param multiPoint
	 *            multi point
	 * @return projected multi point
	 */
	public transformMultiPoint(multiPoint: MultiPoint): MultiPoint {

		const to = new MultiPoint(multiPoint.hasZ, multiPoint.hasM);

		for (const point of multiPoint.points) {
			to.addPoint(this.transformPoint(point));
		}

		return to;
	}

	/**
	 * Transform the projected multi line string
	 * 
	 * @param multiLineString
	 *            multi line string
	 * @return projected multi line string
	 */
	public transformMultiLineString(multiLineString: MultiLineString): MultiLineString {
		const to = new MultiLineString(multiLineString.hasZ, multiLineString.hasM);

		for (const lineString of multiLineString.lineStrings) {
			to.addLineString(this.transformLineString(lineString));
		}

		return to;
	}

	/**
	 * Transform the projected multi polygon
	 * 
	 * @param multiPolygon multi polygon
	 * @return projected multi polygon
	 */
	public transformMultiPolygon(multiPolygon: MultiPolygon): MultiPolygon {

		const to = new MultiPolygon(multiPolygon.hasZ, multiPolygon.hasM);

		for (const polygon of multiPolygon.polygons) {
			to.addPolygon(this.transformPolygon(polygon));
		}

		return to;
	}

	/**
	 * Transform the projected circular string
	 * 
	 * @param circularString circular string
	 * @return projected circular string
	 */
	public transformCircularString(circularString: CircularString): CircularString {
		return this.transformLineString(circularString as LineString) as CircularString;
	}

	/**
	 * Transform the projected compound curve
	 * 
	 * @param compoundCurve compound curve
	 * @return projected compound curve
	 */
	public transformCompoundCurve(compoundCurve: CompoundCurve): CompoundCurve {
		const to = new CompoundCurve(compoundCurve.hasZ, compoundCurve.hasM);

		for (const lineString of compoundCurve.lineStrings) {
			to.addLineString(this.transformLineString(lineString));
		}

		return to;
	}

	/**
	 * Transform the projected curve polygon
	 * 
	 * @param curvePolygon curve polygon
	 * @return projected curve polygon
	 */
	public transformCurvePolygon(curvePolygon: CurvePolygon<Curve>): CurvePolygon<Curve> {
		const to = new CurvePolygon<Curve>(curvePolygon.hasZ, curvePolygon.hasM);

		for (const ring of curvePolygon.rings) {
			let toRing;
			switch (ring.geometryType) {
			case GeometryType.COMPOUNDCURVE:
				toRing = this.transformCompoundCurve(ring as CompoundCurve);
				break;
			default:
				toRing = this.transformLineString(ring as LineString);
			}
			to.addRing(toRing);
		}

		return to;
	}

	/**
	 * Transform the projected polyhedral surface
	 * 
	 * @param polyhedralSurface polyhedral surface
	 * @return projected polyhedral surface
	 */
	public transformPolyhedralSurface(polyhedralSurface: PolyhedralSurface): PolyhedralSurface {
		let to;

		switch (polyhedralSurface.geometryType) {
		case GeometryType.TIN:
			to = new TIN(polyhedralSurface.hasZ, polyhedralSurface.hasM);
			break;
		default:
			to = new PolyhedralSurface(polyhedralSurface.hasZ,
					polyhedralSurface.hasM);
		}

		for (const polygon of polyhedralSurface.polygons) {
			to.addPolygon(this.transformPolygon(polygon));
		}

		return to;
	}

	/**
	 * Transform the projected TIN
	 * 
	 * @param tin TIN
	 * @return projected tin
	 */
	public transformTIN(tin: TIN): TIN {
		return this.transformPolyhedralSurface(tin as PolyhedralSurface) as TIN;
	}

	/**
	 * Transform the projected triangle
	 * 
	 * @param triangle
	 *            triangle
	 * @return projected triangle
	 */
	public transformTriangle(triangle: Triangle): Triangle {
		return this.transformPolygon(triangle as Polygon) as Triangle;
	}

	/**
	 * Transform the projected geometry collection
	 * 
	 * @param geometryCollection
	 *            geometry collection
	 * @return projected geometry collection
	 */
	public transformGeometryCollection(geometryCollection: GeometryCollection<Geometry>): GeometryCollection<Geometry> {
		const to = new GeometryCollection<Geometry>(geometryCollection.hasZ, geometryCollection.hasM);

		for (const geometry of geometryCollection.geometries) {
			to.addGeometry(this.transformGeometry(geometry));
		}

		return to;
	}

}
