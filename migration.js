// MongoDB migration script
const sourceDb = db.getSiblingDB('test');
const targetDb = db.getSiblingDB('prod');
let migratedCount = 0;
let errorCount = 0;
let skippedCount = 0;

// Subscription tier mapping
const TIER_MAPPING = {
    'free': 'FREE',
    'basic': 'BASIC',
    'pro': 'PRO',
    'proplus': 'PROPLUS',
    'unlimited': 'PROPLUS'
};

// Calculate token credits based on current balance
function calculateTokenCredits(balance) {
    return Math.max(20000, balance * 5000);
}

// Extract name from email if it contains @
function extractName(name) {
    if (name.includes('@')) {
        return name.split('@')[0];
    }
    return name;
}

// Migrate each user from the temp collection in test database
sourceDb.temp_users.find().forEach(function(oldUser) {
    try {
        // Skip users with empty verifyTime
        if (!oldUser.verifyTime) {
            print(`Skipping unverified user: ${oldUser.email}`);
            skippedCount++;
            return;
        }

        // Check if user already exists
        const existingUser = targetDb.users.findOne({ email: oldUser.email });
        if (existingUser) {
            print(`Skipping existing user: ${oldUser.email}`);
            skippedCount++;
            return;
        }

        // Create new user document
        const newUser = {
            _id: oldUser._id,  // Maintain the same ObjectId
            name: extractName(oldUser.name || oldUser.email),
            username: "",
            email: oldUser.email,
            emailVerified: true,  // Default to true as per requirements
            password: oldUser.password,
            avatar: null,
            provider: "local",
            role: "USER",
            plugins: [],
            refreshToken: [],
            subscriptionTier: TIER_MAPPING[oldUser.accounttype.toLowerCase()] || "FREE",
            subscriptionStatus: "EXPIRED",
            subscriptionCanceled: false,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(),
            createdAt: oldUser.createTime ? new Date(oldUser.createTime) : new Date(),
            updatedAt: new Date()
        };

        // Create new balance document
        const newBalance = {
            _id: new ObjectId(),
            user: oldUser._id,
            tokenCredits: calculateTokenCredits(oldUser.balance)
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
print(`Skipped users: ${skippedCount}`);
print(`Total source users processed: ${migratedCount + errorCount + skippedCount}`);
