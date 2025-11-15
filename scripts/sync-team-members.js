/**
 * Script to sync team members with their real Appwrite account IDs
 * This script fetches all users and teams, then updates team memberIds with actual account IDs
 */

const { Client, Databases, Users, Query } = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'register'; // Your project ID
const APPWRITE_API_KEY = 'standard_f409d2ebee697bb901df8ba6528dd4ac1e10aeaf11cc2bcd7fdc3a5417f62295c73d53070d3212d3e684fb519897d3f799c7c53ad35ad5011731fae02e6abb4cd406c79e4e2114a99d2eac40933ba530a4afb37aafd56ab39758b03a86c202fa8a45c50296c1a02431c13004171f5754317b8e7a1c59d546a705075b50997a75';
const DATABASE_ID = 'registration-form';
const USERS_COLLECTION_ID = '15';
const TEAMS_COLLECTION_ID = 'teams';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

async function syncTeamMembers() {
    console.log('🚀 Starting team member sync...\n');

    try {
        // Step 1: Fetch all users from the users collection
        console.log('📋 Step 1: Fetching users from collection...');
        const usersCollection = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.limit(1000)]
        );
        console.log(`   Found ${usersCollection.documents.length} users in collection\n`);

        // Step 2: Fetch all Appwrite accounts
        console.log('👥 Step 2: Fetching Appwrite accounts...');
        const appwriteAccounts = await users.list();
        console.log(`   Found ${appwriteAccounts.users.length} Appwrite accounts\n`);

        // Step 3: Create mapping of email -> Appwrite account ID
        console.log('🔗 Step 3: Creating email to account ID mapping...');
        const emailToAccountId = {};
        appwriteAccounts.users.forEach(account => {
            emailToAccountId[account.email.toLowerCase()] = account.$id;
            console.log(`   ${account.email} -> ${account.$id}`);
        });
        console.log('');

        // Step 4: Fetch all teams
        console.log('🏆 Step 4: Fetching teams...');
        const teamsResponse = await databases.listDocuments(
            DATABASE_ID,
            TEAMS_COLLECTION_ID,
            [Query.limit(100)]
        );
        console.log(`   Found ${teamsResponse.documents.length} teams\n`);

        // Step 5: Process each team
        console.log('🔄 Step 5: Processing teams and updating memberIds...\n');
        
        for (const team of teamsResponse.documents) {
            console.log(`📦 Processing team: ${team.teamName} (${team.teamCode})`);
            console.log(`   Current memberIds:`, team.memberIds);

            if (!team.memberIds || team.memberIds.length === 0) {
                console.log(`   ⚠️  No members assigned, skipping...\n`);
                continue;
            }

            // Convert old IDs to real Appwrite account IDs
            const updatedMemberIds = [];
            const notFoundMembers = [];

            for (const oldId of team.memberIds) {
                // Try to find the user in the collection by document ID
                try {
                    const userDoc = await databases.getDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        oldId
                    );

                    // Get the real Appwrite account ID using email
                    const email = userDoc.email.toLowerCase();
                    const accountId = emailToAccountId[email];

                    if (accountId) {
                        updatedMemberIds.push(accountId);
                        console.log(`   ✅ ${userDoc.name} (${email})`);
                        console.log(`      Old ID: ${oldId}`);
                        console.log(`      New ID: ${accountId}`);
                    } else {
                        console.log(`   ⚠️  No Appwrite account found for ${email}`);
                        notFoundMembers.push(oldId);
                    }
                } catch (error) {
                    // ID might already be an Appwrite account ID, check if it exists
                    const accountExists = appwriteAccounts.users.find(acc => acc.$id === oldId);
                    if (accountExists) {
                        updatedMemberIds.push(oldId);
                        console.log(`   ✅ Already valid account ID: ${oldId}`);
                    } else {
                        console.log(`   ❌ Invalid member ID: ${oldId}`);
                        notFoundMembers.push(oldId);
                    }
                }
            }

            // Update the team with new memberIds
            if (updatedMemberIds.length > 0) {
                console.log(`\n   📝 Updating team with ${updatedMemberIds.length} valid members...`);
                await databases.updateDocument(
                    DATABASE_ID,
                    TEAMS_COLLECTION_ID,
                    team.$id,
                    { memberIds: updatedMemberIds }
                );
                console.log(`   ✅ Team updated successfully!`);
            } else {
                console.log(`   ⚠️  No valid members found, team not updated`);
            }

            if (notFoundMembers.length > 0) {
                console.log(`   ⚠️  ${notFoundMembers.length} members could not be resolved`);
            }

            console.log('');
        }

        console.log('✨ Sync completed successfully!\n');
        console.log('Summary:');
        console.log(`  - Total teams processed: ${teamsResponse.documents.length}`);
        console.log(`  - Total Appwrite accounts: ${appwriteAccounts.users.length}`);
        console.log(`  - Total users in collection: ${usersCollection.documents.length}`);

    } catch (error) {
        console.error('❌ Error during sync:', error);
        throw error;
    }
}

// Run the sync
syncTeamMembers()
    .then(() => {
        console.log('\n🎉 Script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
