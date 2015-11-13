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
package net.e2.bw.servicereg.core.service;

import net.e2.bw.servicereg.model.User;

import java.util.List;

/**
 * Main user service definition
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public interface UserService {

    /**
     * Returns the user with the given id
     * @param userId the ID of the user to look up
     * @return the user or null if not found
     */
    User getUser(String userId);

    /**
     * Returns the JPEG photo associated with the user or null if not found
     * @param userId the user id
     * @return the JPEG photo or null if undefined
     */
    byte[] getUserPhoto(String userId);

    /**
     * Returns all users
     * @return all users
     */
    default List<User> getUsers() {
        return searchUsers(null);
    }

    /**
     * Search for all users matching the given search term
     * @param searchTerm the search term
     * @return the result
     */
    List<User> searchUsers(String searchTerm);

    /**
     * Returns the total number of users
     * @return the total number of users
     */
    int getUserCount();
}
