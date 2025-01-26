// MongoDB migration script
const sourceDb = db.getSiblingDB('test');    // Source database with temp_users
const targetDb = db.getSiblingDB('prod');     // Target database for users and balances

let migratedCount = 0;
let errorCount = 0;

// Migrate each user from the temp collection in test database
sourceDb.temp_users.find().forEach(function(oldUser) {
    try {
        // First check if user already exists
        const existingUser = targetDb.users.findOne({ email: oldUser.email });
        if (existingUser) {
            print(`Skipping existing user: ${oldUser.email}`);
            return;
        }

        // Create new user document
        const newUser = {
            _id: oldUser._id,  // Maintain the same ObjectId
            name: oldUser.email,  // In old DB name is email
            username: "",
            email: oldUser.email,
            emailVerified: false,
            password: oldUser.password,
            avatar: null,
            provider: "local",
            role: "USER",
            plugins: [],
            refreshToken: [],
            subscriptionTier: "FREE",
            subscriptionStatus: "EXPIRED",
            subscriptionCanceled: false,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Create new balance document
        const newBalance = {
            _id: new ObjectId(),
            user: oldUser._id,  // Reference to the user's _id
            tokenCredits: oldUser.balance * 3000
        };

        // Insert new documents into prod database
        targetDb.users.insertOne(newUser);
        targetDb.balances.insertOne(newBalance);
        
        print(`Successfully migrated user: ${oldUser.email}`);
        migratedCount++;
    } catch (e) {
        print(`Error migrating user ${oldUser.email}: ${e.message}`);
        errorCount++;
    }
});

// Print migration summary
print("\nMigration Summary:");
print(`Successfully migrated users: ${migratedCount}`);
print(`Failed migrations: ${errorCount}`);
print(`Total source users processed: ${migratedCount + errorCount}`);
