/* Copyright 2014 Danish Maritime Authority.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package net.e2.bw.servicereg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Model object representing a user
 */
public class User implements JsonSerializable {

    private String userId;
    private String emailAddress;
    private String firstName;
    private String lastName;

    @JsonIgnore
    private byte[] photo;

    /** Constructor */
    public User() {
    }

    /** Copies the data of this user to the given user */
    public User copyTo(User user) {
        user.setUserId(userId);
        user.setEmailAddress(emailAddress);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoto(photo);
        return user;
    }

    /** Creates a copy of this user */
    public User copy() {
        return copyTo(new User());
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }
}
