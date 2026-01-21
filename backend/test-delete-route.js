const axios = require('axios');

async function testDelete() {
    const messageId = '696f6f767877ab4596af1e45'; // One of the IDs from debug script
    const url = 'http://localhost:5000/api/messages/' + messageId;

    console.log('Testing DELETE on:', url);

    try {
        // We need a token, but let's see if we at least get a 401
        const res = await axios.delete(url);
        console.log('Response:', res.status);
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Data:', err.response?.data);
    }
}

testDelete();
