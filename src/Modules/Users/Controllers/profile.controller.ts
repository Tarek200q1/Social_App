import { Router } from "express";
import { authentication, Multer } from "../../../Middleware";
import profileService  from "../Services/profile.service";
const profilecontroller = Router()

// Update profile

// Delete profile
profilecontroller.delete('/delete-account', authentication, profileService.deleteAccount)

// Get profile data

// Upload profile picture
profilecontroller.post('/profile-picture', authentication, Multer().single('profilePicture'), profileService.uploadProfilePicture)

// Upload cover pictures

// List all user

// renew signed url
profilecontroller.post('/renew-signed-url', authentication, profileService.reNewSignedUrl)

export {profilecontroller}