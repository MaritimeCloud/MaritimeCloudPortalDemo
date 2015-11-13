/* Copyright (c) 2011 Danish Maritime Authority
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */
package net.e2.bw.servicereg.model.coverage;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * A circle area
 */
public class Circle extends Area {

    @JsonProperty("center-latitude")
    float centerLatitude;

    @JsonProperty("center-longitude")
    float centerLongitude;

    int radius;

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public float getCenterLatitude() {
        return centerLatitude;
    }

    public void setCenterLatitude(float centerLatitude) {
        this.centerLatitude = centerLatitude;
    }

    public float getCenterLongitude() {
        return centerLongitude;
    }

    public void setCenterLongitude(float centerLongitude) {
        this.centerLongitude = centerLongitude;
    }

    public int getRadius() {
        return radius;
    }

    public void setRadius(int radius) {
        this.radius = radius;
    }
}
