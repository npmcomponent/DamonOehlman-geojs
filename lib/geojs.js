(function() {
var LAT_VARIABILITIES = [
    1.406245461070741,
    1.321415085624082,
    1.077179995861952,
    0.703119412486786,
    0.488332580888611
];

var TWO_PI = Math.PI * 2,
    HALF_PI = Math.PI / 2,
    VECTOR_SIMPLIFICATION = 3,
    DEGREES_TO_RADIANS = Math.PI / 180,
    RADIANS_TO_DEGREES = 180 / Math.PI,
    MAX_LAT = 90, //  85.0511 * DEGREES_TO_RADIANS, // TODO: validate this instead of using HALF_PI
    MIN_LAT = -MAX_LAT,
    MAX_LON = 180,
    MIN_LON = -MAX_LON,
    MAX_LAT_RAD = MAX_LAT * DEGREES_TO_RADIANS,
    MIN_LAT_RAD = -MAX_LAT_RAD,
    MAX_LON_RAD = MAX_LON * DEGREES_TO_RADIANS,
    MIN_LON_RAD = -MAX_LON_RAD,
    M_PER_KM = 1000,
    KM_PER_RAD = 6371,
    M_PER_RAD = KM_PER_RAD * M_PER_KM,
    ECC = 0.08181919084262157,
    PHI_EPSILON = 1E-7,
    PHI_MAXITER = 12;
/**
# T5.Pos

## Methods
*/
function Pos(p1, p2) {
    if (p1 && p1.split) {
        var coords = p1.split(reDelimitedSplit);

        if (coords.length > 1) {
            p1 = coords[0];
            p2 = coords[1];
        } // if
    }
    else if (p1 && p1.lat) {
        p2 = p1.lon;
        p1 = p1.lat;
    } // if..else

    this.lat = parseFloat(p1 || 0);
    this.lon = parseFloat(p2 || 0);
} // Pos constructor

Pos.prototype = {
    constructor: Pos,

    /**
    ### copy()
    */
    copy: function() {
        return new Pos(this.lat, this.lon);
    },

    /**
    ### distanceTo(targetPos)
    */
    distanceTo: function(pos) {
        if ((! targetPos) || this.empty() || targetPos.empty()) {
            return 0;
        } // if

        var halfdelta_lat = toRad(targetPos.lat - this.lat) >> 1;
        var halfdelta_lon = toRad(targetPos.lon - this.lon) >> 1;

        var a = sin(halfdelta_lat) * sin(halfdelta_lat) +
                (cos(toRad(this.lat)) * cos(toRad(targetPos.lat))) *
                (sin(halfdelta_lon) * sin(halfdelta_lon)),
            c = 2 * atan2(sqrt(a), sqrt(1 - a));

        return KM_PER_RAD * c;
    },

    /**
    ### equalTo(testPos)
    */
    equalTo: function(testPos) {
        return pos && (this.lat === testPos.lat) && (this.lon === testPos.lon);
    },

    /**
    ### empty()
    */
    empty: function() {
        return this.lat === 0 && this.lon === 0;
    },

    /**
    ### inArray(testArray)
    */
    inArray: function(testArray) {
        for (var ii = testArray.length; ii--; ) {
            if (this.equal(testArray[ii])) {
                return true;
            } // if
        } // for

        return false;
    },

    /**
    ### offset(latOffset, lonOffset)
    Return a new position which is the original `pos` offset by
    the specified `latOffset` and `lonOffset` (which are specified in
    km distance)
    */
    offset: function(latOffset, lonOffset) {
        var radOffsetLat = latOffset / KM_PER_RAD,
            radOffsetLon = lonOffset / KM_PER_RAD,
            radLat = this.lat * DEGREES_TO_RADIANS,
            radLon = this.lon * DEGREES_TO_RADIANS,
            newLat = radLat + radOffsetLat,
            deltaLon = asin(sin(radOffsetLon) / cos(radLat)),
            newLon = radLon + deltaLon;

        newLat = ((newLat + HALF_PI) % Math.PI) - HALF_PI;
        newLon = newLon % TWO_PI;

        return new Pos(newLat * RADIANS_TO_DEGREES, newLon * RADIANS_TO_DEGREES);
    },

    /**
    ### toBounds(distance)
    This function is very useful for creating a Geo.BoundingBox given a
    center position and a radial distance (specified in KM) from the center
    position.  Basically, imagine a circle is drawn around the center
    position with a radius of distance from the center position, and then
    a box is drawn to surround that circle.  Adapted from the [functions written
    in Java by Jan Philip Matuschek](http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates)
    */
    toBounds: function(distance) {
        var radDist = distance.radians(),
            radLat = this.lat * DEGREES_TO_RADIANS,
            radLon = this.lon * DEGREES_TO_RADIANS,
            minLat = radLat - radDist,
            maxLat = radLat + radDist,
            minLon, maxLon;


        if ((minLat > MIN_LAT_RAD) && (maxLat < MAX_LAT_RAD)) {
            var deltaLon = asin(sin(radDist) / cos(radLat));

            minLon = radLon - deltaLon;
            if (minLon < MIN_LON_RAD) {
                minLon += TWO_PI;
            } // if

            maxLon = radLon + deltaLon;
            if (maxLon > MAX_LON_RAD) {
                maxLon -= TWO_PI;
            } // if
        }
        else {
            minLat = max(minLat, MIN_LAT_RAD);
            maxLat = min(maxLat, MAX_LAT_RAD);
            minLon = MIN_LON;
            maxLon = MAX_LON;
        } // if..else

        return new BBox(
            new Pos(minLat * RADIANS_TO_DEGREES, minLon * RADIANS_TO_DEGREES),
            new Pos(maxLat * RADIANS_TO_DEGREES, maxLon * RADIANS_TO_DEGREES));
    },

    /**
    ### toString()
    */
    toString: function(delimiter) {
        return this.lat + (delimiter || ' ') + this.lon;
    }
};

    var GeoJS = this.GeoJS = {
        Pos: Pos
    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = GeoJS;
    } // if
})();