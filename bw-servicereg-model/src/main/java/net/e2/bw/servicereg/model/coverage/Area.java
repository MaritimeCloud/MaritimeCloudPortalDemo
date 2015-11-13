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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import net.e2.bw.servicereg.model.JsonSerializable;

/**
 * An abstract base class for coverage areas
 */
@JsonTypeInfo(
        use= JsonTypeInfo.Id.NAME,
        include=JsonTypeInfo.As.PROPERTY,
        property="type",
        visible = true
)
@JsonSubTypes({
        @Type(value = Polygon.class, name = "polygon"),
        @Type(value = Circle.class, name = "circle"),
        @Type(value = Rectangle.class, name = "rectangle")})
public abstract class Area implements JsonSerializable {

}
