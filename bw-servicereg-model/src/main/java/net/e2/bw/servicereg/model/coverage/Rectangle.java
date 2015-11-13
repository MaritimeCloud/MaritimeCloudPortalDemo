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

/**
 * A rectangle area
 */
public class Rectangle extends Area {

    float topLeftLatitude;
    float topLeftLongitude;
    float buttomRightLatitude;
    float buttomRightLongitude;

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public float getTopLeftLatitude() {
        return topLeftLatitude;
    }

    public void setTopLeftLatitude(float topLeftLatitude) {
        this.topLeftLatitude = topLeftLatitude;
    }

    public float getTopLeftLongitude() {
        return topLeftLongitude;
    }

    public void setTopLeftLongitude(float topLeftLongitude) {
        this.topLeftLongitude = topLeftLongitude;
    }

    public float getButtomRightLatitude() {
        return buttomRightLatitude;
    }

    public void setButtomRightLatitude(float buttomRightLatitude) {
        this.buttomRightLatitude = buttomRightLatitude;
    }

    public float getButtomRightLongitude() {
        return buttomRightLongitude;
    }

    public void setButtomRightLongitude(float buttomRightLongitude) {
        this.buttomRightLongitude = buttomRightLongitude;
    }
}
