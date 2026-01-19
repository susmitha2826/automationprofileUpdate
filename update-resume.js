require('dotenv').config();


const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    resumeFilePath: path.join(__dirname, 'Susmitha_Gopireddy_Full_Stack_Developer.docx'),
    logFilePath: path.join(__dirname, 'naukri_update.log'),
    email: process.env.NAUKRI_EMAIL,
    password: process.env.NAUKRI_PASSWORD,
    profileId: process.env.NAUKRI_PROFILE_ID,
    formKey: process.env.NAUKRI_FORM_KEY,
    fileKey: process.env.NAUKRI_FILE_KEY
};

// Store session data
let SESSION = {
    authToken: '',
    cookies: ''
};

// Logging utility
function log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    console.log(message);
    fs.appendFileSync(CONFIG.logFilePath, logMessage);

    if (isError) {
        console.error(message);
    }
}

// Extract cookies from response headers
function extractCookies(headers) {
    const setCookieHeaders = headers['set-cookie'];
    if (!setCookieHeaders) return '';

    const cookies = setCookieHeaders.map(cookie => {
        // Extract just the cookie name=value part (before the first semicolon)
        return cookie.split(';')[0];
    }).join('; ');

    return cookies;
}

// Step 0: Login to Naukri
async function login() {
    try {
        log('Logging in to Naukri...');

        if (!CONFIG.email || !CONFIG.password) {
            throw new Error('Email or password not configured. Please set NAUKRI_EMAIL and NAUKRI_PASSWORD in .env file');
        }

        const response = await axios.post(
            'https://www.naukri.com/central-login-services/v1/login',
            {
                username: CONFIG.email,
                password: CONFIG.password
            },
            {
                headers: {
                    'accept': 'application/json',
                    'accept-language': 'en-US,en;q=0.9',
                    'appid': '103',
                    'cache-control': 'no-cache',
                    'clientid': 'd3skt0p',
                    'content-type': 'application/json',
                    'origin': 'https://www.naukri.com',
                    'referer': 'https://www.naukri.com/',
                    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'systemid': 'jobseeker',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
                }
            }
        );

        // Extract auth token from cookies array
        const authCookie = response.data.cookies.find(
            c => c.name === 'nauk_at'
        );

        if (!authCookie || !authCookie.value) {
            throw new Error('nauk_at token not found in login response');
        }

        SESSION.authToken = authCookie.value;
        log('Login successful! Auth token obtained.');


        // Extract cookies from response headers
        SESSION.cookies = extractCookies(response.headers);
        if (SESSION.cookies) {
            log('Session cookies obtained.');
        }

        log(`Token preview: ${SESSION.authToken.substring(0, 50)}...`);

        return true;
    } catch (error) {
        log(`Login failed: ${error.message}`, true);
        if (error.response) {
            log(`Response status: ${error.response.status}`, true);
            log(`Response data: ${JSON.stringify(error.response.data)}`, true);
        }
        throw error;
    }
}

// Step 1: Upload resume file
async function uploadResume() {
    try {
        log('Starting resume upload...');

        // Check if resume file exists
        if (!fs.existsSync(CONFIG.resumeFilePath)) {
            throw new Error(`Resume file not found: ${CONFIG.resumeFilePath}`);
        }

        // Create form data
        const formData = new FormData();
        formData.append('formKey', CONFIG.formKey);
        formData.append('file', fs.createReadStream(CONFIG.resumeFilePath));
        formData.append('fileName', path.basename(CONFIG.resumeFilePath));
        formData.append('uploadCallback', 'true');
        formData.append('fileKey', CONFIG.fileKey);

        // Upload request
        const response = await axios.post('https://filevalidation.naukri.com/file', formData, {
            headers: {
                ...formData.getHeaders(),
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-allow-origin': '*',
                'appid': '105',
                'origin': 'https://www.naukri.com',
                'referer': 'https://www.naukri.com/',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'systemid': 'fileupload',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
            }
        });

        log(`Upload successful. Response: ${JSON.stringify(response.data)}`);

        // Extract fileKey from response
        const fileKey = response.data[CONFIG.fileKey]?.fileKey ||
            response.data.fileKey ||
            CONFIG.fileKey;
        log(`Using fileKey: ${fileKey}`);

        return fileKey;
    } catch (error) {
        log(`Upload failed: ${error.message}`, true);
        if (error.response) {
            log(`Response status: ${error.response.status}`, true);
            log(`Response data: ${JSON.stringify(error.response.data)}`, true);
        }
        throw error;
    }
}

// Step 2: Update profile with uploaded resume
async function updateProfile(fileKey) {
    try {
        log('Updating profile...');

        const requestData = {
            textCV: {
                formKey: CONFIG.formKey,
                fileKey: fileKey,
                textCvContent: null
            }
        };

        const response = await axios.post(
            `https://www.naukri.com/cloudgateway-mynaukri/resman-aggregator-services/v0/users/self/profiles/${CONFIG.profileId}/advResume`,
            requestData,
            {
                headers: {
                    'accept': 'application/json',
                    'accept-language': 'en-US,en;q=0.9',
                    'appid': '105',
                    'authorization': `Bearer ${SESSION.authToken}`,
                    'content-type': 'application/json',
                    'cookie': SESSION.cookies,
                    'origin': 'https://www.naukri.com',
                    'referer': 'https://www.naukri.com/mnjuser/profile',
                    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'systemid': '105',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                    'x-http-method-override': 'PUT',
                    'x-requested-with': 'XMLHttpRequest'
                }
            }
        );

        log(`Profile updated successfully. Response: ${JSON.stringify(response.data)}`);
        return true;
    } catch (error) {
        log(`Profile update failed: ${error.message}`, true);
        if (error.response) {
            log(`Response status: ${error.response.status}`, true);
            log(`Response data: ${JSON.stringify(error.response.data)}`, true);
        }
        throw error;
    }
}

// Main function
async function updateNaukriResume() {
    log('========================================');
    log('Starting Naukri resume update process...');

    try {
        // Step 0: Login
        await login();

        // Step 1: Upload resume
        const fileKey = await uploadResume();

        // Step 2: Update profile
        await updateProfile(fileKey);

        log('✓ Naukri resume update completed successfully!');
        log('========================================\n');
        return true;
    } catch (error) {
        log('✗ Naukri resume update failed!', true);
        log('========================================\n');
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    updateNaukriResume();
}

module.exports = { updateNaukriResume };