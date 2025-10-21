"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilecontroller = void 0;
const express_1 = require("express");
const Middleware_1 = require("../../../Middleware");
const profile_service_1 = __importDefault(require("../Services/profile.service"));
const profilecontroller = (0, express_1.Router)();
exports.profilecontroller = profilecontroller;
// Update profile
profilecontroller.put('/update-profile', Middleware_1.authentication, profile_service_1.default.updateProfile);
// Delete profile
profilecontroller.delete('/delete-account', Middleware_1.authentication, profile_service_1.default.deleteAccount);
// Get profile data
profilecontroller.get('/get-profile', Middleware_1.authentication, profile_service_1.default.getProfileData);
// Upload profile picture
profilecontroller.post('/profile-picture', Middleware_1.authentication, (0, Middleware_1.Multer)().single('profilePicture'), profile_service_1.default.uploadProfilePicture);
// renew signed url
profilecontroller.post('/renew-signed-url', Middleware_1.authentication, profile_service_1.default.reNewSignedUrl);
// Upload cover pictures
// List all user
profilecontroller.get('/list-users', profile_service_1.default.listUsers);
// send friend request
profilecontroller.post('/send-friend-request', Middleware_1.authentication, profile_service_1.default.sendFriendShipRequest);
// list friend requests
profilecontroller.get('/list-friend-requests', Middleware_1.authentication, profile_service_1.default.listRequests);
// respond to friend request
profilecontroller.patch('/respond-to-friend-request', Middleware_1.authentication, profile_service_1.default.respondToFriendShipRequests);
