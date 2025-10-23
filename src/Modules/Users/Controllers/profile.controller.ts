import { Router } from "express";
import { authentication, Multer } from "../../../Middleware";
import profileService  from "../Services/profile.service";
const profilecontroller = Router()

// Update profile
profilecontroller.put('/update-profile', authentication, profileService.updateProfile)

// Delete profile
profilecontroller.delete('/delete-account', authentication, profileService.deleteAccount)

// Get profile data
profilecontroller.get('/get-profile', authentication, profileService.getProfileData)

// Upload profile picture
profilecontroller.post('/profile-picture', authentication, Multer().single('profilePicture'), profileService.uploadProfilePicture)

// renew signed url
profilecontroller.post('/renew-signed-url', authentication, profileService.reNewSignedUrl)

// Upload cover pictures

// List all user
profilecontroller.get('/list-users', profileService.listUsers)

// send friend request
profilecontroller.post('/send-friend-request', authentication, profileService.sendFriendShipRequest)

// list friend requests
profilecontroller.get('/list-friend-requests', authentication, profileService.listRequests)

// respond to friend request
profilecontroller.patch('/respond-to-friend-request', authentication, profileService.respondToFriendShipRequests)

// create group
profilecontroller.post('/create-group', authentication, profileService.createGroup)

export {profilecontroller}