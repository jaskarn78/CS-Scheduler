const schedule = require('node-schedule');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const DOWNLOAD_URL = "https://images.fitnessintl.com/mobile/config/mobileclubdb.zip";
const OUTPUT_ZIP_PATH = path.resolve(__dirname, '../db/mobileclubdb.zip');
const EXTRACT_DIR = path.resolve(__dirname,"../db"); // Destination folder

// Function to download the ZIP file
const downloadZip = async () => {
    console.log("📥 Downloading latest mobileclubdb.zip...");

    const curlCommand = `curl -H "Host: images.fitnessintl.com" \
        -H "user-agent: ClubStudio/1.3.6.5 CFNetwork/3826.400.120 Darwin/24.3.0" \
        -H "accept: */*" -H "accept-language: en-US,en;q=0.9" --compressed \
        "${DOWNLOAD_URL}" --output "${OUTPUT_ZIP_PATH}"`;

    return new Promise((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Error downloading ZIP:", error.message);
                return reject(error);
            }
            console.log("✅ Download successful!");
            resolve();
        });
    });
};

// Function to extract the ZIP file
const extractZip = async () => {
    console.log("📂 Extracting mobileclubdb.zip...");

    return new Promise((resolve, reject) => {
        fs.createReadStream(OUTPUT_ZIP_PATH)
            .pipe(unzipper.Extract({ path: EXTRACT_DIR }))
            .on('close', () => {
                console.log("✅ Extraction complete!");
                resolve();
            })
            .on('error', (error) => {
                console.error("❌ Error extracting ZIP:", error);
                reject(error);
            });
    });
};

// Main function to update the database
const updateDatabase = async () => {
    try {
        await downloadZip();
        await extractZip();
        console.log("🎉 Database update completed successfully!");
    } catch (error) {
        console.error("🚨 Update failed:", error);
    }
};




module.exports = updateDatabase;