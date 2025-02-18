// controllers/profileController.js
const pool = require("../db/mysql");  // Import database connection
const { callLAFitnessAPI } = require("../services/classService");

const getCustomerProfile = async (req, res) => {
    const { token, authHeader, userID, barCode } = req.body;

    const requestData = {
        request: { Client: require("../config/config").CLIENT },
        token: token,
        authHeader: authHeader
    };
    try {
        const data = await callLAFitnessAPI("GetCustomerProfile", requestData);
        if(data.Success && data.Value && barCode != null ){
            const fetchedBarCode = data.Value.CustomerBasic.LoginBarcodeID; // Extract barcode from API response
            const fetchedEmail = data.Value.CustomerBasic.Email; // Extract email from API response
            const fetchedFirstName = data.Value.CustomerBasic.FirstName; // Extract first name from API response
            const fetchedLastName = data.Value.CustomerBasic.LastName; // Extract last name from API response
            const fetchedMobileNumber = data.Value.CustomerBasic.MobilePhone	; // Extract mobile number from API response
            const fetchedID = data.Value.CustomerBasic.ID; // Extract ID from API response
            const fetchedClubID = data.Value.CustomerBasic.ClubID; // Extract club ID from API response

            // Check if the barcode is null in the database
            const [user] = await pool.query("SELECT email, first_name, last_name, mobile, member_id, club_id, barcode FROM Users WHERE id = ?", [userID]);
           
            if (user.length > 0) {
                // Update the database if barcode is missing
                if(!user[0].email || !user[0].barcode || !user[0].mobile || !user[0].first_name || !user[0].last_name){
                    await pool.query(`UPDATE Users 
                                    SET email = ?, barcode=?, first_name=?, last_name=?, mobile=?, member_id=?, club_id=? 
                                    WHERE id = ?`, [fetchedEmail,fetchedBarCode,fetchedFirstName,fetchedLastName,fetchedMobileNumber,fetchedID,fetchedClubID,userID]);
                    console.log(`✅ Email updated for user ID: ${userID}`);
                }

            }
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer profile.", });
    }
};

module.exports = { getCustomerProfile };