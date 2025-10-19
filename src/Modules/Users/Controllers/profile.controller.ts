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

// Upload cover pictures

// List all user
profilecontroller.get('/list-users', profileService.listUsers)

// renew signed url
profilecontroller.post('/renew-signed-url', authentication, profileService.reNewSignedUrl)

export {profilecontroller}