const axios = require('axios');

async function testUpdate() {
    try {
        const res = await axios.put('http://localhost:5000/api/auth/profile/1', {
            name: 'Updated Name JS'
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}

testUpdate();
