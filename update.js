// Update script for user subscriptions and credits
const db = db.getSiblingDB('prod');

// Subscription tier mappings and token amounts
const TIER_MAPPINGS = {
    'Базовая': 'BASIC',
    'PRO': 'PRO',
    'PRO+': 'PROPLUS',
    'Безлимит': 'PROPLUS'
};

const TOKEN_AMOUNTS = {
    'BASIC': 500000,
    'PRO': 1000000,
    'PROPLUS': 3000000
};

// List of users to update with their subscription levels
const usersToUpdate = [
    { email: "zarvirovroman@gmail.com", level: "PRO+" },  // Added new user
    { email: "olgkomarova37@gmail.com", level: "Базовая" },
    { email: "katerinka230531@yandex.ru", level: "PRO" },
    { email: "jeka408335@gmail.com", level: "Базовая" },
    { email: "aidar_ukgs@mail.ru", level: "Базовая" },
    { email: "and.knyaz.71@mail.ru", level: "Базовая" },
    { email: "mariaslavnaia@gmail.com", level: "PRO" },
    { email: "zmv.tuva@gmail.com", level: "Базовая" },
    { email: "nleokant@gmail.com", level: "Базовая" },
    { email: "po.solovieva@gmail.com", level: "PRO" },
    { email: "liuliasha85@mail.ru", level: "PRO" },
    { email: "zhadaeff@gmail.com", level: "PRO" },
    { email: "ani.abraamyan3@gmail.com", level: "PRO" },
    { email: "shulgina101010@gmail.com", level: "Базовая" },
    { email: "kseniyagaraeva5@gmail.com", level: "Базовая" },
    { email: "golenduhin563@gmail.com", level: "Базовая" },
    { email: "apodcher@gmail.com", level: "PRO" },
    { email: "nik62bv@gmail.com", level: "Базовая" },
    { email: "news@frontside.ru", level: "Безлимит" },
    { email: "pijama.law@gmail.com", level: "PRO" },
    { email: "tatyana.pichk@gmail.com", level: "Базовая" },
    { email: "mr.muroms@gmail.com", level: "Базовая" },
    { email: "natawork@mail.ru", level: "Базовая" },
    { email: "dvodyanitskaya1@gmail.com", level: "PRO" },
    { email: "rav.7575@mail.ru", level: "PRO" },
    { email: "vlsh@tut.by", level: "PRO+" },
    { email: "alina.g33@mail.ru", level: "Базовая" },
    { email: "celokansofia@gmail.com", level: "Базовая" },
    { email: "kud.74@mail.ru", level: "Базовая" },
    { email: "likking9171@gmail.com", level: "PRO" },
    { email: "moonlilak36@gmail.com", level: "Базовая" },
    { email: "freelancermaria23@gmail.com", level: "Базовая" },
    { email: "zeromixa@gmail.com", level: "PRO+" },
    { email: "dudarevv94@gmail.com", level: "PRO+" },
    { email: "lourenconzau17@gmail.com", level: "Базовая" },
    { email: "senjupoi@gmail.com", level: "Базовая" },
    { email: "klimentevalidia93@gmail.com", level: "Базовая" },
    { email: "aminanadirovad@gmail.com", level: "PRO" },
    { email: "diyatretya@gmail.com", level: "Базовая" },
    { email: "daryadrozdova030909@gmail.com", level: "Базовая" },
    { email: "vova_zhoglik@mail.ru", level: "PRO+" },
    { email: "marinapoddubceva@gmail.com", level: "Базовая" },
    { email: "m.s.pimenova@yandex.ru", level: "Базовая" },
    { email: "a89244776411@yandex.ru", level: "PRO" },
    { email: "adel14082013@gmail.com", level: "Базовая" }
];

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

print("Starting update process...\n");

// Create arrays to store results for final report
const successfulUpdates = [];
const skippedUsers = [];
const failedUpdates = [];

usersToUpdate.forEach(function(userUpdate) {
    try {
        // Map the level to our tier system
        const tier = TIER_MAPPINGS[userUpdate.level];
        if (!tier) {
            throw new Error(`Invalid subscription level: ${userUpdate.level}`);
        }

        // Find the user by email
        const user = db.users.findOne({ email: userUpdate.email });
        
        if (!user) {
            print(`Skipping - User not found in database: ${userUpdate.email}`);
            skippedUsers.push(userUpdate.email);
            skippedCount++;
            return;
        }

        // Update user subscription
        db.users.updateOne(
            { _id: user._id },
            { 
                $set: {
                    subscriptionTier: tier,
                    subscriptionStatus: "ACTIVE",
                    subscriptionStartDate: new Date(),
                    subscriptionEndDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)), // 1 year from now
                    updatedAt: new Date()
                }
            }
        );

        // Update balance with corresponding token amount
        const tokenAmount = TOKEN_AMOUNTS[tier];
        db.balances.updateOne(
            { user: user._id },
            { 
                $set: {
                    tokenCredits: tokenAmount
                }
            }
        );

        print(`Updated user: ${userUpdate.email} (${userUpdate.level} → ${tier}, Tokens: ${tokenAmount})`);
        successfulUpdates.push({
            email: userUpdate.email,
            tier: tier,
            tokens: tokenAmount
        });
        updatedCount++;
    } catch (e) {
        print(`Error updating user ${userUpdate.email}: ${e.message}`);
        failedUpdates.push({
            email: userUpdate.email,
            error: e.message
        });
        errorCount++;
    }
});

// Print detailed summary
print("\n=== Update Summary ===");
print(`Successfully updated users: ${updatedCount}`);
print(`Skipped (not found) users: ${skippedCount}`);
print(`Failed updates: ${errorCount}`);
print(`Total users processed: ${usersToUpdate.length}`);

if (skippedUsers.length > 0) {
    print("\n=== Skipped Users ===");
    skippedUsers.forEach(email => print(`- ${email}`));
}

if (successfulUpdates.length > 0) {
    print("\n=== Successfully Updated Users ===");
    successfulUpdates.forEach(update => {
        print(`- ${update.email} (${update.tier}, ${update.tokens} tokens)`);
    });
}

if (failedUpdates.length > 0) {
    print("\n=== Failed Updates ===");
    failedUpdates.forEach(fail => {
        print(`- ${fail.email}: ${fail.error}`);
    });
}

// Final verification
print("\n=== Final Verification ===");
successfulUpdates.forEach(function(update) {
    const user = db.users.findOne({ email: update.email });
    const balance = db.balances.findOne({ user: user._id });
    print(`\nUser: ${update.email}`);
    print(`Current Tier: ${user.subscriptionTier}`);
    print(`Current Tokens: ${balance.tokenCredits}`);
});
