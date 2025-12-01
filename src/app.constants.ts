
export class AppConstants {
    constructor() {}

    public static app = {
        xyz: 'xyz',
        jwt: {
            token: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY0MDcxNjYwMiwiaWF0IjoxNjQwNzE2NjAyfQ.U8Lkffcq6qlerRlslNU1OUGmihqBanS5_-1iyKXZFSk',
            expiryTime: 113600,
            type: 'JWT' 
        },
        bucket: 'klruploads',
        S3: {
            user: 'user-profile-images',
            product: 'product-images'
        },
        userType: {
            admin: 'Admin',
            user: 'User',
            vendor: 'Vendor',
            deliveryBoy: 'DeliveryBoy'
        },
        status: {
            active: 1,
            inactive: 0
        }
    };

}