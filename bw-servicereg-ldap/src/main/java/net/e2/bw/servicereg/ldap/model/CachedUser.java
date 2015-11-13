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
package net.e2.bw.servicereg.ldap.model;

import net.e2.bw.servicereg.model.User;

/**
 * An immutable User implementation suitable for caching.
 */
public class CachedUser extends User {

    /** Constructor */
    public CachedUser(String userId, String emailAddress, String firstName, String lastName, byte[] photo) {
        super.setUserId(userId);
        super.setEmailAddress(emailAddress);
        super.setFirstName(firstName);
        super.setLastName(lastName);
        super.setPhoto(photo);
    }

    /** Called by setter methods to flag that the class is immutable */
    private void flagImmutable() {
        throw new UnsupportedOperationException("CachedUser is immutable");
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    @Override
    public void setUserId(String userId) {
        flagImmutable();
    }

    @Override
    public void setEmailAddress(String emailAddress) {
        flagImmutable();
    }

    @Override
    public void setFirstName(String firstName) {
        flagImmutable();
    }

    @Override
    public void setLastName(String lastName) {
        flagImmutable();
    }

    @Override
    public void setPhoto(byte[] photo) {
        flagImmutable();
    }

}
