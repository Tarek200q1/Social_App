enum RoleEnum {
    USER = 'user',
    ADMIN = 'admin'
}

enum GenderEnum {
    MALE = "male",
    FEMALE = 'female',
    OTHER = 'other'
}

enum ProviderEnum {
    GOOGLE = 'google',
    LOCAL = 'local'
}

enum OtpTypesEnum {
    CONFIRMATION = 'confirmation',
    RESET_PASSWORD = 'reset-password'
}

enum FriendShipStatusEnum {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

enum ConversationTypeEnum {
    DIRECT = 'direct',
    GROUP = 'group'
}
export {RoleEnum , GenderEnum , ProviderEnum , OtpTypesEnum, FriendShipStatusEnum, ConversationTypeEnum}